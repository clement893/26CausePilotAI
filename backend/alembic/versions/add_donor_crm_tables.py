"""Add CRM tables for donor management (segments, tags, communications, campaigns, recurring donations)

Revision ID: add_donor_crm_002
Revises: add_donor_tables_001
Create Date: 2026-01-24

This migration adds advanced CRM features:
- Donor segments and assignments
- Donor tags and assignments
- Donor communications
- Campaigns
- Recurring donations
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from typing import Union, Sequence

# revision identifiers, used by Alembic.
revision = 'add_donor_crm_002'
down_revision: Union[str, None] = 'add_donor_tables_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Get connection to check if tables exist
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing_tables = inspector.get_table_names()
    
    # Create donor_segments table
    if 'donor_segments' not in existing_tables:
        op.create_table(
            'donor_segments',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('description', sa.Text, nullable=True),
            sa.Column('criteria', postgresql.JSON, default=dict),
            sa.Column('is_automatic', sa.Boolean, default=False, nullable=False),
            sa.Column('color', sa.String(7), nullable=True),
            sa.Column('donor_count', sa.Integer, default=0, nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        )
        
        op.create_index('ix_donor_segments_id', 'donor_segments', ['id'])
        op.create_index('idx_donor_segments_org', 'donor_segments', ['organization_id'])
        op.create_index('idx_donor_segments_name', 'donor_segments', ['name'])
    
    # Create donor_segment_assignments table
    if 'donor_segment_assignments' not in existing_tables:
        op.create_table(
            'donor_segment_assignments',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('donor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False),
            sa.Column('segment_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donor_segments.id', ondelete='CASCADE'), nullable=False),
            sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('assigned_by', sa.Integer, nullable=True),
        )
        
        op.create_index('ix_donor_segment_assignments_id', 'donor_segment_assignments', ['id'])
        op.create_index('idx_donor_segment_assignments_donor', 'donor_segment_assignments', ['donor_id'])
        op.create_index('idx_donor_segment_assignments_segment', 'donor_segment_assignments', ['segment_id'])
        op.create_unique_constraint('uq_donor_segment', 'donor_segment_assignments', ['donor_id', 'segment_id'])
    
    # Create donor_tags table
    if 'donor_tags' not in existing_tables:
        op.create_table(
            'donor_tags',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('name', sa.String(100), nullable=False),
            sa.Column('description', sa.Text, nullable=True),
            sa.Column('color', sa.String(7), nullable=True),
            sa.Column('icon', sa.String(50), nullable=True),
            sa.Column('donor_count', sa.Integer, default=0, nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )
        
        op.create_index('ix_donor_tags_id', 'donor_tags', ['id'])
        op.create_index('idx_donor_tags_org', 'donor_tags', ['organization_id'])
        op.create_index('idx_donor_tags_name', 'donor_tags', ['name'])
        op.create_unique_constraint('uq_org_tag_name', 'donor_tags', ['organization_id', 'name'])
    
    # Create donor_tag_assignments table
    if 'donor_tag_assignments' not in existing_tables:
        op.create_table(
            'donor_tag_assignments',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('donor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False),
            sa.Column('tag_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donor_tags.id', ondelete='CASCADE'), nullable=False),
            sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('assigned_by', sa.Integer, nullable=True),
        )
        
        op.create_index('ix_donor_tag_assignments_id', 'donor_tag_assignments', ['id'])
        op.create_index('idx_donor_tag_assignments_donor', 'donor_tag_assignments', ['donor_id'])
        op.create_index('idx_donor_tag_assignments_tag', 'donor_tag_assignments', ['tag_id'])
        op.create_unique_constraint('uq_donor_tag', 'donor_tag_assignments', ['donor_id', 'tag_id'])
    
    # Create donor_communications table
    if 'donor_communications' not in existing_tables:
        op.create_table(
            'donor_communications',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('donor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False),
            sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('communication_type', sa.String(50), nullable=False),
            sa.Column('subject', sa.String(255), nullable=True),
            sa.Column('content', sa.Text, nullable=False),
            sa.Column('status', sa.String(50), default='sent', nullable=False),
            sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('opened_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('clicked_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('sent_by', sa.Integer, nullable=True),
            sa.Column('metadata', postgresql.JSON, default=dict),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        )
        
        op.create_index('ix_donor_communications_id', 'donor_communications', ['id'])
        op.create_index('idx_donor_communications_donor', 'donor_communications', ['donor_id'])
        op.create_index('idx_donor_communications_org', 'donor_communications', ['organization_id'])
        op.create_index('idx_donor_communications_type', 'donor_communications', ['communication_type'])
        op.create_index('idx_donor_communications_status', 'donor_communications', ['status'])
        op.create_index('idx_donor_communications_sent', 'donor_communications', ['sent_at'])
    
    # Create campaigns table
    if 'campaigns' not in existing_tables:
        op.create_table(
            'campaigns',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('description', sa.Text, nullable=True),
            sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('goal_amount', sa.Numeric(12, 2), nullable=True),
            sa.Column('goal_donors', sa.Integer, nullable=True),
            sa.Column('status', sa.String(50), default='draft', nullable=False),
            sa.Column('total_raised', sa.Numeric(12, 2), default=sa.text("0.00"), nullable=False),
            sa.Column('donor_count', sa.Integer, default=0, nullable=False),
            sa.Column('donation_count', sa.Integer, default=0, nullable=False),
            sa.Column('image_url', sa.String(500), nullable=True),
            sa.Column('external_url', sa.String(500), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        )
        
        op.create_index('ix_campaigns_id', 'campaigns', ['id'])
        op.create_index('idx_campaigns_org', 'campaigns', ['organization_id'])
        op.create_index('idx_campaigns_status', 'campaigns', ['status'])
        op.create_index('idx_campaigns_dates', 'campaigns', ['start_date', 'end_date'])
    
    # Update donations table to add foreign keys for campaign and recurring_donation
    # Refresh inspector to get updated table list after creating campaigns
    if 'donations' in existing_tables:
        # Refresh inspector to see newly created tables
        inspector = sa.inspect(conn)
        updated_tables = inspector.get_table_names()
        # Check if columns already exist
        existing_columns = [col['name'] for col in inspector.get_columns('donations')]
        
        # campaign_id should already exist from add_donor_tables_001, but check anyway
        # recurring_donation_id needs to be added
        if 'recurring_donation_id' not in existing_columns:
            op.add_column('donations', sa.Column('recurring_donation_id', postgresql.UUID(as_uuid=True), nullable=True))
        
        # Check if foreign keys already exist
        existing_fks = [fk['name'] for fk in inspector.get_foreign_keys('donations')]
        if 'fk_donations_campaign' not in existing_fks and 'campaign_id' in existing_columns:
            # Only create FK if campaigns table exists (check updated tables list)
            if 'campaigns' in updated_tables:
                op.create_foreign_key('fk_donations_campaign', 'donations', 'campaigns', ['campaign_id'], ['id'], ondelete='SET NULL')
        
        # Check if indexes already exist
        existing_indexes = [idx['name'] for idx in inspector.get_indexes('donations')]
        if 'idx_donations_campaign' not in existing_indexes and 'campaign_id' in existing_columns:
            op.create_index('idx_donations_campaign', 'donations', ['campaign_id'])
        if 'idx_donations_recurring' not in existing_indexes and 'recurring_donation_id' in existing_columns:
            op.create_index('idx_donations_recurring', 'donations', ['recurring_donation_id'])
    
    # Create recurring_donations table
    if 'recurring_donations' not in existing_tables:
        op.create_table(
            'recurring_donations',
            sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column('donor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False),
            sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('amount', sa.Numeric(12, 2), nullable=False),
            sa.Column('currency', sa.String(3), default='CAD', nullable=False),
            sa.Column('frequency', sa.String(50), nullable=False),
            sa.Column('payment_method_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('payment_methods.id'), nullable=False),
            sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
            sa.Column('next_payment_date', sa.DateTime(timezone=True), nullable=False),
            sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('status', sa.String(50), default='active', nullable=False),
            sa.Column('total_payments', sa.Integer, default=0, nullable=False),
            sa.Column('total_amount', sa.Numeric(12, 2), default=sa.text("0.00"), nullable=False),
            sa.Column('last_payment_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('consecutive_failures', sa.Integer, default=0, nullable=False),
            sa.Column('last_failure_reason', sa.String(255), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        )
        
        op.create_index('ix_recurring_donations_id', 'recurring_donations', ['id'])
        op.create_index('idx_recurring_donations_donor', 'recurring_donations', ['donor_id'])
        op.create_index('idx_recurring_donations_org', 'recurring_donations', ['organization_id'])
        op.create_index('idx_recurring_donations_status', 'recurring_donations', ['status'])
        op.create_index('idx_recurring_donations_next_payment', 'recurring_donations', ['next_payment_date'])
    
    # Add foreign key for recurring_donation_id in donations
    # Refresh inspector again to see recurring_donations table
    if 'donations' in existing_tables:
        inspector = sa.inspect(conn)
        final_tables = inspector.get_table_names()
        if 'recurring_donations' in final_tables:
            existing_fks = [fk['name'] for fk in inspector.get_foreign_keys('donations')]
            existing_columns = [col['name'] for col in inspector.get_columns('donations')]
            if 'fk_donations_recurring' not in existing_fks and 'recurring_donation_id' in existing_columns:
                op.create_foreign_key('fk_donations_recurring', 'donations', 'recurring_donations', ['recurring_donation_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    # Drop foreign keys first
    op.drop_constraint('fk_donations_recurring', 'donations', type_='foreignkey')
    op.drop_constraint('fk_donations_campaign', 'donations', type_='foreignkey')
    
    # Drop recurring_donations table
    op.drop_table('recurring_donations')
    
    # Remove recurring_donation_id column from donations
    op.drop_index('idx_donations_recurring', 'donations')
    op.drop_index('idx_donations_campaign', 'donations')
    op.drop_column('donations', 'recurring_donation_id')
    
    # Drop campaigns table
    op.drop_table('campaigns')
    
    # Drop donor_communications table
    op.drop_table('donor_communications')
    
    # Drop donor_tag_assignments table
    op.drop_table('donor_tag_assignments')
    
    # Drop donor_tags table
    op.drop_table('donor_tags')
    
    # Drop donor_segment_assignments table
    op.drop_table('donor_segment_assignments')
    
    # Drop donor_segments table
    op.drop_table('donor_segments')
