import {
    pgTable,
    uuid,
    text,
    integer,
    boolean,
    jsonb,
    index,
    uniqueIndex,
    pgSchema,
} from 'drizzle-orm/pg-core';
import { timestamps, timestamptz } from './_helpers';

// =====================
// NEON AUTH REFERENCE TABLE
// =====================
// This table is managed by Neon Auth (Better Auth) in the 'neon_auth' schema.
// It is defined here so other tables can reference it for FK relationships.
export const authSchema = pgSchema('neon_auth');

export const authUser = authSchema.table('user', {
    id: uuid('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    image: text('image'),
    createdAt: timestamptz('createdAt').defaultNow().notNull(),
    updatedAt: timestamptz('updatedAt').defaultNow().notNull(),
});

// =====================
// PROJECTS
// =====================
export const projects = pgTable(
    'projects',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .references(() => authUser.id, { onDelete: 'cascade' })
            .notNull(),
        name: text('name').notNull(),
        description: text('description'),
        prompt: text('prompt'),
        isArchived: boolean('is_archived').default(false),
        ...timestamps,
    },
    (t) => [
        index('idx_projects_user_id').on(t.userId),
        index('idx_projects_created_at').on(t.createdAt),
    ],
);

// =====================
// SCREENS
// =====================
export const screens = pgTable(
    'screens',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        projectId: uuid('project_id')
            .references(() => projects.id, { onDelete: 'cascade' })
            .notNull(),
        name: text('name').notNull(),
        orderIndex: integer('order_index').default(0),
        isActive: boolean('is_active').default(true),
        ...timestamps,
    },
    (t) => [
        index('idx_screens_project_id').on(t.projectId),
        index('idx_screens_order_index').on(t.orderIndex),
    ],
);

// =====================
// HTML CONTENTS
// =====================
// Stores generated HTML content directly in the database.
// Replaces the previous Supabase Storage approach.
export const htmlContents = pgTable('html_contents', {
    id: uuid('id').primaryKey().defaultRandom(),
    html: text('html').notNull(),
    parentHtmlId: uuid('parent_html_id'),
    createdAt: timestamptz('created_at').defaultNow().notNull(),
});

// Self-referencing FK must be added after table definition
// Note: parentHtmlId references htmlContents.id for generating screens on top of another reference

// =====================
// SCREEN VERSIONS
// =====================
export const screenVersions = pgTable(
    'screen_versions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        screenId: uuid('screen_id')
            .references(() => screens.id, { onDelete: 'cascade' })
            .notNull(),
        versionNumber: integer('version_number').notNull(),
        userPrompt: text('user_prompt').notNull(),
        aiPrompt: text('ai_prompt'),
        htmlContentId: uuid('html_content_id')
            .references(() => htmlContents.id)
            .notNull(),
        createdBy: uuid('created_by').references(() => authUser.id),
        isCurrent: boolean('is_current').default(false),
        parentVersionId: uuid('parent_version_id'),
        createdAt: timestamptz('created_at').defaultNow().notNull(),
    },
    (t) => [
        index('idx_screen_versions_screen_id').on(t.screenId),
        index('idx_screen_versions_is_current').on(t.isCurrent),
        index('idx_screen_versions_created_at').on(t.createdAt),
        index('idx_screen_versions_parent_id').on(t.parentVersionId),
    ],
);

// =====================
// SUBSCRIPTIONS (with Polar integration)
// =====================
export const subscriptions = pgTable(
    'subscriptions',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .references(() => authUser.id, { onDelete: 'cascade' })
            .notNull(),
        planName: text('plan_name').notNull(),
        status: text('status').notNull(),
        currentPeriodStart: timestamptz('current_period_start'),
        currentPeriodEnd: timestamptz('current_period_end'),
        polarSubscriptionId: text('polar_subscription_id').unique(),
        polarCustomerId: text('polar_customer_id'),
        ...timestamps,
    },
    (t) => [
        index('idx_subscriptions_user_id').on(t.userId),
        index('idx_subscriptions_status').on(t.status),
        index('idx_subscriptions_polar_customer_id').on(t.polarCustomerId),
        uniqueIndex('idx_subscriptions_polar_subscription_id').on(t.polarSubscriptionId),
    ],
);

// =====================
// POLAR CONFIG
// =====================
export const polarConfig = pgTable('polar_config', {
    id: uuid('id').primaryKey().defaultRandom(),
    meterName: text('meter_name').notNull(),
    meterId: text('meter_id'),
    creditsPerSubscription: jsonb('credits_per_subscription')
        .$type<{ standard: number; pro: number }>()
        .default({ standard: 200, pro: 500 }),
    creditCostPerGeneration: integer('credit_cost_per_generation').default(1),
    ...timestamps,
});

// =====================
// TYPE INFERENCE
// =====================
export type AuthUser = typeof authUser.$inferSelect;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Screen = typeof screens.$inferSelect;
export type NewScreen = typeof screens.$inferInsert;

export type HtmlContent = typeof htmlContents.$inferSelect;
export type NewHtmlContent = typeof htmlContents.$inferInsert;

export type ScreenVersion = typeof screenVersions.$inferSelect;
export type NewScreenVersion = typeof screenVersions.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type PolarConfig = typeof polarConfig.$inferSelect;
