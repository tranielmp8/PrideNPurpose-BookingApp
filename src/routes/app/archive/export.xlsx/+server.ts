import { format } from 'node:util';
import { error, type RequestHandler } from '@sveltejs/kit';
import { utils, write } from 'xlsx';
import { getBookingsForWorkspace, shouldArchiveBooking } from '$lib/server/bookings';
import {
	ARCHIVE_AFTER_DAYS,
	filterArchivedBookingsByStatus,
	getArchiveExportFileName,
	getArchiveExportRows,
	getArchiveExportStatus,
	getWorksheetColumnWidths
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

	const workbook = utils.book_new();
	const worksheet = utils.json_to_sheet(rows);
	worksheet['!cols'] = getWorksheetColumnWidths(rows);
	worksheet['!autofilter'] = {
		ref: rows.length > 0 ? `A1:N${rows.length + 1}` : 'A1:N1'
	};
	utils.book_append_sheet(workbook, worksheet, 'Archive');

	const buffer = write(workbook, {
		bookType: 'xlsx',
		type: 'buffer'
	}) as Buffer;
	const bytes = new Uint8Array(buffer);
	const fileName = getArchiveExportFileName(workspace.slug, status, 'xlsx');

	return new Response(bytes, {
		headers: {
			'content-type':
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'content-disposition': format('attachment; filename="%s"', fileName),
			'cache-control': 'no-store'
		}
	});
};
