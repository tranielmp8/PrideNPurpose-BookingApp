import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173';
const shouldStartLocalPreview = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 30_000,
	expect: {
		timeout: 5_000
	},
	use: {
		baseURL,
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	],
	webServer: shouldStartLocalPreview
		? {
				command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
				port: 4173,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000
			}
		: undefined
});
