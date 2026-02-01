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
  DonorTag,
  DonorTagCreate,
  DonorTagUpdate,
  DonorTagList,
  DonorSegment,
  DonorSegmentCreate,
  DonorSegmentUpdate,
  DonorSegmentList,
  SegmentSuggestionList,
  DonorCommunication,
  DonorCommunicationCreate,
  DonorCommunicationUpdate,
  DonorCommunicationList,
  Campaign,
  CampaignCreate,
  CampaignUpdate,
  CampaignList,
  CampaignStats,
  RecurringDonation,
  RecurringDonationCreate,
  RecurringDonationUpdate,
  RecurringDonationList,
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

export interface SeedDonorsResponse {
  success: boolean;
  message: string;
  donors_created: number;
  donations_created: number;
}

export async function seedExampleDonors(
  organizationId: string,
  count: number = 10
): Promise<SeedDonorsResponse> {
  const response = await apiClient.post<SeedDonorsResponse>(
    `/v1/organizations/${organizationId}/donors/seed?count=${count}`
  );
  return extractApiData(response);
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

// ============= Tags =============

export interface ListTagsParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export async function listTags(params: ListTagsParams): Promise<DonorTagList> {
  const { organizationId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  if (queryParams.search) queryString.append('search', queryParams.search);
  
  const url = `/v1/organizations/${organizationId}/tags${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<DonorTagList>(url);
  return extractApiData(response);
}

export async function getTag(organizationId: string, tagId: string): Promise<DonorTag> {
  const response = await apiClient.get<DonorTag>(`/v1/organizations/${organizationId}/tags/${tagId}`);
  return extractApiData(response);
}

export async function createTag(organizationId: string, data: DonorTagCreate): Promise<DonorTag> {
  const response = await apiClient.post<DonorTag>(`/v1/organizations/${organizationId}/tags`, data);
  return extractApiData(response);
}

export async function updateTag(organizationId: string, tagId: string, data: DonorTagUpdate): Promise<DonorTag> {
  const response = await apiClient.patch<DonorTag>(`/v1/organizations/${organizationId}/tags/${tagId}`, data);
  return extractApiData(response);
}

export async function deleteTag(organizationId: string, tagId: string): Promise<void> {
  await apiClient.delete(`/v1/organizations/${organizationId}/tags/${tagId}`);
}

export async function assignTagToDonor(organizationId: string, donorId: string, tagId: string): Promise<DonorTag> {
  const response = await apiClient.post<DonorTag>(
    `/v1/organizations/${organizationId}/donors/${donorId}/tags?tag_id=${tagId}`
  );
  return extractApiData(response);
}

export async function removeTagFromDonor(organizationId: string, donorId: string, tagId: string): Promise<void> {
  await apiClient.delete(`/v1/organizations/${organizationId}/donors/${donorId}/tags/${tagId}`);
}

// ============= Segments =============

export interface ListSegmentsParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  isAutomatic?: boolean;
}

export async function listSegments(params: ListSegmentsParams): Promise<DonorSegmentList> {
  const { organizationId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  if (queryParams.search) queryString.append('search', queryParams.search);
  if (queryParams.isAutomatic !== undefined) queryString.append('is_automatic', queryParams.isAutomatic.toString());
  
  const url = `/v1/organizations/${organizationId}/segments${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<DonorSegmentList>(url);
  return extractApiData(response);
}

export async function getSegment(organizationId: string, segmentId: string): Promise<DonorSegment> {
  const response = await apiClient.get<DonorSegment>(`/v1/organizations/${organizationId}/segments/${segmentId}`);
  return extractApiData(response);
}

export async function createSegment(organizationId: string, data: DonorSegmentCreate): Promise<DonorSegment> {
  const response = await apiClient.post<DonorSegment>(`/v1/organizations/${organizationId}/segments`, data);
  return extractApiData(response);
}

export async function updateSegment(organizationId: string, segmentId: string, data: DonorSegmentUpdate): Promise<DonorSegment> {
  const response = await apiClient.patch<DonorSegment>(`/v1/organizations/${organizationId}/segments/${segmentId}`, data);
  return extractApiData(response);
}

export async function deleteSegment(organizationId: string, segmentId: string): Promise<void> {
  await apiClient.delete(`/v1/organizations/${organizationId}/segments/${segmentId}`);
}

export interface GetSegmentDonorsParams {
  organizationId: string;
  segmentId: string;
  page?: number;
  pageSize?: number;
}

export async function getSegmentDonors(params: GetSegmentDonorsParams): Promise<DonorList> {
  const { organizationId, segmentId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  
  const url = `/v1/organizations/${organizationId}/segments/${segmentId}/donors${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<DonorList>(url);
  return extractApiData(response);
}

export async function recalculateSegment(organizationId: string, segmentId: string): Promise<DonorSegment> {
  const response = await apiClient.post<DonorSegment>(
    `/v1/organizations/${organizationId}/segments/${segmentId}/recalculate`
  );
  return extractApiData(response);
}

// ============= Segment Suggestions =============

export interface ListSegmentSuggestionsParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  includeAccepted?: boolean;
}

export async function listSegmentSuggestions(
  params: ListSegmentSuggestionsParams
): Promise<SegmentSuggestionList> {
  const { organizationId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  if (queryParams.includeAccepted !== undefined) {
    queryString.append('include_accepted', queryParams.includeAccepted.toString());
  }
  
  const url = `/v1/organizations/${organizationId}/segment-suggestions${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<SegmentSuggestionList>(url);
  return extractApiData(response);
}

// ============= Communications =============

export interface ListDonorCommunicationsParams {
  organizationId: string;
  donorId: string;
  page?: number;
  pageSize?: number;
  communicationType?: string;
}

export async function listDonorCommunications(params: ListDonorCommunicationsParams): Promise<DonorCommunicationList> {
  const { organizationId, donorId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  if (queryParams.communicationType) queryString.append('communication_type', queryParams.communicationType);
  
  const url = `/v1/organizations/${organizationId}/donors/${donorId}/communications${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<DonorCommunicationList>(url);
  return extractApiData(response);
}

export async function createCommunication(
  organizationId: string,
  donorId: string,
  data: DonorCommunicationCreate
): Promise<DonorCommunication> {
  const response = await apiClient.post<DonorCommunication>(
    `/v1/organizations/${organizationId}/donors/${donorId}/communications`,
    data
  );
  return extractApiData(response);
}

export async function getCommunication(organizationId: string, communicationId: string): Promise<DonorCommunication> {
  const response = await apiClient.get<DonorCommunication>(
    `/v1/organizations/${organizationId}/communications/${communicationId}`
  );
  return extractApiData(response);
}

export async function updateCommunication(
  organizationId: string,
  communicationId: string,
  data: DonorCommunicationUpdate
): Promise<DonorCommunication> {
  const response = await apiClient.patch<DonorCommunication>(
    `/v1/organizations/${organizationId}/communications/${communicationId}`,
    data
  );
  return extractApiData(response);
}

// ============= Campaigns =============

export interface ListCampaignsParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export async function listCampaigns(params: ListCampaignsParams): Promise<CampaignList> {
  const { organizationId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  if (queryParams.search) queryString.append('search', queryParams.search);
  if (queryParams.status) queryString.append('status', queryParams.status);
  
  const url = `/v1/organizations/${organizationId}/campaigns${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<CampaignList>(url);
  return extractApiData(response);
}

export async function getCampaign(organizationId: string, campaignId: string): Promise<Campaign> {
  const response = await apiClient.get<Campaign>(`/v1/organizations/${organizationId}/campaigns/${campaignId}`);
  return extractApiData(response);
}

export async function createCampaign(organizationId: string, data: CampaignCreate): Promise<Campaign> {
  const response = await apiClient.post<Campaign>(`/v1/organizations/${organizationId}/campaigns`, data);
  return extractApiData(response);
}

export async function updateCampaign(organizationId: string, campaignId: string, data: CampaignUpdate): Promise<Campaign> {
  const response = await apiClient.patch<Campaign>(`/v1/organizations/${organizationId}/campaigns/${campaignId}`, data);
  return extractApiData(response);
}

export async function deleteCampaign(organizationId: string, campaignId: string): Promise<void> {
  await apiClient.delete(`/v1/organizations/${organizationId}/campaigns/${campaignId}`);
}

export interface GetCampaignDonationsParams {
  organizationId: string;
  campaignId: string;
  page?: number;
  pageSize?: number;
}

export async function getCampaignDonations(params: GetCampaignDonationsParams): Promise<DonationList> {
  const { organizationId, campaignId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  
  const url = `/v1/organizations/${organizationId}/campaigns/${campaignId}/donations${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<DonationList>(url);
  return extractApiData(response);
}

export async function getCampaignStats(organizationId: string, campaignId: string): Promise<CampaignStats> {
  const response = await apiClient.get<CampaignStats>(`/v1/organizations/${organizationId}/campaigns/${campaignId}/stats`);
  return extractApiData(response);
}

// ============= Recurring Donations =============

export interface ListRecurringDonationsParams {
  organizationId: string;
  donorId: string;
  page?: number;
  pageSize?: number;
  status?: string;
}

export async function listRecurringDonations(params: ListRecurringDonationsParams): Promise<RecurringDonationList> {
  const { organizationId, donorId, ...queryParams } = params;
  const queryString = new URLSearchParams();
  
  if (queryParams.page) queryString.append('page', queryParams.page.toString());
  if (queryParams.pageSize) queryString.append('page_size', queryParams.pageSize.toString());
  if (queryParams.status) queryString.append('status', queryParams.status);
  
  const url = `/v1/organizations/${organizationId}/donors/${donorId}/recurring${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  const response = await apiClient.get<RecurringDonationList>(url);
  return extractApiData(response);
}

export async function getRecurringDonation(organizationId: string, recurringId: string): Promise<RecurringDonation> {
  const response = await apiClient.get<RecurringDonation>(`/v1/organizations/${organizationId}/recurring/${recurringId}`);
  return extractApiData(response);
}

export async function createRecurringDonation(
  organizationId: string,
  donorId: string,
  data: RecurringDonationCreate
): Promise<RecurringDonation> {
  const response = await apiClient.post<RecurringDonation>(
    `/v1/organizations/${organizationId}/donors/${donorId}/recurring`,
    data
  );
  return extractApiData(response);
}

export async function updateRecurringDonation(
  organizationId: string,
  recurringId: string,
  data: RecurringDonationUpdate
): Promise<RecurringDonation> {
  const response = await apiClient.patch<RecurringDonation>(
    `/v1/organizations/${organizationId}/recurring/${recurringId}`,
    data
  );
  return extractApiData(response);
}

export async function cancelRecurringDonation(organizationId: string, recurringId: string): Promise<void> {
  await apiClient.delete(`/v1/organizations/${organizationId}/recurring/${recurringId}`);
}
