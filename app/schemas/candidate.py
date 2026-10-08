from datetime import date

from pydantic import BaseModel, EmailStr, Field, field_validator


class WorkExperienceBase(BaseModel):
    start_date: date
    end_date: date | None = None
    is_current: bool = False
    company: str = Field(..., min_length=1, max_length=200)
    position: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)

    @field_validator("end_date")
    @classmethod
    def validate_end_date(cls, v, info):
        if info.data.get("is_current") and v is not None:
            raise ValueError("end_date must be None when is_current is True")
        return v


class WorkExperienceCreate(WorkExperienceBase):
    pass


class WorkExperienceResponse(WorkExperienceBase):
    id: int

    model_config = {"from_attributes": True}


class SoftSkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class SoftSkillCreate(SoftSkillBase):
    pass


class SoftSkillResponse(SoftSkillBase):
    id: int

    model_config = {"from_attributes": True}


class CandidateBase(BaseModel):
    last_name: str = Field(..., min_length=1, max_length=100)
    first_name: str = Field(..., min_length=1, max_length=100)
    middle_name: str | None = Field(None, max_length=100)
    phone: str = Field(..., pattern=r"^\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$")
    email: EmailStr
    telegram: str = Field(..., min_length=1, max_length=100)
    about_me: str | None = Field(None, max_length=1000)


class CandidateCreate(CandidateBase):
    work_experiences: list[WorkExperienceCreate] = []
    soft_skills: list[str] = []


class CandidateUpdate(CandidateBase):
    work_experiences: list[WorkExperienceCreate] = []
    soft_skills: list[str] = []


class CandidateResponse(CandidateBase):
    id: int
    user_sub: str
    work_experiences: list[WorkExperienceResponse]
    soft_skills: list[SoftSkillResponse]

    model_config = {"from_attributes": True}
