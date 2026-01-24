"""Add organizations tables

Revision ID: add_organizations_001
Revises: 032_make_name_nullable
Create Date: 2026-01-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from typing import Union, Sequence

# revision identifiers, used by Alembic.
revision = 'add_organizations_001'
down_revision: Union[str, None] = '032_make_name_nullable'  # Latest migration
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False, unique=True),
        sa.Column('db_connection_string', sa.Text, nullable=False),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('settings', postgresql.JSON, default=dict),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )
    
    # Create indexes for organizations
    op.create_index('ix_organizations_id', 'organizations', ['id'])
    op.create_index('ix_organizations_name', 'organizations', ['name'])
    op.create_index('ix_organizations_slug', 'organizations', ['slug'])
    op.create_index('ix_organizations_is_active', 'organizations', ['is_active'])
    
    # Create organization_modules table
    op.create_table(
        'organization_modules',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('module_key', sa.String(50), nullable=False),
        sa.Column('is_enabled', sa.Boolean, default=False, nullable=False),
        sa.Column('settings', postgresql.JSON, default=dict),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    # Create indexes and constraints for organization_modules
    op.create_index('ix_organization_modules_id', 'organization_modules', ['id'])
    op.create_index('ix_organization_modules_organization_id', 'organization_modules', ['organization_id'])
    op.create_index('ix_organization_modules_module_key', 'organization_modules', ['module_key'])
    op.create_index('ix_organization_modules_is_enabled', 'organization_modules', ['is_enabled'])
    op.create_unique_constraint('uq_org_module', 'organization_modules', ['organization_id', 'module_key'])
    
    # Create organization_members table
    op.create_table(
        'organization_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_email', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), default='member', nullable=False),
        sa.Column('invited_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),  # User.id is Integer, not UUID
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    
    # Create indexes and constraints for organization_members
    op.create_index('ix_organization_members_id', 'organization_members', ['id'])
    op.create_index('ix_organization_members_organization_id', 'organization_members', ['organization_id'])
    op.create_index('ix_organization_members_user_email', 'organization_members', ['user_email'])
    op.create_unique_constraint('uq_org_member', 'organization_members', ['organization_id', 'user_email'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('organization_members')
    op.drop_table('organization_modules')
    op.drop_table('organizations')
