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

<section class="space-y-7">
	<div class="border-b border-[#d5e2e9] pb-6">
		<p class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Settings</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight text-[#384959] md:text-4xl">
			Workspace profile and Zoho Meeting setup.
		</h1>
		<p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
			Settings are grouped into expandable rows so the page stays condensed while still keeping every field available.
		</p>
	</div>

	{#if form?.settingsMessage}
		<p class="border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
			{form.settingsMessage}
		</p>
	{/if}

	<form method="POST" action="?/saveSettings" use:enhance class="space-y-4">
		<details class="border border-[#d5e2e9]" open>
			<summary class="grid cursor-pointer list-none gap-3 bg-[#f7fafb] px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Workspace profile</h2>
					<p class="mt-1 text-sm text-slate-600">
						{data.workspace.name} · /book/{data.workspace.slug} · {data.workspace.timezone}
					</p>
				</div>
				<p class="text-sm font-semibold text-[#384959]">Edit profile</p>
			</summary>

			<div class="grid gap-4 border-t border-[#d5e2e9] p-5 md:grid-cols-2">
				<div>
					<label class="text-sm font-medium text-slate-700" for="name">Business name</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="name" name="name" required value={data.workspace.name} />
				</div>
				<div>
					<label class="text-sm font-medium text-slate-700" for="slug">Booking slug</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="slug" name="slug" required value={data.workspace.slug} />
				</div>
				<div>
					<label class="text-sm font-medium text-slate-700" for="timezone">Timezone</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="timezone" name="timezone" required value={data.workspace.timezone} />
				</div>
				<div>
					<label class="text-sm font-medium text-slate-700" for="contactEmail">Contact email</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="contactEmail" name="contactEmail" type="email" value={data.workspace.contactEmail ?? ''} />
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="locationLabel">Location label</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="locationLabel" name="locationLabel" placeholder="Zoom, Phone call, Chicago office, etc." value={data.workspace.locationLabel ?? ''} />
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="description">Public description</label>
					<textarea class="mt-2 block min-h-28 w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="description" name="description" placeholder="Tell customers what this booking page is for.">{data.workspace.description ?? ''}</textarea>
				</div>
				<div class="md:col-span-2">
					<label class="text-sm font-medium text-slate-700" for="defaultConfirmationMessage">Default confirmation email message</label>
					<textarea class="mt-2 block min-h-32 w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="defaultConfirmationMessage" name="defaultConfirmationMessage" placeholder={'Use placeholders like {customer}, {date}, {time}, {duration}, {location}, {meeting_link}.'}>{data.workspace.defaultConfirmationMessage ?? ''}</textarea>
				</div>
			</div>
		</details>

		<details class="border border-[#d5e2e9]">
			<summary class="grid cursor-pointer list-none gap-3 bg-[#f7fafb] px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Zoho Meeting connection</h2>
					<p class="mt-1 text-sm text-slate-600">
						Non-secret Zoho identifiers, env readiness, and connection tests.
					</p>
				</div>
				<p class="text-sm font-semibold text-[#384959]">Open setup</p>
			</summary>

			<div class="space-y-5 border-t border-[#d5e2e9] p-5">
				<div class="grid gap-4 md:grid-cols-2">
					<div>
						<label class="text-sm font-medium text-slate-700" for="zohoDataCenter">Zoho data center</label>
						<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="zohoDataCenter" name="zohoDataCenter" placeholder="com, eu, in, com.au" value={data.workspace.zohoDataCenter ?? ''} />
					</div>
					<div>
						<label class="text-sm font-medium text-slate-700" for="zohoZsoid">Zoho zsoid</label>
						<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="zohoZsoid" name="zohoZsoid" value={data.workspace.zohoZsoid ?? ''} />
					</div>
					<div>
						<label class="text-sm font-medium text-slate-700" for="zohoPresenterUserId">Presenter user ID</label>
						<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="zohoPresenterUserId" name="zohoPresenterUserId" value={data.workspace.zohoPresenterUserId ?? ''} />
					</div>
					<div>
						<label class="text-sm font-medium text-slate-700" for="zohoXZsource">X-ZSOURCE</label>
						<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="zohoXZsource" name="zohoXZsource" value={data.workspace.zohoXZsource ?? ''} />
					</div>
				</div>

				<div class="border border-[#d5e2e9]">
					<div class="bg-[#f7fafb] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
						Readiness
					</div>
					<div class="divide-y divide-[#d5e2e9]">
						{#each getReadinessItems() as item}
							<div class="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_8rem] md:items-center">
								<p class="text-slate-600">{item.label}</p>
								<p class={`font-semibold ${item.ready ? 'text-emerald-700' : 'text-amber-700'}`}>
									{item.ready ? 'Ready' : 'Missing'}
								</p>
							</div>
						{/each}
					</div>
				</div>

				<div class="border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
					<p class="font-semibold text-slate-950">Custom confirmation email sender</p>
					<p class="mt-1 break-all">{data.emailStatus.emailFrom || 'Not set'}</p>
					<p class="mt-2 text-slate-600">
						Use the format Business Name &lt;name@yourdomain.com&gt;. The domain also needs to be verified in Resend.
					</p>
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<button class="border border-[#cfdce4] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7]" formaction="?/testZohoAuth" formmethod="POST" type="submit">
						Test Zoho OAuth
					</button>
					{#if form?.zohoTestResult}
						<p class="text-sm text-slate-600">
							OAuth works. API domain: {form.zohoTestResult.apiDomain}. Access token TTL:
							{form.zohoTestResult.expiresIn ?? 'unknown'} seconds.
						</p>
					{/if}
				</div>

				<div class="flex flex-wrap items-center gap-3">
					<button class="border border-[#cfdce4] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-[#eef4f7]" formaction="?/testZohoMeeting" formmethod="POST" type="submit">
						Test Zoho Meeting Create
					</button>
					{#if form?.zohoMeetingResult}
						<p class="text-sm text-slate-600">
							Meeting created. Key: {form.zohoMeetingResult.meetingKey ?? 'unknown'}.
						</p>
					{/if}
				</div>

				{#if form?.zohoMeetingResult?.joinLink}
					<div class="border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
						<p class="break-all">Join link: {form.zohoMeetingResult.joinLink}</p>
						{#if form.zohoMeetingResult.startLink}
							<p class="mt-1 break-all">Start link: {form.zohoMeetingResult.startLink}</p>
						{/if}
					</div>
				{/if}
			</div>
		</details>

		<details class="border border-[#d5e2e9]">
			<summary class="grid cursor-pointer list-none gap-3 bg-[#f7fafb] px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<h2 class="text-xl font-semibold tracking-tight text-[#384959]">Meeting defaults</h2>
					<p class="mt-1 text-sm text-slate-600">
						Default Zoho title, agenda, attendee behavior, and auto-create setting.
					</p>
				</div>
				<p class="text-sm font-semibold text-[#384959]">Edit defaults</p>
			</summary>

			<div class="space-y-4 border-t border-[#d5e2e9] p-5">
				<div>
					<label class="text-sm font-medium text-slate-700" for="zohoDefaultMeetingTopic">Default meeting title</label>
					<input class="mt-2 block w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="zohoDefaultMeetingTopic" name="zohoDefaultMeetingTopic" placeholder={'Discuss Plans - {customer_name}'} value={data.workspace.zohoDefaultMeetingTopic ?? ''} />
				</div>

				<div>
					<label class="text-sm font-medium text-slate-700" for="zohoDefaultAgenda">Default agenda</label>
					<textarea class="mt-2 block min-h-32 w-full border-[#cfdce4] bg-white px-4 py-3 text-sm" id="zohoDefaultAgenda" name="zohoDefaultAgenda" placeholder="Add the default context that should go into each Zoho Meeting.">{data.workspace.zohoDefaultAgenda ?? ''}</textarea>
				</div>

				<label class="flex items-center gap-3 border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
					<input checked={data.workspace.zohoAddAttendeeEmails} class="rounded border-[#cfdce4]" name="zohoAddAttendeeEmails" type="checkbox" />
					Add attendee emails to the Zoho meeting when possible.
				</label>

				<label class="flex items-center gap-3 border border-[#d5e2e9] bg-[#f7fafb] px-4 py-3 text-sm text-slate-700">
					<input checked={data.workspace.zohoAutoCreateMeetings} class="rounded border-[#cfdce4]" name="zohoAutoCreateMeetings" type="checkbox" />
					Automatically create a Zoho Meeting as soon as a booking is confirmed.
				</label>
			</div>
		</details>

		<div class="flex justify-end pt-2">
			<button class="bg-[#384959] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24313d]" type="submit">
				Save settings
			</button>
		</div>
	</form>
</section>
