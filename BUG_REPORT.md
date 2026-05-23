# Psynova Bug Report — Round 1

Produced from a static code audit (frontend pages + backend routes). Not from a live runtime pass — that requires Postgres/Redis up and would be the next step. P0 endpoint bugs were verified by reading the route files directly; lower-severity items were code-scanned by an Explore agent and may need a quick second look before fixing.

Round 1 changes (admin profile, role guards, perf, photos) are already landed — those bugs are not listed here.

## Status

- ✅ **All 4 P0s fixed** in a follow-up pass — see "Fixed" section at the bottom.
- ✅ **Schema applied:** `sessionNotes` column added to the live Neon DB via `prisma db push`. (Project uses `db push`, not migration files — no migration folder exists.)
- P1s and P2s below are still open.

---

## P0 — Crash / broken core flow

### 1. Booking success page hits a non-existent endpoint
- **Frontend:** [psynova-frontend/src/app/booking/success/page.tsx:23](psynova-frontend/src/app/booking/success/page.tsx#L23) calls `GET /api/appointments/by-session/{sessionId}`.
- **Backend:** No such route in [psynova-backend/src/routes/appointment.routes.ts](psynova-backend/src/routes/appointment.routes.ts).
- **Effect:** After Stripe checkout returns, the success page spins forever (3 retries × 1.5s) then renders without `data` — user sees no confirmation details.
- **Fix:** Add `router.get('/by-session/:sessionId', authenticateToken, appointmentController.getBySessionId)` and the matching service method that looks up by `stripeSessionId`.

### 2. Session notes PATCH endpoint missing
- **Frontend:** [psynova-frontend/src/app/session/[appointmentId]/page.tsx:35](psynova-frontend/src/app/session/[appointmentId]/page.tsx#L35) calls `PATCH /api/appointments/{id}/notes`.
- **Backend:** Not in [appointment.routes.ts](psynova-backend/src/routes/appointment.routes.ts).
- **Effect:** Therapists can type session notes but save fails silently (no toast in catch path).
- **Fix:** Add `router.patch('/:id/notes', authenticateToken, requireRole('THERAPIST'), appointmentController.saveNotes)` and a service method that authorizes the therapist on the appointment before writing.

### 3. Therapist null access on `therapists/[id]` detail page
- [psynova-frontend/src/app/therapists/[id]/page.tsx:59,89,127](psynova-frontend/src/app/therapists/[id]/page.tsx#L59) reads `therapist.user.firstName` before the `!therapist` guard at line 48.
- **Effect:** TypeError if the query throws or returns nothing.
- **Fix:** Move derived values (`fullName`, `topSpecs`, etc.) inside the post-guard block, or use optional chaining everywhere.

### 4. Client dashboard renders next-session card before data arrives
- [psynova-frontend/src/app/dashboard/client/page.tsx:73,78,141-143](psynova-frontend/src/app/dashboard/client/page.tsx#L73) accesses `nextSession.therapistUser.firstName` without guarding `nextSession`.
- **Effect:** Crash on first render when `upcomingAppointments` hasn't resolved yet.
- **Fix:** Render the card only when `nextSession` is defined; or use `nextSession?.therapistUser?.firstName ?? 'Your therapist'`.

---

## P1 — Broken or wrong feature

### 5. Therapist dashboard hits admin-only revenue endpoint
- [psynova-frontend/src/app/dashboard/therapist/page.tsx:36](psynova-frontend/src/app/dashboard/therapist/page.tsx#L36) calls `/api/admin/revenue`.
- **Effect:** Backend will return 403 for THERAPIST role, so the chart stays empty. (The earnings page does the same thing at [earnings/page.tsx:25](psynova-frontend/src/app/dashboard/therapist/earnings/page.tsx#L25).)
- **Fix:** Add `GET /api/therapists/me/earnings` that returns monthly revenue scoped to `req.user.userId` and switch both pages to it.

### 6. Admin users page has no pagination params
- [psynova-frontend/src/app/dashboard/admin/users/page.tsx](psynova-frontend/src/app/dashboard/admin/users/page.tsx) calls `/api/admin/users` with no `page` / `limit`, relying on backend defaults.
- **Effect:** Works for now (backend defaults to 20), but no UI pagination controls means only the first 20 users are ever visible.
- **Fix:** Add `page` state + a simple Prev/Next pager that passes `?page=X&limit=20`.

### 7. Booking modal availability shape is fragile
- [psynova-frontend/src/components/booking/BookingModal.tsx:113-120](psynova-frontend/src/components/booking/BookingModal.tsx#L113) `.reduce`s `slots` without verifying it's an array.
- **Effect:** If the availability endpoint ever returns `{ data: { slots: [...] } }` instead of a flat array, the modal crashes.
- **Fix:** Normalize to `Array.isArray(data) ? data : data?.slots ?? []` at the hook boundary.

### 8. Messages page has no error boundary or socket fallback
- [psynova-frontend/src/app/messages/page.tsx:101-102](psynova-frontend/src/app/messages/page.tsx#L101).
- **Effect:** If Socket.IO fails to connect or the conversations endpoint 500s, page hangs on the loading state.
- **Fix:** Show an error card with a retry button when the query is in error state.

---

## P2 — Polish / UX / a11y

### 9. Demo credentials visible in login UI
- [psynova-frontend/src/app/(auth)/login/page.tsx:117-120](psynova-frontend/src/app/(auth)/login/page.tsx#L117). Visible on every login screen in production.
- **Fix:** Gate behind `process.env.NEXT_PUBLIC_DEMO_MODE === 'true'` or remove entirely before launch.

### 10. Hardcoded "50 minutes" on booking success
- [psynova-frontend/src/app/booking/success/page.tsx:85](psynova-frontend/src/app/booking/success/page.tsx#L85) shows "50 minutes" regardless of actual `endTime - startTime`.
- **Fix:** `Math.round((new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / 60000)` minutes.

### 11. Mood + Journal pages render before data loads
- [psynova-frontend/src/app/dashboard/client/mood/page.tsx](psynova-frontend/src/app/dashboard/client/mood/page.tsx) and [journal/page.tsx](psynova-frontend/src/app/dashboard/client/journal/page.tsx) show empty charts/lists during load with no skeleton.
- **Fix:** Add `isLoading` branch using the existing `SkeletonCard` patterns.

### 12. Notifications page infinite scroll never triggers with <20 items
- [psynova-frontend/src/app/notifications/page.tsx:273](psynova-frontend/src/app/notifications/page.tsx#L273): sentinel only renders when `visible.length > 0`.
- **Fix:** Drop the `visible.length > 0` part of the sentinel condition.

### 13. Admin pending-therapists list uses `any`
- [psynova-frontend/src/app/dashboard/admin/page.tsx:148](psynova-frontend/src/app/dashboard/admin/page.tsx#L148) — `pendingTherapists.map((t: any) => ...)`.
- **Fix:** Add a `PendingTherapist` interface and type the query response.

### 14. Search page filters may be unreachable on mobile
- [psynova-frontend/src/app/search/page.tsx](psynova-frontend/src/app/search/page.tsx) hides the filter sidebar with `hidden lg:block`. Verify the mobile filter-toggle button is actually wired up — the audit flagged the visibility logic but didn't trace the toggle handler.

---

## Verified-OK areas

- Auth flow (login/register/refresh) — endpoints match, role-based redirect lands correctly.
- `next/image` config — Cloudinary + Unsplash now whitelisted.
- Admin profile page + role guards — added in Round 1, typechecks clean.
- Recharts dynamic-import — moves chart code out of main admin/earnings bundles.
- `getRevenueByMonth` — now SQL-aggregated, returns last 12 months.

---

## How this was produced

- Frontend + backend typechecks both pass (`npx tsc --noEmit` exit 0).
- Static reads of every page under `src/app/` and the backend route files. No live runtime pass.

## Fixed in follow-up pass

| # | Issue | Fix |
|---|-------|-----|
| P0-1 | `/api/appointments/by-session/:id` missing | New route + service `getAppointmentBySessionId` with auth check (client or therapist on the appointment). |
| P0-2 | `PATCH /api/appointments/:id/notes` missing + `sessionNotes` field missing on schema | Added `sessionNotes String? @db.Text` to `Appointment`, new `saveSessionNotes` service (therapist-only), and PATCH route. Also added `GET /api/appointments/:id` since the session page calls it, and fixed the frontend's `PATCH /complete` → `POST /complete` method mismatch. |
| P0-3 | `therapists/[id]` page null-access risk | The top-level `!therapist` guard was already in place — the audit overstated severity. Defensive fallbacks added for nested array fields (`languages`, `specializations`, `sessionTypes`, `reviews`, `availabilitySlots`) and `review.client?.firstName`. |
| P0-4 | Client dashboard `nextSession` access | The `nextSession &&` gate at line 61 was already there — also overstated. Added the missing loading skeleton for stats cards and wired the existing `canJoin` calc to gate the Join button (it was computed but never used). |

## Next step

When you spin up Postgres + the backend, run the Prisma migration above, then click through the P1/P2 list — most are 5-15 minute fixes.
