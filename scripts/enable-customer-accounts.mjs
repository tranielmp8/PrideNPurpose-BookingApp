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

const sql = postgres(loadDatabaseUrl());

try {
	await sql.begin(async (tx) => {
		await tx`
			CREATE TABLE IF NOT EXISTS customer_account (
				id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				workspace_id uuid NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
				user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
				name text NOT NULL,
				email text NOT NULL,
				is_active boolean NOT NULL DEFAULT true,
				created_at timestamptz NOT NULL DEFAULT now(),
				updated_at timestamptz NOT NULL DEFAULT now()
			)
		`;

		await tx`
			ALTER TABLE booking
			ADD COLUMN IF NOT EXISTS customer_account_id uuid REFERENCES customer_account(id) ON DELETE SET NULL
		`;

		await tx`
			CREATE INDEX IF NOT EXISTS customer_account_workspace_idx ON customer_account (workspace_id)
		`;

		await tx`
			CREATE INDEX IF NOT EXISTS customer_account_user_idx ON customer_account (user_id)
		`;

		await tx`
			CREATE UNIQUE INDEX IF NOT EXISTS customer_account_workspace_email_unique_idx
			ON customer_account (workspace_id, email)
		`;

		await tx`
			CREATE UNIQUE INDEX IF NOT EXISTS customer_account_user_unique_idx
			ON customer_account (user_id)
		`;

		await tx`
			CREATE INDEX IF NOT EXISTS booking_customer_account_idx ON booking (customer_account_id)
		`;
	});

	console.log('Customer account schema is enabled.');
} finally {
	await sql.end();
}
