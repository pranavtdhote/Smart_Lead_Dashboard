/**
 * Lead Service — Business Logic Layer.
 *
 * Orchestrates validation, authorization, and data access.
 * This layer NEVER touches Mongoose directly — it delegates
 * all database operations to the LeadRepository.
 */

import { LeadRepository } from './lead.repository';
import type { CreateLeadDto, UpdateLeadDto, LeadQueryDto } from './lead.validation';
import { NotFoundError, ForbiddenError } from '../../core';
import type { ILead } from './lead.model';
import type { PaginationMeta } from '../../types';

export class LeadService {
  /**
   * Create a new lead assigned to the current user.
   */
  static async createLead(userId: string, dto: CreateLeadDto): Promise<ILead> {
    return LeadRepository.create({
      ...dto,
      createdBy: userId as unknown as ILead['createdBy'],
    });
  }

  /**
   * Fetch paginated, filtered, and sorted leads.
   * RBAC is enforced at the repository level via QueryBuilder.
   */
  static async getLeads(
    userId: string,
    isAdmin: boolean,
    query: LeadQueryDto,
  ): Promise<{ leads: ILead[]; meta: PaginationMeta }> {
    const { data, meta } = await LeadRepository.findAll(query, userId, isAdmin);
    return { leads: data, meta };
  }

  /**
   * Fetch a single lead by ID (respects RBAC).
   */
  static async getLeadById(leadId: string, userId: string, isAdmin: boolean): Promise<ILead> {
    const lead = await LeadRepository.findById(leadId, userId, isAdmin);
    if (!lead) {
      throw new NotFoundError('Lead');
    }
    return lead;
  }

  /**
   * Update a lead by ID (respects RBAC).
   */
  static async updateLead(
    leadId: string,
    userId: string,
    isAdmin: boolean,
    dto: UpdateLeadDto,
  ): Promise<ILead> {
    // Verify existence and ownership before updating
    const existing = await LeadRepository.findById(leadId, userId, isAdmin);
    if (!existing) {
      throw new NotFoundError('Lead');
    }

    const updated = await LeadRepository.update(leadId, dto);
    if (!updated) {
      throw new NotFoundError('Lead');
    }
    return updated;
  }

  /**
   * Delete a lead (admin-only operation).
   */
  static async deleteLead(leadId: string, userId: string, isAdmin: boolean): Promise<void> {
    const lead = await LeadRepository.findById(leadId, userId, isAdmin);
    if (!lead) {
      throw new NotFoundError('Lead');
    }

    if (!isAdmin) {
      throw new ForbiddenError('Only administrators can delete leads');
    }

    await LeadRepository.delete(leadId);
  }

  /**
   * Get lead counts grouped by status for dashboard widgets.
   */
  static async getStats(
    userId: string,
    isAdmin: boolean,
  ): Promise<Record<string, number>> {
    return LeadRepository.countByStatus(userId, isAdmin);
  }
}
