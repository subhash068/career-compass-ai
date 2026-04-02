"""add_is_verified_to_users
Revision ID: 010
Revises: 009
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '010'
down_revision = '009'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('users', 'is_verified')
