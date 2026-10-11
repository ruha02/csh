"""Компания (работодатель) и её команда."""

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
from .enums import (
    CompanyIndustry,
    CompanySize,
    EmployerStatus,
    MemberRole,
)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_sub = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
        comment="sub из Keycloak (владелец)",
    )
    name = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    email = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    industry = Column(
        SAEnum(CompanyIndustry, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    size = Column(
        SAEnum(CompanySize, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
    )
    status = Column(
        SAEnum(EmployerStatus, values_callable=lambda x: [e.value for e in x]),
        default=EmployerStatus.active,
    )
    founded_year = Column(Integer, nullable=True)
    about = Column(Text, nullable=True)
    social_links = Column(Text, nullable=True, comment="JSON")
    benefits = Column(Text, nullable=True, comment="JSON array")
    technologies = Column(Text, nullable=True, comment="JSON array")

    # Административные поля
    registered_at = Column(Date, nullable=True)
    last_active_at = Column(Date, nullable=True)
    is_verified = Column(Boolean, default=False)
    block_reason = Column(Text, nullable=True)
    blocked_at = Column(Date, nullable=True)

    members = relationship(
        "CompanyMember", back_populates="company", cascade="all, delete-orphan"
    )
    vacancies = relationship(
        "Vacancy", back_populates="company", cascade="all, delete-orphan"
    )


class CompanyMember(Base):
    __tablename__ = "company_members"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(
        Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False
    )
    user_sub = Column(String, nullable=False, index=True, comment="sub из Keycloak")
    role = Column(SAEnum(MemberRole), nullable=False, default=MemberRole.viewer)
    joined_at = Column(Date, nullable=False)

    company = relationship("Company", back_populates="members")
