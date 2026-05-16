import { useState } from 'react';
import { Plus } from 'lucide-react';
import { LeadsTable } from '../components/LeadsTable';
import { LeadsFilters } from '../components/LeadsFilters';
import { LeadFormModal } from '../components/LeadFormModal';
import { Button } from '../../../components/ui/Button';
import type { Lead } from '../types';

export const DashboardPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const handleCreateNew = () => {
    setLeadToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View, track, and manage your incoming leads from all sources.
          </p>
        </div>
        <Button onClick={handleCreateNew} leftIcon={<Plus size={18} />}>
          Add New Lead
        </Button>
      </div>

      <div className="shadow-sm rounded-xl">
        <LeadsFilters />
        <LeadsTable onEdit={handleEdit} />
      </div>

      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        leadToEdit={leadToEdit} 
      />
    </div>
  );
};
