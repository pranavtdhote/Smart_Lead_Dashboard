export const LEAD_STATUSES = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  LOST: 'LOST',
} as const;

export const LEAD_SOURCES = {
  WEBSITE: 'WEBSITE',
  INSTAGRAM: 'INSTAGRAM',
  REFERRAL: 'REFERRAL',
} as const;

export type LeadStatus = typeof LEAD_STATUSES[keyof typeof LEAD_STATUSES];
export type LeadSource = typeof LEAD_SOURCES[keyof typeof LEAD_SOURCES];

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
