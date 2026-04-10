# MVP Database Schema

This schema is sized for a solo-provider or small-team booking app MVP.

## Core tables

- `workspace`: the provider-facing business profile and booking settings.
- `service`: the appointment types a workspace offers.
- `weekly_availability`: recurring weekly time windows, stored as local `HH:MM` strings.
- `availability_override`: one record per date that differs from the weekly schedule.
- `availability_override_window`: optional custom windows for an override date.
- `customer`: deduplicated customer records per workspace.
- `booking`: the scheduled appointment plus customer snapshots.

## Main choices

- `workspace.ownerUserId` is stored as plain text for now.
  The repo has Better Auth configured, but `src/lib/server/db/auth.schema.ts` has not been generated yet, so adding a foreign key today would break the build.
- Weekly availability and date overrides are split.
  That keeps slot generation straightforward:
  1. read the normal weekly windows
  2. replace them if an override exists for the target date
  3. subtract conflicting bookings
- `booking` keeps customer name/email snapshots.
  That protects historical bookings if a customer later updates their profile details.
- Times are intended to be stored in UTC for bookings.
  Availability windows stay local to the workspace timezone and should be converted during slot generation.

## Expected MVP flow

1. Create a `workspace` during onboarding.
2. Add one or more `service` records.
3. Save weekly rules in `weekly_availability`.
4. Optionally add blackout dates or custom-date windows with `availability_override`.
5. Create or reuse a `customer`.
6. Insert a `booking` after validating the requested slot is still free.

## Next schema step

After running `npm run auth:schema`, we can tighten `workspace.ownerUserId` into a real foreign key against the generated Better Auth user table.
