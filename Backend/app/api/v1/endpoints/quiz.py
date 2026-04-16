from fastapi import APIRouter, Depends, HTTPException, status
from chromadb import AsyncHttpClient
from app.models import User
from app.api.deps import get_db, get_current_user, get_chroma_client
from app.schema import Quiz_input, QuizOutput, IngestRequest
from .prompts import SYSTEM_PROMPT
from fastapi import APIRouter, Depends, HTTPException
from chromadb.api.models.Collection import Collection 
from app.api.deps import get_chroma_collection
from app.llm import call_llm
import uuid
import logging


router = APIRouter()

logger = logging.getLogger("uvicorn.error") 

async def search_logic(query: str, collection: Collection, filter_dict: dict = None):
    logger.info(f"🔍 [Search Logic] Starting search for query: '{query}'")

    try:
        results = await collection.query(
        query_texts=[query],
        n_results=5,
        where=filter_dict
    )
        
        logger.info(f"📄 [Search Logic] Raw results from DB: {results}")

        if results and results.get('documents') and len(results['documents']) > 0:
            raw_docs = results['documents'][0]

            valid_docs = [str(doc) for doc in raw_docs if doc is not None]
            
            logger.info(f"✅ [Search Logic] Processing: Found {len(raw_docs)} items. Valid text items: {len(valid_docs)}")
            
            if len(raw_docs) != len(valid_docs):
                logger.warning("⚠️ [Search Logic] Warning: Some documents contained NoneType and were skipped.")

            final_context = " ".join(valid_docs)
            return final_context
            
        else:
            logger.warning("⚠️ [Search Logic] No documents found for this query.")
            return ""

    except Exception as e:
        logger.error(f"❌ [Search Logic] CRITICAL ERROR: {str(e)}")
        return ""

@router.get("/search_docs")
async def search_documents(
    query: str,
    collection: Collection = Depends(get_chroma_collection)
):
    try:
        return await search_logic(query, collection)
    except Exception as e:
        raise HTTPException(500, f"ChromaDB Query Error: {e}")


@router.post("/resume", response_model=QuizOutput, status_code=status.HTTP_201_CREATED)
async def generate_quiz_resume(
    Input_model: Quiz_input, 
    collection: Collection = Depends(get_chroma_collection), 
    current_user: User = Depends(get_current_user)
):
    try:
        query = Input_model.parsed_doc + Input_model.user_prompt
        retrieved_context = await search_logic(query, collection)
        

        if not retrieved_context:
            raise ValueError("No context available to generate quiz.")
        prompt = await prompt_builder(Input_model.parsed_doc, Input_model.user_prompt, retrieved_context)
        
        quiz_data_obj = await call_llm(prompt)

        return quiz_data_obj

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Invalid Input: {str(e)}'
        )


async def ingest_logic(input_data:IngestRequest , collection: Collection):
    doc_id = input_data.id if input_data.id else str(uuid.uuid4())

    await collection.add(
        ids = [doc_id],
        documents=[input_data.parsed_doc],
        metadatas=[{"user_prompt": input_data.user_prompt}]
    )

    return {
        "status": "success",
        "id": doc_id,
        "stored_prompt": input_data.user_prompt
    }

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_data(
    input_data: IngestRequest,
    collection: Collection = Depends(get_chroma_collection), 
    current_user: User = Depends(get_current_user)
):
    try: 
        return await ingest_logic(input_data, collection)
    except Exception as e:
        raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail= f"Ingestion failed: {str(e)}"
    )



@router.post("/notes", response_model=QuizOutput, status_code=status.HTTP_201_CREATED)
async def generate_quiz_notes(
    Input_model: IngestRequest, 
    collection: Collection = Depends(get_chroma_collection), 
    current_user: User = Depends(get_current_user)
):
    try:
        notes = Input_model
        await ingest_logic(notes, collection)

        query = Input_model.user_prompt
        retrieved_context = await search_logic(query, collection)
        

        if not retrieved_context:
            raise ValueError("No context available to generate quiz.")
        prompt = await prompt_builder(Input_model.parsed_doc, Input_model.user_prompt, retrieved_context)
        
        quiz_data_obj = await call_llm(prompt)

        return quiz_data_obj

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Invalid Input: {str(e)}'
        )


# #--------Helper Functions--------#


async def prompt_builder(parsed_doc:str, user_prompt:str, docs:str=None):
    prompt = SYSTEM_PROMPT.format(
        user_prompt=user_prompt,
        parsed_info=parsed_doc,
        retrieved_docs=docs
    )
    return prompt