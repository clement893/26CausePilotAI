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
from app.models.organization_donors import Donor, Donation, PaymentMethod, DonorNote, DonorActivity
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
    # Get organization_id from query param (required for now)
    # TODO: Get from org_db context or request state
    
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
    
    # Create activity
    activity = DonorActivity(
        donor_id=donor.id,
        organization_id=organization_id,
        activity_type='profile_created',
        activity_data={"created_by": current_user.id},
        performed_by=current_user.id,
    )
    org_db.add(activity)
    await org_db.commit()
    
    return donor


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
