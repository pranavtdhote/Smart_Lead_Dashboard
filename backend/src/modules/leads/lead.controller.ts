/**
 * Lead Controller — Request Handling Layer.
 *
 * Responsibilities:
 *  - Extract data from the request (body, params, query, user context).
 *  - Delegate business logic to LeadService.
 *  - Format and send the API response.
 *
 * This layer NEVER contains business logic or database queries.
 */

import type { Request, Response } from 'express';
import { LeadService } from './lead.service';
import { ApiResponse } from '../../core';
import type { CreateLeadDto, UpdateLeadDto, LeadQueryDto } from './lead.validation';
import type { AuthenticatedRequest } from '../../types';
import { USER_ROLES } from '../../types';

export class LeadController {
  static async createLead(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const body = req.body as CreateLeadDto;
    const lead = await LeadService.createLead(authReq.user.userId, body);
    ApiResponse.created(res, { lead }, 'Lead created successfully');
  }

  static async getLeads(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const isAdmin = authReq.user.role === USER_ROLES.ADMIN;
    const query = req.query as unknown as LeadQueryDto;

    const { leads, meta } = await LeadService.getLeads(authReq.user.userId, isAdmin, query);
    ApiResponse.success(res, { leads }, 'Leads retrieved successfully', 200, meta);
  }

  static async getLead(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const isAdmin = authReq.user.role === USER_ROLES.ADMIN;

    const leadId = String(req.params.id);
    const lead = await LeadService.getLeadById(leadId, authReq.user.userId, isAdmin);
    ApiResponse.success(res, { lead }, 'Lead retrieved successfully');
  }

  static async updateLead(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const isAdmin = authReq.user.role === USER_ROLES.ADMIN;
    const body = req.body as UpdateLeadDto;

    const leadId = String(req.params.id);
    const lead = await LeadService.updateLead(leadId, authReq.user.userId, isAdmin, body);
    ApiResponse.success(res, { lead }, 'Lead updated successfully');
  }

  static async deleteLead(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const isAdmin = authReq.user.role === USER_ROLES.ADMIN;

    const leadId = String(req.params.id);
    await LeadService.deleteLead(leadId, authReq.user.userId, isAdmin);
    ApiResponse.success(res, null, 'Lead deleted successfully');
  }

  static async getStats(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthenticatedRequest;
    const isAdmin = authReq.user.role === USER_ROLES.ADMIN;

    const stats = await LeadService.getStats(authReq.user.userId, isAdmin);
    ApiResponse.success(res, { stats }, 'Lead statistics retrieved');
  }
}
