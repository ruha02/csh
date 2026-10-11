"""interaction, questions, settings

Revision ID: 004
Revises: 003
Create Date: 2026-10-11 13:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "004"
down_revision: str | None = "003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ============================================================
    # Enums
    # ============================================================
    tasksource_enum = postgresql.ENUM(
        "employer", "ai", name="tasksource", create_type=True
    )
    taskstatus_enum = postgresql.ENUM(
        "pending",
        "in_progress",
        "submitted",
        "evaluated",
        name="taskstatus",
        create_type=True,
    )
    taskresult_enum = postgresql.ENUM(
        "accepted", "rejected", name="taskresult", create_type=True
    )
    responsestatus_enum = postgresql.ENUM(
        "pending",
        "viewed",
        "accepted",
        "rejected",
        name="responsestatus",
        create_type=True,
    )
    invitationstatus_enum = postgresql.ENUM(
        "pending",
        "accepted",
        "rejected",
        "expired",
        name="invitationstatus",
        create_type=True,
    )
    chatsender_enum = postgresql.ENUM(
        "candidate", "employer", name="chatsender", create_type=True
    )
    questiontype_enum = postgresql.ENUM(
        "single", "multiple", "text", name="questiontype", create_type=True
    )

    # ============================================================
    # 1. Тестовые задания
    # ============================================================
    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vacancy_id", sa.Integer(), nullable=True),
        sa.Column("resume_id", sa.Integer(), nullable=True),
        sa.Column("response_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("employer_name", sa.String(length=200), nullable=False),
        sa.Column("source", tasksource_enum, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("direction", sa.String(length=20), nullable=True),
        sa.Column("grade", sa.String(length=20), nullable=True),
        sa.Column("status", taskstatus_enum, server_default="pending"),
        sa.Column("result", taskresult_enum, nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("solution_url", sa.String(length=500), nullable=True),
        sa.Column("solution_file_name", sa.String(length=200), nullable=True),
        sa.Column("is_public", sa.Boolean(), server_default="false"),
        sa.Column("received_at", sa.DateTime(), nullable=False),
        sa.Column("deadline", sa.DateTime(), nullable=True),
        sa.Column("accepted_at", sa.DateTime(), nullable=True),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
        sa.Column("evaluated_at", sa.DateTime(), nullable=True),
        sa.Column("ai_generated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["vacancy_id"], ["vacancies.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tasks_id"), "tasks", ["id"], unique=False)

    # ============================================================
    # 2. Отклики
    # ============================================================
    op.create_table(
        "responses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vacancy_id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=True),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("status", responsestatus_enum, server_default="pending"),
        sa.Column("task_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("viewed_at", sa.DateTime(), nullable=True),
        sa.Column("responded_at", sa.DateTime(), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["vacancy_id"], ["vacancies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_responses_id"), "responses", ["id"], unique=False)

    # ============================================================
    # 3. Приглашения
    # ============================================================
    op.create_table(
        "invitations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("vacancy_id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", invitationstatus_enum, server_default="pending"),
        sa.Column("task_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.Column("responded_at", sa.DateTime(), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["vacancy_id"], ["vacancies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"]),
        sa.ForeignKeyConstraint(["task_id"], ["tasks.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_invitations_id"), "invitations", ["id"], unique=False)

    # ============================================================
    # 4. Сообщения чата
    # ============================================================
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("response_id", sa.Integer(), nullable=True),
        sa.Column("invitation_id", sa.Integer(), nullable=True),
        sa.Column("sender", chatsender_enum, nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("timestamp", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["response_id"], ["responses.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["invitation_id"], ["invitations.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_chat_messages_id"), "chat_messages", ["id"], unique=False)

    # ============================================================
    # 5. Банк вопросов
    # ============================================================
    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("topic_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("question_type", questiontype_enum, nullable=False),
        sa.Column("correct_answer", sa.Text(), nullable=True),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(
            ["topic_id"], ["roadmap_topics.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_questions_id"), "questions", ["id"], unique=False)

    op.create_table(
        "question_options",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("is_anti_ai", sa.Boolean(), server_default="false"),
        sa.ForeignKeyConstraint(["question_id"], ["questions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_question_options_id"), "question_options", ["id"], unique=False
    )

    # ============================================================
    # 6. Настройки
    # ============================================================
    op.create_table(
        "candidate_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("candidate_id", sa.Integer(), nullable=False),
        sa.Column("notifications", sa.Text(), nullable=True, comment="JSON"),
        sa.Column("privacy", sa.Text(), nullable=True, comment="JSON"),
        sa.Column("integrations", sa.Text(), nullable=True, comment="JSON"),
        sa.ForeignKeyConstraint(
            ["candidate_id"], ["candidates.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("candidate_id"),
    )
    op.create_index(
        op.f("ix_candidate_settings_id"), "candidate_settings", ["id"], unique=False
    )

    op.create_table(
        "employer_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("notifications", sa.Text(), nullable=True, comment="JSON"),
        sa.Column("vacancy_defaults", sa.Text(), nullable=True, comment="JSON"),
        sa.Column("privacy", sa.Text(), nullable=True, comment="JSON"),
        sa.Column("integrations", sa.Text(), nullable=True, comment="JSON"),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("company_id"),
    )
    op.create_index(
        op.f("ix_employer_settings_id"), "employer_settings", ["id"], unique=False
    )


def downgrade() -> None:
    op.drop_table("employer_settings")
    op.drop_table("candidate_settings")
    op.drop_table("question_options")
    op.drop_table("questions")
    op.drop_table("chat_messages")
    op.drop_table("invitations")
    op.drop_table("responses")
    op.drop_table("tasks")

    # Очистка ENUM типов
    postgresql.ENUM(name="tasksource", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="taskstatus", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="taskresult", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="responsestatus", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="invitationstatus", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="chatsender", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
    postgresql.ENUM(name="questiontype", create_type=False).drop(
        op.get_bind(), checkfirst=True
    )
