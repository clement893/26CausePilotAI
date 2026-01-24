"""
Donor Model

Donor model for organization-specific databases.
Each organization has its own donors table in its dedicated database.
"""

from sqlalchemy import Column, String, Boolean, Date, DateTime, Numeric, Integer, Text, JSON, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from decimal import Decimal

from app.core.database import Base


class Donor(Base):
    """
    Donor model
    
    Represents a donor in an organization's database.
    Each organization has its own donors isolated in separate database.
    """
    __tablename__ = "donors"
    __table_args__ = (
        Index("idx_donors_email_org", "email", "organization_id"),
        Index("idx_donors_name", "last_name", "first_name"),
        Index("idx_donors_created", "created_at"),
        Index("idx_donors_total_donated", "total_donated"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Reference to main DB
    
    # Contact Information
    email = Column(String(255), nullable=False, index=True)
    first_name = Column(String(100), nullable=True, index=True)
    last_name = Column(String(100), nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    
    # Address (stored as JSON for flexibility)
    address = Column(JSON, nullable=True)  # {street, city, province, postal_code, country}
    
    # Personal Information
    date_of_birth = Column(Date, nullable=True)
    preferred_language = Column(String(10), default='fr', nullable=False)
    tax_id = Column(String(50), nullable=True)  # Numéro d'assurance sociale pour reçus fiscaux
    
    # Status & Preferences
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_anonymous = Column(Boolean, default=False, nullable=False)
    opt_in_email = Column(Boolean, default=True, nullable=False)
    opt_in_sms = Column(Boolean, default=False, nullable=False)
    opt_in_postal = Column(Boolean, default=True, nullable=False)
    
    # Tags and Custom Fields
    tags = Column(JSON, default=list)  # Array of tag names
    custom_fields = Column(JSON, default=dict)  # Custom organization-specific fields
    
    # Calculated Statistics (updated via triggers or application logic)
    total_donated = Column(Numeric(12, 2), default=Decimal('0.00'), nullable=False)
    first_donation_date = Column(DateTime(timezone=True), nullable=True)
    last_donation_date = Column(DateTime(timezone=True), nullable=True)
    donation_count = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships (will be defined in organization DB)
    donations = relationship("Donation", back_populates="donor", cascade="all, delete-orphan")
    payment_methods = relationship("PaymentMethod", back_populates="donor", cascade="all, delete-orphan")
    notes = relationship("DonorNote", back_populates="donor", cascade="all, delete-orphan")
    # communications = relationship("DonorCommunication", back_populates="donor", cascade="all, delete-orphan")  # TODO: Create DonorCommunication model
    activities = relationship("DonorActivity", back_populates="donor", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Donor(id={self.id}, email={self.email}, name={self.first_name} {self.last_name})>"
    
    @property
    def full_name(self) -> str:
        """Get full name"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        return self.email
    
    @property
    def lifetime_value(self) -> Decimal:
        """Get lifetime donation value"""
        return self.total_donated or Decimal('0.00')
