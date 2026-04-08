import { timestamp } from 'drizzle-orm/pg-core';

/**
 * Wrapper for timestamp with timezone columns.
 */
export const timestamptz = (name: string) =>
    timestamp(name, { withTimezone: true, mode: 'string' });

/**
 * Standard created_at column with default now().
 */
export const createdAt = () => timestamptz('created_at').defaultNow().notNull();

/**
 * Standard updated_at column with default now().
 */
export const updatedAt = () => timestamptz('updated_at').defaultNow().notNull();

/**
 * Spread-friendly object containing both timestamp columns.
 * Usage: `{ ...timestamps }` in table definitions.
 */
export const timestamps = {
    createdAt: createdAt(),
    updatedAt: updatedAt(),
};
