import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

function loadDatabaseUrl() {
	if (process.env.DATABASE_URL) {
		return process.env.DATABASE_URL;
	}

	const envPath = path.resolve(process.cwd(), '.env');
	if (!fs.existsSync(envPath)) {
		throw new Error('DATABASE_URL is not set and no .env file was found.');
	}

	const envText = fs.readFileSync(envPath, 'utf8');
	for (const rawLine of envText.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) {
			continue;
		}

		const separatorIndex = line.indexOf('=');
		if (separatorIndex === -1) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		if (key !== 'DATABASE_URL') {
			continue;
		}

		let value = line.slice(separatorIndex + 1).trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		if (value) {
			return value;
		}
	}

	throw new Error('DATABASE_URL is not set.');
}

function createManageToken() {
	return crypto.randomBytes(24).toString('base64url');
}

const sql = postgres(loadDatabaseUrl());

try {
	await sql.begin(async (tx) => {
		await tx`
			ALTER TABLE workspace
			ADD COLUMN IF NOT EXISTS customer_change_cutoff_minutes integer DEFAULT 120 NOT NULL
		`;

		await tx`
			ALTER TABLE booking
			ADD COLUMN IF NOT EXISTS manage_token text
		`;

		const bookings = await tx`
			SELECT id
			FROM booking
			WHERE manage_token IS NULL OR manage_token = ''
		`;

		for (const booking of bookings) {
			await tx`
				UPDATE booking
				SET manage_token = ${createManageToken()}
				WHERE id = ${booking.id}
			`;
		}

		await tx`
			ALTER TABLE booking
			ALTER COLUMN manage_token SET NOT NULL
		`;

		await tx`
			CREATE UNIQUE INDEX IF NOT EXISTS booking_manage_token_unique_idx
			ON booking (manage_token)
		`;
	});

	console.log('Customer booking management schema is enabled.');
} finally {
	await sql.end();
}
