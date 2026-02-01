"""
Organization Donors Schemas

Pydantic schemas for donor management API requests/responses.
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


# ============= Donor Schemas =============

class Address(BaseModel):
    """Address model"""
    street: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class DonorBase(BaseModel):
    """Base donor schema"""
    email: EmailStr
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[Address] = None
    date_of_birth: Optional[date] = None
    preferred_language: str = Field(default='fr', max_length=10)
    tax_id: Optional[str] = Field(None, max_length=50)
    is_anonymous: bool = False
    opt_in_email: bool = True
    opt_in_sms: bool = False
    opt_in_postal: bool = True
    tags: List[str] = Field(default_factory=list)
    custom_fields: Dict[str, Any] = Field(default_factory=dict)


class DonorCreate(DonorBase):
    """Create donor request"""
    pass


class DonorUpdate(BaseModel):
    """Update donor request"""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[Address] = None
    date_of_birth: Optional[date] = None
    preferred_language: Optional[str] = Field(None, max_length=10)
    tax_id: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None
    is_anonymous: Optional[bool] = None
    opt_in_email: Optional[bool] = None
    opt_in_sms: Optional[bool] = None
    opt_in_postal: Optional[bool] = None
    tags: Optional[List[str]] = None
    custom_fields: Optional[Dict[str, Any]] = None


class Donor(DonorBase):
    """Donor response"""
    id: UUID
    organization_id: UUID
    is_active: bool
    total_donated: Decimal
    first_donation_date: Optional[datetime] = None
    last_donation_date: Optional[datetime] = None
    donation_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DonorWithStats(Donor):
    """Donor with additional statistics"""
    average_donation: Optional[Decimal] = None
    last_donation_amount: Optional[Decimal] = None


# ============= Donation Schemas =============

class DonationBase(BaseModel):
    """Base donation schema"""
    amount: Decimal = Field(..., gt=0, description="Donation amount")
    currency: str = Field(default='CAD', max_length=3)
    donation_type: str = Field(..., pattern=r'^(one_time|recurring|pledge|in_kind)$')
    payment_method_id: Optional[UUID] = None
    payment_status: str = Field(default='pending', pattern=r'^(pending|completed|failed|refunded|cancelled)$')
    payment_date: Optional[datetime] = None
    campaign_id: Optional[UUID] = None
    designation: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    is_anonymous: bool = False
    is_tax_deductible: bool = True
    tax_receipt_amount: Optional[Decimal] = None
    metadata: Dict[str, Any] = Field(default_factory=dict, alias='extra_data')


class DonationCreate(DonationBase):
    """Create donation request"""
    donor_id: UUID


class DonationUpdate(BaseModel):
    """Update donation request"""
    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    donation_type: Optional[str] = Field(None, pattern=r'^(one_time|recurring|pledge|in_kind)$')
    payment_status: Optional[str] = Field(None, pattern=r'^(pending|completed|failed|refunded|cancelled)$')
    payment_date: Optional[datetime] = None
    campaign_id: Optional[UUID] = None
    designation: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    is_anonymous: Optional[bool] = None
    is_tax_deductible: Optional[bool] = None
    tax_receipt_amount: Optional[Decimal] = None
    metadata: Optional[Dict[str, Any]] = Field(None, alias='extra_data')


class Donation(DonationBase):
    """Donation response"""
    id: UUID
    donor_id: UUID
    organization_id: UUID
    receipt_number: Optional[str] = None
    receipt_sent: bool
    receipt_sent_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True  # ORM has extra_data; schema field has alias='extra_data'


class RefundRequest(BaseModel):
    """Refund donation request"""
    reason: Optional[str] = Field(None, max_length=500)
    amount: Optional[Decimal] = Field(None, gt=0, description="Partial refund amount. If not provided, full refund.")


# ============= Payment Method Schemas =============

class PaymentMethodBase(BaseModel):
    """Base payment method schema"""
    type: str = Field(..., pattern=r'^(credit_card|debit_card|bank_transfer|check|cash|other)$')
    provider: Optional[str] = Field(None, max_length=50)
    last_four: Optional[str] = Field(None, max_length=4)
    expiry_month: Optional[int] = Field(None, ge=1, le=12)
    expiry_year: Optional[int] = Field(None, ge=2000)
    brand: Optional[str] = Field(None, max_length=50)
    is_default: bool = False
    is_active: bool = True
    metadata: Dict[str, Any] = Field(default_factory=dict, alias='extra_data')


class PaymentMethodCreate(PaymentMethodBase):
    """Create payment method request"""
    donor_id: UUID


class PaymentMethod(PaymentMethodBase):
    """Payment method response"""
    id: UUID
    donor_id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True  # Allow both field name and alias


# ============= Donor Note Schemas =============

class DonorNoteBase(BaseModel):
    """Base donor note schema"""
    note: str = Field(..., min_length=1)
    note_type: str = Field(default='general', pattern=r'^(general|call|meeting|email|other)$')
    is_private: bool = False


class DonorNoteCreate(DonorNoteBase):
    """Create donor note request"""
    donor_id: UUID


class DonorNote(DonorNoteBase):
    """Donor note response"""
    id: UUID
    donor_id: UUID
    organization_id: UUID
    created_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= Donor Activity Schemas =============

class DonorActivity(BaseModel):
    """Donor activity response"""
    id: UUID
    donor_id: UUID
    organization_id: UUID
    activity_type: str
    activity_data: Dict[str, Any]
    performed_by: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= List Responses =============

class DonorList(BaseModel):
    """List of donors"""
    items: List[Donor]
    total: int
    page: int
    page_size: int
    total_pages: int


class DonationList(BaseModel):
    """List of donations"""
    items: List[Donation]
    total: int
    page: int
    page_size: int
    total_pages: int


class DonorHistory(BaseModel):
    """Donor history (donations + activities)"""
    donations: List[Donation]
    activities: List[DonorActivity]
    total_donations: int
    total_activities: int


class DonorStats(BaseModel):
    """Donor statistics"""
    total_donated: Decimal
    donation_count: int
    average_donation: Decimal
    first_donation_date: Optional[datetime]
    last_donation_date: Optional[datetime]
    last_donation_amount: Optional[Decimal]
    largest_donation: Optional[Decimal]
    this_year_total: Decimal
    this_year_count: int
    this_month_total: Decimal
    this_month_count: int


# ============= Donor Segment Schemas =============

class DonorSegmentBase(BaseModel):
    """Base donor segment schema"""
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    criteria: Dict[str, Any] = Field(default_factory=dict)
    is_automatic: bool = False
    color: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')


class DonorSegmentCreate(DonorSegmentBase):
    """Create donor segment request"""
    pass


class DonorSegmentUpdate(BaseModel):
    """Update donor segment request"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None
    is_automatic: Optional[bool] = None
    color: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')


