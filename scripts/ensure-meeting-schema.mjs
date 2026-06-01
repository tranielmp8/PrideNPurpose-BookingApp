import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const sql = postgres(databaseUrl, { max: 1 });

async function columnExists(tableName, columnName) {
	const [row] = await sql`
		select exists (
			select 1
			from information_schema.columns
			where table_schema = 'public'
				and table_name = ${tableName}
				and column_name = ${columnName}
		) as exists
	`;
	return Boolean(row?.exists);
}

async function renameColumnIfNeeded(tableName, oldColumnName, newColumnName) {
	const hasOldColumn = await columnExists(tableName, oldColumnName);
	const hasNewColumn = await columnExists(tableName, newColumnName);

	if (hasOldColumn && !hasNewColumn) {
		await sql.unsafe(
			`alter table "${tableName}" rename column "${oldColumnName}" to "${newColumnName}"`
		);
		console.log(`Renamed ${tableName}.${oldColumnName} to ${newColumnName}`);
	}
}

async function addColumnIfMissing(tableName, columnName, definition) {
	if (!(await columnExists(tableName, columnName))) {
		await sql.unsafe(`alter table "${tableName}" add column "${columnName}" ${definition}`);
		console.log(`Added ${tableName}.${columnName}`);
	}
}

try {
	await renameColumnIfNeeded('workspace', 'zoho_presenter_user_id', 'meeting_host_user_id');
	await renameColumnIfNeeded('workspace', 'zoho_default_meeting_topic', 'meeting_default_topic');
	await renameColumnIfNeeded('workspace', 'zoho_default_agenda', 'meeting_default_agenda');
	await renameColumnIfNeeded(
		'workspace',
		'zoho_add_attendee_emails',
		'meeting_add_attendee_emails'
	);
	await renameColumnIfNeeded('workspace', 'zoho_auto_create_meetings', 'meeting_auto_create');

	await addColumnIfMissing('workspace', 'meeting_host_user_id', 'text');
	await addColumnIfMissing('workspace', 'meeting_default_topic', 'text');
	await addColumnIfMissing('workspace', 'meeting_default_agenda', 'text');
	await addColumnIfMissing(
		'workspace',
		'meeting_add_attendee_emails',
		'boolean not null default true'
	);
	await addColumnIfMissing('workspace', 'meeting_auto_create', 'boolean not null default true');

	await renameColumnIfNeeded('booking', 'zoho_meeting_key', 'meeting_external_id');
	await renameColumnIfNeeded('booking', 'zoho_join_link', 'meeting_join_link');
	await renameColumnIfNeeded('booking', 'zoho_start_link', 'meeting_start_link');
	await renameColumnIfNeeded('booking', 'zoho_meeting_payload', 'meeting_payload');

	await addColumnIfMissing('booking', 'meeting_provider', 'text');
	await addColumnIfMissing('booking', 'meeting_external_id', 'text');
	await addColumnIfMissing('booking', 'meeting_join_link', 'text');
	await addColumnIfMissing('booking', 'meeting_start_link', 'text');
	await addColumnIfMissing('booking', 'meeting_payload', 'text');

	console.log('Meeting schema is ready.');
} finally {
	await sql.end();
}
