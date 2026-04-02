"""Add user profile fields: first_name, last_name, location, experience_years, bio

Revision ID: 011_add_user_profile_fields
Revises: 010_add_is_verified_to_users
Create Date: 2024 (manual)

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '011_add_user_profile_fields'
down_revision = '010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns
    op.add_column('users', sa.Column('first_name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('last_name', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(length=200), nullable=True))
    op.add_column('users', sa.Column('experience_years', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))

    # Populate first_name/last_name from existing name (split on space)
    op.execute("""
        UPDATE users 
        SET 
            first_name = TRIM(SUBSTR(name, 1, INSTR(name || ' ', ' ') - 1)),
            last_name = TRIM(SUBSTR(name, INSTR(name || ' ', ' ') + 1))
        WHERE name IS NOT NULL AND name != ''
    """)


def downgrade() -> None:
    # Drop new columns
    op.drop_column('users', 'bio')
    op.drop_column('users', 'experience_years')
    op.drop_column('users', 'location')
    op.drop_column('users', 'last_name')
    op.drop_column('users', 'first_name')
