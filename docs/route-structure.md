# MVP Route Structure

This app is organized around two main surfaces:

- provider routes under `/app`
- public booking routes under `/book/[slug]`

## Routes

- `/`
  Landing page for the product and quick entry links.
- `/auth/sign-in`
  Provider authentication entry point.
- `/auth/sign-up`
  Provider registration and onboarding entry point.
- `/app/dashboard`
  Provider home screen with upcoming bookings and setup status.
- `/app/services`
  CRUD surface for `service`.
- `/app/availability`
  Editor for `weekly_availability`, `availability_override`, and booking rules.
- `/app/bookings`
  Provider booking management list and details.
- `/app/settings`
  Workspace profile and booking defaults.
- `/book/[slug]`
  Public scheduling flow for a workspace.

## Build order

1. Wire `/auth/sign-up` to Better Auth and workspace creation.
2. Implement `/app/services` forms and persistence.
3. Implement `/app/availability` forms and persistence.
4. Build slot generation for `/book/[slug]`.
5. Persist bookings from `/book/[slug]`.
6. Load real booking data into `/app/dashboard` and `/app/bookings`.

## Notes

- The provider dashboard is intentionally grouped under `/app` so auth protection can be added at the layout level.
- The public booking route is separated from the provider area so it stays shareable and unauthenticated.
- If we later add teams, `/app/settings` can expand into workspace members and roles without changing the public route shape.
