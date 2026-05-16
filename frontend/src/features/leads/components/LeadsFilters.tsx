import { useState, useEffect } from 'react';
import { Search, FilterX, Download } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useLeadsFilterStore } from '../store/leadsStore';
import { useDebounce } from '../../../hooks/useDebounce';
import { exportToCsv } from '../../../utils/csv';
import { LEAD_STATUSES, LEAD_SOURCES } from '../types';
import { leadsApi } from '../api/leads.api';
import toast from 'react-hot-toast';

export const LeadsFilters = () => {
  const { search, status, source, setSearch, setFilters, resetFilters, sortBy, sortOrder } = useLeadsFilterStore();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 500);
  const [isExporting, setIsExporting] = useState(false);

  // Sync local search to store only after debounce
  useEffect(() => {
    if (debouncedSearch !== search) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, search, setSearch]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await leadsApi.exportCsv({
        search,
        status,
        source,
        sortBy,
        sortOrder
      });
      
      if (data.length === 0) {
        toast.error('No leads to export');
        return;
      }

      exportToCsv(data, `leads_export_${new Date().toISOString().split('T')[0]}`, [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status' },
        { key: 'source', label: 'Source' },
        { key: (item) => `${item.createdBy.firstName} ${item.createdBy.lastName}`, label: 'Created By' },
        { key: (item) => new Date(item.createdAt).toLocaleDateString(), label: 'Created At' },
      ]);
      
      toast.success('Export successful');
    } catch (error) {
      toast.error('Failed to export leads');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 bg-white p-4 rounded-t-xl border-b border-gray-200">
      <div className="flex-1">
        <Input
          placeholder="Search by name or email..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          leftIcon={<Search size={18} />}
          className="max-w-md"
        />
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <Select
          className="w-40"
          value={status || ''}
          onChange={(e) => setFilters({ status: e.target.value as any })}
          options={[
            { value: '', label: 'All Statuses' },
            { value: LEAD_STATUSES.NEW, label: 'New' },
            { value: LEAD_STATUSES.CONTACTED, label: 'Contacted' },
            { value: LEAD_STATUSES.QUALIFIED, label: 'Qualified' },
            { value: LEAD_STATUSES.LOST, label: 'Lost' },
          ]}
        />

        <Select
          className="w-40"
          value={source || ''}
          onChange={(e) => setFilters({ source: e.target.value as any })}
          options={[
            { value: '', label: 'All Sources' },
            { value: LEAD_SOURCES.WEBSITE, label: 'Website' },
            { value: LEAD_SOURCES.INSTAGRAM, label: 'Instagram' },
            { value: LEAD_SOURCES.REFERRAL, label: 'Referral' },
          ]}
        />

        {(search || status || source) && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setLocalSearch('');
              resetFilters();
            }}
            title="Clear filters"
            className="px-3 text-gray-500 hover:text-red-600"
          >
            <FilterX size={18} />
          </Button>
        )}

        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <Button 
          variant="outline" 
          onClick={handleExport} 
          isLoading={isExporting}
          leftIcon={<Download size={16} />}
        >
          Export
        </Button>
      </div>
    </div>
  );
};
