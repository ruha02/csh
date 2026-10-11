"""Вакансии и их требования."""

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from .base import Base
from .enums import Direction, Grade, VacancyStatus


class Vacancy(Base):
    __tablename__ = "vacancies"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    title = Column(String(300), nullable=False)
    direction = Column(
        SAEnum(Direction, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    grade = Column(
        SAEnum(Grade, values_callable=lambda x: [e.value for e in x]), nullable=False
    )
    status = Column(
        SAEnum(VacancyStatus, values_callable=lambda x: [e.value for e in x]),
        default=VacancyStatus.draft,
    )
    description = Column(Text, nullable=False)
    salary_from = Column(Integer, nullable=True)
    salary_to = Column(Integer, nullable=True)
    currency = Column(String(3), default="RUB")
    location = Column(String(200), nullable=True)
    is_remote = Column(Boolean, default=False)
    published_at = Column(Date, nullable=True)
    deadline = Column(Date, nullable=True)
    created_at = Column(Date, nullable=False)
    updated_at = Column(Date, nullable=False)

    company = relationship("Company", back_populates="vacancies")
    hard_skills = relationship(
        "VacancyHardSkill", back_populates="vacancy", cascade="all, delete-orphan"
    )
    soft_skills = relationship(
        "VacancySoftSkill", back_populates="vacancy", cascade="all, delete-orphan"
    )
    responses = relationship(
        "Response", back_populates="vacancy", cascade="all, delete-orphan"
    )
    invitations = relationship(
        "Invitation", back_populates="vacancy", cascade="all, delete-orphan"
    )
    tasks = relationship("Task", back_populates="vacancy")


class VacancyHardSkill(Base):
    __tablename__ = "vacancy_hard_skills"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(
        Integer, ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False
    )
    topic_id = Column(Integer, ForeignKey("roadmap_topics.id"), nullable=False)
    required_percent = Column(Integer, nullable=False, default=70)

    vacancy = relationship("Vacancy", back_populates="hard_skills")
    topic = relationship("RoadmapTopic", back_populates="vacancy_hard_skills")


class VacancySoftSkill(Base):
    __tablename__ = "vacancy_soft_skills"

    id = Column(Integer, primary_key=True, index=True)
    vacancy_id = Column(
        Integer, ForeignKey("vacancies.id", ondelete="CASCADE"), nullable=False
    )
    soft_skill_dict_id = Column(
        Integer, ForeignKey("soft_skill_dict.id"), nullable=False
    )

    vacancy = relationship("Vacancy", back_populates="soft_skills")
    soft_skill = relationship("SoftSkillDict")
