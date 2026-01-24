"""
Organization Donors API Endpoints

API endpoints for managing donors in organization-specific databases.
All endpoints require organization_id query parameter (or use active org for regular users).
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from decimal import Decimal

from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.dependencies.organization_db import get_organization_db
from app.models.organization_donors import (
    Donor, Donation, PaymentMethod, DonorNote, DonorActivity,
    DonorSegment, DonorSegmentAssignment,
    DonorTag, DonorTagAssignment,
    DonorCommunication,
    Campaign,
    RecurringDonation,
)
from app.schemas.organization_donors import (
    DonorCreate,
    DonorUpdate,
    Donor as DonorSchema,
    DonorWithStats,
    DonorList,
    DonationCreate,
    DonationUpdate,
    Donation as DonationSchema,
    DonationList,
    PaymentMethodCreate,
    PaymentMethod as PaymentMethodSchema,
    DonorNoteCreate,
    DonorNote as DonorNoteSchema,
    DonorActivity as DonorActivitySchema,
    DonorHistory,
    DonorStats,
    RefundRequest,
    DonorSegmentCreate,
    DonorSegmentUpdate,
    DonorSegment as DonorSegmentSchema,
    DonorSegmentList,
    DonorTagCreate,
    DonorTagUpdate,
    DonorTag as DonorTagSchema,
    DonorTagList,
    DonorCommunicationCreate,
    DonorCommunicationUpdate,
    DonorCommunication as DonorCommunicationSchema,
    DonorCommunicationList,
    CampaignCreate,
    CampaignUpdate,
    Campaign as CampaignSchema,
    CampaignList,
    CampaignStats,
    RecurringDonationCreate,
    RecurringDonationUpdate,
    RecurringDonation as RecurringDonationSchema,
    RecurringDonationList,
)

router = APIRouter()




# ============= Donors CRUD =============

@router.get("/{organization_id}/donors", response_model=DonorList)
async def list_donors(
    organization_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    tags: Optional[List[str]] = Query(None),
    min_total_donated: Optional[Decimal] = Query(None),
    max_total_donated: Optional[Decimal] = Query(None),
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List donors for organization
    
    Supports pagination, search, and filtering.
    """
    from sqlalchemy.exc import ProgrammingError, OperationalError
    
    try:
        # Build query
        query = select(Donor)
        
        # Apply filters
        if search:
        search_filter = or_(
            Donor.email.ilike(f"%{search}%"),
            Donor.first_name.ilike(f"%{search}%"),
            Donor.last_name.ilike(f"%{search}%"),
        )
            query = query.where(search_filter)
        
        if is_active is not None:
            query = query.where(Donor.is_active == is_active)
        
        if tags:
            # Filter by tags (JSON array contains)
            for tag in tags:
                query = query.where(Donor.tags.contains([tag]))
        
        if min_total_donated is not None:
            query = query.where(Donor.total_donated >= min_total_donated)
        
        if max_total_donated is not None:
            query = query.where(Donor.total_donated <= max_total_donated)
        
        # Get total count - build count query with same filters
        count_query = select(func.count(Donor.id))
        if search:
            search_filter = or_(
                Donor.email.ilike(f"%{search}%"),
                Donor.first_name.ilike(f"%{search}%"),
                Donor.last_name.ilike(f"%{search}%"),
            )
            count_query = count_query.where(search_filter)
        if is_active is not None:
            count_query = count_query.where(Donor.is_active == is_active)
        if tags:
            for tag in tags:
                count_query = count_query.where(Donor.tags.contains([tag]))
        if min_total_donated is not None:
            count_query = count_query.where(Donor.total_donated >= min_total_donated)
        if max_total_donated is not None:
            count_query = count_query.where(Donor.total_donated <= max_total_donated)
        
        total_result = await org_db.execute(count_query)
        total = total_result.scalar_one() or 0
        
        # Apply pagination
        offset = (page - 1) * page_size
        query = query.order_by(Donor.created_at.desc()).offset(offset).limit(page_size)
        
        # Execute query
        result = await org_db.execute(query)
        donors = result.scalars().all()
        
        # Calculate total pages
        total_pages = (total + page_size - 1) // page_size
        
        return {
            "items": donors,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }


