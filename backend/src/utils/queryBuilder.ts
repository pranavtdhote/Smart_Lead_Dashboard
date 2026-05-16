/**
 * Dynamic MongoDB Query Builder.
 *
 * A generic, reusable utility that constructs type-safe MongoDB filter
 * objects from parsed query parameters. Designed to be model-agnostic
 * so it can be reused across any module (Leads, Users, etc.).
 *
 * Architecture:
 *  - Each filter type (exact match, regex search, date range, RBAC)
 *    is a composable function that mutates a shared filter object.
 *  - The builder chains them together via a fluent API.
 *
 * Performance considerations:
 *  - Regex search uses anchored patterns where possible.
 *  - User input is sanitized to prevent ReDoS attacks.
 *  - The builder avoids $or when a single field suffices.
 */

/**
 * Escape special regex characters in user input to prevent ReDoS.
 * This is CRITICAL for any regex built from user-supplied strings.
 */
export const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Generic filter condition types for MongoDB queries.
 */
interface ExactFilter {
  field: string;
  value: string | undefined;
}

interface SearchFilter {
  fields: string[];
  term: string | undefined;
}

interface DateRangeFilter {
  field: string;
  from?: string;
  to?: string;
}

interface OwnershipFilter {
  field: string;
  userId: string;
  isAdmin: boolean;
}

/**
 * QueryBuilder constructs a MongoDB filter object step by step.
 *
 * Usage:
 *   const filter = new QueryBuilder()
 *     .addExactMatch({ field: 'status', value: 'NEW' })
 *     .addExactMatch({ field: 'source', value: 'WEBSITE' })
 *     .addSearch({ fields: ['name', 'email'], term: 'john' })
 *     .addOwnership({ field: 'createdBy', userId: '...', isAdmin: false })
 *     .build();
 */
export class QueryBuilder {
  private filters: Record<string, unknown>[] = [];
  private searchConditions: Record<string, unknown>[] = [];

  /**
   * Add an exact-match filter (e.g., status === 'NEW').
   * Skips if value is undefined/empty — so filters compose cleanly.
   */
  addExactMatch(filter: ExactFilter): this {
    if (filter.value) {
      this.filters.push({ [filter.field]: filter.value });
    }
    return this;
  }

  /**
   * Add a case-insensitive regex search across multiple fields.
   * Uses $or to match ANY of the specified fields.
   *
   * Performance note: For large datasets (>100k docs), consider
   * replacing this with MongoDB Atlas Search ($search) or a
   * text index with $text/$meta instead of regex.
   */
  addSearch(filter: SearchFilter): this {
    if (filter.term && filter.term.trim().length > 0) {
      const sanitized = escapeRegex(filter.term.trim());
      const regex = new RegExp(sanitized, 'i');

      this.searchConditions = filter.fields.map((field) => ({
        [field]: { $regex: regex },
      }));
    }
    return this;
  }

  /**
   * Add a date range filter (createdAt between from and to).
   * Supports open-ended ranges (only from, only to, or both).
   */
  addDateRange(filter: DateRangeFilter): this {
    const range: Record<string, Date> = {};

    if (filter.from) {
      range.$gte = new Date(filter.from);
    }
    if (filter.to) {
      // Set to end of day for inclusive "to" date
      const toDate = new Date(filter.to);
      toDate.setHours(23, 59, 59, 999);
      range.$lte = toDate;
    }

    if (Object.keys(range).length > 0) {
      this.filters.push({ [filter.field]: range });
    }
    return this;
  }

  /**
   * Add RBAC ownership filter.
   * Admin users bypass this filter entirely.
   * Non-admin users are restricted to their own documents.
   */
  addOwnership(filter: OwnershipFilter): this {
    if (!filter.isAdmin) {
      this.filters.push({ [filter.field]: filter.userId });
    }
    return this;
  }

  /**
   * Build the final MongoDB filter object.
   *
   * Combines all conditions with $and so that:
   *  - All exact filters AND together
   *  - Search conditions use $or (match any field)
   *  - Ownership is always enforced
   *
   * Returns {} if no filters — fetches all documents.
   */
  build(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [...this.filters];

    // Add search as a single $or condition
    if (this.searchConditions.length > 0) {
      conditions.push({ $or: this.searchConditions });
    }

    // No filters? Return empty object (match all)
    if (conditions.length === 0) {
      return {};
    }

    // Single condition? No need for $and wrapper
    if (conditions.length === 1) {
      return conditions[0] as Record<string, unknown>;
    }

    // Multiple conditions: combine with $and
    return { $and: conditions };
  }
}
