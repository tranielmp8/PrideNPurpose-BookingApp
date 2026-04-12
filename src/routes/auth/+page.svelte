<svelte:head>
	<title>Account Access | Pride N Purpose Bookings</title>
</svelte:head>

<div class="min-h-screen bg-[linear-gradient(165deg,#f9fbfc_0%,#eef4f7_42%,#e5edf1_100%)] px-6 py-16 text-slate-900">
	<div class="mx-auto max-w-6xl">
		<div class="rounded-[2.5rem] border border-[#d5e2e9] bg-white p-8 shadow-[0_28px_80px_rgba(93,122,139,0.1)] md:p-10">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="brand-script text-2xl text-slate-600 md:text-3xl">Pride N Purpose Bookings</p>
					<h1 class="mt-5 font-serif text-4xl leading-tight tracking-tight text-[#384959] md:text-5xl">
						Choose the right sign in.
					</h1>
					<p class="mt-5 max-w-2xl text-base leading-7 text-slate-600">
						Provider access is for the business owner dashboard. Customer access is for people managing their own bookings.
					</p>
				</div>

				<a
					class="rounded-full border border-[#d5e2e9] bg-[#f8fbfc] px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#eef4f7]"
					href="/"
				>
					Home
				</a>
			</div>

			<div class="mt-10 grid gap-5 md:grid-cols-2">
				<section class="rounded-[2rem] border border-[#d5e2e9] bg-[#f8fbfc] p-6">
					<p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Provider access</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight text-[#384959]">Workspace owner</h2>
					<p class="mt-3 text-sm leading-6 text-slate-600">
						Sign in to manage services, availability, bookings, and your booking site settings.
					</p>
					<div class="mt-6 flex flex-wrap gap-3">
						<a
							class="inline-flex rounded-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
							href="/auth/sign-in"
						>
							Provider sign in
						</a>
						<a
							class="inline-flex rounded-full border border-[#d5e2e9] bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#eef4f7]"
							href="/auth/sign-up"
						>
							Create provider account
						</a>
					</div>
				</section>

				<section class="rounded-[2rem] border border-[#d5e2e9] bg-[#f8fbfc] p-6">
					<p class="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Customer access</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight text-[#384959]">Booking customer</h2>
					<p class="mt-3 text-sm leading-6 text-slate-600">
						Sign in to review or manage your bookings. New customer sign-up should start from a specific booking page so your account connects to the right workspace.
					</p>
					<div class="mt-6 flex flex-wrap gap-3">
						<a
							class="inline-flex rounded-full bg-[#96C2DB] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#87b6d1]"
							href="/customer/sign-in"
						>
							Customer sign in
						</a>
						<a
							class="inline-flex rounded-full border border-[#d5e2e9] bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-[#b8ccd8] hover:bg-[#eef4f7]"
							href="/customer/sign-up"
						>
							Customer sign up
						</a>
					</div>
				</section>
			</div>
		</div>
	</div>
</div>
