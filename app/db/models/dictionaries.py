"""Справочники."""
from sqlalchemy import Boolean, Column, Integer, String

from .base import Base


class SoftSkillDict(Base):
    __tablename__ = "soft_skill_dict"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(String(100), nullable=True,
                      comment="Межличностные, Когнитивные...")
    is_active = Column(Boolean, default=True)
