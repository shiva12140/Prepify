from sqlalchemy import String, LargeBinary, JSON, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.database import Base
from typing import List

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] =  mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))

    pdf_data: Mapped[list["PDFData"]] = relationship(back_populates="user")

class PDFData(Base):
    __tablename__ = "pdf_data"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # 👇 ADD THESE TWO LINES
    filename: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    # 👆
    
    pdf_blob: Mapped[bytes] = mapped_column(LargeBinary)
    pdf_embedding: Mapped[list[float]] = mapped_column(JSON)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))

    user: Mapped["User"] = relationship(back_populates="pdf_data")
    chat_sessions: Mapped[List["ChatSession"]] = relationship(back_populates="pdf_data", cascade="all, delete-orphan")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True) 
    name: Mapped[str] = mapped_column(String(100)) 
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    pdf_id: Mapped[int] = mapped_column(ForeignKey('pdf_data.id'))
    pdf_data: Mapped["PDFData"] = relationship(back_populates="chat_sessions")
    
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    
    messages: Mapped[List["ChatMessage"]] = relationship(back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(ForeignKey('chat_sessions.id'))
    session: Mapped["ChatSession"] = relationship(back_populates="messages")
    
    role: Mapped[str] = mapped_column(String(20)) 
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)