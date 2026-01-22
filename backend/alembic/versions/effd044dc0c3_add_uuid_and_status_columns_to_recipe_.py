"""add uuid and status columns to recipe table

Revision ID: effd044dc0c3
Revises: a2c99d2c8b9b
Create Date: 2025-12-24 08:31:34.659376

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'effd044dc0c3'
down_revision: Union[str, Sequence[str], None] = 'a2c99d2c8b9b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add UUID column
    op.add_column(
        "recipes",
        sa.Column(
            "uuid",
            sa.UUID(),
            nullable=False,
            unique=True,
            server_default=sa.text("gen_random_uuid()")
        )
    )
    op.create_index("idx_recipes_uuid", "recipes", ["uuid"])

    # Add status column for soft drafts
    op.add_column(
        "recipes",
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="'draft'",
            comment="soft draft status: draft | published | archived"
        )
    )
    op.create_index("idx_recipes_status", "recipes", ["status"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("idx_recipes_status", table_name="recipes")
    op.drop_column("recipes", "status")

    op.drop_index("idx_recipes_uuid", table_name="recipes")
    op.drop_column("recipes", "uuid")
