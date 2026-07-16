<svelte:head>
	<title>Account Access | PNP Connect</title>
</svelte:head>

<div class="pnp-page px-6 py-16">
	<div class="mx-auto max-w-6xl">
		<div class="rounded-[2.5rem] border p-8 md:p-10 shadow-[var(--shadow-md)] pnp-surface"
			style="border-color: var(--c-border)">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="brand-wordmark" style="color: var(--c-text3)">PNP Connect</p>
					<h1 class="mt-5 font-serif text-4xl leading-tight tracking-tight md:text-5xl" style="color: var(--c-text)">
						Choose the right sign in.
					</h1>
					<p class="mt-5 max-w-2xl text-base leading-7" style="color: var(--c-text2)">
						Provider access is for the business owner dashboard. Customer access is for people
						managing their own bookings.
					</p>
				</div>

				<a
					class="rounded-full border px-4 py-2 text-sm font-semibold transition hover:text-[#c2410c]"
					style="border-color: var(--c-border); background-color: var(--c-muted); color: var(--c-text2)"
					href="/"
				>
					Home
				</a>
			</div>

			<div class="mt-10 grid gap-5 md:grid-cols-2">
				<section class="rounded-[2rem] border p-6 pnp-muted" style="border-color: var(--c-border)">
					<p class="text-sm font-semibold uppercase tracking-[0.28em]" style="color: var(--c-text3)">Provider access</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight" style="color: var(--c-text)">Workspace owner</h2>
					<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">
						Sign in to manage services, availability, bookings, and your booking site settings.
					</p>
					<div class="mt-6 flex flex-wrap gap-3">
						<a
							class="inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_16px_rgba(194,65,12,0.3)]"
							href="/auth/sign-in"
						>
							Provider sign in
						</a>
						<a
							class="inline-flex rounded-full border px-5 py-3 text-sm font-semibold transition hover:border-[#c2410c] hover:text-[#c2410c]"
							style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text2)"
							href="/auth/sign-up"
						>
							Create provider account
						</a>
					</div>
				</section>

				<section class="rounded-[2rem] border p-6 pnp-muted" style="border-color: var(--c-border)">
					<p class="text-sm font-semibold uppercase tracking-[0.28em]" style="color: var(--c-text3)">Customer access</p>
					<h2 class="mt-3 text-2xl font-semibold tracking-tight" style="color: var(--c-text)">Booking customer</h2>
					<p class="mt-3 text-sm leading-6" style="color: var(--c-text2)">
						Sign in to review or manage your bookings. New customer sign-up should start from a
						specific booking page so your account connects to the right workspace.
					</p>
					<div class="mt-6 flex flex-wrap gap-3">
						<a
							class="inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white pnp-btn-primary shadow-[0_4px_16px_rgba(194,65,12,0.3)]"
							href="/customer/sign-in"
						>
							Customer sign in
						</a>
						<a
							class="inline-flex rounded-full border px-5 py-3 text-sm font-semibold transition hover:border-[#c2410c] hover:text-[#c2410c]"
							style="border-color: var(--c-border); background-color: var(--c-surface); color: var(--c-text2)"
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
