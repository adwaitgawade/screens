import { relations } from "drizzle-orm/relations";
import { organizationInNeonAuth, invitationInNeonAuth, userInNeonAuth, sessionInNeonAuth, accountInNeonAuth, memberInNeonAuth, screens, screenVersions, htmlContents, projects, user, subscriptions } from "./schema";

export const invitationInNeonAuthRelations = relations(invitationInNeonAuth, ({one}) => ({
	organizationInNeonAuth: one(organizationInNeonAuth, {
		fields: [invitationInNeonAuth.organizationId],
		references: [organizationInNeonAuth.id]
	}),
	userInNeonAuth: one(userInNeonAuth, {
		fields: [invitationInNeonAuth.inviterId],
		references: [userInNeonAuth.id]
	}),
}));

export const organizationInNeonAuthRelations = relations(organizationInNeonAuth, ({many}) => ({
	invitationInNeonAuths: many(invitationInNeonAuth),
	memberInNeonAuths: many(memberInNeonAuth),
}));

export const userInNeonAuthRelations = relations(userInNeonAuth, ({many}) => ({
	invitationInNeonAuths: many(invitationInNeonAuth),
	sessionInNeonAuths: many(sessionInNeonAuth),
	accountInNeonAuths: many(accountInNeonAuth),
	memberInNeonAuths: many(memberInNeonAuth),
	screenVersions: many(screenVersions),
	projects: many(projects),
}));

export const sessionInNeonAuthRelations = relations(sessionInNeonAuth, ({one}) => ({
	userInNeonAuth: one(userInNeonAuth, {
		fields: [sessionInNeonAuth.userId],
		references: [userInNeonAuth.id]
	}),
}));

export const accountInNeonAuthRelations = relations(accountInNeonAuth, ({one}) => ({
	userInNeonAuth: one(userInNeonAuth, {
		fields: [accountInNeonAuth.userId],
		references: [userInNeonAuth.id]
	}),
}));

export const memberInNeonAuthRelations = relations(memberInNeonAuth, ({one}) => ({
	organizationInNeonAuth: one(organizationInNeonAuth, {
		fields: [memberInNeonAuth.organizationId],
		references: [organizationInNeonAuth.id]
	}),
	userInNeonAuth: one(userInNeonAuth, {
		fields: [memberInNeonAuth.userId],
		references: [userInNeonAuth.id]
	}),
}));

export const screenVersionsRelations = relations(screenVersions, ({one}) => ({
	screen: one(screens, {
		fields: [screenVersions.screenId],
		references: [screens.id]
	}),
	htmlContent: one(htmlContents, {
		fields: [screenVersions.htmlContentId],
		references: [htmlContents.id]
	}),
	userInNeonAuth: one(userInNeonAuth, {
		fields: [screenVersions.createdBy],
		references: [userInNeonAuth.id]
	}),
}));

export const screensRelations = relations(screens, ({one, many}) => ({
	screenVersions: many(screenVersions),
	project: one(projects, {
		fields: [screens.projectId],
		references: [projects.id]
	}),
}));

export const htmlContentsRelations = relations(htmlContents, ({many}) => ({
	screenVersions: many(screenVersions),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	screens: many(screens),
	userInNeonAuth: one(userInNeonAuth, {
		fields: [projects.userId],
		references: [userInNeonAuth.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(user, {
		fields: [subscriptions.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	subscriptions: many(subscriptions),
}));