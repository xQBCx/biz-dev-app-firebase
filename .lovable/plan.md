
Goal: When you “View as George”, the app must behave like George (not like Bill). Specifically, George has only `deal_rooms` permission in the database, so he must not be able to land on Dashboard, xEVENTSx, Initiative Architect, Partner Management, Proposal Generator, or any admin UI—either via sidebar, direct URL, or the “home” button.

What’s actually going wrong (confirmed):
- George’s permissions (backend) are correct: he only has `deal_rooms` enabled.  
- The UI still lets you land on “Bill-looking” screens while impersonating because:
  1) The top navigation “Globe/Home” button always navigates to `/`, and in the authenticated app `/` renders `<Dashboard />` with no module guard.  
  2) Routes like `/xevents`, `/initiatives`, `/partners`, `/proposals` are not wrapped in the new `RequirePermission` guard, so direct URL bypass still works.  
  3) There is still at least one “real admin” check leaking into “View As” inside Deal Rooms: `DealRoomDetail.tsx` uses `useUserRole()` + `user.id` (real Bill) to compute `isAdmin`, which can show admin-only panels while impersonating.

Immediate “stop the bleed” implementation (fast + safe)

Phase 1 — Make “Home” safe during impersonation (fixes what you’re seeing right now)
1) Add a single source of truth for “default app landing route”:
   - Implement a small hook (e.g. `useDefaultAppRoute()`) that uses effective permissions (impersonation-aware) and returns the best safe landing:
     - If `deal_rooms:view` → `/deal-rooms`
     - Else if `dashboard:view` → `/dashboard`
     - Else → `/profile` (or a dedicated `/no-access` page if you prefer)
2) Update `src/components/Navigation.tsx`:
   - Change the Globe/Home button from `navigate("/")` to `navigate(defaultRoute)`
   - Optional: if impersonating, you can label/tooltip it “Home (impersonated)” so it’s clear you’re not going to the admin dashboard.
3) Update `src/App.tsx` (authenticated routes):
   - Change `<Route path="/" element={<Dashboard />} />` to a redirect component that sends to `defaultRoute` (impersonation-aware).
   - Result: even if something navigates to `/`, it won’t show Dashboard unless the effective user is allowed.

Why this fixes the “Bill interface on /” problem:
- George doesn’t have `dashboard:view`, so “Home” cannot land on Dashboard anymore while impersonating.

Phase 2 — Enforce module access at the routing layer (prevents URL bypass)
1) Start using the existing `src/components/auth/RequirePermission.tsx` (it exists but is not currently applied in `App.tsx`).
2) Wrap the specific “problem modules” first (the ones you called out):
   - `/dashboard` → `<RequirePermission module="dashboard" ...><Dashboard /></RequirePermission>`
   - `/deal-rooms`, `/deal-rooms/new`, `/deal-rooms/:id` → module `deal_rooms`
   - `/xevents` routes → module `xevents`
   - `/initiatives` routes → module `initiatives`
   - `/partners` route → module `partner_management`
   - `/proposals` route → module `proposal_generator`
3) Fix redirect loops cleanly:
   - Update `RequirePermission` so its default `redirectTo` is not hardcoded to `/dashboard`.
   - Instead, default it to `defaultRoute` (from Phase 1), so if dashboard is denied it redirects to `/deal-rooms` (or another allowed module), not back to dashboard.

Result:
- Even if someone pastes a URL, the route guard blocks it based on effective permissions (including impersonation).

Phase 3 — Remove “real admin” leakage inside Deal Rooms (admin panels showing while viewing as George)
1) Update `src/pages/DealRoomDetail.tsx`:
   - Replace `useUserRole()` with `useEffectiveUserRole()`
   - Stop using `user?.id` (real Bill) for “creator/admin” checks; use `effectiveUserId` instead.
   - Compute `isAdmin` as:
     - effectiveGlobalAdmin (impersonation-aware) OR `room.created_by === effectiveUserId`
2) Ensure any admin-only panels/controls inside DealRoomDetail use that corrected `isAdmin`:
   - Especially the new `DealRoomSettingsPanel` (so it can’t appear for George unless George is allowed).

Result:
- Governance/settings/admin controls cannot appear just because Bill is the real logged-in user.

Phase 4 — Verification checklist (we will test immediately after implementing)
While “View as George”:
1) Sidebar does not show Dashboard, xEVENTSx, Initiative Architect, Partner Management, Proposal Generator.
2) Clicking the Globe/Home button does NOT show Dashboard; it routes to Deal Rooms.
3) Visiting these URLs manually redirects you away with an access denied message:
   - `/dashboard`
   - `/xevents`
   - `/initiatives`
   - `/partners`
   - `/proposals`
4) Deal Room detail:
   - George cannot see admin-only governance/settings controls
   - Terms tab remains hidden/blocked per his deal-room participant permissions

Important clarification (re: “George better not see my profile”):
- What you’re seeing right now is an admin-only “View As” simulation bug (routing/UI not respecting effective permissions consistently). It does not mean George can log in and see Bill’s profile. The fix above ensures the “View As” experience accurately matches what George would see.

Files that will be updated in the implementation
- `src/components/Navigation.tsx` (Home button uses safe landing)
- `src/App.tsx` (route “/” becomes safe redirect; apply `RequirePermission` wrappers)
- `src/components/auth/RequirePermission.tsx` (default redirect should be “safe landing” not `/dashboard`)
- `src/pages/DealRoomDetail.tsx` (replace real-role admin checks with effective-role checks)

Execution order (fastest path to relief)
1) Phase 1 (Home safe) + Phase 2 (guard dashboard + the 4 problem modules)
2) Phase 3 (DealRoomDetail admin leakage fix)
3) Full regression verification

If you approve, I’ll implement Phase 1–3 as an emergency patch first (so you stop seeing Bill’s interface while viewing as George), then we can optionally expand route-level guards to more modules afterward for complete platform hardening.
