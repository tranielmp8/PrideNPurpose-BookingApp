import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const sql = postgres(databaseUrl, { max: 1 });

const ids = {
	user: 'local-provider-user',
	workspace: '11111111-1111-4111-8111-111111111111',
	strategy: '22222222-2222-4222-8222-222222222222',
	coaching: '33333333-3333-4333-8333-333333333333',
	customer: '44444444-4444-4444-8444-444444444444'
};

async function seed() {
	await sql.begin(async (tx) => {
		await tx`
			INSERT INTO "user" (id, name, email, email_verified)
			VALUES (${ids.user}, 'Local Provider', 'provider@example.com', true)
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				email = EXCLUDED.email,
				email_verified = EXCLUDED.email_verified,
				updated_at = now()
		`;

		await tx`
			INSERT INTO workspace (
				id,
				owner_user_id,
				name,
				slug,
				timezone,
				description,
				location_label,
				contact_email,
				default_confirmation_message,
				min_notice_minutes,
				customer_change_cutoff_minutes,
				booking_window_days,
				max_bookings_per_day,
				is_active
			)
			VALUES (
				${ids.workspace},
				${ids.user},
				'Pride N Purpose',
				'pride-purpose',
				'America/Chicago',
				'Development workspace for local booking flows.',
				'Online',
				'provider@example.com',
				'Thank you for booking {service_name} with {workspace_name}. Your session is scheduled for {start_date} at {start_time}.',
				60,
				120,
				45,
				6,
				true
			)
			ON CONFLICT (id) DO UPDATE SET
				owner_user_id = EXCLUDED.owner_user_id,
				name = EXCLUDED.name,
				slug = EXCLUDED.slug,
				timezone = EXCLUDED.timezone,
				description = EXCLUDED.description,
				location_label = EXCLUDED.location_label,
				contact_email = EXCLUDED.contact_email,
				default_confirmation_message = EXCLUDED.default_confirmation_message,
				min_notice_minutes = EXCLUDED.min_notice_minutes,
				customer_change_cutoff_minutes = EXCLUDED.customer_change_cutoff_minutes,
				booking_window_days = EXCLUDED.booking_window_days,
				max_bookings_per_day = EXCLUDED.max_bookings_per_day,
				is_active = EXCLUDED.is_active,
				updated_at = now()
		`;

		await tx`
			INSERT INTO service (
				id,
				workspace_id,
				name,
				slug,
				description,
				duration_minutes,
				price_cents,
				currency_code,
				buffer_before_minutes,
				buffer_after_minutes,
				is_intro_offer,
				allow_guest_booking,
				requires_customer_account,
				max_bookings_per_customer,
				is_active
			)
			VALUES
				(
					${ids.strategy},
					${ids.workspace},
					'Strategy Call',
					'strategy-call',
					'A focused session for goals, next steps, and planning.',
					45,
					0,
					'USD',
					0,
					15,
					true,
					true,
					false,
					null,
					true
				),
				(
					${ids.coaching},
					${ids.workspace},
					'Coaching Session',
					'coaching-session',
					'A longer working session for active client support.',
					60,
					12500,
					'USD',
					15,
					15,
					false,
					true,
					false,
					null,
					true
				)
			ON CONFLICT (id) DO UPDATE SET
				workspace_id = EXCLUDED.workspace_id,
				name = EXCLUDED.name,
				slug = EXCLUDED.slug,
				description = EXCLUDED.description,
				duration_minutes = EXCLUDED.duration_minutes,
				price_cents = EXCLUDED.price_cents,
				currency_code = EXCLUDED.currency_code,
				buffer_before_minutes = EXCLUDED.buffer_before_minutes,
				buffer_after_minutes = EXCLUDED.buffer_after_minutes,
				is_intro_offer = EXCLUDED.is_intro_offer,
				allow_guest_booking = EXCLUDED.allow_guest_booking,
				requires_customer_account = EXCLUDED.requires_customer_account,
				max_bookings_per_customer = EXCLUDED.max_bookings_per_customer,
				is_active = EXCLUDED.is_active,
				updated_at = now()
		`;

		await tx`
			DELETE FROM weekly_availability
			WHERE workspace_id = ${ids.workspace}
		`;

		await tx`
			INSERT INTO weekly_availability (workspace_id, day_of_week, start_time, end_time, is_active)
			VALUES
				(${ids.workspace}, 1, '09:00', '12:00', true),
				(${ids.workspace}, 1, '13:00', '16:00', true),
				(${ids.workspace}, 2, '09:00', '12:00', true),
				(${ids.workspace}, 2, '13:00', '16:00', true),
				(${ids.workspace}, 3, '09:00', '12:00', true),
				(${ids.workspace}, 3, '13:00', '16:00', true),
				(${ids.workspace}, 4, '09:00', '12:00', true),
				(${ids.workspace}, 4, '13:00', '16:00', true),
				(${ids.workspace}, 5, '09:00', '12:00', true)
		`;

		await tx`
			INSERT INTO customer (id, workspace_id, name, email)
			VALUES (${ids.customer}, ${ids.workspace}, 'Sample Customer', 'customer@example.com')
			ON CONFLICT (id) DO UPDATE SET
				workspace_id = EXCLUDED.workspace_id,
				name = EXCLUDED.name,
				email = EXCLUDED.email,
				updated_at = now()
		`;
	});
}

try {
	await seed();
	console.log('Seeded local development data.');
	console.log('Public booking page: /book/pride-purpose');
} finally {
	await sql.end();
}
