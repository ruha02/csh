"""Схемы для настроек."""

from typing import Any

from pydantic import BaseModel, ConfigDict


class CandidateSettingsCreate(BaseModel):
    notifications: dict[str, Any] | None = None
    privacy: dict[str, Any] | None = None
    integrations: dict[str, Any] | None = None


class CandidateSettingsResponse(CandidateSettingsCreate):
    id: int
    candidate_id: int

    model_config = ConfigDict(from_attributes=True)


class EmployerSettingsCreate(BaseModel):
    notifications: dict[str, Any] | None = None
    vacancy_defaults: dict[str, Any] | None = None
    privacy: dict[str, Any] | None = None
    integrations: dict[str, Any] | None = None


class EmployerSettingsResponse(EmployerSettingsCreate):
    id: int
    company_id: int

    model_config = ConfigDict(from_attributes=True)
