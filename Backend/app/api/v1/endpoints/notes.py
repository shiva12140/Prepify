from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Response, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
from app.models.tables import PDFData
from app.api.deps import get_db, get_current_user, get_chroma_collection
from app.schema import AI_chat_input
from app.llm import stream_chat
import uuid
from fastapi.responses import StreamingResponse
from chromadb.api.models.Collection import Collection 
from pathlib import Path
from llama_index.readers.file.pymu_pdf import PyMuPDFReader
from llama_index.core.node_parser import SentenceSplitter
from typing import Annotated
import shutil
import tempfile
import os
from sentence_transformers import SentenceTransformer
from .quiz import search_logic
from sqlalchemy import select, desc, asc
from app.models.tables import ChatSession, ChatMessage
from app.schema.models import SessionCreate, SessionResponse, MessageResponse , NoteInfo
from app.database import async_session_maker
from typing import List

router = APIRouter()

UPLOAD_DIRECTORY = "uploaded_pdfs"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

@router.post("/stream_chat", response_class=StreamingResponse)
async def ai_chat(
    Input_model: AI_chat_input, 
    collection: Collection = Depends(get_chroma_collection), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages_dict = [msg.model_dump() for msg in Input_model.messages]
    query = f"{Input_model.context};{Input_model.messages[-1].content}"
    retrieved_docs: str | None = await search_logic(query, collection)

    return StreamingResponse(
        stream_chat(messages_dict, Input_model.context, retrieved_docs),
        media_type="text/plain"
    )

# Backend/app/api/v1/endpoints/notes.py

@router.post("/upload_notes")
async def upload_notes(
    file: Annotated[UploadFile, File(description="A PDF file to upload")],
    collection: Collection = Depends(get_chroma_collection), 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = Path(UPLOAD_DIRECTORY) / safe_filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        chunks = await pdf_process(str(file_path))
        
        if not chunks:
            raise ValueError("No text chunks could be extracted from this PDF.")

        full_text_preview = " ".join(chunks)[:2000]
        doc_embedding = embedding_model.encode(full_text_preview).tolist()

        file.file.seek(0) 
        
        new_doc = PDFData(
            pdf_blob=file.file.read(),     
            pdf_embedding=doc_embedding,        
            user_id=current_user.id,
            filename=file.filename 
        )
        
        db.add(new_doc)
        await db.commit()
        await db.refresh(new_doc)

        ids = [str(uuid.uuid4()) for _ in chunks]

        metadatas = [{
            "source_file": file.filename,
            "pdf_id": new_doc.id, 
            "chunk_index": i
        } for i in range(len(chunks))]

        await collection.add(
            ids=ids,
            documents=chunks,
            metadatas=metadatas
        )

        return {
            "status": "success", 
            "filename": file.filename, 
            "doc_id": new_doc.id,
            "chunks_ingested": len(chunks)
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
        
    finally:
        # Cleanup temp file
        if file_path.exists():
            os.remove(file_path)

# #--------Helper Functions--------#

async def pdf_process(pdf_path: str):
    try:
        loader = PyMuPDFReader()
        
        # Load data (this reads the file we just saved)
        documents = loader.load_data(file_path=pdf_path)
        
        text_splitter = SentenceSplitter(
            chunk_size=1000,
            chunk_overlap=20
        )
        
        text_chunks = []
        
        # Process all pages/documents found in the PDF
        for doc in documents:
            cur_text_chunks = text_splitter.split_text(doc.text)
            text_chunks.extend(cur_text_chunks)

        return text_chunks
    except Exception as e:
        print(f"PDF Processing Error: {e}")
        raise e
    
# -------------------------
# 1. Session Management
# -------------------------

@router.post("/sessions", response_model=SessionResponse)
async def create_session(
    session_in: SessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(PDFData).filter(PDFData.id == session_in.pdf_id, PDFData.user_id == current_user.id))
    pdf = result.scalar_one_or_none()
    if not pdf:
        raise HTTPException(404, "PDF not found")

    new_session = ChatSession(
        id=str(uuid.uuid4()),
        name=session_in.name,
        pdf_id=session_in.pdf_id,
        user_id=current_user.id
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session

@router.get("/sessions/{pdf_id}", response_model=List[SessionResponse])
async def get_sessions(
    pdf_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.pdf_id == pdf_id)
        .where(ChatSession.user_id == current_user.id)
        .order_by(desc(ChatSession.created_at))
    )
    return result.scalars().all()

@router.get("/history/{session_id}", response_model=List[MessageResponse])
async def get_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(asc(ChatMessage.created_at))
    )
    return result.scalars().all()

# -------------------------
# 2. Chat with Memory
# -------------------------

@router.post("/chat/{session_id}")
async def chat_session(
    session_id: str,
    user_prompt: str,
    db: AsyncSession = Depends(get_db),
    collection: Collection = Depends(get_chroma_collection),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify Session
    session_res = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    session = session_res.scalar_one_or_none()
    if not session:
        raise HTTPException(404, "Session not found")

    await ensure_pdf_in_chroma(session.pdf_id, db, collection)
    # ---------------------------------------------------------

    # 3. Save User Message
    user_msg = ChatMessage(session_id=session_id, role="user", content=user_prompt)
    db.add(user_msg)
    await db.commit()

    # 4. Filter & Search
    filter_dict = {"pdf_id": session.pdf_id}
    retrieved_context = await search_logic(user_prompt, collection, filter_dict)

    # 5. Fetch History & Stream (Rest of your code remains the same)
    history_res = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(asc(ChatMessage.created_at))
    )
    history_msgs = history_res.scalars().all()
    messages_payload = [{"role": m.role, "content": m.content} for m in history_msgs]

    async def response_generator():
        full_response = ""
        async for chunk in stream_chat(messages_payload, "", retrieved_context):
            full_response += chunk
            yield chunk
            
        async with async_session_maker() as new_db_session:
            ai_msg = ChatMessage(session_id=session_id, role="assistant", content=full_response)
            new_db_session.add(ai_msg)
            await new_db_session.commit()

    return StreamingResponse(response_generator(), media_type="text/plain")



async def ensure_pdf_in_chroma(pdf_id: int, db: AsyncSession, collection: Collection):
    """
    Checks if embeddings exist for the given PDF ID.
    If not, it fetches the blob from SQL, chunks it, and re-uploads to Chroma.
    """
    # 1. Check Chroma first (Fast check)
    # We query for just 1 ID to see if any exist with this metadata
    existing = await collection.get(
        where={"pdf_id": pdf_id},
        limit=1
    )
    
    if existing and len(existing['ids']) > 0:
        print(f"✅ Embeddings found for PDF {pdf_id}. No action needed.")
        return

    print(f"⚠️ Embeddings missing for PDF {pdf_id}. Restoring from SQL...")

    # 2. Fetch Blob from SQL
    result = await db.execute(select(PDFData).where(PDFData.id == pdf_id))
    pdf_record = result.scalar_one_or_none()
    
    if not pdf_record:
        raise HTTPException(404, "PDF Data not found in database")

    # 3. Write Blob to Temp File (Required because pdf_process expects a path)
    # We use valid suffixes so PyMuPDF knows it's a PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
        tmp_file.write(pdf_record.pdf_blob)
        tmp_path = tmp_file.name

    try:
        # 4. Re-Process (Reuse your existing chunking logic)
        chunks = await pdf_process(tmp_path)
        
        if not chunks:
            print("Warning: Restored PDF has no text.")
            return

        # 5. Re-Embed and Upload to Chroma
        # Generate new UUIDs for the chunks
        ids = [str(uuid.uuid4()) for _ in chunks]
        
        # EXACT SAME metadata structure as upload_notes
        metadatas = [{
            "source_file": pdf_record.filename, 
            "pdf_id": pdf_id, 
            "chunk_index": i
        } for i in range(len(chunks))]

        # Re-add to Chroma
        await collection.add(
            ids=ids,
            documents=chunks,
            metadatas=metadatas
        )
        print(f"♻️ Successfully restored {len(chunks)} chunks for PDF {pdf_id}")

    except Exception as e:
        print(f"❌ Error restoring PDF: {e}")
        raise HTTPException(500, f"Failed to restore PDF embeddings: {str(e)}")
        
    finally:
        # Cleanup temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.get("/", response_model=List[NoteInfo])
async def get_all_notes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch all uploaded PDFs for the sidebar list."""
    result = await db.execute(
        select(PDFData.id, PDFData.filename, PDFData.created_at)
        .where(PDFData.user_id == current_user.id)
        .order_by(desc(PDFData.created_at))
    )
    return result.all()


@router.get("/{pdf_id}/content")
async def get_pdf_content(
    pdf_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(PDFData).where(PDFData.id == pdf_id, PDFData.user_id == current_user.id)
    )
    pdf = result.scalar_one_or_none()
    
    if not pdf:
        raise HTTPException(status_code=404, detail="Note not found")

    # FIX: Add 'Content-Disposition: inline' to tell browser to render it
    headers = {
        "Content-Disposition": f"inline; filename={pdf.filename}"
    }
    
    return Response(
        content=pdf.pdf_blob, 
        media_type="application/pdf",
        headers=headers
    )


# -------------------------
# NEW: Delete Note
# -------------------------
@router.delete("/{note_id}")
async def delete_note(
    note_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    collection: Collection = Depends(get_chroma_collection)
):
    # 1. Check ownership
    result = await db.execute(
        select(PDFData).where(PDFData.id == note_id, PDFData.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # 2. Delete from ChromaDB (using metadata filter)
    try:
        # This deletes all chunks where metadata field 'pdf_id' matches
        await collection.delete(where={"pdf_id": note_id})
    except Exception as e:
        print(f"Error deleting from Chroma: {e}")
        # Proceed to delete from DB even if Chroma fails to avoid sync issues

    # 3. Delete from Database (Cascades to Sessions/Messages)
    await db.delete(note)
    await db.commit()

    return {"status": "success", "message": "Note deleted"}

# -------------------------
# NEW: Rename Note
# -------------------------
@router.put("/{note_id}")
async def rename_note(
    note_id: int,
    new_filename: str = Body(..., embed=True), # Expects JSON: { "new_filename": "foo.pdf" }
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(PDFData).where(PDFData.id == note_id, PDFData.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.filename = new_filename
    await db.commit()
    await db.refresh(note)
    
    return {
        "id": note.id,
        "filename": note.filename,
        "created_at": note.created_at
    }