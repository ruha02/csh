"""employer and vacancies

Revision ID: 003
Revises: 002
Create Date: 2026-10-11 12:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "003"
down_revision: str | None = "002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ============================================================
    # Enums
    # ============================================================
    companyindustry_enum = postgresql.ENUM(
        "it",
        "finance",
        "retail",
        "manufacturing",
        "education",
        "healthcare",
        "media",
        "consulting",
        "other",
        name="companyindustry",
        create_type=True,
    )
    companysize_enum = postgresql.ENUM(
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1000+",
        name="companysize",
        create_type=True,
    )
    employerstatus_enum = postgresql.ENUM(
        "active",
        "blocked",
        "pending_verification",
        name="employerstatus",
        create_type=True,
    )
    memberrole_enum = postgresql.ENUM(
        "owner", "hr", "hiring_manager", "viewer", name="memberrole", create_type=True
    )
    vacancystatus_enum = postgresql.ENUM(
        "draft",
        "published",
        "archived",
        "closed",
        name="vacancystatus",
        create_type=True,
    )
    # direction и grade были созданы в миграции 002, используем create_type=False
    direction_enum = postgresql.ENUM(
        "frontend",
        "backend",
        "devops",
        "mobile",
        "data",
        "qa",
        name="direction",
        create_type=False,
    )
    grade_enum = postgresql.ENUM(
        "junior", "middle", "senior", name="grade", create_type=False
    )

    # ============================================================
    # 1. Компании
    # ============================================================
    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "user_sub",
            sa.String(),
            nullable=False,
            comment="sub из Keycloak (владелец)",
        ),
        sa.Column("name", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("website", sa.String(length=500), nullable=True),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("industry", companyindustry_enum, nullable=False),
        sa.Column("size", companysize_enum, nullable=False),
        sa.Column("founded_year", sa.Integer(), nullable=True),
        sa.Column("about", sa.Text(), nullable=True),
        sa.Column("social_links", sa.Text(), nullable=True, comment="JSON"),
        sa.Column("benefits", sa.Text(), nullable=True, comment="JSON array"),
        sa.Column("technologies", sa.Text(), nullable=True, comment="JSON array"),
        sa.Column("registered_at", sa.Date(), nullable=True),
        sa.Column("last_active_at", sa.Date(), nullable=True),
        sa.Column("status", employerstatus_enum, server_default="active"),
        sa.Column("is_verified", sa.Boolean(), server_default="false"),
        sa.Column("block_reason", sa.Text(), nullable=True),
        sa.Column("blocked_at", sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_companies_id"), "companies", ["id"], unique=False)
    op.create_index(
        op.f("ix_companies_user_sub"), "companies", ["user_sub"], unique=True
    )

    # ============================================================
    # 2. Команда компании
    # ============================================================
    op.create_table(
        "company_members",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("user_sub", sa.String(), nullable=False, comment="sub из Keycloak"),
        sa.Column("role", memberrole_enum, nullable=False, server_default="viewer"),
        sa.Column("joined_at", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_company_members_id"), "company_members", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_company_members_user_sub"),
        "company_members",
        ["user_sub"],
        unique=False,
    )

    # ============================================================
    # 3. Вакансии
    # ============================================================
    op.create_table(
        "vacancies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("direction", direction_enum, nullable=False),
        sa.Column("grade", grade_enum, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("salary_from", sa.Integer(), nullable=True),
        sa.Column("salary_to", sa.Integer(), nullable=True),
        sa.Column("currency", sa.String(length=3), server_default="RUB"),
        sa.Column("location", sa.String(length=200), nullable=True),
        sa.Column("is_remote", sa.Boolean(), server_default="false"),
        sa.Column("status", vacancystatus_enum, server_default="draft"),
        sa.Column("published_at", sa.Date(), nullable=True),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column("created_at", sa.Date(), nullable=False),
        sa.Column("updated_at", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vacancies_id"), "vacancies", ["id"], unique=False)

    # ============================================================
    # 4. Требования к hard skills вакансии
    # ============================================================
    op.create_table(
        "vacancy_hard_skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vacancy_id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column(
            "required_percent", sa.Integer(), nullable=False, server_default="70"
        ),
        sa.ForeignKeyConstraint(["vacancy_id"], ["vacancies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["topic_id"], ["roadmap_topics.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_vacancy_hard_skills_id"), "vacancy_hard_skills", ["id"], unique=False
    )

    # ============================================================
    # 5. Требования к soft skills вакансии
    # ============================================================
    op.create_table(
        "vacancy_soft_skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vacancy_id", sa.Integer(), nullable=False),
        sa.Column("soft_skill_dict_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["vacancy_id"], ["vacancies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["soft_skill_dict_id"], ["soft_skill_dict.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_vacancy_soft_skills_id"), "vacancy_soft_skills", ["id"], unique=False
    )


def downgrade() -> None:
    op.drop_table("vacancy_soft_skills")
    op.drop_table("vacancy_hard_skills")
    op.drop_table("vacancies")
    op.drop_table("company_members")
    op.drop_table("companies")

    # Очистка ENUM типов
    postgresql.ENUM(name="companyindustry", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="companysize", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="employerstatus", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="memberrole", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="vacancystatus", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
