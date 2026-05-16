import { ChevronLeft, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { useLeadsFilterStore } from '../store/leadsStore';
import { useLeads, useDeleteLead } from '../hooks/useLeads';
import { TableSkeleton } from '../../../components/ui/Skeleton';
import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../../../store/authStore';
import { USER_ROLES } from '../../../types';
import type { Lead } from '../types';

interface LeadsTableProps {
  onEdit: (lead: Lead) => void;
}

export const LeadsTable = ({ onEdit }: LeadsTableProps) => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const filters = useLeadsFilterStore();
  const deleteLead = useDeleteLead();
  
  const { data, isLoading, isError, isPlaceholderData } = useLeads({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    status: filters.status,
    source: filters.source,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      deleteLead.mutate(id);
    }
  };

  const toggleSort = (field: string) => {
    if (filters.sortBy === field) {
      filters.setSorting(field, filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      filters.setSorting(field, 'desc');
    }
  };

  const renderSortIndicator = (field: string) => {
    if (filters.sortBy !== field) return null;
    return <span className="ml-1 inline-block">{filters.sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  if (isLoading) {
    return <TableSkeleton rows={8} columns={5} />;
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center bg-white">
        <p className="text-red-500">Failed to load leads. Please try again.</p>
      </div>
    );
  }

  const { leads } = data.data;
  const meta = data.meta!;

  return (
    <div className="bg-white rounded-b-xl shadow-sm border border-t-0 border-gray-200 flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('name')}
              >
                Lead {renderSortIndicator('name')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('status')}
              >
                Status {renderSortIndicator('status')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('source')}
              >
                Source {renderSortIndicator('source')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('createdAt')}
              >
                Created {renderSortIndicator('createdAt')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${isPlaceholderData ? 'opacity-50 transition-opacity duration-200' : ''}`}>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No leads found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{lead.name}</span>
                      <span className="text-sm text-gray-500">{lead.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' : ''}
                      ${lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${lead.status === 'QUALIFIED' ? 'bg-green-100 text-green-800' : ''}
                      ${lead.status === 'LOST' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => onEdit(lead)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit lead"
                      >
                        <Edit2 size={16} />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(lead._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete lead"
                          disabled={deleteLead.isPending}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {leads.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> to{' '}
                <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span> of{' '}
                <span className="font-medium">{meta.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-none border-r-0"
                  disabled={!meta.hasPrevPage || isPlaceholderData}
                  onClick={() => filters.setPage(meta.page - 1)}
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <div className="flex items-center justify-center px-4 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                  Page {meta.page} of {meta.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-none border-l-0"
                  disabled={!meta.hasNextPage || isPlaceholderData}
                  onClick={() => filters.setPage(meta.page + 1)}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
