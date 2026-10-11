"""candidate core: profile, skills, education, experience, resumes, fsp, tests

Revision ID: 002
Revises: 001
Create Date: 2026-10-11 11:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ============================================================
    # Enums
    # ============================================================
    candidatestatus_enum = postgresql.ENUM(
        "active",
        "blocked",
        "pending_verification",
        name="candidatestatus",
        create_type=True,
    )
    direction_enum = postgresql.ENUM(
        "frontend",
        "backend",
        "devops",
        "mobile",
        "data",
        "qa",
        name="direction",
        create_type=True,
    )
    grade_enum = postgresql.ENUM(
        "junior", "middle", "senior", name="grade", create_type=True
    )
    fspresult_enum = postgresql.ENUM(
        "first_place",
        "second_place",
        "third_place",
        "participation",
        name="fspresult",
        create_type=True,
    )
    participationtype_enum = postgresql.ENUM(
        "individual", "team", name="participationtype", create_type=True
    )
    teamrole_enum = postgresql.ENUM(
        "backend",
        "frontend",
        "designer",
        "project_manager",
        "analyst",
        "qa",
        "other",
        name="teamrole",
        create_type=True,
    )

    # ============================================================
    # 1. Кандидаты
    # ============================================================
    op.create_table(
        "candidates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "user_sub", sa.String(), nullable=False, comment="sub из Keycloak JWT"
        ),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("middle_name", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("email", sa.String(length=100), nullable=True),
        sa.Column("telegram", sa.String(length=100), nullable=True),
        sa.Column("about_me", sa.Text(), nullable=True),
        sa.Column("registered_at", sa.Date(), nullable=True),
        sa.Column("last_active_at", sa.Date(), nullable=True),
        sa.Column("status", candidatestatus_enum, server_default="active"),
        sa.Column("is_verified", sa.Boolean(), server_default="false"),
        sa.Column("block_reason", sa.Text(), nullable=True),
        sa.Column("blocked_at", sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_candidates_id"), "candidates", ["id"], unique=False)
    op.create_index(
        op.f("ix_candidates_user_sub"), "candidates", ["user_sub"], unique=True
    )

    # ============================================================
    # 2. Навыки кандидата
    # ============================================================
    op.create_table(
        "candidate_skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("direction", direction_enum, nullable=False),
        sa.Column("grade", grade_enum, nullable=False),
        sa.Column(
            "language",
            sa.String(length=100),
            nullable=False,
            comment="Язык/технология: TypeScript, Python...",
        ),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_candidate_skills_id"), "candidate_skills", ["id"], unique=False
    )

    # ============================================================
    # 3. Образование
    # ============================================================
    op.create_table(
        "educations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("institution", sa.String(length=300), nullable=False),
        sa.Column("specialty", sa.String(length=300), nullable=False),
        sa.Column("degree", sa.String(length=100), nullable=True),
        sa.Column("start_year", sa.Integer(), nullable=False),
        sa.Column("end_year", sa.Integer(), nullable=True),
        sa.Column("is_current", sa.Boolean(), server_default="false"),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_educations_id"), "educations", ["id"], unique=False)

    # ============================================================
    # 4. Опыт работы
    # ============================================================
    op.create_table(
        "work_experiences",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("is_current", sa.Boolean(), server_default="false"),
        sa.Column("company", sa.String(length=200), nullable=False),
        sa.Column("position", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_work_experiences_id"), "work_experiences", ["id"], unique=False
    )

    # ============================================================
    # 5. Soft skills кандидата
    # ============================================================
    op.create_table(
        "candidate_soft_skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("soft_skill_dict_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["soft_skill_dict_id"], ["soft_skill_dict.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "candidate_id", "soft_skill_dict_id", name="uq_candidate_soft_skill"
        ),
    )
    op.create_index(
        op.f("ix_candidate_soft_skills_id"),
        "candidate_soft_skills",
        ["id"],
        unique=False,
    )

    # ============================================================
    # 6. Резюме
    # ============================================================
    op.create_table(
        "resumes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("salary_from", sa.Integer(), nullable=True),
        sa.Column("salary_to", sa.Integer(), nullable=True),
        sa.Column("currency", sa.String(length=3), server_default="RUB"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.Date(), nullable=False),
        sa.Column("updated_at", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["skill_id"], ["candidate_skills.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_resumes_id"), "resumes", ["id"], unique=False)

    # ============================================================
    # 7. Участия в ФСП
    # ============================================================
    op.create_table(
        "fsp_participations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("event_name", sa.String(length=300), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("result", fspresult_enum, nullable=False),
        sa.Column("result_details", sa.String(length=500), nullable=True),
        sa.Column("participation_type", participationtype_enum, nullable=False),
        sa.Column("team_role", teamrole_enum, nullable=True),
        sa.Column("team_name", sa.String(length=200), nullable=True),
        sa.Column("organizer", sa.String(length=200), nullable=True),
        sa.Column("location", sa.String(length=200), nullable=True),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_fsp_participations_id"), "fsp_participations", ["id"], unique=False
    )

    # ============================================================
    # 8. Результаты тестов по темам
    # ============================================================
    op.create_table(
        "topic_tests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_skill_id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("best_score", sa.Integer(), server_default="0"),
        sa.Column("last_score", sa.Integer(), server_default="0"),
        sa.Column("attempts", sa.Integer(), server_default="0"),
        sa.Column("passed", sa.Boolean(), server_default="false"),
        sa.Column("last_attempt_date", sa.Date(), nullable=True),
        sa.Column("next_attempt_date", sa.Date(), nullable=True),
        sa.Column("locked", sa.Boolean(), server_default="false"),
        sa.ForeignKeyConstraint(
            ["candidate_skill_id"], ["candidate_skills.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["topic_id"], ["roadmap_topics.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "candidate_skill_id", "topic_id", name="uq_candidate_skill_topic"
        ),
    )
    op.create_index(op.f("ix_topic_tests_id"), "topic_tests", ["id"], unique=False)


def downgrade() -> None:
    op.drop_table("topic_tests")
    op.drop_table("fsp_participations")
    op.drop_table("resumes")
    op.drop_table("candidate_soft_skills")
    op.drop_table("work_experiences")
    op.drop_table("educations")
    op.drop_table("candidate_skills")
    op.drop_table("candidates")

    # Очистка ENUM типов
    postgresql.ENUM(name="candidatestatus", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="direction", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="grade", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="fspresult", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="participationtype", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="teamrole", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
