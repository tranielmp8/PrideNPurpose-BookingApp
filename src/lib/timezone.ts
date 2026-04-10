type ZonedParts = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
	weekday: number;
};

const weekdayMap: Record<string, number> = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6
};

function getFormatter(timeZone: string) {
	return new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hourCycle: 'h23',
		weekday: 'short'
	});
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
	const parts = getFormatter(timeZone).formatToParts(date);
	const lookup = Object.fromEntries(
		parts
			.filter((part) => part.type !== 'literal')
			.map((part) => [part.type, part.value])
	);

	return {
		year: Number(lookup.year),
		month: Number(lookup.month),
		day: Number(lookup.day),
		hour: Number(lookup.hour),
		minute: Number(lookup.minute),
		second: Number(lookup.second),
		weekday: weekdayMap[lookup.weekday] ?? 0
	};
}

export function getDateKeyInTimeZone(date: Date, timeZone: string) {
	const parts = getZonedParts(date, timeZone);
	return `${parts.year.toString().padStart(4, '0')}-${parts.month
		.toString()
		.padStart(2, '0')}-${parts.day.toString().padStart(2, '0')}`;
}

export function addDaysToDateKey(dateKey: string, days: number) {
	const base = new Date(`${dateKey}T00:00:00.000Z`);
	base.setUTCDate(base.getUTCDate() + days);
	return `${base.getUTCFullYear().toString().padStart(4, '0')}-${(base.getUTCMonth() + 1)
		.toString()
		.padStart(2, '0')}-${base.getUTCDate().toString().padStart(2, '0')}`;
}

export function zonedDateTimeToUtc(dateKey: string, time: string, timeZone: string) {
	const [year, month, day] = dateKey.split('-').map(Number);
	const [hour, minute] = time.split(':').map(Number);
	const desiredEpoch = Date.UTC(year, month - 1, day, hour, minute, 0);

	let guess = new Date(desiredEpoch);

	for (let iteration = 0; iteration < 4; iteration += 1) {
		const parts = getZonedParts(guess, timeZone);
		const actualEpoch = Date.UTC(
			parts.year,
			parts.month - 1,
			parts.day,
			parts.hour,
			parts.minute,
			parts.second
		);
		const diff = desiredEpoch - actualEpoch;

		if (diff === 0) {
			return guess;
		}

		guess = new Date(guess.getTime() + diff);
	}

	return guess;
}

export function formatTimeInTimeZone(date: Date, timeZone: string) {
	return new Intl.DateTimeFormat('en-US', {
		timeZone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	}).format(date);
}
