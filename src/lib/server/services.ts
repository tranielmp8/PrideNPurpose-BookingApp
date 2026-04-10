import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { service } from '$lib/server/db/schema';
import { slugify } from '$lib/server/slug';

export function normalizeServiceSlug(value: string) {
	return slugify(value) || 'service';
}

export async function getServicesForWorkspace(workspaceId: string) {
	return db.query.service.findMany({
		where: eq(service.workspaceId, workspaceId),
		orderBy: (service, { asc }) => [asc(service.name)]
	});
}

export async function serviceSlugExists(workspaceId: string, slug: string, excludeId?: string) {
	const existingService = await db.query.service.findFirst({
		where: and(eq(service.workspaceId, workspaceId), eq(service.slug, slug)),
		columns: { id: true }
	});

	if (!existingService) {
		return false;
	}

	return existingService.id !== excludeId;
}

export async function generateServiceSlug(workspaceId: string, source: string, excludeId?: string) {
	const baseSlug = normalizeServiceSlug(source);
	let attempt = baseSlug;
	let suffix = 2;

	while (await serviceSlugExists(workspaceId, attempt, excludeId)) {
		attempt = `${baseSlug}-${suffix}`;
		suffix += 1;
	}

	return attempt;
}
