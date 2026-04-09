import { relations } from "drizzle-orm";
import { pgTable, text, uuid, timestamp, boolean, index, integer, foreignKey } from "drizzle-orm/pg-core";


export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));



export const htmlContents = pgTable("html_contents", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    html: text().notNull(),
    parentHtmlId: uuid("parent_html_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const screenVersions = pgTable("screen_versions", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    screenId: uuid("screen_id").notNull(),
    versionNumber: integer("version_number").notNull(),
    userPrompt: text("user_prompt").notNull(),
    aiPrompt: text("ai_prompt"),
    htmlContentId: uuid("html_content_id").notNull(),
    createdBy: text("created_by"),
    isCurrent: boolean("is_current").default(false),
    parentVersionId: uuid("parent_version_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    index("idx_screen_versions_created_at").using("btree", table.createdAt.asc().nullsLast()),
    index("idx_screen_versions_is_current").using("btree", table.isCurrent.asc().nullsLast()),
    index("idx_screen_versions_parent_id").using("btree", table.parentVersionId.asc().nullsLast()),
    index("idx_screen_versions_screen_id").using("btree", table.screenId.asc().nullsLast()),
    foreignKey({
        columns: [table.screenId],
        foreignColumns: [screens.id],
        name: "screen_versions_screen_id_screens_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.htmlContentId],
        foreignColumns: [htmlContents.id],
        name: "screen_versions_html_content_id_html_contents_id_fk"
    }),
    foreignKey({
        columns: [table.createdBy],
        foreignColumns: [user.id],
        name: "screen_versions_created_by_user_id_fk"
    }),
]);

export const screens = pgTable("screens", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    projectId: uuid("project_id").notNull(),
    name: text().notNull(),
    orderIndex: integer("order_index").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    index("idx_screens_order_index").using("btree", table.orderIndex.asc().nullsLast()),
    index("idx_screens_project_id").using("btree", table.projectId.asc().nullsLast()),
    foreignKey({
        columns: [table.projectId],
        foreignColumns: [projects.id],
        name: "screens_project_id_projects_id_fk"
    }).onDelete("cascade"),
]);

export const projects = pgTable("projects", {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    description: text(),
    prompt: text(),
    isArchived: boolean("is_archived").default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    index("idx_projects_created_at").using("btree", table.createdAt.asc().nullsLast()),
    index("idx_projects_user_id").using("btree", table.userId.asc().nullsLast()),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "projects_user_id_user_id_fk"
    }).onDelete("cascade"),
]);


// =====================
// TYPE INFERENCE
// =====================
export const AuthUserSchema = user;
export type AuthUser = typeof user.$inferSelect;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Screen = typeof screens.$inferSelect;
export type NewScreen = typeof screens.$inferInsert;

export type HtmlContent = typeof htmlContents.$inferSelect;
export type NewHtmlContent = typeof htmlContents.$inferInsert;

export type ScreenVersion = typeof screenVersions.$inferSelect;
export type NewScreenVersion = typeof screenVersions.$inferInsert;