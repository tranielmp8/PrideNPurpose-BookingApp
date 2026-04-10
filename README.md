# Booking App

Booking App is a SvelteKit scheduling app for solo operators and small teams. Providers can define services and availability, customers can book through a public page, and confirmed bookings can create, update, and cancel Zoho Meetings.

## Current features

- Provider sign-up and onboarding
- Workspace settings and public booking slug
- Service management with durations, prices, and scheduling buffers
- Weekly availability and date-specific overrides
- Public booking flow
- Provider booking management for reschedule, cancel, and complete
- Zoho Meeting create, update, and delete sync

## Local setup

1. Install dependencies:

```sh
npm install
```

2. Copy `.env.example` to `.env` and fill in the required values.

3. Generate the Better Auth schema if needed:

```sh
npm run auth:schema
```

4. Push the database schema:

```sh
npm run db:push
```

5. Start the dev server:

```sh
npm run dev
```

## Required environment variables

- `DATABASE_URL`
- `ORIGIN`
- `BETTER_AUTH_SECRET`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`

Workspace-specific Zoho values such as data center, `zsoid`, and presenter user ID are managed in the provider settings UI.

## Zoho Meeting setup

Use the Zoho Developer Console for the same data center as the host account. The OAuth client must be consented with at least these scopes:

```text
ZohoMeeting.meeting.CREATE,ZohoMeeting.meeting.UPDATE,ZohoMeeting.meeting.DELETE
```

Optional:

```text
ZohoMeeting.meeting.READ
```

After updating scopes, generate a new authorization code, exchange it for tokens, and store the new refresh token in `ZOHO_REFRESH_TOKEN`.

## Verification

Project checks:

```sh
npm run check
npm run build
```

Manual end-to-end flow:

1. Create a booking from the public page.
2. Reschedule it from the provider dashboard.
3. Cancel another booking.
4. Complete another booking.

## Railway deployment

This project is configured for Railway with `@sveltejs/adapter-node`.

Railway should use:

- Build command: `npm run build`
- Start command: `npm run start`

Runtime notes:

- Railway injects `PORT`, and the Node adapter listens on it automatically.
- Set `ORIGIN` to your Railway public URL or custom domain.
- Add the same application secrets you use locally, including database, Better Auth, email, and Zoho variables.