class DonorSegment(DonorSegmentBase):
    """Donor segment response"""
    id: UUID
    organization_id: UUID
    donor_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DonorSegmentAssignment(BaseModel):
    """Donor segment assignment"""
    id: UUID
    donor_id: UUID
    segment_id: UUID
    assigned_at: datetime
    assigned_by: Optional[int] = None
    
    class Config:
        from_attributes = True


# ============= Donor Tag Schemas =============

class DonorTagBase(BaseModel):
    """Base donor tag schema"""
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    color: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=50)


class DonorTagCreate(DonorTagBase):
    """Create donor tag request"""
    pass


class DonorTagUpdate(BaseModel):
    """Update donor tag request"""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    color: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=50)


class DonorTag(DonorTagBase):
    """Donor tag response"""
    id: UUID
    organization_id: UUID
    donor_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class DonorTagAssignment(BaseModel):
    """Donor tag assignment"""
    id: UUID
    donor_id: UUID
    tag_id: UUID
    assigned_at: datetime
    assigned_by: Optional[int] = None
    
    class Config:
        from_attributes = True


# ============= Donor Communication Schemas =============

class DonorCommunicationBase(BaseModel):
    """Base donor communication schema"""
    communication_type: str = Field(..., pattern=r'^(email|sms|letter|phone|in_person)$')
    subject: Optional[str] = Field(None, max_length=255)
    content: str = Field(..., min_length=1)
    status: str = Field(default='sent', pattern=r'^(sent|delivered|opened|clicked|bounced|failed)$')


