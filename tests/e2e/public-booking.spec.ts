import { expect, test } from '@playwright/test';

const publicSlug = process.env.PLAYWRIGHT_PUBLIC_SLUG;

test('landing page exposes the public booking entry point', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: /book meaningful conversations/i })).toBeVisible();
	await expect(
		page.getByText(/public booking page appears after onboarding|book with pride n purpose/i)
	).toBeVisible();
});

test('public booking page renders the core booking form', async ({ page }) => {
	test.skip(
		!process.env.PLAYWRIGHT_BASE_URL || !publicSlug,
		'This smoke test requires PLAYWRIGHT_BASE_URL and PLAYWRIGHT_PUBLIC_SLUG to target a real public booking page.'
	);

	await page.goto(`/book/${publicSlug}`);

	await expect(page.getByRole('heading', { name: /book your next conversation with intention/i })).toBeVisible();
	await expect(page.getByRole('heading', { name: /reserve a session/i })).toBeVisible();
	await expect(page.getByText(/choose a service/i)).toBeVisible();
	await expect(page.getByLabel(/direct date pick/i)).toBeVisible();
	await expect(page.getByLabel(/select your time/i)).toBeVisible();
	await expect(page.getByLabel(/your name/i)).toBeVisible();
	await expect(page.getByLabel(/^email$/i)).toBeVisible();
	await expect(page.getByRole('button', { name: /confirm booking/i })).toBeVisible();
});
