import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { createLeadSchema, type CreateLeadFormData } from '../leads.validation';
import { useCreateLead, useUpdateLead } from '../hooks/useLeads';
import type { Lead } from '../types';
import { LEAD_STATUSES, LEAD_SOURCES } from '../types';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

export const LeadFormModal = ({ isOpen, onClose, leadToEdit }: LeadFormModalProps) => {
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const isEditing = !!leadToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      status: LEAD_STATUSES.NEW,
    },
  });

  // Reset form when modal opens/closes or when leadToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (leadToEdit) {
        reset({
          name: leadToEdit.name,
          email: leadToEdit.email,
          status: leadToEdit.status,
          source: leadToEdit.source,
        });
      } else {
        reset({ status: LEAD_STATUSES.NEW, name: '', email: '', source: undefined });
      }
    }
  }, [isOpen, leadToEdit, reset]);

  const onSubmit = (data: CreateLeadFormData) => {
    if (isEditing && leadToEdit) {
      updateLead.mutate(
        { id: leadToEdit._id, data },
        { onSuccess: () => onClose() }
      );
    } else {
      createLead.mutate(data, { onSuccess: () => onClose() });
    }
  };

  const isLoading = createLead.isPending || updateLead.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Lead' : 'Create New Lead'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="name"
          label="Full Name"
          placeholder="Jane Smith"
          error={errors.name?.message}
          {...register('name')}
        />
        
        <Input
          id="email"
          type="email"
          label="Email Address"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            id="status"
            label="Status"
            error={errors.status?.message}
            {...register('status')}
            options={[
              { value: LEAD_STATUSES.NEW, label: 'New' },
              { value: LEAD_STATUSES.CONTACTED, label: 'Contacted' },
              { value: LEAD_STATUSES.QUALIFIED, label: 'Qualified' },
              { value: LEAD_STATUSES.LOST, label: 'Lost' },
            ]}
          />

          <Select
            id="source"
            label="Source"
            error={errors.source?.message}
            {...register('source')}
            options={[
              { value: '', label: 'Select Source' },
              { value: LEAD_SOURCES.WEBSITE, label: 'Website' },
              { value: LEAD_SOURCES.INSTAGRAM, label: 'Instagram' },
              { value: LEAD_SOURCES.REFERRAL, label: 'Referral' },
            ]}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