@router.get("/{organization_id}/donors/{donor_id}", response_model=DonorWithStats)
async def get_donor(
    organization_id: UUID,
    donor_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get donor by ID"""
    query = select(Donor).where(Donor.id == donor_id)
    result = await org_db.execute(query)
    donor = result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    # Calculate additional stats
    donations_query = select(Donation).where(Donation.donor_id == donor_id)
    donations_result = await org_db.execute(donations_query)
    donations = donations_result.scalars().all()
    
    avg_donation = None
    last_donation_amount = None
    
    if donations:
        completed_donations = [d for d in donations if d.payment_status == 'completed']
        if completed_donations:
            total = sum(d.amount for d in completed_donations)
            avg_donation = total / len(completed_donations)
            
            # Get last donation
            last_donation = max(completed_donations, key=lambda d: d.payment_date or d.created_at)
            last_donation_amount = last_donation.amount
    
    # Convert donor to dict and map extra_data to metadata
    donor_dict = {
        **{k: v for k, v in donor.__dict__.items() if not k.startswith('_')},
    }
    
    # Convert Decimal fields to strings for API
    if 'total_donated' in donor_dict and donor_dict['total_donated'] is not None:
        donor_dict['total_donated'] = str(donor_dict['total_donated'])
    
    # Map extra_data to metadata for API response
    if 'extra_data' in donor_dict:
        donor_dict['metadata'] = donor_dict.pop('extra_data')
    
    # Add calculated stats
    donor_dict['average_donation'] = str(avg_donation) if avg_donation else None
    donor_dict['last_donation_amount'] = str(last_donation_amount) if last_donation_amount else None
    
    return DonorWithStats(**donor_dict)


@router.post("/{organization_id}/donors", response_model=DonorSchema, status_code=status.HTTP_201_CREATED)
async def create_donor(
    organization_id: UUID,
    donor_in: DonorCreate,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create new donor"""
    from sqlalchemy.exc import ProgrammingError, OperationalError
    
    try:
        # Check if donor with email already exists
        existing_query = select(Donor).where(Donor.email == donor_in.email)
        existing_result = await org_db.execute(existing_query)
        existing = existing_result.scalar_one_or_none()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Donor with this email already exists"
            )
        
        # Create donor
        donor = Donor(
            **donor_in.dict(),
            organization_id=organization_id,
        )
        
        org_db.add(donor)
        await org_db.commit()
        await org_db.refresh(donor)
        
        # Create activity (only if table exists)
        try:
            activity = DonorActivity(
                donor_id=donor.id,
                organization_id=organization_id,
                activity_type='profile_created',
                activity_data={"created_by": current_user.id},
                performed_by=current_user.id,
            )
            org_db.add(activity)
            await org_db.commit()
        except (ProgrammingError, OperationalError) as e:
            # If activity table doesn't exist, log but don't fail
            logger.warning(f"Could not create donor activity (table may not exist): {e}")
            await org_db.rollback()
        
        return donor
        
    except (ProgrammingError, OperationalError) as e:
        error_msg = str(e).lower()
        if "does not exist" in error_msg or "relation" in error_msg:
            # Table doesn't exist - migrations needed
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Database tables not found. Please run migrations on the organization database. "
                    f"Use POST /api/v1/organizations/{organization_id}/database/migrate to run migrations."
                )
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


