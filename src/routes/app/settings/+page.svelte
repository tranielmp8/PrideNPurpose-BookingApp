<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: import('./$types').ActionData } = $props();

	function getReadinessItems() {
		return [
			{ label: 'Resend API key in env', ready: data.emailStatus.hasResendApiKey },
			{ label: 'EMAIL_FROM in env', ready: data.emailStatus.hasEmailFrom },
			{ label: 'EMAIL_FROM format valid', ready: data.emailStatus.hasValidEmailFrom },
			{ label: 'Google client ID in env', ready: data.googleStatus.hasClientId },
			{ label: 'Google client secret in env', ready: data.googleStatus.hasClientSecret },
			{ label: 'Google refresh token in env', ready: data.googleStatus.hasRefreshToken },
			{ label: 'Google calendar ID set', ready: data.googleStatus.hasCalendarId }
		];
	}

	const inputClass = 'mt-2 block w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e85521] focus:border-[#e85521]';
	const inputStyle = 'border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text);';
	const labelStyle = 'color: var(--c-text2)';
</script>

<svelte:head>
	<title>Settings | PNP Connect</title>
</svelte:head>

<section class="space-y-7">
	<div class="border-b pb-6" style="border-color: var(--c-border)">
		<p class="text-xs font-semibold uppercase tracking-[0.22em]" style="color: var(--c-text3)">Settings</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl" style="color: var(--c-text)">
			Workspace profile and meeting setup.
		</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6" style="color: var(--c-text2)">
			Settings are grouped into expandable rows so the page stays condensed while still keeping every field available.
		</p>
	</div>

	{#if form?.settingsMessage}
		<p class="rounded-xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
			{form.settingsMessage}
		</p>
	{/if}

	<form method="POST" action="?/saveSettings" use:enhance class="space-y-4">

		<!-- Workspace profile -->
		<details class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)" open>
			<summary class="grid cursor-pointer list-none gap-3 px-5 py-4 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">Workspace profile</h2>
					<p class="mt-1 text-sm" style="color: var(--c-text2)">
						{data.workspace.name} · /book/{data.workspace.slug} · {data.workspace.timezone}
					</p>
				</div>
				<p class="text-sm font-semibold text-[#e85521]">Edit profile</p>
			</summary>

			<div class="grid gap-4 border-t p-5 md:grid-cols-2" style="border-color: var(--c-border)">
				<div>
					<label class="text-sm font-medium" for="name" style={labelStyle}>Business name</label>
					<input class={inputClass} style={inputStyle} id="name" name="name" required value={data.workspace.name} />
				</div>
				<div>
					<label class="text-sm font-medium" for="slug" style={labelStyle}>Booking slug</label>
					<input class={inputClass} style={inputStyle} id="slug" name="slug" required value={data.workspace.slug} />
				</div>
				<div>
					<label class="text-sm font-medium" for="timezone" style={labelStyle}>Timezone</label>
					<input class={inputClass} style={inputStyle} id="timezone" name="timezone" required value={data.workspace.timezone} />
				</div>
				<div>
					<label class="text-sm font-medium" for="contactEmail" style={labelStyle}>Contact email</label>
					<input class={inputClass} style={inputStyle} id="contactEmail" name="contactEmail" type="email" value={data.workspace.contactEmail ?? ''} />
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium" for="locationLabel" style={labelStyle}>Location label</label>
					<input class={inputClass} style={inputStyle} id="locationLabel" name="locationLabel" placeholder="Zoom, Phone call, Chicago office, etc." value={data.workspace.locationLabel ?? ''} />
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium" for="description" style={labelStyle}>Public description</label>
					<textarea class="{inputClass} min-h-28" style={inputStyle} id="description" name="description" placeholder="Tell customers what this booking page is for.">{data.workspace.description ?? ''}</textarea>
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium" for="defaultConfirmationMessage" style={labelStyle}>Default confirmation email message</label>
					<textarea class="{inputClass} min-h-32" style={inputStyle} id="defaultConfirmationMessage" name="defaultConfirmationMessage" placeholder={'Use placeholders like {customer}, {date}, {time}, {duration}, {location}, {meeting_link}.'}>{data.workspace.defaultConfirmationMessage ?? ''}</textarea>
				</div>
			</div>
		</details>

		<!-- Meeting connection -->
		<details class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
			<summary class="grid cursor-pointer list-none gap-3 px-5 py-4 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">Meeting connection</h2>
					<p class="mt-1 text-sm" style="color: var(--c-text2)">Google Calendar and Meet connection status.</p>
				</div>
				<p class="text-sm font-semibold text-[#e85521]">Open setup</p>
			</summary>

			<div class="space-y-5 border-t p-5" style="border-color: var(--c-border)">
				<div class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
					<div class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] pnp-muted" style="color: var(--c-text3)">
						Readiness
					</div>
					<div class="divide-y" style="border-color: var(--c-border)">
						{#each getReadinessItems() as item}
							<div class="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_8rem] md:items-center">
								<p style="color: var(--c-text2)">{item.label}</p>
								<p class="font-semibold {item.ready ? 'text-emerald-500' : 'text-amber-500'}">
									{item.ready ? 'Ready' : 'Missing'}
								</p>
							</div>
						{/each}
					</div>
				</div>

				<div class="rounded-xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border)">
					<p class="font-semibold" style="color: var(--c-text)">Custom confirmation email sender</p>
					<p class="mt-1 break-all" style="color: var(--c-text2)">{data.emailStatus.emailFrom || 'Not set'}</p>
					<p class="mt-2" style="color: var(--c-text3)">
						Use the format Business Name &lt;name@yourdomain.com&gt;. The domain also needs to be verified in Resend.
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<button class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
						formaction="?/testGoogleAuth" formmethod="POST" type="submit">
						Test Google OAuth
					</button>
					{#if form?.googleTestResult}
						<p class="text-sm" style="color: var(--c-text2)">
							Google OAuth works. Access token TTL: {form.googleTestResult.expiresIn ?? 'unknown'} seconds.
						</p>
					{/if}
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<button class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
						style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
						formaction="?/testGoogleMeeting" formmethod="POST" type="submit">
						Test Google Meet Create
					</button>
					{#if form?.googleMeetingResult}
						<p class="text-sm" style="color: var(--c-text2)">
							Meeting created. Event: {form.googleMeetingResult.eventId ?? 'unknown'}.
						</p>
					{/if}
				</div>

				{#if form?.googleMeetingResult?.joinLink}
					<div class="rounded-xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
						<p class="break-all">Join link: {form.googleMeetingResult.joinLink}</p>
						{#if form.googleMeetingResult.hostLink}
							<p class="mt-1 break-all">Calendar event: {form.googleMeetingResult.hostLink}</p>
						{/if}
					</div>
				{/if}

				<!-- Legacy Zoho -->
				<details class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
					<summary class="grid cursor-pointer list-none gap-3 px-4 py-3 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
						<div>
							<h3 class="text-sm font-semibold" style="color: var(--c-text)">Legacy Zoho fallback</h3>
							<p class="mt-1 text-sm" style="color: var(--c-text2)">
								Only needed if Google Calendar is not configured or you intentionally switch back.
							</p>
						</div>
						<p class="text-sm font-semibold text-[#e85521]">Open legacy setup</p>
					</summary>

					<div class="space-y-5 border-t p-4" style="border-color: var(--c-border)">
						<div class="grid gap-4 md:grid-cols-2">
							<div>
								<label class="text-sm font-medium" for="zohoDataCenterLegacy" style={labelStyle}>Zoho data center</label>
								<input class={inputClass} style={inputStyle} id="zohoDataCenterLegacy" name="zohoDataCenter" placeholder="com, eu, in, com.au" value={data.workspace.zohoDataCenter ?? ''} />
							</div>
							<div>
								<label class="text-sm font-medium" for="zohoZsoidLegacy" style={labelStyle}>Zoho zsoid</label>
								<input class={inputClass} style={inputStyle} id="zohoZsoidLegacy" name="zohoZsoid" value={data.workspace.zohoZsoid ?? ''} />
							</div>
							<div>
								<label class="text-sm font-medium" for="zohoPresenterUserIdLegacy" style={labelStyle}>Presenter user ID</label>
								<input class={inputClass} style={inputStyle} id="zohoPresenterUserIdLegacy" name="zohoPresenterUserId" value={data.workspace.zohoPresenterUserId ?? ''} />
							</div>
							<div>
								<label class="text-sm font-medium" for="zohoXZsourceLegacy" style={labelStyle}>X-ZSOURCE</label>
								<input class={inputClass} style={inputStyle} id="zohoXZsourceLegacy" name="zohoXZsource" value={data.workspace.zohoXZsource ?? ''} />
							</div>
						</div>

						<div class="grid gap-2 text-sm md:grid-cols-2">
							{#each [
								{ label: 'Client ID', ready: data.zohoStatus.hasClientId },
								{ label: 'Client secret', ready: data.zohoStatus.hasClientSecret },
								{ label: 'Refresh token', ready: data.zohoStatus.hasRefreshToken },
								{ label: 'Meeting creation', ready: data.zohoStatus.readyForMeetingCreation }
							] as item}
								<p class={item.ready ? 'text-emerald-500' : 'text-amber-500'}>
									{item.label}: {item.ready ? 'Ready' : 'Missing'}
								</p>
							{/each}
						</div>

						<div class="flex flex-wrap items-center gap-3">
							<button class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
								style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
								formaction="?/testZohoAuth" formmethod="POST" type="submit">
								Test Zoho OAuth
							</button>
							{#if form?.zohoTestResult}
								<p class="text-sm" style="color: var(--c-text2)">
									OAuth works. API domain: {form.zohoTestResult.apiDomain}. TTL: {form.zohoTestResult.expiresIn ?? 'unknown'} seconds.
								</p>
							{/if}
						</div>

						<div class="flex flex-wrap items-center gap-3">
							<button class="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-[#e85521] hover:text-[#e85521]"
								style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
								formaction="?/testZohoMeeting" formmethod="POST" type="submit">
								Test Zoho Meeting Create
							</button>
							{#if form?.zohoMeetingResult}
								<p class="text-sm" style="color: var(--c-text2)">
									Meeting created. Key: {form.zohoMeetingResult.meetingKey ?? 'unknown'}.
								</p>
							{/if}
						</div>

						{#if form?.zohoMeetingResult?.joinLink}
							<div class="rounded-xl border px-4 py-3 text-sm pnp-muted" style="border-color: var(--c-border); color: var(--c-text2)">
								<p class="break-all">Join link: {form.zohoMeetingResult.joinLink}</p>
								{#if form.zohoMeetingResult.startLink}
									<p class="mt-1 break-all">Start link: {form.zohoMeetingResult.startLink}</p>
								{/if}
							</div>
						{/if}
					</div>
				</details>
			</div>
		</details>

		<!-- Meeting defaults -->
		<details class="rounded-xl border overflow-hidden" style="border-color: var(--c-border)">
			<summary class="grid cursor-pointer list-none gap-3 px-5 py-4 pnp-muted md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<h2 class="text-xl font-semibold tracking-tight" style="color: var(--c-text)">Meeting defaults</h2>
					<p class="mt-1 text-sm" style="color: var(--c-text2)">Default title, agenda, attendee behavior, and auto-create setting.</p>
				</div>
				<p class="text-sm font-semibold text-[#e85521]">Edit defaults</p>
			</summary>

			<div class="space-y-4 border-t p-5" style="border-color: var(--c-border)">
				<div>
					<label class="text-sm font-medium" for="zohoDefaultMeetingTopic" style={labelStyle}>Default meeting title</label>
					<input class={inputClass} style={inputStyle} id="zohoDefaultMeetingTopic" name="zohoDefaultMeetingTopic" placeholder={'Discuss Plans - {customer_name}'} value={data.workspace.zohoDefaultMeetingTopic ?? ''} />
				</div>

				<div>
					<label class="text-sm font-medium" for="zohoDefaultAgenda" style={labelStyle}>Default agenda</label>
					<textarea class="{inputClass} min-h-32" style={inputStyle} id="zohoDefaultAgenda" name="zohoDefaultAgenda" placeholder="Add the default context that should go into each meeting.">{data.workspace.zohoDefaultAgenda ?? ''}</textarea>
				</div>

				<label class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition hover:border-[#e85521]"
					style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)">
					<input checked={data.workspace.zohoAddAttendeeEmails} class="rounded accent-[#e85521]" name="zohoAddAttendeeEmails" type="checkbox" />
					Add attendee emails to the meeting when possible.
				</label>

				<label class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition hover:border-[#e85521]"
					style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)">
					<input checked={data.workspace.zohoAutoCreateMeetings} class="rounded accent-[#e85521]" name="zohoAutoCreateMeetings" type="checkbox" />
					Automatically create a meeting as soon as a booking is confirmed.
				</label>
			</div>
		</details>

		<div class="flex justify-end pt-2">
			<button class="rounded-xl px-6 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_20px_rgba(232,85,33,0.35)]" type="submit">
				Save settings
			</button>
		</div>
	</form>
</section>
