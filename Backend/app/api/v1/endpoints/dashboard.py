from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models import User
from app.models.tables import PDFData, ChatSession, ChatMessage
from app.api.deps import get_db, get_current_user
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns aggregated dashboard statistics for the authenticated user.
    Queries actual data from the database — no hardcoded values.
    """

    # 1. Count of uploaded PDFs/notes
    notes_result = await db.execute(
        select(func.count(PDFData.id)).where(PDFData.user_id == current_user.id)
    )
    notes_count = notes_result.scalar() or 0

    # 2. Count of chat sessions
    sessions_result = await db.execute(
        select(func.count(ChatSession.id)).where(ChatSession.user_id == current_user.id)
    )
    sessions_count = sessions_result.scalar() or 0

    # 3. Count of total chat messages across all user sessions
    messages_result = await db.execute(
        select(func.count(ChatMessage.id))
        .join(ChatSession, ChatMessage.session_id == ChatSession.id)
        .where(ChatSession.user_id == current_user.id)
    )
    messages_count = messages_result.scalar() or 0

    # 4. Recent activity — last 5 notes uploaded
    recent_notes_result = await db.execute(
        select(PDFData.id, PDFData.filename, PDFData.created_at)
        .where(PDFData.user_id == current_user.id)
        .order_by(PDFData.created_at.desc())
        .limit(5)
    )
    recent_notes = [
        {
            "id": row.id,
            "type": "note",
            "title": row.filename,
            "date": row.created_at.isoformat() if row.created_at else None,
        }
        for row in recent_notes_result.all()
    ]

    # 5. Recent chat sessions — last 5
    recent_sessions_result = await db.execute(
        select(ChatSession.id, ChatSession.name, ChatSession.created_at)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.created_at.desc())
        .limit(5)
    )
    recent_sessions = [
        {
            "id": row.id,
            "type": "chat",
            "title": row.name,
            "date": row.created_at.isoformat() if row.created_at else None,
        }
        for row in recent_sessions_result.all()
    ]

    # 6. Activity streak — count distinct days with any activity in last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    # Days with note uploads
    note_days_result = await db.execute(
        select(func.date(PDFData.created_at))
        .where(PDFData.user_id == current_user.id)
        .where(PDFData.created_at >= thirty_days_ago)
        .distinct()
    )
    note_days = set(row[0] for row in note_days_result.all() if row[0])

    # Days with chat messages
    msg_days_result = await db.execute(
        select(func.date(ChatMessage.created_at))
        .join(ChatSession, ChatMessage.session_id == ChatSession.id)
        .where(ChatSession.user_id == current_user.id)
        .where(ChatMessage.created_at >= thirty_days_ago)
        .distinct()
    )
    msg_days = set(row[0] for row in msg_days_result.all() if row[0])

    active_days = len(note_days | msg_days)

    # Merge and sort recent activity
    all_activity = sorted(
        recent_notes + recent_sessions,
        key=lambda x: x["date"] or "",
        reverse=True,
    )[:5]

    return {
        "username": current_user.username,
        "notes_count": notes_count,
        "sessions_count": sessions_count,
        "messages_count": messages_count,
        "active_days_last_30": active_days,
        "recent_activity": all_activity,
    }
