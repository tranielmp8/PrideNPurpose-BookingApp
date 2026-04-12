<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: import('./$types').ActionData } = $props();

	function getReadinessItems() {
		return [
			{ label: 'Resend API key in env', ready: data.emailStatus.hasResendApiKey },
			{ label: 'EMAIL_FROM in env', ready: data.emailStatus.hasEmailFrom },
			{ label: 'EMAIL_FROM format valid', ready: data.emailStatus.hasValidEmailFrom },
			{ label: 'Client ID in env', ready: data.zohoStatus.hasClientId },
			{ label: 'Client secret in env', ready: data.zohoStatus.hasClientSecret },
			{ label: 'Refresh token in env', ready: data.zohoStatus.hasRefreshToken },
			{ label: 'Data center saved', ready: data.zohoStatus.hasDataCenter },
			{ label: 'zsoid saved', ready: data.zohoStatus.hasZsoid },
			{ label: 'Presenter ID saved', ready: data.zohoStatus.hasPresenterUserId }
		];
	}
</script>

<svelte:head>
	<title>Settings | Pride N Purpose Conversations</title>
</svelte:head>

<section class="space-y-8">
	<div>
		<p class="text-sm uppercase tracking-[0.3em] text-stone-500">Settings</p>
		<h1 class="mt-3 text-4xl font-semibold tracking-tight">Workspace profile and Zoho Meeting setup.</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
			Use this page to control the public booking page and prepare the workspace for automatic
			Zoho Meeting creation.
		</p>
	</div>

	{#if form?.settingsMessage}
		<p class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
			{form.settingsMessage}
		</p>
	{/if}

	<form method="POST" action="?/saveSettings" use:enhance class="space-y-8">
		<section class="rounded-[1.5rem] border border-stone-200 p-6">
			<h2 class="text-xl font-semibold tracking-tight">Workspace profile</h2>
			<div class="mt-6 grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium text-stone-700" for="name">Business name</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="name"
						name="name"
						required
						value={data.workspace.name}
					/>
				</div>
				<div>
					<label class="text-sm font-medium text-stone-700" for="slug">Booking slug</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="slug"
						name="slug"
						required
						value={data.workspace.slug}
					/>
				</div>
				<div>
					<label class="text-sm font-medium text-stone-700" for="timezone">Timezone</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="timezone"
						name="timezone"
						required
						value={data.workspace.timezone}
					/>
				</div>
				<div>
					<label class="text-sm font-medium text-stone-700" for="contactEmail">Contact email</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="contactEmail"
						name="contactEmail"
						type="email"
						value={data.workspace.contactEmail ?? ''}
					/>
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium text-stone-700" for="locationLabel">Location label</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="locationLabel"
						name="locationLabel"
						placeholder="Zoom, Phone call, Chicago office, etc."
						value={data.workspace.locationLabel ?? ''}
					/>
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium text-stone-700" for="description">Public description</label>
					<textarea
						class="mt-2 block min-h-28 w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="description"
						name="description"
						placeholder="Tell customers what this booking page is for."
					>{data.workspace.description ?? ''}</textarea>
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium text-stone-700" for="defaultConfirmationMessage">
						Default confirmation email message
					</label>
					<textarea
						class="mt-2 block min-h-32 w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="defaultConfirmationMessage"
						name="defaultConfirmationMessage"
						placeholder={'Use placeholders like {customer}, {date}, {time}, {duration}, {location}, {meeting_link}.'}
					>{data.workspace.defaultConfirmationMessage ?? ''}</textarea>
				</div>
			</div>
		</section>

		<section class="rounded-[1.5rem] border border-stone-200 p-6">
			<h2 class="text-xl font-semibold tracking-tight">Zoho Meeting connection</h2>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
				This stores the non-secret Zoho Meeting identifiers and defaults we need before wiring in
				meeting creation. OAuth credentials and refresh tokens should stay in server env vars.
			</p>
			<div class="mt-6 grid gap-4 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium text-stone-700" for="zohoDataCenter">Zoho data center</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="zohoDataCenter"
						name="zohoDataCenter"
						placeholder="com, eu, in, com.au"
						value={data.workspace.zohoDataCenter ?? ''}
					/>
				</div>
				<div>
					<label class="text-sm font-medium text-stone-700" for="zohoZsoid">Zoho zsoid</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="zohoZsoid"
						name="zohoZsoid"
						value={data.workspace.zohoZsoid ?? ''}
					/>
				</div>
				<div>
					<label class="text-sm font-medium text-stone-700" for="zohoPresenterUserId">Presenter user ID</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="zohoPresenterUserId"
						name="zohoPresenterUserId"
						value={data.workspace.zohoPresenterUserId ?? ''}
					/>
				</div>
				<div>
					<label class="text-sm font-medium text-stone-700" for="zohoXZsource">X-ZSOURCE</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="zohoXZsource"
						name="zohoXZsource"
						value={data.workspace.zohoXZsource ?? ''}
					/>
				</div>
			</div>

			<div class="mt-6 grid gap-3 md:grid-cols-2">
				{#each getReadinessItems() as item}
					<div class="rounded-2xl border border-stone-200 px-4 py-3 text-sm">
						<p class="text-stone-500">{item.label}</p>
						<p class={`mt-1 font-medium ${item.ready ? 'text-emerald-700' : 'text-amber-700'}`}>
							{item.ready ? 'Ready' : 'Missing'}
						</p>
					</div>
				{/each}
			</div>

			<div class="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
				<p class="font-medium text-stone-900">Custom confirmation email sender</p>
				<p class="mt-1 break-all">{data.emailStatus.emailFrom || 'Not set'}</p>
				<p class="mt-2 text-stone-600">
					Use the format Business Name &lt;name@yourdomain.com&gt;. The domain also needs to be
					verified in Resend.
				</p>
			</div>

			<div class="mt-6 flex flex-wrap items-center gap-3">
				<button
					class="rounded-full border border-stone-300 px-4 py-2 text-sm transition hover:bg-stone-100"
					formaction="?/testZohoAuth"
					formmethod="POST"
					type="submit"
				>
					Test Zoho OAuth
				</button>

				{#if form?.zohoTestResult}
					<p class="text-sm text-stone-600">
						OAuth works. API domain: {form.zohoTestResult.apiDomain}. Access token TTL:
						{form.zohoTestResult.expiresIn ?? 'unknown'} seconds.
					</p>
				{/if}
			</div>

			<div class="mt-3 flex flex-wrap items-center gap-3">
				<button
					class="rounded-full border border-stone-300 px-4 py-2 text-sm transition hover:bg-stone-100"
					formaction="?/testZohoMeeting"
					formmethod="POST"
					type="submit"
				>
					Test Zoho Meeting Create
				</button>

				{#if form?.zohoMeetingResult}
					<p class="text-sm text-stone-600">
						Meeting created. Key: {form.zohoMeetingResult.meetingKey ?? 'unknown'}.
					</p>
				{/if}
			</div>

			{#if form?.zohoMeetingResult?.joinLink}
				<div class="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
					<p>Join link: {form.zohoMeetingResult.joinLink}</p>
					{#if form.zohoMeetingResult.startLink}
						<p class="mt-1">Start link: {form.zohoMeetingResult.startLink}</p>
					{/if}
				</div>
			{/if}
		</section>

		<section class="rounded-[1.5rem] border border-stone-200 p-6">
			<h2 class="text-xl font-semibold tracking-tight">Meeting defaults</h2>
			<div class="mt-6 space-y-4">
				<div>
					<label class="text-sm font-medium text-stone-700" for="zohoDefaultMeetingTopic">Default meeting title</label>
					<input
						class="mt-2 block w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="zohoDefaultMeetingTopic"
						name="zohoDefaultMeetingTopic"
						placeholder={'Discuss Plans - {customer_name}'}
						value={data.workspace.zohoDefaultMeetingTopic ?? ''}
					/>
				</div>

				<div>
					<label class="text-sm font-medium text-stone-700" for="zohoDefaultAgenda">Default agenda</label>
					<textarea
						class="mt-2 block min-h-32 w-full rounded-2xl border-stone-300 bg-white px-4 py-3 text-sm"
						id="zohoDefaultAgenda"
						name="zohoDefaultAgenda"
						placeholder="Add the default context that should go into each Zoho Meeting."
					>{data.workspace.zohoDefaultAgenda ?? ''}</textarea>
				</div>

				<label class="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700">
					<input
						checked={data.workspace.zohoAddAttendeeEmails}
						class="rounded border-stone-300"
						name="zohoAddAttendeeEmails"
						type="checkbox"
					/>
					Add attendee emails to the Zoho meeting when possible.
				</label>

				<label class="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700">
					<input
						checked={data.workspace.zohoAutoCreateMeetings}
						class="rounded border-stone-300"
						name="zohoAutoCreateMeetings"
						type="checkbox"
					/>
					Automatically create a Zoho Meeting as soon as a booking is confirmed.
				</label>
			</div>
		</section>

		<div class="flex justify-end">
			<button
				class="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
				type="submit"
			>
				Save settings
			</button>
		</div>
	</form>
</section>
