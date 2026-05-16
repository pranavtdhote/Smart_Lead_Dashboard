import { apiClient } from '../../../lib/axios';
import type { Lead } from '../types';
import type { ApiSuccessResponse } from '../../../types';
import type { CreateLeadFormData, UpdateLeadFormData } from '../leads.validation';

export interface GetLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface LeadsResponse {
  leads: Lead[];
}

export const leadsApi = {
  getLeads: async (params: GetLeadsParams) => {
    // Filter out empty strings/undefined from params before sending
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    const response = await apiClient.get<ApiSuccessResponse<LeadsResponse>>('/leads', {
      params: cleanParams,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get<ApiSuccessResponse<{ stats: Record<string, number> }>>('/leads/stats');
    return response.data.data.stats;
  },

  createLead: async (data: CreateLeadFormData) => {
    const response = await apiClient.post<ApiSuccessResponse<{ lead: Lead }>>('/leads', data);
    return response.data.data.lead;
  },

  updateLead: async ({ id, data }: { id: string; data: UpdateLeadFormData }) => {
    const response = await apiClient.patch<ApiSuccessResponse<{ lead: Lead }>>(`/leads/${id}`, data);
    return response.data.data.lead;
  },

  deleteLead: async (id: string) => {
    await apiClient.delete(`/leads/${id}`);
  },

  exportCsv: async (params: GetLeadsParams) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    // Fetch all records for export, bypassing pagination limit
    const response = await apiClient.get<ApiSuccessResponse<LeadsResponse>>('/leads', {
      params: { ...cleanParams, limit: 1000 },
    });
    return response.data.data.leads;
  }
};
