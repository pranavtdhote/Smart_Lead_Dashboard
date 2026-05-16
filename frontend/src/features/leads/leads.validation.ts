import { z } from 'zod';
import { LEAD_STATUSES, LEAD_SOURCES } from './types';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  status: z.nativeEnum(LEAD_STATUSES).optional(),
  source: z.nativeEnum(LEAD_SOURCES),
});

export const updateLeadSchema = createLeadSchema.partial();

export type CreateLeadFormData = z.infer<typeof createLeadSchema>;
export type UpdateLeadFormData = z.infer<typeof updateLeadSchema>;
