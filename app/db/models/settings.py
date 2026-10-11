"""Настройки пользователей."""
from sqlalchemy import Column, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from .base import Base


class CandidateSettings(Base):
    __tablename__ = "candidate_settings"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"),
                          unique=True, nullable=False)
    notifications = Column(Text, nullable=True, comment="JSON")
    privacy = Column(Text, nullable=True, comment="JSON")
    integrations = Column(Text, nullable=True, comment="JSON")

    candidate = relationship("Candidate")


class EmployerSettings(Base):
    __tablename__ = "employer_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"),
                        unique=True, nullable=False)
    notifications = Column(Text, nullable=True, comment="JSON")
    vacancy_defaults = Column(Text, nullable=True, comment="JSON")
    privacy = Column(Text, nullable=True, comment="JSON")
    integrations = Column(Text, nullable=True, comment="JSON")

    company = relationship("Company")
