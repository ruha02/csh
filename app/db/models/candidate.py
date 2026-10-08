from sqlalchemy import Boolean, Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_sub = Column(String, unique=True, index=True, nullable=False, comment="sub из Keycloak JWT")
    last_name = Column(String(100), nullable=False)
    first_name = Column(String(100), nullable=False)
    middle_name = Column(String(100))
    phone = Column(String(20))
    email = Column(String(100))
    telegram = Column(String(100))
    about_me = Column(Text)

    work_experiences = relationship(
        "WorkExperience",
        back_populates="candidate",
        cascade="all, delete-orphan",
        order_by="WorkExperience.start_date.desc()"
    )
    soft_skills = relationship(
        "SoftSkill",
        back_populates="candidate",
        cascade="all, delete-orphan"
    )


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_current = Column(Boolean, default=False, nullable=False)
    company = Column(String(200), nullable=False)
    position = Column(String(200), nullable=False)
    description = Column(Text)

    candidate = relationship("Candidate", back_populates="work_experiences")


class SoftSkill(Base):
    __tablename__ = "soft_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)

    candidate = relationship("Candidate", back_populates="soft_skills")
