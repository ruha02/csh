"""Модели кандидата и связанных сущностей."""

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy import (
    Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from .base import Base
from .enums import (
    CandidateStatus,
    Direction,
    FspResult,
    Grade,
    ParticipationType,
    TeamRole,
)


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    # ⚠️ user_sub будет добавлен в миграции 002 (таблица уже создана в 001)
    user_sub = Column(
        String, unique=True, nullable=True, index=True, comment="sub из Keycloak JWT"
    )
    last_name = Column(String(100), nullable=False)
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    telegram = Column(String(100), nullable=True)
    about_me = Column(Text, nullable=True)

    # Административные поля (добавятся в миграции 002)
    registered_at = Column(Date, nullable=True)
    last_active_at = Column(Date, nullable=True)
    status = Column(
        SAEnum(CandidateStatus, values_callable=lambda x: [e.value for e in x]),
        default=CandidateStatus.active,
    )
    is_verified = Column(Boolean, default=False)
    block_reason = Column(Text, nullable=True)
    blocked_at = Column(Date, nullable=True)

    # Связи
    skills = relationship(
        "CandidateSkill", back_populates="candidate", cascade="all, delete-orphan"
    )
    educations = relationship(
        "Education", back_populates="candidate", cascade="all, delete-orphan"
    )
    work_experiences = relationship(
        "WorkExperience", back_populates="candidate", cascade="all, delete-orphan"
    )
    candidate_soft_skills = relationship(
        "CandidateSoftSkill", back_populates="candidate", cascade="all, delete-orphan"
    )
    resumes = relationship(
        "Resume", back_populates="candidate", cascade="all, delete-orphan"
    )
    fsp_participations = relationship(
        "FspParticipation", back_populates="candidate", cascade="all, delete-orphan"
    )
    responses = relationship(
        "Response", back_populates="candidate", cascade="all, delete-orphan"
    )
    invitations = relationship(
        "Invitation", back_populates="candidate", cascade="all, delete-orphan"
    )


class CandidateSoftSkill(Base):
    """Связь M:N: кандидат ↔ soft skill из справочника."""

    __tablename__ = "candidate_soft_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    soft_skill_dict_id = Column(
        Integer, ForeignKey("soft_skill_dict.id", ondelete="CASCADE"), nullable=False
    )

    candidate = relationship("Candidate", back_populates="candidate_soft_skills")
    soft_skill = relationship("SoftSkillDict")

    __table_args__ = (
        UniqueConstraint(
            "candidate_id", "soft_skill_dict_id", name="uq_candidate_soft_skill"
        ),
    )


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    direction = Column(
        SAEnum(Direction, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    grade = Column(
        SAEnum(Grade, values_callable=lambda x: [e.value for e in x]), nullable=False
    )
    language = Column(
        String(100), nullable=False, comment="Язык/технология: TypeScript, Python..."
    )

    candidate = relationship("Candidate", back_populates="skills")
    topic_tests = relationship(
        "TopicTest", back_populates="candidate_skill", cascade="all, delete-orphan"
    )
    resumes = relationship("Resume", back_populates="skill")


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    institution = Column(String(300), nullable=False)
    specialty = Column(String(300), nullable=False)
    degree = Column(String(100), nullable=True)
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer, nullable=True)
    is_current = Column(Boolean, default=False)

    candidate = relationship("Candidate", back_populates="educations")


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False, server_default="false")
    company = Column(String(200), nullable=False)
    position = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="work_experiences")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    skill_id = Column(
        Integer, ForeignKey("candidate_skills.id", ondelete="SET NULL"), nullable=True
    )
    title = Column(String(200), nullable=False)
    salary_from = Column(Integer, nullable=True)
    salary_to = Column(Integer, nullable=True)
    currency = Column(String(3), default="RUB")
    description = Column(Text, nullable=True)
    created_at = Column(Date, nullable=False)
    updated_at = Column(Date, nullable=False)

    candidate = relationship("Candidate", back_populates="resumes")
    skill = relationship("CandidateSkill", back_populates="resumes")
    responses = relationship("Response", back_populates="resume")


class FspParticipation(Base):
    __tablename__ = "fsp_participations"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(
        Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False
    )
    event_name = Column(String(300), nullable=False)
    event_date = Column(Date, nullable=False)
    result = Column(
        SAEnum(FspResult, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    participation_type = Column(
        SAEnum(ParticipationType, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    team_role = Column(
        SAEnum(TeamRole, values_callable=lambda x: [e.value for e in x]), nullable=True
    )
    result_details = Column(String(500), nullable=True)
    team_name = Column(String(200), nullable=True)
    organizer = Column(String(200), nullable=True)
    location = Column(String(200), nullable=True)

    candidate = relationship("Candidate", back_populates="fsp_participations")
