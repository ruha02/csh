"""Схемы для кандидата и связанных сущностей."""

from datetime import date
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

# ============================================================================
# Enums (литералы — как на фронтенде)
# ============================================================================
Direction = str  # 'frontend' | 'backend' | 'devops' | 'mobile' | 'data' | 'qa'
Grade = str  # 'junior' | 'middle' | 'senior'
CandidateStatus = str  # 'active' | 'blocked' | 'pending_verification'


# ============================================================================
# Образование
# ============================================================================
class EducationCreate(BaseModel):
    institution: str = Field(..., max_length=300)
    specialty: str = Field(..., max_length=300)
    degree: str | None = Field(None, max_length=100)
    start_year: int = Field(..., ge=1950, le=2030)
    end_year: int | None = Field(None, ge=1950, le=2030)
    is_current: bool = False


class EducationResponse(EducationCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Опыт работы
# ============================================================================
class WorkExperienceCreate(BaseModel):
    company: str = Field(..., max_length=200)
    position: str = Field(..., max_length=200)
    description: str | None = None
    start_date: date
    end_date: date | None = None
    is_current: bool = False


class WorkExperienceResponse(WorkExperienceCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Soft skills кандидата
# ============================================================================
class CandidateSoftSkillCreate(BaseModel):
    soft_skill_dict_id: int


class CandidateSoftSkillResponse(BaseModel):
    id: int
    soft_skill_dict_id: int
    name: str  # Подтягивается из справочника

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# ФСП участия
# ============================================================================
class FspParticipationCreate(BaseModel):
    event_name: str = Field(..., max_length=300)
    event_date: date
    result: str  # 'first_place' | 'second_place' | 'third_place' | 'participation'
    result_details: str | None = Field(None, max_length=500)
    participation_type: str  # 'individual' | 'team'
    team_role: str | None = None  # 'backend' | 'frontend' | 'designer' | ...
    team_name: str | None = Field(None, max_length=200)
    organizer: str | None = Field(None, max_length=200)
    location: str | None = Field(None, max_length=200)


class FspParticipationResponse(FspParticipationCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Навыки кандидата
# ============================================================================
class CandidateSkillCreate(BaseModel):
    direction: Direction
    grade: Grade
    language: str = Field(..., max_length=100)


class CandidateSkillResponse(CandidateSkillCreate):
    id: int
    candidate_id: int
    confidence: int | None = None  # Вычисляется из topic_tests

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Результаты тестов по темам
# ============================================================================
class TopicTestResponse(BaseModel):
    id: int
    topic_id: int
    topic_key: str  # Из roadmap_topics
    topic_title: str  # Из roadmap_topics
    best_score: int
    last_score: int
    attempts: int
    passed: bool
    last_attempt_date: date | None = None
    next_attempt_date: date | None = None
    locked: bool

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Резюме
# ============================================================================
class ResumeCreate(BaseModel):
    title: str = Field(..., max_length=200)
    skill_id: int | None = None
    salary_from: int | None = None
    salary_to: int | None = None
    currency: str = "RUB"
    description: str | None = None


class ResumeResponse(ResumeCreate):
    id: int
    candidate_id: int
    direction: Direction | None = None  # Из candidate_skills
    grade: Grade | None = None
    confidence: int | None = None
    created_at: date
    updated_at: date

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Профиль кандидата (полный)
# ============================================================================
class CandidateProfileCreate(BaseModel):
    """Создание профиля при первом входе."""

    last_name: str = Field(..., max_length=100)
    first_name: str = Field(..., max_length=100)
    middle_name: str | None = Field(None, max_length=100)
    phone: str | None = Field(None, max_length=20)
    email: str | None = Field(None, max_length=100)
    telegram: str | None = Field(None, max_length=100)
    about_me: str | None = None


class CandidateProfileUpdate(BaseModel):
    """Обновление профиля (все поля опциональны)."""

    last_name: str | None = Field(None, max_length=100)
    first_name: str | None = Field(None, max_length=100)
    middle_name: str | None = Field(None, max_length=100)
    phone: str | None = Field(None, max_length=20)
    email: str | None = Field(None, max_length=100)
    telegram: str | None = Field(None, max_length=100)
    about_me: str | None = None


class CandidateProfileResponse(BaseModel):
    """Полный профиль кандидата — как CandidateProfileData на фронте."""

    id: int
    user_sub: str
    last_name: str
    first_name: str
    middle_name: str | None = None
    phone: str | None = None
    email: str | None = None
    telegram: str | None = None
    about_me: str | None = None

    # Связанные сущности
    educations: list[EducationResponse] = []
    work_experiences: list[WorkExperienceResponse] = []
    soft_skills: list[CandidateSoftSkillResponse] = []
    fsp_participations: list[FspParticipationResponse] = []
    skills: list[CandidateSkillResponse] = []
    resumes: list[ResumeResponse] = []

    # Мета
    registered_at: date | None = None
    last_active_at: date | None = None
    status: CandidateStatus = "active"
    is_verified: bool = False

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Кандидат для поиска (EmployerCandidates)
# ============================================================================
class CandidateSearchResult(BaseModel):
    """Как CandidateSearchResult на фронте — для работодателя."""

    id: int
    user_sub: str
    last_name: str
    first_name: str
    middle_name: str | None = None
    email: str | None = None
    phone: str | None = None
    telegram: str | None = None
    about_me: str | None = None

    skills: list[CandidateSkillResponse] = []
    topic_tests: list[TopicTestResponse] = []

    total_experience_years: int = 0
    current_company: str | None = None
    current_position: str | None = None
    salary_expectation_from: int | None = None
    salary_expectation_to: int | None = None
    currency: str = "RUB"
    location: str | None = None
    is_remote_available: bool = False
    is_looking_for_job: bool = True
    last_active_at: date | None = None
    soft_skills: list[str] = []  # Назвы soft skills
    education: list[dict[str, Any]] = []  # Упрощённо
    fsp_achievements: list[dict[str, Any]] = []  # Упрощённо

    model_config = ConfigDict(from_attributes=True)
