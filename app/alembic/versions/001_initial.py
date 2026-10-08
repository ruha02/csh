"""initial migration

Revision ID: 001
Revises: 
Create Date: 2026-10-08 12:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Создаём таблицу candidates
    op.create_table(
        'candidates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_sub', sa.String(), nullable=False, comment='sub из Keycloak JWT'),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('middle_name', sa.String(length=100), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('telegram', sa.String(length=100), nullable=True),
        sa.Column('about_me', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_candidates_id'), 'candidates', ['id'], unique=False)
    op.create_index(op.f('ix_candidates_user_sub'), 'candidates', ['user_sub'], unique=True)

    # Создаём таблицу work_experiences
    op.create_table(
        'work_experiences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('company', sa.String(length=200), nullable=False),
        sa.Column('position', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_work_experiences_id'), 'work_experiences', ['id'], unique=False)

    # Создаём таблицу soft_skills
    op.create_table(
        'soft_skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('candidate_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['candidate_id'], ['candidates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_soft_skills_id'), 'soft_skills', ['id'], unique=False)


def downgrade() -> None:
    # Удаляем таблицы в обратном порядке (сначала дочерние)
    op.drop_table('soft_skills')
    op.drop_table('work_experiences')
    op.drop_table('candidates')
