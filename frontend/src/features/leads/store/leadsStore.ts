import { create } from 'zustand';
import type { LeadStatus, LeadSource } from '../types';

interface LeadsFilterState {
  page: number;
  limit: number;
  search: string;
  status: LeadStatus | '' | undefined;
  source: LeadSource | '' | undefined;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Actions
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setFilters: (filters: { status?: LeadStatus | ''; source?: LeadSource | '' }) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  resetFilters: () => void;
}

const initialState = {
  page: 1,
  limit: 10,
  search: '',
  status: '' as const,
  source: '' as const,
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
};

export const useLeadsFilterStore = create<LeadsFilterState>((set) => ({
  ...initialState,

  setPage: (page) => set({ page }),
  
  // Reset page to 1 whenever search changes
  setSearch: (search) => set({ search, page: 1 }),
  
  // Reset page to 1 whenever filters change
  setFilters: (filters) => set({ ...filters, page: 1 }),
  
  setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
  
  resetFilters: () => set(initialState),
}));
