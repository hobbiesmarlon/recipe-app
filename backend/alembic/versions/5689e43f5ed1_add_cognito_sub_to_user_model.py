"""add cognito_sub to user model

Revision ID: 5689e43f5ed1
Revises: 0001_initial_schema
Create Date: 2026-03-04 13:27:54.846584

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5689e43f5ed1'
down_revision: Union[str, Sequence[str], None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('cognito_sub', sa.Text(), nullable=True))
    op.create_unique_constraint('uq_users_cognito_sub', 'users', ['cognito_sub'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_users_cognito_sub', 'users', type_='unique')
    op.drop_column('users', 'cognito_sub')
