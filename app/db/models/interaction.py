"""Отклики, приглашения, чат, тестовые задания."""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from .base import Base
from .enums import (
    ChatSender,
    Direction,
    Grade,
    InvitationStatus,
    ResponseStatus,
    TaskResult,
    TaskSource,
    TaskStatus,
)


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(
        Integer, ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False
    )
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    resume_id = Column(
        Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True
    )
    cover_letter = Column(Text, nullable=True)
    status = Column(
        SAEnum(ResponseStatus, values_callable=lambda x: [e.value for e in x]),
        default=ResponseStatus.pending,
    )
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    viewed_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    comment = Column(Text, nullable=True)

    vacancy = relationship("Vacancy", back_populates="responses")
    candidate = relationship("Candidate", back_populates="responses")
    resume = relationship("Resume", back_populates="responses")
    messages = relationship(
        "ChatMessage",
        back_populates="response",
        cascade="all, delete-orphan",
        foreign_keys="ChatMessage.response_id",
    )


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(
        Integer, ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False
    )
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True)
    description = Column(
        Text, nullable=False, comment="Текст приглашения от работодателя"
    )
    status = Column(
        SAEnum(InvitationStatus, values_callable=lambda x: [e.value for e in x]),
        default=InvitationStatus.pending,
    )
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    vacancy = relationship("Vacancy", back_populates="invitations")
    candidate = relationship("Candidate", back_populates="invitations")
    messages = relationship(
        "ChatMessage",
        back_populates="invitation",
        cascade="all, delete-orphan",
        foreign_keys="ChatMessage.invitation_id",
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    response_id = Column(
        Integer, ForeignKey("responses.id", ondelete="CASCADE"), nullable=True
    )
    invitation_id = Column(
        Integer, ForeignKey("invitations.id", ondelete="CASCADE"), nullable=True
    )
    sender = Column(
        SAEnum(ChatSender, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)

    response = relationship(
        "Response", back_populates="messages", foreign_keys=[response_id]
    )
    invitation = relationship(
        "Invitation", back_populates="messages", foreign_keys=[invitation_id]
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(
        Integer, ForeignKey("vacancies.id", ondelete="SET NULL"), nullable=True
    )
    resume_id = Column(
        Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True
    )
    response_id = Column(
        Integer, ForeignKey("responses.id", ondelete="SET NULL"), nullable=True
    )
    title = Column(String(300), nullable=False)
    employer_name = Column(
        String(200), nullable=False, comment="Название компании или 'ИИ'"
    )
    source = Column(
        SAEnum(TaskSource, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    direction = Column(
        SAEnum(Direction, values_callable=lambda x: [e.value for e in x]), nullable=True
    )
    grade = Column(
        SAEnum(Grade, values_callable=lambda x: [e.value for e in x]), nullable=True
    )
    status = Column(
        SAEnum(TaskStatus, values_callable=lambda x: [e.value for e in x]),
        default=TaskStatus.pending,
    )
    result = Column(
        SAEnum(TaskResult, values_callable=lambda x: [e.value for e in x]),
        nullable=True,
    )
    description = Column(Text, nullable=False)
    comment = Column(Text, nullable=True)
    solution_url = Column(String(500), nullable=True)
    solution_file_name = Column(String(200), nullable=True)
    is_public = Column(Boolean, default=False)
    received_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    evaluated_at = Column(DateTime, nullable=True)
    ai_generated_at = Column(DateTime, nullable=True)

    vacancy = relationship("Vacancy", back_populates="tasks")
