"""Схемы для откликов, приглашений, чата и заданий."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

ResponseStatus = str  # 'pending' | 'viewed' | 'accepted' | 'rejected'
InvitationStatus = str  # 'pending' | 'accepted' | 'rejected' | 'expired'
TaskStatus = str  # 'pending' | 'in_progress' | 'submitted' | 'evaluated'
TaskResult = str  # 'accepted' | 'rejected'
TaskSource = str  # 'employer' | 'ai'
ChatSender = str  # 'candidate' | 'employer'


# ============================================================================
# Чат
# ============================================================================
class ChatMessageCreate(BaseModel):
    text: str


class ChatMessageResponse(BaseModel):
    id: int
    response_id: int | None = None
    invitation_id: int | None = None
    sender: ChatSender
    text: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Тестовые задания
# ============================================================================
class TaskCreate(BaseModel):
    title: str = Field(..., max_length=300)
    employer_name: str = Field(..., max_length=200)
    source: TaskSource
    description: str
    direction: str | None = None
    grade: str | None = None
    deadline: datetime | None = None


class TaskResponse(BaseModel):
    id: int
    vacancy_id: int | None = None
    resume_id: int | None = None
    response_id: int | None = None
    title: str
    employer_name: str
    source: TaskSource
    description: str
    direction: str | None = None
    grade: str | None = None
    status: TaskStatus
    result: TaskResult | None = None
    comment: str | None = None
    solution_url: str | None = None
    solution_file_name: str | None = None
    is_public: bool = False
    received_at: datetime
    deadline: datetime | None = None
    accepted_at: datetime | None = None
    submitted_at: datetime | None = None
    evaluated_at: datetime | None = None
    ai_generated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Отклики
# ============================================================================
class ResponseCreate(BaseModel):
    vacancy_id: int
    resume_id: int | None = None
    cover_letter: str | None = None


class ResponseResponse(BaseModel):
    id: int
    vacancy_id: int
    candidate_id: int
    resume_id: int | None = None
    cover_letter: str | None = None
    status: ResponseStatus
    task_id: int | None = None
    created_at: datetime
    viewed_at: datetime | None = None
    responded_at: datetime | None = None
    comment: str | None = None

    messages: list[ChatMessageResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Приглашения
# ============================================================================
class InvitationCreate(BaseModel):
    vacancy_id: int
    candidate_id: int
    resume_id: int | None = None
    description: str
    expires_at: datetime | None = None


class InvitationResponse(BaseModel):
    id: int
    vacancy_id: int
    candidate_id: int
    resume_id: int | None = None
    description: str
    status: InvitationStatus
    task_id: int | None = None
    created_at: datetime
    expires_at: datetime | None = None
    responded_at: datetime | None = None
    rejection_reason: str | None = None

    messages: list[ChatMessageResponse] = []

    model_config = ConfigDict(from_attributes=True)
