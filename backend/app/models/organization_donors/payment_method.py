"""
Payment Method Model

Payment method model for organization-specific databases.
Stores payment methods securely for donors.
"""

from sqlalchemy import Column, String, Boolean, Integer, DateTime, JSON, ForeignKey, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class PaymentMethod(Base):
    """
    Payment Method model
    
    Stores payment methods (credit cards, bank accounts, etc.) for donors.
    Sensitive data should be encrypted or tokenized.
    """
    __tablename__ = "payment_methods"
    __table_args__ = (
        Index("idx_payment_methods_donor", "donor_id"),
        Index("idx_payment_methods_active", "is_active"),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("donors.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)  # Reference to main DB
    
    # Payment Method Type
    type = Column(String(50), nullable=False)  # 'credit_card', 'debit_card', 'bank_transfer', 'check', 'cash', 'other'
    provider = Column(String(50), nullable=True)  # 'stripe', 'paypal', 'interac', etc.
    
    # Card/Bank Details (masked)
    last_four = Column(String(4), nullable=True)  # Last 4 digits
    expiry_month = Column(Integer, nullable=True)
    expiry_year = Column(Integer, nullable=True)
    brand = Column(String(50), nullable=True)  # 'visa', 'mastercard', etc.
    
    # Status
    is_default = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    
    # Secure Metadata (encrypted/tokenized sensitive data)
    extra_data = Column(JSON, name='metadata', default=dict)  # Tokenized/encrypted payment data
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    donor = relationship("Donor", back_populates="payment_methods")
    donations = relationship("Donation", back_populates="payment_method")
    
    def __repr__(self):
        return f"<PaymentMethod(id={self.id}, type={self.type}, last_four={self.last_four})>"
    
    @property
    def display_name(self) -> str:
        """Get display name for payment method"""
        if self.type == 'credit_card' and self.last_four:
            brand = self.brand or 'Card'
            return f"{brand.title()} •••• {self.last_four}"
        elif self.type == 'debit_card' and self.last_four:
            return f"Debit •••• {self.last_four}"
        return self.type.replace('_', ' ').title()
