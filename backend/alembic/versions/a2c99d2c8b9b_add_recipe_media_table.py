"""add recipe_media table

Revision ID: a2c99d2c8b9b
Revises: 893461263099
Create Date: 2025-12-24 08:19:01.531633
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a2c99d2c8b9b"
down_revision: Union[str, Sequence[str], None] = "893461263099"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add recipe_media table (additive-only).

    This table replaces / supersedes recipe_photos at the application level
    without modifying or dropping any existing tables.
    """
    op.create_table(
        "recipe_media",
        sa.Column(
            "id",
            sa.UUID(),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "recipe_id",
            sa.Integer(),
            sa.ForeignKey("recipes.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "media_type",
            sa.String(length=20),
            nullable=False,
            comment="e.g. image, video",
        ),
        sa.Column(
            "url",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "display_order",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_index(
        "ix_recipe_media_recipe_id",
        "recipe_media",
        ["recipe_id"],
    )

    op.create_index(
        "ix_recipe_media_media_type",
        "recipe_media",
        ["media_type"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_recipe_media_media_type", table_name="recipe_media")
    op.drop_index("ix_recipe_media_recipe_id", table_name="recipe_media")
    op.drop_table("recipe_media")
