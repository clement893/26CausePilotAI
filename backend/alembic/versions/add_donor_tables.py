"""Add donor management tables for organization databases

Revision ID: add_donor_tables_001
Revises: None (initial migration for org databases)
Create Date: 2026-01-24

This migration is intended to be run on organization-specific databases,
not the main database. It creates all tables needed for donor management.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from typing import Union, Sequence

# revision identifiers, used by Alembic.
revision = 'add_donor_tables_001'
down_revision: Union[str, None] = None  # Initial migration for org DBs
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Get connection to check if tables exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()
    
    # Create donors table
    if 'donors' not in existing_tables:
        op.create_table(
            'donors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=True),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('address', postgresql.JSON, nullable=True),
        sa.Column('date_of_birth', sa.Date, nullable=True),
        sa.Column('preferred_language', sa.String(10), default='fr', nullable=False),
        sa.Column('tax_id', sa.String(50), nullable=True),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('is_anonymous', sa.Boolean, default=False, nullable=False),
        sa.Column('opt_in_email', sa.Boolean, default=True, nullable=False),
        sa.Column('opt_in_sms', sa.Boolean, default=False, nullable=False),
        sa.Column('opt_in_postal', sa.Boolean, default=True, nullable=False),
        sa.Column('tags', postgresql.JSON, default=list),
        sa.Column('custom_fields', postgresql.JSON, default=dict),
        sa.Column('total_donated', sa.Numeric(12, 2), default=sa.text("0.00"), nullable=False),
        sa.Column('first_donation_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_donation_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('donation_count', sa.Integer, default=0, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        )
        
        # Create indexes for donors
        op.create_index('ix_donors_id', 'donors', ['id'])
        op.create_index('ix_donors_email', 'donors', ['email'])
        op.create_index('ix_donors_organization_id', 'donors', ['organization_id'])
        op.create_index('ix_donors_first_name', 'donors', ['first_name'])
        op.create_index('ix_donors_last_name', 'donors', ['last_name'])
        op.create_index('ix_donors_is_active', 'donors', ['is_active'])
        op.create_index('ix_donors_created_at', 'donors', ['created_at'])
        op.create_index('ix_donors_total_donated', 'donors', ['total_donated'])
        op.create_index('idx_donors_email_org', 'donors', ['email', 'organization_id'])
        op.create_index('idx_donors_name', 'donors', ['last_name', 'first_name'])
        op.create_index('idx_donors_created', 'donors', ['created_at'])
        op.create_index('idx_donors_total_donated', 'donors', ['total_donated'])
    else:
        # Table exists, check and create missing indexes
        existing_indexes = [idx['name'] for idx in inspector.get_indexes('donors')]
        indexes_to_create = {
            'ix_donors_id': ['id'],
            'ix_donors_email': ['email'],
            'ix_donors_organization_id': ['organization_id'],
            'ix_donors_first_name': ['first_name'],
            'ix_donors_last_name': ['last_name'],
            'ix_donors_is_active': ['is_active'],
            'ix_donors_created_at': ['created_at'],
            'ix_donors_total_donated': ['total_donated'],
            'idx_donors_email_org': ['email', 'organization_id'],
            'idx_donors_name': ['last_name', 'first_name'],
            'idx_donors_created': ['created_at'],
            'idx_donors_total_donated': ['total_donated'],
        }
        for idx_name, idx_cols in indexes_to_create.items():
            if idx_name not in existing_indexes:
                op.create_index(idx_name, 'donors', idx_cols)
    
    # Create payment_methods table
    if 'payment_methods' not in existing_tables:
        op.create_table(
            'payment_methods',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('donor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('provider', sa.String(50), nullable=True),
        sa.Column('last_four', sa.String(4), nullable=True),
        sa.Column('expiry_month', sa.Integer, nullable=True),
        sa.Column('expiry_year', sa.Integer, nullable=True),
        sa.Column('brand', sa.String(50), nullable=True),
        sa.Column('is_default', sa.Boolean, default=False, nullable=False),
        sa.Column('is_active', sa.Boolean, default=True, nullable=False),
        sa.Column('metadata', postgresql.JSON, default=dict),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        )
        
        # Create indexes for payment_methods
        op.create_index('ix_payment_methods_id', 'payment_methods', ['id'])
        op.create_index('ix_payment_methods_donor_id', 'payment_methods', ['donor_id'])
        op.create_index('ix_payment_methods_organization_id', 'payment_methods', ['organization_id'])
        op.create_index('ix_payment_methods_is_active', 'payment_methods', ['is_active'])
        op.create_index('idx_payment_methods_donor', 'payment_methods', ['donor_id'])
        op.create_index('idx_payment_methods_active', 'payment_methods', ['is_active'])
    
    # Create donations table
    if 'donations' not in existing_tables:
        op.create_table(
            'donations',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('donor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False),
            sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('amount', sa.Numeric(12, 2), nullable=False),
            sa.Column('currency', sa.String(3), default='CAD', nullable=False),
            sa.Column('donation_type', sa.String(50), nullable=False),
            sa.Column('payment_method_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('payment_methods.id'), nullable=True),
            sa.Column('payment_status', sa.String(50), nullable=False),
            sa.Column('payment_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('receipt_number', sa.String(50), unique=True, nullable=True),
            sa.Column('receipt_sent', sa.Boolean, default=False, nullable=False),
            sa.Column('receipt_sent_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('campaign_id', postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column('designation', sa.String(255), nullable=True),
            sa.Column('notes', sa.Text, nullable=True),
            sa.Column('is_anonymous', sa.Boolean, default=False, nullable=False),
            sa.Column('is_tax_deductible', sa.Boolean, default=True, nullable=False),
            sa.Column('tax_receipt_amount', sa.Numeric(12, 2), nullable=True),
            sa.Column('metadata', postgresql.JSON, default=dict),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        )
        
        # Create indexes for donations
        op.create_index('ix_donations_id', 'donations', ['id'])
        op.create_index('ix_donations_donor_id', 'donations', ['donor_id'])
        op.create_index('ix_donations_organization_id', 'donations', ['organization_id'])
        op.create_index('ix_donations_payment_method_id', 'donations', ['payment_method_id'])
        op.create_index('ix_donations_payment_status', 'donations', ['payment_status'])
        op.create_index('ix_donations_payment_date', 'donations', ['payment_date'])
        op.create_index('ix_donations_receipt_number', 'donations', ['receipt_number'])
        op.create_index('ix_donations_donation_type', 'donations', ['donation_type'])
        op.create_index('idx_donations_donor', 'donations', ['donor_id'])
        op.create_index('idx_donations_org', 'donations', ['organization_id'])
        op.create_index('idx_donations_date', 'donations', ['payment_date'])
        op.create_index('idx_donations_status', 'donations', ['payment_status'])
        op.create_index('idx_donations_receipt', 'donations', ['receipt_number'])
    
    # Create donor_notes table
    if 'donor_notes' not in existing_tables:
        op.create_table(
            'donor_notes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('donor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('note', sa.Text, nullable=False),
        sa.Column('note_type', sa.String(50), default='general', nullable=False),
        sa.Column('created_by', sa.Integer, nullable=True),
        sa.Column('is_private', sa.Boolean, default=False, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )
        
        # Create indexes for donor_notes
        op.create_index('ix_donor_notes_id', 'donor_notes', ['id'])
        op.create_index('ix_donor_notes_donor_id', 'donor_notes', ['donor_id'])
        op.create_index('ix_donor_notes_organization_id', 'donor_notes', ['organization_id'])
        op.create_index('ix_donor_notes_created_at', 'donor_notes', ['created_at'])
        op.create_index('idx_donor_notes_donor', 'donor_notes', ['donor_id'])
        op.create_index('idx_donor_notes_created', 'donor_notes', ['created_at'])
    
    # Create donor_activities table
    if 'donor_activities' not in existing_tables:
        op.create_table(
            'donor_activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('donor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('activity_type', sa.String(50), nullable=False),
        sa.Column('activity_data', postgresql.JSON, default=dict),
        sa.Column('performed_by', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )
        
        # Create indexes for donor_activities
        op.create_index('ix_donor_activities_id', 'donor_activities', ['id'])
        op.create_index('ix_donor_activities_donor_id', 'donor_activities', ['donor_id'])
        op.create_index('ix_donor_activities_organization_id', 'donor_activities', ['organization_id'])
        op.create_index('ix_donor_activities_activity_type', 'donor_activities', ['activity_type'])
        op.create_index('ix_donor_activities_created_at', 'donor_activities', ['created_at'])
        op.create_index('idx_donor_activities_donor', 'donor_activities', ['donor_id'])
        op.create_index('idx_donor_activities_created', 'donor_activities', ['created_at'])
        op.create_index('idx_donor_activities_type', 'donor_activities', ['activity_type'])


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign keys)
    op.drop_table('donor_activities')
    op.drop_table('donor_notes')
    op.drop_table('donations')
    op.drop_table('payment_methods')
    op.drop_table('donors')
