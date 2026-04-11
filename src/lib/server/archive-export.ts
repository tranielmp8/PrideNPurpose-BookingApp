import type { getBookingsForWorkspace } from '$lib/server/bookings';

export const ARCHIVE_AFTER_DAYS = 30;

export type ArchiveExportStatus = 'all' | 'cancelled' | 'completed';

type ArchivedBooking = Awaited<ReturnType<typeof getBookingsForWorkspace>>[number];

function formatDateTime(value: Date | null, timezone: string) {
	if (!value) {
		return '';
	}

	return new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).format(value);
}

export function getArchiveExportStatus(value: string | null): ArchiveExportStatus {
	if (value === 'cancelled' || value === 'completed') {
		return value;
	}

	return 'all';
}

export function filterArchivedBookingsByStatus(
	bookings: ArchivedBooking[],
	status: ArchiveExportStatus
) {
	if (status === 'all') {
		return bookings;
	}

	return bookings.filter((booking) => booking.status === status);
}

export function getArchiveExportRows(bookings: ArchivedBooking[], timezone: string) {
	return bookings.map((item) => ({
		Status: item.status,
		Service: item.service?.name ?? 'Service removed',
		Customer: item.customerNameSnapshot,
		CustomerEmail: item.customerEmailSnapshot,
		StartAt: formatDateTime(item.startAt, timezone),
		EndAt: formatDateTime(item.endAt, timezone),
		CancelledAt: formatDateTime(item.cancelledAt, timezone),
		CompletedAt: formatDateTime(item.completedAt, timezone),
		ArchivedAt: formatDateTime(item.archivedAt, timezone),
		Timezone: timezone,
		ZohoMeetingKey: item.zohoMeetingKey ?? '',
		HostLink: item.zohoStartLink ?? '',
		JoinLink: item.zohoJoinLink ?? '',
		Notes: item.customerNotes ?? ''
	}));
}

export function getWorksheetColumnWidths(rows: Record<string, string>[]) {
	if (rows.length === 0) {
		return [{ wch: 14 }];
	}

	const headers = Object.keys(rows[0]);

	return headers.map((header) => {
		const contentWidth = rows.reduce((longest, row) => {
			return Math.max(longest, String(row[header] ?? '').length);
		}, header.length);

		return { wch: Math.min(Math.max(contentWidth + 2, 12), 48) };
	});
}

export function slugifyFilePart(value: string) {
	return (
		value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'workspace'
	);
}

export function getArchiveExportFileName(
	workspaceSlug: string,
	status: ArchiveExportStatus,
	extension: 'xlsx' | 'csv'
) {
	const suffix = status === 'all' ? 'all' : status;
	return `${slugifyFilePart(workspaceSlug)}-archive-${suffix}.${extension}`;
}
