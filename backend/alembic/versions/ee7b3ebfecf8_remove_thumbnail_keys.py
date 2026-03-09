"""remove_thumbnail_keys

Revision ID: ee7b3ebfecf8
Revises: 5689e43f5ed1
Create Date: 2026-03-09 14:29:23.008879

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ee7b3ebfecf8'
down_revision: Union[str, Sequence[str], None] = '5689e43f5ed1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column('recipe_media', 'thumbnail_small_key')
    op.drop_column('recipe_media', 'thumbnail_medium_key')
    op.drop_column('recipe_media', 'thumbnail_large_key')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('recipe_media', sa.Column('thumbnail_small_key', sa.Text(), nullable=True))
    op.add_column('recipe_media', sa.Column('thumbnail_medium_key', sa.Text(), nullable=True))
    op.add_column('recipe_media', sa.Column('thumbnail_large_key', sa.Text(), nullable=True))
