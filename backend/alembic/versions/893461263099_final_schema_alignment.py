"""final_schema_alignment

Revision ID: 893461263099
Revises: 0c05b3eed3e6
Create Date: 2025-12-22 11:03:22.451708

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '893461263099'
down_revision: Union[str, Sequence[str], None] = '0c05b3eed3e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Surgical upgrade: Add missing columns, skip dangerous drops."""
    
    # 1. ADD missing 'updated_at' columns (Safe: these are new to your old schema)
    op.add_column('categories', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('category_groups', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('ingredients', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('recipe_categories', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('recipe_categories', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('recipe_ingredients', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('recipe_photos', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('recipe_photos', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('recipe_steps', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('units', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('user_recipe_views', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('user_recipe_views', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('user_saved_recipes', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('user_saved_recipes', sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))

    # 2. FIX the Full-Text Search Index (Matches your Recipe model exactly)
    op.drop_index('idx_recipes_name_desc_fts', table_name='recipes', postgresql_using='gin')
    op.create_index('idx_recipes_name_desc_fts', 'recipes', [sa.text("to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))")], unique=False, postgresql_using='gin')

    # 3. IGNORE everything else (No drops, no alters of existing columns)
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema - Cleaned to match surgical upgrade."""
    
    # 1. REMOVE the 'updated_at' columns we added
    op.drop_column('user_saved_recipes', 'updated_at')
    op.drop_column('user_saved_recipes', 'created_at')
    op.drop_column('user_recipe_views', 'updated_at')
    op.drop_column('user_recipe_views', 'created_at')
    op.drop_column('units', 'updated_at')
    op.drop_column('recipe_steps', 'updated_at')
    op.drop_column('recipe_photos', 'updated_at')
    op.drop_column('recipe_photos', 'created_at')
    op.drop_column('recipe_ingredients', 'updated_at')
    op.drop_column('recipe_categories', 'updated_at')
    op.drop_column('recipe_categories', 'created_at')
    op.add_column('recipe_photos', sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False))
    op.drop_column('ingredients', 'updated_at')
    op.drop_column('category_groups', 'updated_at')
    op.drop_column('categories', 'updated_at')

    # 2. RESTORE the original FTS index format (reversing the fix)
    op.drop_index('idx_recipes_name_desc_fts', table_name='recipes', postgresql_using='gin')
    op.create_index('idx_recipes_name_desc_fts', 'recipes', [sa.text("to_tsvector('english'::regconfig, (COALESCE(name, ''::text) || ' '::text) || COALESCE(description, ''::text))")], unique=False, postgresql_using='gin')

    # 3. IGNORE all the other 'create_index' and 'alter_column' commands
    pass