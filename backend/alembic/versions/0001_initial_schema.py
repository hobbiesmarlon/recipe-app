"""initial schema

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-02-23 15:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial_schema'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')

    # 2. Define Enums
    oauth_provider = postgresql.ENUM('x', 'google', 'local', 'other', name='oauth_provider')
    unit_type = postgresql.ENUM('weight', 'volume', 'count', 'other', name='unit_type')
    recipe_status = postgresql.ENUM('draft', 'published', name='recipe_status')
    storage_provider = postgresql.ENUM('minio', 's3', name='storage_provider')
    media_type = postgresql.ENUM('image', 'video', name='media_type')

    # Create Enums in DB
    oauth_provider.create(op.get_bind(), checkfirst=True)
    unit_type.create(op.get_bind(), checkfirst=True)
    recipe_status.create(op.get_bind(), checkfirst=True)
    storage_provider.create(op.get_bind(), checkfirst=True)
    media_type.create(op.get_bind(), checkfirst=True)

    # 3. Independent Tables
    op.create_table('users',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('username', sa.Text(), nullable=False),
        sa.Column('display_name', sa.Text(), nullable=False),
        sa.Column('email', sa.Text(), nullable=True),
        sa.Column('profile_picture_url', sa.Text(), nullable=True),
        sa.Column('username_sourced_from_provider', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('display_name_sourced_from_provider', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('profile_pic_sourced_from_provider', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )

    op.create_table('category_groups',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    op.create_table('ingredients',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('base_ingredient_id', sa.BigInteger(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['base_ingredient_id'], ['ingredients.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    op.create_table('units',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('symbol', sa.Text(), nullable=True),
        sa.Column('unit_type', unit_type, server_default='other', nullable=False),
        sa.Column('conversion_to_base', sa.Float(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # 4. Dependent Tables
    op.create_table('oauth_accounts',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('provider', oauth_provider, nullable=False),
        sa.Column('provider_user_id', sa.Text(), nullable=False),
        sa.Column('provider_username', sa.Text(), nullable=True),
        sa.Column('provider_display_name', sa.Text(), nullable=True),
        sa.Column('provider_profile_pic_url', sa.Text(), nullable=True),
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('token_expires_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('provider', 'provider_user_id', name='uq_provider_user')
    )

    op.create_table('categories',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('group_id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['category_groups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('group_id', 'name', name='uq_category_group_name')
    )

    op.create_table('recipes',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('uuid', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=True),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('chefs_note', sa.Text(), nullable=True),
        sa.Column('cook_time_minutes', sa.Integer(), nullable=True),
        sa.Column('servings', sa.Integer(), nullable=True),
        sa.Column('is_public', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('status', recipe_status, server_default='draft', nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('search_vector', postgresql.TSVECTOR(), sa.Computed("to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(chefs_note, ''))", persisted=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('uuid')
    )

    op.create_table('recipe_ingredients',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('recipe_id', sa.BigInteger(), nullable=False),
        sa.Column('ingredient_id', sa.BigInteger(), nullable=True),
        sa.Column('name_text', sa.Text(), nullable=False),
        sa.Column('quantity', sa.Numeric(precision=12, scale=4), nullable=True),
        sa.Column('unit_id', sa.BigInteger(), nullable=True),
        sa.Column('quantity_text', sa.Text(), nullable=True),
        sa.Column('preparation_notes', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['ingredient_id'], ['ingredients.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('recipe_steps',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('recipe_id', sa.BigInteger(), nullable=False),
        sa.Column('step_number', sa.Integer(), nullable=False),
        sa.Column('instruction', sa.Text(), nullable=False),
        sa.Column('estimated_minutes', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('recipe_id', 'step_number', name='uq_recipe_step')
    )

    op.create_table('recipe_media',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('recipe_id', sa.BigInteger(), nullable=False),
        sa.Column('recipe_uuid', sa.UUID(), nullable=True),
        sa.Column('storage_provider', storage_provider, nullable=False),
        sa.Column('bucket', sa.Text(), nullable=False),
        sa.Column('object_key', sa.Text(), nullable=False),
        sa.Column('media_type', media_type, nullable=False),
        sa.Column('content_type', sa.Text(), nullable=False),
        sa.Column('size_bytes', sa.BigInteger(), nullable=False),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('processed', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('processing_error', sa.String(), nullable=True),
        sa.Column('thumbnail_small_key', sa.Text(), nullable=True),
        sa.Column('thumbnail_medium_key', sa.Text(), nullable=True),
        sa.Column('thumbnail_large_key', sa.Text(), nullable=True),
        sa.Column('key', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('is_primary', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('display_order', sa.Integer(), server_default='0', nullable=False),
        sa.Column('url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('recipe_likes',
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('recipe_id', sa.BigInteger(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'recipe_id')
    )

    op.create_table('user_saved_recipes',
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('recipe_id', sa.BigInteger(), nullable=False),
        sa.Column('saved_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'recipe_id')
    )

    op.create_table('user_recipe_views',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', sa.BigInteger(), nullable=False),
        sa.Column('recipe_id', sa.BigInteger(), nullable=False),
        sa.Column('viewed_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('ingredient_aliases',
        sa.Column('alias_text', sa.Text(), nullable=False),
        sa.Column('canonical_ingredient_id', sa.BigInteger(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['canonical_ingredient_id'], ['ingredients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('alias_text')
    )

    op.create_table('recipe_categories',
        sa.Column('recipe_id', sa.BigInteger(), nullable=False),
        sa.Column('category_id', sa.BigInteger(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('recipe_id', 'category_id')
    )

    # 5. Indexes
    op.create_index('idx_recipes_search_vector', 'recipes', ['search_vector'], postgresql_using='gin')
    op.create_index('idx_recipes_name_trgm', 'recipes', ['name'], postgresql_using='gin', postgresql_ops={'name': 'gin_trgm_ops'})
    op.create_index('idx_recipes_description_trgm', 'recipes', ['description'], postgresql_using='gin', postgresql_ops={'description': 'gin_trgm_ops'})
    op.create_index('idx_recipe_media_recipe_id', 'recipe_media', ['recipe_id'])
    op.create_index('idx_recipe_media_type', 'recipe_media', ['media_type'])
    op.create_index('idx_recipe_media_primary', 'recipe_media', ['is_primary'])
    op.create_index('idx_recipe_media_order', 'recipe_media', ['display_order'])


def downgrade() -> None:
    # Drop in reverse order
    op.drop_table('recipe_categories')
    op.drop_table('ingredient_aliases')
    op.drop_table('user_recipe_views')
    op.drop_table('user_saved_recipes')
    op.drop_table('recipe_likes')
    op.drop_table('recipe_media')
    op.drop_table('recipe_steps')
    op.drop_table('recipe_ingredients')
    op.drop_table('recipes')
    op.drop_table('categories')
    op.drop_table('oauth_accounts')
    op.drop_table('units')
    op.drop_table('ingredients')
    op.drop_table('category_groups')
    op.drop_table('users')
    
    op.execute("DROP TYPE IF EXISTS media_type")
    op.execute("DROP TYPE IF EXISTS storage_provider")
    op.execute("DROP TYPE IF EXISTS recipe_status")
    op.execute("DROP TYPE IF EXISTS unit_type")
    op.execute("DROP TYPE IF EXISTS oauth_provider")
