import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi, type GetLeadsParams } from '../api/leads.api';
import toast from 'react-hot-toast';

// Keys for cache invalidation
export const leadsKeys = {
  all: ['leads'] as const,
  lists: () => [...leadsKeys.all, 'list'] as const,
  list: (filters: GetLeadsParams) => [...leadsKeys.lists(), filters] as const,
  stats: () => [...leadsKeys.all, 'stats'] as const,
};

export const useLeads = (filters: GetLeadsParams) => {
  return useQuery({
    queryKey: leadsKeys.list(filters),
    queryFn: () => leadsApi.getLeads(filters),
    // Keep previous data while fetching new pages/filters to prevent layout shift
    placeholderData: (previousData) => previousData,
  });
};

export const useLeadStats = () => {
  return useQuery({
    queryKey: leadsKeys.stats(),
    queryFn: leadsApi.getStats,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.createLead,
    onSuccess: () => {
      toast.success('Lead created successfully');
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.updateLead,
    onSuccess: () => {
      toast.success('Lead updated successfully');
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.deleteLead,
    onSuccess: () => {
      toast.success('Lead deleted successfully');
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
    },
  });
};
