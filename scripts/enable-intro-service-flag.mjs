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
	await sql`
		ALTER TABLE service
		ADD COLUMN IF NOT EXISTS is_intro_offer boolean NOT NULL DEFAULT false
	`;

	console.log('Intro service flag schema is enabled.');
} finally {
	await sql.end();
}
