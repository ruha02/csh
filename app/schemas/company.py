"""Схемы для компаний и их команды."""

from datetime import date
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

CompanyIndustry = str  # 'it' | 'finance' | 'retail' | ...
CompanySize = str  # '1-10' | '11-50' | '51-200' | ...
EmployerStatus = str  # 'active' | 'blocked' | 'pending_verification'
MemberRole = str  # 'owner' | 'hr' | 'hiring_manager' | 'viewer'


class CompanyCreate(BaseModel):
    name: str = Field(..., max_length=300)
    description: str | None = None
    email: str = Field(..., max_length=100)
    phone: str | None = Field(None, max_length=20)
    website: str | None = Field(None, max_length=500)
    address: str | None = Field(None, max_length=500)
    industry: CompanyIndustry
    size: CompanySize
    founded_year: int | None = None
    about: str | None = None
    logo_url: str | None = Field(None, max_length=500)
    social_links: dict[str, Any] | None = None
    benefits: list[str] | None = None
    technologies: list[str] | None = None


class CompanyUpdate(BaseModel):
    name: str | None = Field(None, max_length=300)
    description: str | None = None
    email: str | None = Field(None, max_length=100)
    phone: str | None = Field(None, max_length=20)
    website: str | None = Field(None, max_length=500)
    address: str | None = Field(None, max_length=500)
    industry: CompanyIndustry | None = None
    size: CompanySize | None = None
    founded_year: int | None = None
    about: str | None = None
    logo_url: str | None = Field(None, max_length=500)
    social_links: dict[str, Any] | None = None
    benefits: list[str] | None = None
    technologies: list[str] | None = None


class CompanyResponse(CompanyCreate):
    id: int
    user_sub: str
    registered_at: date | None = None
    last_active_at: date | None = None
    status: EmployerStatus = "active"
    is_verified: bool = False

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Команда компании
# ============================================================================
class CompanyMemberCreate(BaseModel):
    user_sub: str
    role: MemberRole = "viewer"


class CompanyMemberResponse(BaseModel):
    id: int
    company_id: int
    user_sub: str
    role: MemberRole
    joined_at: date

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Профиль компании (как CompanyProfileData на фронте)
# ============================================================================
class CompanyProfileResponse(BaseModel):
    """Полный профиль компании с командой."""

    id: int
    user_sub: str
    name: str
    description: str | None = None
    logo_url: str | None = None
    website: str | None = None
    email: str
    phone: str | None = None
    address: str | None = None
    industry: CompanyIndustry
    size: CompanySize
    founded_year: int | None = None
    about: str | None = None
    social_links: dict[str, Any] | None = None
    benefits: list[str] | None = None
    technologies: list[str] | None = None

    members: list[CompanyMemberResponse] = []

    registered_at: date | None = None
    last_active_at: date | None = None
    status: EmployerStatus = "active"
    is_verified: bool = False

    model_config = ConfigDict(from_attributes=True)
