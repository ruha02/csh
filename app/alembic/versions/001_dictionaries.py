"""dictionaries: roadmap topics and soft skills

Revision ID: 001
Revises:
Create Date: 2026-10-11 10:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ============================================================
    # 1. Справочник soft skills
    # ============================================================
    op.create_table(
        "soft_skill_dict",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=True,
            comment="Межличностные, Когнитивные...",
        ),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(
        op.f("ix_soft_skill_dict_id"), "soft_skill_dict", ["id"], unique=False
    )

    # ============================================================
    # 2. Дорожная карта (дерево тем)
    # ============================================================
    op.create_table(
        "roadmap_topics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "key",
            sa.String(length=100),
            nullable=False,
            comment="Уникальный ключ внутри направления",
        ),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("direction", sa.String(length=20), nullable=False),
        sa.Column(
            "parent_id", sa.Integer(), nullable=True, comment="NULL = корневой узел"
        ),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.ForeignKeyConstraint(["parent_id"], ["roadmap_topics.id"]),
        sa.PrimaryKeyConstraint("id"),
        # ИЗМЕНИТЬ ЭТО: Составной уникальный ключ
        sa.UniqueConstraint("key", "direction", name="uq_roadmap_topic_key_direction"),
    )
    op.create_index(
        op.f("ix_roadmap_topics_id"), "roadmap_topics", ["id"], unique=False
    )
    # Убираем уникальный индекс с key, так как теперь уникальна пара (key, direction)
    op.create_index(
        op.f("ix_roadmap_topics_key"), "roadmap_topics", ["key"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_roadmap_topics_key"), table_name="roadmap_topics")
    op.drop_index(op.f("ix_roadmap_topics_id"), table_name="roadmap_topics")
    op.drop_table("roadmap_topics")
    op.drop_index(op.f("ix_soft_skill_dict_id"), table_name="soft_skill_dict")
    op.drop_table("soft_skill_dict")
