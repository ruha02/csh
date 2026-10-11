"""Схемы для справочников."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


# ============================================================================
# Soft skills справочник
# ============================================================================
class SoftSkillDictCreate(BaseModel):
    name: str = Field(..., max_length=100)
    category: str | None = Field(None, max_length=100)


class SoftSkillDictResponse(SoftSkillDictCreate):
    id: int
    is_active: bool = True
    usage_count: int = 0  # Вычисляется
    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Дорожная карта
# ============================================================================
class RoadmapTopicCreate(BaseModel):
    key: str = Field(..., max_length=100)
    title: str = Field(..., max_length=200)
    direction: str  # Direction
    parent_id: int | None = None


class RoadmapTopicResponse(RoadmapTopicCreate):
    id: int
    is_active: bool = True
    children: list[RoadmapTopicResponse] = []
    tests_count: int = 0  # Вычисляется
    avg_score: int = 0  # Вычисляется
    model_config = ConfigDict(from_attributes=True)


# Разрешаем рекурсивную ссылку
RoadmapTopicResponse.model_rebuild()
