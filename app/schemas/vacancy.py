# app/schemas/vacancy.py
"""Схемы для вакансий."""

from datetime import date

from pydantic import BaseModel, ConfigDict, Field

VacancyStatus = str  # 'draft' | 'published' | 'archived' | 'closed'


class VacancyHardSkillCreate(BaseModel):
    topic_id: int
    # Исправлено: убрано "...", оставлен только default=70
    required_percent: int = Field(default=70, ge=0, le=100)


class VacancyHardSkillResponse(VacancyHardSkillCreate):
    id: int
    topic_key: str  # Из roadmap_topics
    topic_title: str
    model_config = ConfigDict(from_attributes=True)


class VacancySoftSkillCreate(BaseModel):
    soft_skill_dict_id: int


class VacancySoftSkillResponse(BaseModel):
    id: int
    soft_skill_dict_id: int
    name: str  # Из soft_skill_dict
    model_config = ConfigDict(from_attributes=True)


class VacancyCreate(BaseModel):
    title: str = Field(..., max_length=300)
    direction: str  # Direction
    grade: str  # Grade
    description: str
    salary_from: int | None = None
    salary_to: int | None = None
    currency: str = "RUB"
    location: str | None = Field(None, max_length=200)
    is_remote: bool = False
    deadline: date | None = None
    hard_skills: list[VacancyHardSkillCreate] = []
    soft_skills: list[VacancySoftSkillCreate] = []


class VacancyUpdate(BaseModel):
    title: str | None = Field(None, max_length=300)
    direction: str | None = None
    grade: str | None = None
    description: str | None = None
    salary_from: int | None = None
    salary_to: int | None = None
    currency: str | None = None
    location: str | None = Field(None, max_length=200)
    is_remote: bool | None = None
    status: VacancyStatus | None = None
    deadline: date | None = None
    hard_skills: list[VacancyHardSkillCreate] | None = None
    soft_skills: list[VacancySoftSkillCreate] | None = None


class VacancyResponse(BaseModel):
    id: int
    company_id: int
    title: str
    direction: str
    grade: str
    description: str
    salary_from: int | None = None
    salary_to: int | None = None
    currency: str
    location: str | None = None
    is_remote: bool
    status: VacancyStatus
    published_at: date | None = None
    deadline: date | None = None
    created_at: date
    updated_at: date
    hard_skills: list[VacancyHardSkillResponse] = []
    soft_skills: list[VacancySoftSkillResponse] = []
    # Статистика (вычисляется)
    responses_count: int = 0
    viewed_count: int = 0
    model_config = ConfigDict(from_attributes=True)
