/**
 * Donors API Client
 * 
 * Frontend API client for donor management endpoints.
 * All endpoints require organization_id path parameter.
 */

import { apiClient } from './client';
import { extractApiData } from './utils';
import type {
  Donor,
  DonorWithStats,
  DonorCreate,
  DonorUpdate,
  DonorList,
  Donation,
  DonationCreate,
  DonationUpdate,
  DonationList,
  DonorHistory,
  DonorStats,
  RefundRequest,
} from '@modele/types';

// ============= Donors CRUD =============

export interface ListDonorsParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  tags?: string[];
  minTotalDonated?: string;
  maxTotalDonated?: string;
}

export async function listDonors(params: ListDonorsParams): Promise<DonorList> {
  const { organizationId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  if (queryParams.search) queryString.append('search', queryParams.search);
  if (queryParams.isActive !== undefined) queryString.append('is_active', queryParams.isActive.toString());
  if (queryParams.tags) {
    queryParams.tags.forEach(tag => queryString.append('tags', tag));
  }
  if (queryParams.minTotalDonated) queryString.append('min_total_donated', queryParams.minTotalDonated);
  if (queryParams.maxTotalDonated) queryString.append('max_total_donated', queryParams.maxTotalDonated);
  
  const url = `/v1/organizations/${organizationId}/donors${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<DonorList>(url);
  return extractApiData(response);
}

export async function getDonor(organizationId: string, donorId: string): Promise<DonorWithStats> {
  const response = await apiClient.get<DonorWithStats>(`/v1/organizations/${organizationId}/donors/${donorId}`);
  return extractApiData(response);
}

export async function createDonor(organizationId: string, data: DonorCreate): Promise<Donor> {
  const response = await apiClient.post<Donor>(`/v1/organizations/${organizationId}/donors`, data);
  return extractApiData(response);
}

export async function updateDonor(organizationId: string, donorId: string, data: DonorUpdate): Promise<Donor> {
  const response = await apiClient.patch<Donor>(`/v1/organizations/${organizationId}/donors/${donorId}`, data);
  return extractApiData(response);
}

export async function deleteDonor(organizationId: string, donorId: string): Promise<void> {
  await apiClient.delete(`/v1/organizations/${organizationId}/donors/${donorId}`);
}

// ============= Donations =============

export interface ListDonorDonationsParams {
  organizationId: string;
  donorId: string;
  page?: number;
  pageSize?: number;
  paymentStatus?: string;
}

export async function listDonorDonations(params: ListDonorDonationsParams): Promise<DonationList> {
  const { organizationId, donorId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  if (queryParams.paymentStatus) queryString.append('payment_status', queryParams.paymentStatus);
  
  const url = `/v1/organizations/${organizationId}/donors/${donorId}/donations${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<DonationList>(url);
  return extractApiData(response);
}

export async function createDonation(organizationId: string, donorId: string, data: DonationCreate): Promise<Donation> {
  const response = await apiClient.post<Donation>(`/v1/organizations/${organizationId}/donors/${donorId}/donations`, data);
  return extractApiData(response);
}

export async function updateDonation(organizationId: string, donationId: string, data: DonationUpdate): Promise<Donation> {
  const response = await apiClient.patch<Donation>(`/v1/organizations/${organizationId}/donations/${donationId}`, data);
  return extractApiData(response);
}

export async function refundDonation(organizationId: string, donationId: string, data: RefundRequest): Promise<Donation> {
  const response = await apiClient.post<Donation>(`/v1/organizations/${organizationId}/donations/${donationId}/refund`, data);
  return extractApiData(response);
}

// ============= Donor History & Stats =============

export async function getDonorHistory(organizationId: string, donorId: string): Promise<DonorHistory> {
  const response = await apiClient.get<DonorHistory>(`/v1/organizations/${organizationId}/donors/${donorId}/history`);
  return extractApiData(response);
}

export async function getDonorStats(organizationId: string, donorId: string): Promise<DonorStats> {
  const response = await apiClient.get<DonorStats>(`/v1/organizations/${organizationId}/donors/${donorId}/stats`);
  return extractApiData(response);
}
