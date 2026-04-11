import { format } from 'node:util';
import { error, type RequestHandler } from '@sveltejs/kit';
import { utils } from 'xlsx';
import { getBookingsForWorkspace, shouldArchiveBooking } from '$lib/server/bookings';
import {
	ARCHIVE_AFTER_DAYS,
	filterArchivedBookingsByStatus,
	getArchiveExportFileName,
	getArchiveExportRows,
	getArchiveExportStatus
} from '$lib/server/archive-export';
import { getWorkspaceForUser } from '$lib/server/workspace';

export const GET: RequestHandler = async ({ locals, url }) => {
	const workspace = locals.user ? await getWorkspaceForUser(locals.user.id) : null;
	if (!workspace) {
		throw error(401, 'Workspace not found.');
	}

	const status = getArchiveExportStatus(url.searchParams.get('status'));
	const bookings = await getBookingsForWorkspace(workspace.id);
	const now = new Date();
	const archivedBookings = bookings.filter((booking) =>
		shouldArchiveBooking(booking, now, ARCHIVE_AFTER_DAYS)
	);
	const filteredBookings = filterArchivedBookingsByStatus(archivedBookings, status);
	const rows = getArchiveExportRows(filteredBookings, workspace.timezone);
	const worksheet = utils.json_to_sheet(rows);
	const csv = utils.sheet_to_csv(worksheet);
	const fileName = getArchiveExportFileName(workspace.slug, status, 'csv');

	return new Response(csv, {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': format('attachment; filename="%s"', fileName),
			'cache-control': 'no-store'
		}
	});
};
