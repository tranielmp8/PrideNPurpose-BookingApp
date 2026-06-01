import { error, type RequestHandler } from '@sveltejs/kit';
import { exchangeGoogleAuthCodeForTokens } from '$lib/server/google-calendar';

function html(content: string, status = 200) {
	return new Response(content, {
		status,
		headers: {
			'Content-Type': 'text/html; charset=utf-8'
		}
	});
}

export const GET: RequestHandler = async ({ cookies, url }) => {
	const oauthError = url.searchParams.get('error');
	if (oauthError) {
		throw error(400, `Google OAuth failed: ${oauthError}`);
	}

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expectedState = cookies.get('google_oauth_state');
	cookies.delete('google_oauth_state', { path: '/' });

	if (!code || !state || !expectedState || state !== expectedState) {
		throw error(400, 'Google OAuth callback state was invalid.');
	}

	const tokens = await exchangeGoogleAuthCodeForTokens(code);
	const refreshToken = tokens.refresh_token;

	if (!refreshToken) {
		return html(
			`<!doctype html>
			<html lang="en">
				<head><title>Google OAuth</title></head>
				<body style="font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem;">
					<h1>No refresh token returned</h1>
					<p>Google did not return a refresh token. Visit <code>/oauth/google</code> again; this app requests <code>prompt=consent</code> and <code>access_type=offline</code>.</p>
				</body>
			</html>`,
			400
		);
	}

	return html(`<!doctype html>
	<html lang="en">
		<head><title>Google OAuth</title></head>
		<body style="font-family: system-ui, sans-serif; line-height: 1.5; padding: 2rem;">
			<h1>Google refresh token created</h1>
			<p>Add this to your <code>.env</code> file:</p>
			<pre style="background: #f5f5f5; border: 1px solid #ddd; padding: 1rem; white-space: pre-wrap;">GOOGLE_REFRESH_TOKEN="${refreshToken}"</pre>
			<p>Use <code>GOOGLE_CALENDAR_ID="primary"</code> for your primary calendar.</p>
		</body>
	</html>`);
};
