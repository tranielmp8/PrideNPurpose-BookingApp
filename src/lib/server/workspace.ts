import { and, eq } from 'drizzle-orm';
import { DEFAULT_WORKSPACE_TIMEZONE } from '$lib/constants';
import { db } from '$lib/server/db';
import { workspace } from '$lib/server/db/schema';
import { slugify } from '$lib/server/slug';

export async function getWorkspaceForUser(userId: string) {
	return db.query.workspace.findFirst({
		where: eq(workspace.ownerUserId, userId)
	});
}

export async function getWorkspaceBySlug(slug: string) {
	return db.query.workspace.findFirst({
		where: and(eq(workspace.slug, slug), eq(workspace.isActive, true))
	});
}

export async function getWorkspaceById(workspaceId: string) {
	return db.query.workspace.findFirst({
		where: eq(workspace.id, workspaceId)
	});
}

export async function getFirstActiveWorkspace() {
	return db.query.workspace.findFirst({
		where: eq(workspace.isActive, true)
	});
}

export async function createWorkspaceForUser(input: {
	userId: string;
	name: string;
	slug: string;
	timezone: string;
	contactEmail?: string | null;
}) {
	const [createdWorkspace] = await db
		.insert(workspace)
		.values({
			ownerUserId: input.userId,
			name: input.name,
			slug: input.slug,
			timezone: input.timezone,
			contactEmail: input.contactEmail ?? null
		})
		.returning();

	return createdWorkspace;
}

export async function updateWorkspaceSettings(
	workspaceId: string,
	input: {
		name: string;
		slug: string;
		timezone: string;
		description: string | null;
		locationLabel: string | null;
		contactEmail: string | null;
		defaultConfirmationMessage: string | null;
		zohoDataCenter: string | null;
		zohoZsoid: string | null;
		zohoPresenterUserId: string | null;
		zohoXZsource: string | null;
		zohoDefaultMeetingTopic: string | null;
		zohoDefaultAgenda: string | null;
		zohoAddAttendeeEmails: boolean;
		zohoAutoCreateMeetings: boolean;
	}
) {
	const [updatedWorkspace] = await db
		.update(workspace)
		.set({
			name: input.name,
			slug: input.slug,
			timezone: input.timezone,
			description: input.description,
			locationLabel: input.locationLabel,
			contactEmail: input.contactEmail,
			defaultConfirmationMessage: input.defaultConfirmationMessage,
			zohoDataCenter: input.zohoDataCenter,
			zohoZsoid: input.zohoZsoid,
			zohoPresenterUserId: input.zohoPresenterUserId,
			zohoXZsource: input.zohoXZsource,
			zohoDefaultMeetingTopic: input.zohoDefaultMeetingTopic,
			zohoDefaultAgenda: input.zohoDefaultAgenda,
			zohoAddAttendeeEmails: input.zohoAddAttendeeEmails,
			zohoAutoCreateMeetings: input.zohoAutoCreateMeetings,
			updatedAt: new Date()
		})
		.where(eq(workspace.id, workspaceId))
		.returning();

	return updatedWorkspace;
}

export async function slugExists(slug: string) {
	const existingWorkspace = await db.query.workspace.findFirst({
		where: eq(workspace.slug, slug),
		columns: { id: true }
	});

	return Boolean(existingWorkspace);
}

export async function generateWorkspaceSlug(source: string) {
	const baseSlug = slugify(source) || 'my-booking-page';
	let attempt = baseSlug;
	let suffix = 2;

	while (await slugExists(attempt)) {
		attempt = `${baseSlug}-${suffix}`;
		suffix += 1;
	}

	return attempt;
}
