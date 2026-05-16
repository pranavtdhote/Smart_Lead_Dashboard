import { Router } from 'express';
import { LeadController } from './lead.controller';
import { validate, asyncHandler, requireAuth, requireRole } from '../../middlewares';
import { createLeadSchema, updateLeadSchema, leadQuerySchema } from './lead.validation';
import { USER_ROLES } from '../../types';

const router = Router();

// All lead routes require authentication
router.use(requireAuth);

// ─── Dashboard Stats ─────────────────────────────────────────
router.get(
  '/stats',
  asyncHandler(LeadController.getStats),
);

// ─── CRUD Operations ─────────────────────────────────────────
router.post(
  '/',
  validate({ body: createLeadSchema }),
  asyncHandler(LeadController.createLead),
);

router.get(
  '/',
  validate({ query: leadQuerySchema }),
  asyncHandler(LeadController.getLeads),
);

router.get(
  '/:id',
  asyncHandler(LeadController.getLead),
);

router.patch(
  '/:id',
  validate({ body: updateLeadSchema }),
  asyncHandler(LeadController.updateLead),
);

// Only ADMIN can delete leads
router.delete(
  '/:id',
  requireRole([USER_ROLES.ADMIN]),
  asyncHandler(LeadController.deleteLead),
);

export default router;
