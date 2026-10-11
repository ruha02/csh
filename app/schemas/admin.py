"""Админские схемы — проекции для админ-панели."""

from datetime import date

from pydantic import BaseModel, ConfigDict


class AdminCandidateResponse(BaseModel):
    """Как AdminCandidate на фронте."""

    id: int
    user_sub: str
    last_name: str
    first_name: str
    middle_name: str | None = None
    email: str
    phone: str | None = None
    telegram: str | None = None
    registered_at: date
    last_active_at: date
    status: str
    is_verified: bool
    block_reason: str | None = None
    blocked_at: date | None = None

    # Навыки (упрощённо)
    skills: list[dict] = []

    # Статистика (вычисляется)
    total_tests_passed: int = 0
    total_responses: int = 0
    total_invitations: int = 0
    total_tasks: int = 0

    model_config = ConfigDict(from_attributes=True)


class AdminEmployerResponse(BaseModel):
    """Как AdminEmployer на фронте."""

    id: int
    company_name: str
    industry: str
    size: str
    email: str
    phone: str | None = None
    website: str | None = None
    registered_at: date
    last_active_at: date
    status: str
    is_verified: bool
    block_reason: str | None = None
    blocked_at: date | None = None

    # Статистика
    total_vacancies: int = 0
    published_vacancies: int = 0
    total_responses: int = 0
    total_tasks: int = 0
    team_size: int = 0

    model_config = ConfigDict(from_attributes=True)


class AdminDirectionResponse(BaseModel):
    key: str
    label: str
    color: str
    description: str
    is_active: bool
    topics_count: int = 0


class AdminGradeResponse(BaseModel):
    key: str
    label: str
    color: str
    threshold: int
    description: str


class AdminTopicResponse(BaseModel):
    key: str
    title: str
    direction: str
    parent_key: str | None = None
    tests_count: int = 0
    avg_score: int = 0
    is_active: bool


class AdminSoftSkillResponse(BaseModel):
    id: int
    name: str
    category: str | None = None
    usage_count: int = 0
    is_active: bool
