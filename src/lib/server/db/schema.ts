import {
	boolean,
	date,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const bookingStatusEnum = pgEnum('booking_status', [
	'scheduled',
	'cancelled',
	'completed'
]);

export const workspace = pgTable(
	'workspace',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		ownerUserId: text('owner_user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		timezone: text('timezone').notNull(),
		description: text('description'),
		locationLabel: text('location_label'),
		contactEmail: text('contact_email'),
		defaultConfirmationMessage: text('default_confirmation_message'),
		zohoDataCenter: text('zoho_data_center'),
		zohoZsoid: text('zoho_zsoid'),
		zohoPresenterUserId: text('zoho_presenter_user_id'),
		zohoXZsource: text('zoho_x_zsource'),
		zohoDefaultMeetingTopic: text('zoho_default_meeting_topic'),
		zohoDefaultAgenda: text('zoho_default_agenda'),
		zohoAddAttendeeEmails: boolean('zoho_add_attendee_emails').notNull().default(true),
		zohoAutoCreateMeetings: boolean('zoho_auto_create_meetings').notNull().default(true),
		minNoticeMinutes: integer('min_notice_minutes').notNull().default(120),
		customerChangeCutoffMinutes: integer('customer_change_cutoff_minutes').notNull().default(120),
		bookingWindowDays: integer('booking_window_days').notNull().default(60),
		maxBookingsPerDay: integer('max_bookings_per_day'),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		uniqueIndex('workspace_slug_unique_idx').on(table.slug),
		index('workspace_owner_user_idx').on(table.ownerUserId)
	]
);

export const service = pgTable(
	'service',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspace.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		description: text('description'),
		confirmationMessage: text('confirmation_message'),
		durationMinutes: integer('duration_minutes').notNull(),
		priceCents: integer('price_cents'),
		currencyCode: text('currency_code').notNull().default('USD'),
		bufferBeforeMinutes: integer('buffer_before_minutes').notNull().default(0),
		bufferAfterMinutes: integer('buffer_after_minutes').notNull().default(0),
		isIntroOffer: boolean('is_intro_offer').notNull().default(false),
		allowGuestBooking: boolean('allow_guest_booking').notNull().default(true),
		requiresCustomerAccount: boolean('requires_customer_account').notNull().default(false),
		maxBookingsPerCustomer: integer('max_bookings_per_customer'),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('service_workspace_idx').on(table.workspaceId),
		uniqueIndex('service_workspace_slug_unique_idx').on(table.workspaceId, table.slug)
	]
);

export const weeklyAvailability = pgTable(
	'weekly_availability',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspace.id, { onDelete: 'cascade' }),
		dayOfWeek: integer('day_of_week').notNull(),
		startTime: text('start_time').notNull(),
		endTime: text('end_time').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [index('weekly_availability_workspace_day_idx').on(table.workspaceId, table.dayOfWeek)]
);

export const availabilityOverride = pgTable(
	'availability_override',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspace.id, { onDelete: 'cascade' }),
		overrideDate: date('override_date', { mode: 'string' }).notNull(),
		isUnavailable: boolean('is_unavailable').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('availability_override_workspace_date_idx').on(table.workspaceId, table.overrideDate),
		uniqueIndex('availability_override_workspace_date_unique_idx').on(
			table.workspaceId,
			table.overrideDate
		)
	]
);

export const availabilityOverrideWindow = pgTable(
	'availability_override_window',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		overrideId: uuid('override_id')
			.notNull()
			.references(() => availabilityOverride.id, { onDelete: 'cascade' }),
		startTime: text('start_time').notNull(),
		endTime: text('end_time').notNull()
	},
	(table) => [index('availability_override_window_override_idx').on(table.overrideId)]
);

export const customer = pgTable(
	'customer',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspace.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		email: text('email').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('customer_workspace_idx').on(table.workspaceId),
		uniqueIndex('customer_workspace_email_unique_idx').on(table.workspaceId, table.email)
	]
);

export const customerAccount = pgTable(
	'customer_account',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspace.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		email: text('email').notNull(),
		isActive: boolean('is_active').notNull().default(true),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('customer_account_workspace_idx').on(table.workspaceId),
		index('customer_account_user_idx').on(table.userId),
		uniqueIndex('customer_account_workspace_email_unique_idx').on(table.workspaceId, table.email),
		uniqueIndex('customer_account_user_unique_idx').on(table.userId)
	]
);

export const booking = pgTable(
	'booking',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		workspaceId: uuid('workspace_id')
			.notNull()
			.references(() => workspace.id, { onDelete: 'cascade' }),
		serviceId: uuid('service_id')
			.notNull()
			.references(() => service.id, { onDelete: 'restrict' }),
		customerId: uuid('customer_id')
			.notNull()
			.references(() => customer.id, { onDelete: 'restrict' }),
		customerAccountId: uuid('customer_account_id').references(() => customerAccount.id, {
			onDelete: 'set null'
		}),
		status: bookingStatusEnum('status').notNull().default('scheduled'),
		startAt: timestamp('start_at', { withTimezone: true }).notNull(),
		endAt: timestamp('end_at', { withTimezone: true }).notNull(),
		customerNameSnapshot: text('customer_name_snapshot').notNull(),
		customerEmailSnapshot: text('customer_email_snapshot').notNull(),
		customerNotes: text('customer_notes'),
		manageToken: text('manage_token').notNull(),
		zohoMeetingKey: text('zoho_meeting_key'),
		zohoJoinLink: text('zoho_join_link'),
		zohoStartLink: text('zoho_start_link'),
		zohoMeetingPayload: text('zoho_meeting_payload'),
		cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
		completedAt: timestamp('completed_at', { withTimezone: true }),
		archivedAt: timestamp('archived_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('booking_workspace_start_idx').on(table.workspaceId, table.startAt),
		index('booking_service_start_idx').on(table.serviceId, table.startAt),
		uniqueIndex('booking_manage_token_unique_idx').on(table.manageToken),
		index('booking_customer_idx').on(table.customerId),
		index('booking_customer_account_idx').on(table.customerAccountId)
	]
);

export * from './auth.schema';