@router.patch("/{organization_id}/donors/{donor_id}", response_model=DonorSchema)
async def update_donor(
    organization_id: UUID,
    donor_id: UUID,
    donor_update: DonorUpdate,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update donor"""
    query = select(Donor).where(Donor.id == donor_id)
    result = await org_db.execute(query)
    donor = result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    # Update fields
    update_data = donor_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(donor, field, value)
    
    await org_db.commit()
    await org_db.refresh(donor)
    
    # Get organization_id from donor
    org_id = donor.organization_id
    
    # Create activity
    activity = DonorActivity(
        donor_id=donor.id,
        organization_id=org_id,
        activity_type='profile_updated',
        activity_data={"updated_by": current_user.id, "fields": list(update_data.keys())},
        performed_by=current_user.id,
    )
    org_db.add(activity)
    await org_db.commit()
    
    return donor


@router.delete("/{organization_id}/donors/{donor_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donor(
    organization_id: UUID,
    donor_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete donor"""
    query = select(Donor).where(Donor.id == donor_id)
    result = await org_db.execute(query)
    donor = result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    await org_db.delete(donor)
    await org_db.commit()
    
    return None


# ============= Donations =============

@router.get("/{organization_id}/donors/{donor_id}/donations", response_model=DonationList)
async def list_donor_donations(
    organization_id: UUID,
    donor_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    payment_status: Optional[str] = Query(None),
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List donations for a donor"""
    # Verify donor exists
    donor_query = select(Donor).where(Donor.id == donor_id)
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    # Build query
    query = select(Donation).where(Donation.donor_id == donor_id)
    
    if payment_status:
        query = query.where(Donation.payment_status == payment_status)
    
    # Get total count - build count query with same filters
    count_query = select(func.count(Donation.id)).where(Donation.donor_id == donor_id)
    if payment_status:
        count_query = count_query.where(Donation.payment_status == payment_status)
    
    total_result = await org_db.execute(count_query)
    total = total_result.scalar_one() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Donation.payment_date.desc(), Donation.created_at.desc()).offset(offset).limit(page_size)
    
    # Execute query
    result = await org_db.execute(query)
    donations = result.scalars().all()
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": donations,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/{organization_id}/donors/{donor_id}/donations", response_model=DonationSchema, status_code=status.HTTP_201_CREATED)
async def create_donation(
    organization_id: UUID,
    donor_id: UUID,
    donation_in: DonationCreate,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create donation for donor"""
    # Verify donor exists
    donor_query = select(Donor).where(Donor.id == donor_id)
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    # Create donation - map metadata to extra_data
    donation_data = donation_in.dict()
    if 'metadata' in donation_data:
        donation_data['extra_data'] = donation_data.pop('metadata')
    
    donation = Donation(
        **donation_data,
        donor_id=donor_id,
        organization_id=organization_id,
    )
    
    org_db.add(donation)
    await org_db.flush()
    
    # Update donor statistics if donation is completed
    if donation.payment_status == 'completed':
        donor.total_donated = (donor.total_donated or Decimal('0.00')) + donation.amount
        donor.donation_count = (donor.donation_count or 0) + 1
        
        if not donor.first_donation_date:
            donor.first_donation_date = donation.payment_date or donation.created_at
        donor.last_donation_date = donation.payment_date or donation.created_at
        
        await org_db.flush()
    
    await org_db.commit()
    await org_db.refresh(donation)
    
    # Create activity
    activity = DonorActivity(
        donor_id=donor_id,
        organization_id=organization_id,
        activity_type='donation',
        activity_data={
            "donation_id": str(donation.id),
            "amount": float(donation.amount),
            "status": donation.payment_status,
        },
        performed_by=current_user.id,
    )
    org_db.add(activity)
    await org_db.commit()
    
    return donation


@router.patch("/{organization_id}/donations/{donation_id}", response_model=DonationSchema)
async def update_donation(
    organization_id: UUID,
    donation_id: UUID,
    donation_update: DonationUpdate,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update donation"""
    query = select(Donation).where(Donation.id == donation_id)
    result = await org_db.execute(query)
    donation = result.scalar_one_or_none()
    
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found"
        )
    
    # Track status change for donor stats update
    old_status = donation.payment_status
    old_amount = donation.amount
    
    # Update fields - map metadata to extra_data
    update_data = donation_update.dict(exclude_unset=True)
    if 'metadata' in update_data:
        update_data['extra_data'] = update_data.pop('metadata')
    
    for field, value in update_data.items():
        setattr(donation, field, value)
    
    await org_db.flush()
    
    # Update donor statistics if status changed
    if donation.payment_status != old_status or donation.amount != old_amount:
        donor_query = select(Donor).where(Donor.id == donation.donor_id)
        donor_result = await org_db.execute(donor_query)
        donor = donor_result.scalar_one()
        
        # Recalculate stats
        donations_query = select(Donation).where(
            and_(
                Donation.donor_id == donor.id,
                Donation.payment_status == 'completed'
            )
        )
        donations_result = await org_db.execute(donations_query)
        completed_donations = donations_result.scalars().all()
        
        if completed_donations:
            donor.total_donated = sum(d.amount for d in completed_donations)
            donor.donation_count = len(completed_donations)
            donor.first_donation_date = min(d.payment_date or d.created_at for d in completed_donations)
            donor.last_donation_date = max(d.payment_date or d.created_at for d in completed_donations)
        else:
            donor.total_donated = Decimal('0.00')
            donor.donation_count = 0
            donor.first_donation_date = None
            donor.last_donation_date = None
        
        await org_db.flush()
    
    await org_db.commit()
    await org_db.refresh(donation)
    
    return donation


@router.post("/{organization_id}/donations/{donation_id}/refund", response_model=DonationSchema)
async def refund_donation(
    organization_id: UUID,
    donation_id: UUID,
    refund_request: RefundRequest,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Refund a donation (full or partial)"""
    query = select(Donation).where(Donation.id == donation_id)
    result = await org_db.execute(query)
    donation = result.scalar_one_or_none()
    
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found"
        )
    
    if donation.payment_status != 'completed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only completed donations can be refunded"
        )
    
    # Update donation status
    refund_amount = refund_request.amount or donation.amount
    donation.payment_status = 'refunded'
    donation.notes = (donation.notes or "") + f"\n[Refund] {refund_request.reason or 'No reason provided'}"
    
    await org_db.flush()
    
    # Update donor statistics
    donor_query = select(Donor).where(Donor.id == donation.donor_id)
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one()
    
    # Recalculate stats
    donations_query = select(Donation).where(
        and_(
            Donation.donor_id == donor.id,
            Donation.payment_status == 'completed'
        )
    )
    donations_result = await org_db.execute(donations_query)
    completed_donations = donations_result.scalars().all()
    
    if completed_donations:
        donor.total_donated = sum(d.amount for d in completed_donations)
        donor.donation_count = len(completed_donations)
        donor.first_donation_date = min(d.payment_date or d.created_at for d in completed_donations)
        donor.last_donation_date = max(d.payment_date or d.created_at for d in completed_donations)
    else:
        donor.total_donated = Decimal('0.00')
        donor.donation_count = 0
        donor.first_donation_date = None
        donor.last_donation_date = None
    
    await org_db.commit()
    await org_db.refresh(donation)
    
    # Get organization_id from donation
    org_id = donation.organization_id
    
    # Create activity
    activity = DonorActivity(
        donor_id=donation.donor_id,
        organization_id=org_id,
        activity_type='donation_refunded',
        activity_data={
            "donation_id": str(donation.id),
            "refund_amount": float(refund_amount),
            "reason": refund_request.reason,
        },
        performed_by=current_user.id,
    )
    org_db.add(activity)
    await org_db.commit()
    
    return donation


# ============= Donor History & Stats =============

@router.get("/{organization_id}/donors/{donor_id}/history", response_model=DonorHistory)
async def get_donor_history(
    organization_id: UUID,
    donor_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get donor history (donations + activities)"""
    # Verify donor exists
    donor_query = select(Donor).where(Donor.id == donor_id)
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    # Get donations
    donations_query = select(Donation).where(Donation.donor_id == donor_id).order_by(Donation.payment_date.desc(), Donation.created_at.desc())
    donations_result = await org_db.execute(donations_query)
    donations = donations_result.scalars().all()
    
    # Get activities
    activities_query = select(DonorActivity).where(DonorActivity.donor_id == donor_id).order_by(DonorActivity.created_at.desc())
    activities_result = await org_db.execute(activities_query)
    activities = activities_result.scalars().all()
    
    return {
        "donations": donations,
        "activities": activities,
        "total_donations": len(donations),
        "total_activities": len(activities),
    }


@router.get("/{organization_id}/donors/{donor_id}/stats", response_model=DonorStats)
async def get_donor_stats(
    organization_id: UUID,
    donor_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get donor statistics"""
    # Verify donor exists
    donor_query = select(Donor).where(Donor.id == donor_id)
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    # Get all completed donations
    donations_query = select(Donation).where(
        and_(
            Donation.donor_id == donor_id,
            Donation.payment_status == 'completed'
        )
    )
    donations_result = await org_db.execute(donations_query)
    donations = donations_result.scalars().all()
    
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    this_year_start = datetime(now.year, 1, 1, tzinfo=timezone.utc)
    this_month_start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    
    this_year_donations = [d for d in donations if (d.payment_date or d.created_at) >= this_year_start]
    this_month_donations = [d for d in donations if (d.payment_date or d.created_at) >= this_month_start]
    
    amounts = [d.amount for d in donations] if donations else []
    
    return {
        "total_donated": str(donor.total_donated or Decimal('0.00')),
        "donation_count": donor.donation_count or 0,
        "average_donation": str(sum(amounts) / len(amounts) if amounts else Decimal('0.00')),
        "first_donation_date": donor.first_donation_date,
        "last_donation_date": donor.last_donation_date,
        "last_donation_amount": str(amounts[-1]) if amounts else None,
        "largest_donation": str(max(amounts)) if amounts else None,
        "this_year_total": str(sum(d.amount for d in this_year_donations)),
        "this_year_count": len(this_year_donations),
        "this_month_total": str(sum(d.amount for d in this_month_donations)),
        "this_month_count": len(this_month_donations),
    }


# ============= Tags Endpoints =============

@router.get("/{organization_id}/tags", response_model=DonorTagList)
async def list_tags(
    organization_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """List all tags for organization"""
    query = select(DonorTag).where(DonorTag.organization_id == organization_id)
    
    if search:
        query = query.where(DonorTag.name.ilike(f"%{search}%"))
    
    # Get total count
    count_query = select(func.count(DonorTag.id)).where(DonorTag.organization_id == organization_id)
    if search:
        count_query = count_query.where(DonorTag.name.ilike(f"%{search}%"))
    
    total_result = await org_db.execute(count_query)
    total = total_result.scalar_one() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(DonorTag.name.asc()).offset(offset).limit(page_size)
    
    result = await org_db.execute(query)
    tags = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": tags,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/{organization_id}/tags", response_model=DonorTagSchema, status_code=status.HTTP_201_CREATED)
async def create_tag(
    organization_id: UUID,
    tag_data: DonorTagCreate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new tag"""
    # Check if tag with same name already exists
    existing_query = select(DonorTag).where(
        and_(
            DonorTag.organization_id == organization_id,
            DonorTag.name == tag_data.name
        )
    )
    existing_result = await org_db.execute(existing_query)
    existing_tag = existing_result.scalar_one_or_none()
    
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag with this name already exists"
        )
    
    tag = DonorTag(
        organization_id=organization_id,
        **tag_data.model_dump()
    )
    
    org_db.add(tag)
    await org_db.commit()
    await org_db.refresh(tag)
    
    return tag


@router.get("/{organization_id}/tags/{tag_id}", response_model=DonorTagSchema)
async def get_tag(
    organization_id: UUID,
    tag_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Get tag by ID"""
    query = select(DonorTag).where(
        and_(
            DonorTag.id == tag_id,
            DonorTag.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    return tag


@router.patch("/{organization_id}/tags/{tag_id}", response_model=DonorTagSchema)
async def update_tag(
    organization_id: UUID,
    tag_id: UUID,
    tag_data: DonorTagUpdate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Update tag"""
    query = select(DonorTag).where(
        and_(
            DonorTag.id == tag_id,
            DonorTag.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Check name uniqueness if name is being updated
    if tag_data.name and tag_data.name != tag.name:
        existing_query = select(DonorTag).where(
            and_(
                DonorTag.organization_id == organization_id,
                DonorTag.name == tag_data.name,
                DonorTag.id != tag_id
            )
        )
        existing_result = await org_db.execute(existing_query)
        if existing_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tag with this name already exists"
            )
    
    # Update fields
    update_data = tag_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tag, field, value)
    
    await org_db.commit()
    await org_db.refresh(tag)
    
    return tag


@router.delete("/{organization_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    organization_id: UUID,
    tag_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Delete tag"""
    query = select(DonorTag).where(
        and_(
            DonorTag.id == tag_id,
            DonorTag.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    tag = result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    await org_db.delete(tag)
    await org_db.commit()
    
    return None


@router.post("/{organization_id}/donors/{donor_id}/tags", response_model=DonorTagSchema)
async def assign_tag_to_donor(
    organization_id: UUID,
    donor_id: UUID,
    tag_id: UUID = Query(..., description="Tag ID to assign"),
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Assign a tag to a donor"""
    # Verify donor exists
    donor_query = select(Donor).where(
        and_(
            Donor.id == donor_id,
            Donor.organization_id == organization_id
        )
    )
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    # Verify tag exists
    tag_query = select(DonorTag).where(
        and_(
            DonorTag.id == tag_id,
            DonorTag.organization_id == organization_id
        )
    )
    tag_result = await org_db.execute(tag_query)
    tag = tag_result.scalar_one_or_none()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    
    # Check if assignment already exists
    assignment_query = select(DonorTagAssignment).where(
        and_(
            DonorTagAssignment.donor_id == donor_id,
            DonorTagAssignment.tag_id == tag_id
        )
    )
    assignment_result = await org_db.execute(assignment_query)
    existing_assignment = assignment_result.scalar_one_or_none()
    
    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag already assigned to this donor"
        )
    
    # Create assignment
    assignment = DonorTagAssignment(
        donor_id=donor_id,
        tag_id=tag_id,
        assigned_by=current_user.id
    )
    
    org_db.add(assignment)
    
    # Update tag count
    tag.donor_count = (tag.donor_count or 0) + 1
    
    await org_db.commit()
    await org_db.refresh(tag)
    
    return tag


@router.delete("/{organization_id}/donors/{donor_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_tag_from_donor(
    organization_id: UUID,
    donor_id: UUID,
    tag_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a tag from a donor"""
    # Find assignment
    assignment_query = select(DonorTagAssignment).where(
        and_(
            DonorTagAssignment.donor_id == donor_id,
            DonorTagAssignment.tag_id == tag_id
        )
    )
    assignment_result = await org_db.execute(assignment_query)
    assignment = assignment_result.scalar_one_or_none()
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag assignment not found"
        )
    
    # Get tag to update count
    tag_query = select(DonorTag).where(DonorTag.id == tag_id)
    tag_result = await org_db.execute(tag_query)
    tag = tag_result.scalar_one_or_none()
    
    if tag:
        tag.donor_count = max(0, (tag.donor_count or 0) - 1)
    
    await org_db.delete(assignment)
    await org_db.commit()
    
    return None


# ============= Segments Endpoints =============

@router.get("/{organization_id}/segments", response_model=DonorSegmentList)
async def list_segments(
    organization_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_automatic: Optional[bool] = Query(None),
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """List all segments for organization"""
    query = select(DonorSegment).where(DonorSegment.organization_id == organization_id)
    
    if search:
        query = query.where(DonorSegment.name.ilike(f"%{search}%"))
    
    if is_automatic is not None:
        query = query.where(DonorSegment.is_automatic == is_automatic)
    
    # Get total count
    count_query = select(func.count(DonorSegment.id)).where(DonorSegment.organization_id == organization_id)
    if search:
        count_query = count_query.where(DonorSegment.name.ilike(f"%{search}%"))
    if is_automatic is not None:
        count_query = count_query.where(DonorSegment.is_automatic == is_automatic)
    
    total_result = await org_db.execute(count_query)
    total = total_result.scalar_one() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(DonorSegment.name.asc()).offset(offset).limit(page_size)
    
    result = await org_db.execute(query)
    segments = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": segments,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/{organization_id}/segments", response_model=DonorSegmentSchema, status_code=status.HTTP_201_CREATED)
async def create_segment(
    organization_id: UUID,
    segment_data: DonorSegmentCreate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new segment"""
    segment = DonorSegment(
        organization_id=organization_id,
        **segment_data.model_dump()
    )
    
    org_db.add(segment)
    await org_db.commit()
    await org_db.refresh(segment)
    
    # If automatic, recalculate immediately
    if segment.is_automatic:
        await recalculate_segment(organization_id, segment.id, org_db)
    
    return segment


@router.get("/{organization_id}/segments/{segment_id}", response_model=DonorSegmentSchema)
async def get_segment(
    organization_id: UUID,
    segment_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Get segment by ID"""
    query = select(DonorSegment).where(
        and_(
            DonorSegment.id == segment_id,
            DonorSegment.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    segment = result.scalar_one_or_none()
    
    if not segment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segment not found"
        )
    
    return segment


@router.patch("/{organization_id}/segments/{segment_id}", response_model=DonorSegmentSchema)
async def update_segment(
    organization_id: UUID,
    segment_id: UUID,
    segment_data: DonorSegmentUpdate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Update segment"""
    query = select(DonorSegment).where(
        and_(
            DonorSegment.id == segment_id,
            DonorSegment.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    segment = result.scalar_one_or_none()
    
    if not segment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segment not found"
        )
    
    # Update fields
    update_data = segment_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(segment, field, value)
    
    await org_db.commit()
    await org_db.refresh(segment)
    
    # If automatic and criteria changed, recalculate
    if segment.is_automatic and 'criteria' in update_data:
        await recalculate_segment(organization_id, segment.id, org_db)
    
    return segment


@router.delete("/{organization_id}/segments/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_segment(
    organization_id: UUID,
    segment_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Delete segment"""
    query = select(DonorSegment).where(
        and_(
            DonorSegment.id == segment_id,
            DonorSegment.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    segment = result.scalar_one_or_none()
    
    if not segment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segment not found"
        )
    
    await org_db.delete(segment)
    await org_db.commit()
    
    return None


@router.get("/{organization_id}/segments/{segment_id}/donors", response_model=DonorList)
async def get_segment_donors(
    organization_id: UUID,
    segment_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Get donors in a segment"""
    # Verify segment exists
    segment_query = select(DonorSegment).where(
        and_(
            DonorSegment.id == segment_id,
            DonorSegment.organization_id == organization_id
        )
    )
    segment_result = await org_db.execute(segment_query)
    segment = segment_result.scalar_one_or_none()
    
    if not segment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segment not found"
        )
    
    # Get assignments
    assignments_query = select(DonorSegmentAssignment).where(
        DonorSegmentAssignment.segment_id == segment_id
    )
    
    # Get total count
    count_query = select(func.count(DonorSegmentAssignment.id)).where(
        DonorSegmentAssignment.segment_id == segment_id
    )
    total_result = await org_db.execute(count_query)
    total = total_result.scalar_one() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    assignments_query = assignments_query.offset(offset).limit(page_size)
    
    assignments_result = await org_db.execute(assignments_query)
    assignments = assignments_result.scalars().all()
    
    # Get donors
    donor_ids = [a.donor_id for a in assignments]
    if donor_ids:
        donors_query = select(Donor).where(Donor.id.in_(donor_ids))
        donors_result = await org_db.execute(donors_query)
        donors = donors_result.scalars().all()
    else:
        donors = []
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": donors,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/{organization_id}/segments/{segment_id}/recalculate", response_model=DonorSegmentSchema)
async def recalculate_segment_endpoint(
    organization_id: UUID,
    segment_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Recalculate segment assignments based on criteria"""
    await recalculate_segment(organization_id, segment_id, org_db)
    
    # Return updated segment
    query = select(DonorSegment).where(
        and_(
            DonorSegment.id == segment_id,
            DonorSegment.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    segment = result.scalar_one()
    
    return segment


async def recalculate_segment(organization_id: UUID, segment_id: UUID, org_db: AsyncSession):
    """Helper function to recalculate segment assignments"""
    # Get segment
    query = select(DonorSegment).where(
        and_(
            DonorSegment.id == segment_id,
            DonorSegment.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    segment = result.scalar_one_or_none()
    
    if not segment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Segment not found"
        )
    
    if not segment.is_automatic:
        return  # Only recalculate automatic segments
    
    # Remove all existing assignments
    delete_query = select(DonorSegmentAssignment).where(
        DonorSegmentAssignment.segment_id == segment_id
    )
    delete_result = await org_db.execute(delete_query)
    existing_assignments = delete_result.scalars().all()
    for assignment in existing_assignments:
        await org_db.delete(assignment)
    
    # Build query based on criteria
    donors_query = select(Donor).where(Donor.organization_id == organization_id)
    
    criteria = segment.criteria or {}
    
    # Apply criteria filters
    if 'min_total_donated' in criteria:
        donors_query = donors_query.where(Donor.total_donated >= Decimal(str(criteria['min_total_donated'])))
    
    if 'max_total_donated' in criteria:
        donors_query = donors_query.where(Donor.total_donated <= Decimal(str(criteria['max_total_donated'])))
    
    if 'is_active' in criteria:
        donors_query = donors_query.where(Donor.is_active == criteria['is_active'])
    
    if 'tags' in criteria and criteria['tags']:
        # Filter by tags (using tag assignments)
        tag_names = criteria['tags']
        tag_query = select(DonorTag.id).where(
            and_(
                DonorTag.organization_id == organization_id,
                DonorTag.name.in_(tag_names)
            )
        )
        tag_result = await org_db.execute(tag_query)
        tag_ids = [t.id for t in tag_result.scalars().all()]
        
        if tag_ids:
            assignment_query = select(DonorTagAssignment.donor_id).where(
                DonorTagAssignment.tag_id.in_(tag_ids)
            )
            assignment_result = await org_db.execute(assignment_query)
            donor_ids_with_tags = set(a for a in assignment_result.scalars().all())
            donors_query = donors_query.where(Donor.id.in_(donor_ids_with_tags))
    
    # Execute query
    donors_result = await org_db.execute(donors_query)
    matching_donors = donors_result.scalars().all()
    
    # Create assignments
    for donor in matching_donors:
        assignment = DonorSegmentAssignment(
            donor_id=donor.id,
            segment_id=segment_id
        )
        org_db.add(assignment)
    
    # Update segment count
    segment.donor_count = len(matching_donors)
    
    await org_db.commit()


# ============= Communications Endpoints =============

@router.get("/{organization_id}/donors/{donor_id}/communications", response_model=DonorCommunicationList)
async def list_donor_communications(
    organization_id: UUID,
    donor_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    communication_type: Optional[str] = Query(None),
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """List communications for a donor"""
    # Verify donor exists
    donor_query = select(Donor).where(
        and_(
            Donor.id == donor_id,
            Donor.organization_id == organization_id
        )
    )
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    query = select(DonorCommunication).where(
        and_(
            DonorCommunication.donor_id == donor_id,
            DonorCommunication.organization_id == organization_id
        )
    )
    
    if communication_type:
        query = query.where(DonorCommunication.communication_type == communication_type)
    
    # Get total count
    count_query = select(func.count(DonorCommunication.id)).where(
        and_(
            DonorCommunication.donor_id == donor_id,
            DonorCommunication.organization_id == organization_id
        )
    )
    if communication_type:
        count_query = count_query.where(DonorCommunication.communication_type == communication_type)
    
    total_result = await org_db.execute(count_query)
    total = total_result.scalar_one() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(DonorCommunication.created_at.desc()).offset(offset).limit(page_size)
    
    result = await org_db.execute(query)
    communications = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": communications,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/{organization_id}/donors/{donor_id}/communications", response_model=DonorCommunicationSchema, status_code=status.HTTP_201_CREATED)
async def create_communication(
    organization_id: UUID,
    donor_id: UUID,
    communication_data: DonorCommunicationCreate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new communication for a donor"""
    # Verify donor exists
    donor_query = select(Donor).where(
        and_(
            Donor.id == donor_id,
            Donor.organization_id == organization_id
        )
    )
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    from datetime import datetime, timezone
    
    communication = DonorCommunication(
        donor_id=donor_id,
        organization_id=organization_id,
        sent_by=current_user.id,
        sent_at=datetime.now(timezone.utc),
        **communication_data.model_dump()
    )
    
    org_db.add(communication)
    await org_db.commit()
    await org_db.refresh(communication)
    
    return communication


@router.get("/{organization_id}/communications/{communication_id}", response_model=DonorCommunicationSchema)
async def get_communication(
    organization_id: UUID,
    communication_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Get communication by ID"""
    query = select(DonorCommunication).where(
        and_(
            DonorCommunication.id == communication_id,
            DonorCommunication.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    communication = result.scalar_one_or_none()
    
    if not communication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Communication not found"
        )
    
    return communication


@router.patch("/{organization_id}/communications/{communication_id}", response_model=DonorCommunicationSchema)
async def update_communication(
    organization_id: UUID,
    communication_id: UUID,
    communication_data: DonorCommunicationUpdate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Update communication status"""
    query = select(DonorCommunication).where(
        and_(
            DonorCommunication.id == communication_id,
            DonorCommunication.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    communication = result.scalar_one_or_none()
    
    if not communication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Communication not found"
        )
    
    from datetime import datetime, timezone
    
    # Update fields (map schema 'metadata' -> model 'communication_metadata')
    update_data = communication_data.model_dump(exclude_unset=True)
    if "metadata" in update_data:
        update_data["communication_metadata"] = update_data.pop("metadata")
    for field, value in update_data.items():
        if field.endswith("_at") and value:
            setattr(communication, field, value if isinstance(value, datetime) else datetime.fromisoformat(value))
        else:
            setattr(communication, field, value)
    
    await org_db.commit()
    await org_db.refresh(communication)
    
    return communication


# ============= Campaigns Endpoints =============

@router.get("/{organization_id}/campaigns", response_model=CampaignList)
async def list_campaigns(
    organization_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """List all campaigns for organization"""
    query = select(Campaign).where(Campaign.organization_id == organization_id)
    
    if search:
        query = query.where(Campaign.name.ilike(f"%{search}%"))
    
    if status:
        query = query.where(Campaign.status == status)
    
    # Get total count
    count_query = select(func.count(Campaign.id)).where(Campaign.organization_id == organization_id)
    if search:
        count_query = count_query.where(Campaign.name.ilike(f"%{search}%"))
    if status:
        count_query = count_query.where(Campaign.status == status)
    
    total_result = await org_db.execute(count_query)
    total = total_result.scalar_one() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Campaign.created_at.desc()).offset(offset).limit(page_size)
    
    result = await org_db.execute(query)
    campaigns = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": campaigns,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/{organization_id}/campaigns", response_model=CampaignSchema, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    organization_id: UUID,
    campaign_data: CampaignCreate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new campaign"""
    campaign = Campaign(
        organization_id=organization_id,
        **campaign_data.model_dump()
    )
    
    org_db.add(campaign)
    await org_db.commit()
    await org_db.refresh(campaign)
    
    return campaign


@router.get("/{organization_id}/campaigns/{campaign_id}", response_model=CampaignSchema)
async def get_campaign(
    organization_id: UUID,
    campaign_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Get campaign by ID"""
    query = select(Campaign).where(
        and_(
            Campaign.id == campaign_id,
            Campaign.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return campaign


@router.patch("/{organization_id}/campaigns/{campaign_id}", response_model=CampaignSchema)
async def update_campaign(
    organization_id: UUID,
    campaign_id: UUID,
    campaign_data: CampaignUpdate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Update campaign"""
    query = select(Campaign).where(
        and_(
            Campaign.id == campaign_id,
            Campaign.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    # Update fields
    update_data = campaign_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campaign, field, value)
    
    await org_db.commit()
    await org_db.refresh(campaign)
    
    return campaign


@router.delete("/{organization_id}/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    organization_id: UUID,
    campaign_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Delete campaign"""
    query = select(Campaign).where(
        and_(
            Campaign.id == campaign_id,
            Campaign.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    await org_db.delete(campaign)
    await org_db.commit()
    
    return None


@router.get("/{organization_id}/campaigns/{campaign_id}/donations", response_model=DonationList)
async def get_campaign_donations(
    organization_id: UUID,
    campaign_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Get donations for a campaign"""
    # Verify campaign exists
    campaign_query = select(Campaign).where(
        and_(
            Campaign.id == campaign_id,
            Campaign.organization_id == organization_id
        )
    )
    campaign_result = await org_db.execute(campaign_query)
    campaign = campaign_result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    query = select(Donation).where(
        and_(
            Donation.campaign_id == campaign_id,
            Donation.organization_id == organization_id
        )
    )
    
    # Get total count
    count_query = select(func.count(Donation.id)).where(
        and_(
            Donation.campaign_id == campaign_id,
            Donation.organization_id == organization_id
        )
    )
    total_result = await org_db.execute(count_query)
    total = total_result.scalar_one() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(Donation.created_at.desc()).offset(offset).limit(page_size)
    
    result = await org_db.execute(query)
    donations = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": donations,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/{organization_id}/campaigns/{campaign_id}/stats", response_model=CampaignStats)
async def get_campaign_stats(
    organization_id: UUID,
    campaign_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Get campaign statistics"""
    # Verify campaign exists
    campaign_query = select(Campaign).where(
        and_(
            Campaign.id == campaign_id,
            Campaign.organization_id == organization_id
        )
    )
    campaign_result = await org_db.execute(campaign_query)
    campaign = campaign_result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaign not found"
        )
    
    return {
        "total_raised": campaign.total_raised,
        "donor_count": campaign.donor_count,
        "donation_count": campaign.donation_count,
        "progress_percentage": campaign.progress_percentage,
        "days_remaining": campaign.days_remaining,
        "is_active": campaign.is_active,
    }


# ============= Recurring Donations Endpoints =============

@router.get("/{organization_id}/donors/{donor_id}/recurring", response_model=RecurringDonationList)
async def list_recurring_donations(
    organization_id: UUID,
    donor_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """List recurring donations for a donor"""
    # Verify donor exists
    donor_query = select(Donor).where(
        and_(
            Donor.id == donor_id,
            Donor.organization_id == organization_id
        )
    )
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    query = select(RecurringDonation).where(
        and_(
            RecurringDonation.donor_id == donor_id,
            RecurringDonation.organization_id == organization_id
        )
    )
    
    if status:
        query = query.where(RecurringDonation.status == status)
    
    # Get total count
    count_query = select(func.count(RecurringDonation.id)).where(
        and_(
            RecurringDonation.donor_id == donor_id,
            RecurringDonation.organization_id == organization_id
        )
    )
    if status:
        count_query = count_query.where(RecurringDonation.status == status)
    
    total_result = await org_db.execute(count_query)
    total = total_result.scalar_one() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.order_by(RecurringDonation.next_payment_date.asc()).offset(offset).limit(page_size)
    
    result = await org_db.execute(query)
    recurring_donations = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": recurring_donations,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.post("/{organization_id}/donors/{donor_id}/recurring", response_model=RecurringDonationSchema, status_code=status.HTTP_201_CREATED)
async def create_recurring_donation(
    organization_id: UUID,
    donor_id: UUID,
    recurring_data: RecurringDonationCreate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new recurring donation"""
    # Verify donor exists
    donor_query = select(Donor).where(
        and_(
            Donor.id == donor_id,
            Donor.organization_id == organization_id
        )
    )
    donor_result = await org_db.execute(donor_query)
    donor = donor_result.scalar_one_or_none()
    
    if not donor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donor not found"
        )
    
    # Verify payment method exists
    payment_method_query = select(PaymentMethod).where(
        PaymentMethod.id == recurring_data.payment_method_id
    )
    payment_method_result = await org_db.execute(payment_method_query)
    payment_method = payment_method_result.scalar_one_or_none()
    
    if not payment_method:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    # Calculate next payment date
    from datetime import timedelta
    next_payment_date = recurring_data.start_date
    if recurring_data.frequency == 'weekly':
        next_payment_date = recurring_data.start_date + timedelta(weeks=1)
    elif recurring_data.frequency == 'monthly':
        next_payment_date = recurring_data.start_date + timedelta(days=30)
    elif recurring_data.frequency == 'quarterly':
        next_payment_date = recurring_data.start_date + timedelta(days=90)
    elif recurring_data.frequency == 'yearly':
        next_payment_date = recurring_data.start_date + timedelta(days=365)
    
    recurring_donation = RecurringDonation(
        donor_id=donor_id,
        organization_id=organization_id,
        next_payment_date=next_payment_date,
        **recurring_data.model_dump()
    )
    
    org_db.add(recurring_donation)
    await org_db.commit()
    await org_db.refresh(recurring_donation)
    
    return recurring_donation


@router.get("/{organization_id}/recurring/{recurring_id}", response_model=RecurringDonationSchema)
async def get_recurring_donation(
    organization_id: UUID,
    recurring_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Get recurring donation by ID"""
    query = select(RecurringDonation).where(
        and_(
            RecurringDonation.id == recurring_id,
            RecurringDonation.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    recurring_donation = result.scalar_one_or_none()
    
    if not recurring_donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring donation not found"
        )
    
    return recurring_donation


@router.patch("/{organization_id}/recurring/{recurring_id}", response_model=RecurringDonationSchema)
async def update_recurring_donation(
    organization_id: UUID,
    recurring_id: UUID,
    recurring_data: RecurringDonationUpdate,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Update recurring donation (pause, resume, cancel, etc.)"""
    query = select(RecurringDonation).where(
        and_(
            RecurringDonation.id == recurring_id,
            RecurringDonation.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    recurring_donation = result.scalar_one_or_none()
    
    if not recurring_donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring donation not found"
        )
    
    # Update fields
    update_data = recurring_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(recurring_donation, field, value)
    
    # Recalculate next payment date if frequency changed
    if 'frequency' in update_data:
        recurring_donation.next_payment_date = recurring_donation.calculate_next_payment_date()
    
    await org_db.commit()
    await org_db.refresh(recurring_donation)
    
    return recurring_donation


@router.delete("/{organization_id}/recurring/{recurring_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_recurring_donation(
    organization_id: UUID,
    recurring_id: UUID,
    org_db: AsyncSession = Depends(get_organization_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel a recurring donation"""
    query = select(RecurringDonation).where(
        and_(
            RecurringDonation.id == recurring_id,
            RecurringDonation.organization_id == organization_id
        )
    )
    result = await org_db.execute(query)
    recurring_donation = result.scalar_one_or_none()
    
    if not recurring_donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recurring donation not found"
        )
    
    # Mark as cancelled instead of deleting
    recurring_donation.status = 'cancelled'
    
    await org_db.commit()
    
    return None
