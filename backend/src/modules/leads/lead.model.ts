/**
 * Lead Mongoose Model & Schema.
 *
 * ─── Indexing Strategy ──────────────────────────────────────
 *
 * Index design follows the ESR rule (Equality → Sort → Range):
 *
 * 1. { status: 1, createdAt: -1 }
 *    Covers: filter by status + sort by newest.
 *    Query: GET /leads?status=NEW&sortBy=createdAt&sortOrder=desc
 *
 * 2. { source: 1, createdAt: -1 }
 *    Covers: filter by source + sort by newest.
 *    Query: GET /leads?source=WEBSITE&sortBy=createdAt
 *
 * 3. { createdBy: 1, status: 1, createdAt: -1 }
 *    Covers: RBAC ownership + status filter + sort.
 *    Query: GET /leads?status=NEW (as a SALES user)
 *    This is the most important index for non-admin users.
 *
 * 4. { createdBy: 1, createdAt: -1 }
 *    Covers: RBAC ownership + sort by newest (no filters).
 *    Query: GET /leads (as a SALES user)
 *
 * 5. { name: 1 } and { email: 1 }
 *    Single-field indexes for regex search prefix matching.
 *    Note: $regex with /^pattern/i CAN use a single-field index.
 *    Our regex is unanchored (/pattern/i), so these help less,
 *    but Mongo can still use them for intersection plans.
 *
 * For datasets > 500k documents, replace regex search with:
 *  - MongoDB Atlas Search ($search operator)
 *  - A dedicated text index with $text query
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { LeadStatus, LeadSource } from '../../types';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../types';

export interface ILead extends Document {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    status: {
      type: String,
      enum: Object.values(LEAD_STATUSES),
      default: LEAD_STATUSES.NEW,
    },
    source: {
      type: String,
      enum: Object.values(LEAD_SOURCES),
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

// ─── Compound Indexes (ESR Rule) ────────────────────────────
// Equality fields first, then Sort fields, then Range fields.

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ source: 1, createdAt: -1 });
leadSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
leadSchema.index({ createdBy: 1, createdAt: -1 });

// ─── Single-field indexes for search ────────────────────────
leadSchema.index({ name: 1 });
leadSchema.index({ email: 1 });

export const LeadModel = mongoose.model<ILead>('Lead', leadSchema);