class DonorCommunicationCreate(DonorCommunicationBase):
    """Create donor communication request"""
    pass


class DonorCommunicationUpdate(BaseModel):
    """Update donor communication request"""
    status: Optional[str] = Field(None, pattern=r'^(sent|delivered|opened|clicked|bounced|failed)$')
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


class DonorCommunication(DonorCommunicationBase):
    """Donor communication response"""
    id: UUID
    donor_id: UUID
    organization_id: UUID
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    opened_at: Optional[datetime] = None
    clicked_at: Optional[datetime] = None
    sent_by: Optional[int] = None
    metadata: Dict[str, Any] = Field(default_factory=dict, validation_alias="communication_metadata")
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============= Campaign Schemas =============

class CampaignBase(BaseModel):
    """Base campaign schema"""
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    goal_amount: Optional[Decimal] = Field(None, gt=0)
    goal_donors: Optional[int] = Field(None, gt=0)
    status: str = Field(default='draft', pattern=r'^(draft|active|paused|completed|cancelled)$')
    image_url: Optional[str] = Field(None, max_length=500)
    external_url: Optional[str] = Field(None, max_length=500)


class CampaignCreate(CampaignBase):
    """Create campaign request"""
    pass


class CampaignUpdate(BaseModel):
    """Update campaign request"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    goal_amount: Optional[Decimal] = Field(None, gt=0)
    goal_donors: Optional[int] = Field(None, gt=0)
    status: Optional[str] = Field(None, pattern=r'^(draft|active|paused|completed|cancelled)$')
    image_url: Optional[str] = Field(None, max_length=500)
    external_url: Optional[str] = Field(None, max_length=500)


class Campaign(CampaignBase):
    """Campaign response"""
    id: UUID
    organization_id: UUID
    total_raised: Decimal
    donor_count: int
    donation_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CampaignStats(BaseModel):
    """Campaign statistics"""
    total_raised: Decimal
    donor_count: int
    donation_count: int
    progress_percentage: float
    days_remaining: Optional[int] = None
    is_active: bool


# ============= Recurring Donation Schemas =============

class RecurringDonationBase(BaseModel):
    """Base recurring donation schema"""
    amount: Decimal = Field(..., gt=0)
    currency: str = Field(default='CAD', max_length=3)
    frequency: str = Field(..., pattern=r'^(weekly|monthly|quarterly|yearly)$')
    payment_method_id: UUID
    start_date: datetime
    end_date: Optional[datetime] = None


class RecurringDonationCreate(RecurringDonationBase):
    """Create recurring donation request"""
    pass


class RecurringDonationUpdate(BaseModel):
    """Update recurring donation request"""
    amount: Optional[Decimal] = Field(None, gt=0)
    currency: Optional[str] = Field(None, max_length=3)
    frequency: Optional[str] = Field(None, pattern=r'^(weekly|monthly|quarterly|yearly)$')
    payment_method_id: Optional[UUID] = None
    status: Optional[str] = Field(None, pattern=r'^(active|paused|cancelled|failed)$')
    end_date: Optional[datetime] = None


class RecurringDonation(RecurringDonationBase):
    """Recurring donation response"""
    id: UUID
    donor_id: UUID
    organization_id: UUID
    next_payment_date: datetime
    status: str
    total_payments: int
    total_amount: Decimal
    last_payment_date: Optional[datetime] = None
    consecutive_failures: int
    last_failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============= List Responses (Extended) =============

class DonorSegmentList(BaseModel):
    """List of donor segments"""
    items: List[DonorSegment]
    total: int
    page: int
    page_size: int
    total_pages: int


class DonorTagList(BaseModel):
    """List of donor tags"""
    items: List[DonorTag]
    total: int
    page: int
    page_size: int
    total_pages: int


class DonorCommunicationList(BaseModel):
    """List of donor communications"""
    items: List[DonorCommunication]
    total: int
    page: int
    page_size: int
    total_pages: int


class CampaignList(BaseModel):
    """List of campaigns"""
    items: List[Campaign]
    total: int
    page: int
    page_size: int
    total_pages: int


class RecurringDonationList(BaseModel):
    """List of recurring donations"""
    items: List[RecurringDonation]
    total: int
    page: int
    page_size: int
    total_pages: int
