
## What’s happening (root causes we can prove from the code)
### 1) “Deal Rooms permission” is currently being used as a catch‑all toggle for multiple unrelated pages
In `src/components/AppSidebar.tsx`, these items are all mapped to `module: 'deal_rooms'`:
- Deal Rooms (`/deal-rooms`)
- xEVENTSx (`/xevents`)
- Initiative Architect (`/initiatives`)
- Partner Management (`/partners`)
- Proposal Generator (`/proposals`)

So if George has *only* `deal_rooms` permission, the sidebar will still show all of those pages as “allowed”, because they are all controlled by the same module toggle today.

### 2) “View As” is not consistently using the impersonated (effective) permissions/roles
Some UI gating uses **effective** permissions/roles (impersonated), but other parts still use the “real logged-in user” permissions/roles:

- `AppSidebar` uses `useEffectivePermissions()` and `useEffectiveUserRole()` (good).
- `MasterWhitePaperButton` uses `usePermissions()` (not effective), so while impersonating, it can still render docs based on the admin’s real permissions.
- `useDealRoomPermissions()` uses `useAuth()` and `useUserRole()` (not effective), so while impersonating, it can behave like the admin (showing tabs like Terms).

### 3) Deal Room access + tabs: two separate issues
- **List page** (`src/pages/DealRooms.tsx`) currently fetches `deal_rooms` without filtering by the effective user. During “View As”, it will still return everything the admin can see.
- **Tabs gating** (`src/pages/DealRoomDetail.tsx`) depends on `useDealRoomPermissions()`, which currently checks the real logged-in user (admin), not the impersonated user.
- Additionally, at least one tab trigger is **unconditionally rendered** (e.g. “XODIAK Anchors”), meaning even correct permissions could be bypassed at the UI level.

## Goals (what “fixed” means)
When you “View as George”:
1) Sidebar shows only what George should see (based on George’s module toggles).
2) Direct URL access is blocked (route-level guard), not just hidden links.
3) Deal Rooms list shows only rooms George is a participant in (or explicitly invited to).
4) Inside “The View Pro Strategic Partnership”:
   - Terms tab and any finance/contract tabs stay hidden/blocked for Engineer.
5) Platform Documentation does not appear unless George has the documentation permission.
6) Same behavior applies to any user, not just George.

---

## Phase A (Immediate hotfix: make View-As accurate)
### A1) Make Deal Room permission evaluation use the effective (impersonated) identity
Update `src/hooks/useDealRoomPermissions.ts` to use:
- `useEffectiveUser()` for the user id used in queries
- `useEffectiveUserRole()` for “is admin” checks

Key changes:
- Replace `useAuth()`’s `user.id` with `effectiveUserId`
- Replace `useUserRole()` with `useEffectiveUserRole()`
- Determine “creator” status using `room.created_by === effectiveUserId` (not admin user id)
- This ensures `canAccess('terms')` stays false for George’s Engineer preset (which currently has `view_deal_terms: false` in his participant record)

### A2) Fix DealRooms list to filter by effective user participation
Update `src/pages/DealRooms.tsx`:
- Use `useEffectiveUser()` and query only rooms where `deal_room_participants.user_id === effectiveUserId`
- Show the “New Deal Room” button only when the effective user is actually allowed (and not during impersonation unless explicitly intended)

Result: George won’t see “Test Deal” unless he’s actually a participant.

### A3) Fix DealRoomDetail tab triggers that are currently not gated
Update `src/pages/DealRoomDetail.tsx`:
- Ensure every tab trigger that should be permissioned is wrapped with `canAccess(...)`
  - Example: “XODIAK Anchors” is currently not gated in the desktop tabs list.
- Ensure mobile `<SelectItem>` entries are also gated (some appear to be unconditional, e.g. “CRM”).

This removes UI escape hatches even if someone can “guess” tab names.

### A4) Fix Platform Documentation visibility during impersonation
Update:
- `src/components/whitepaper/MasterWhitePaperButton.tsx`
- `src/components/whitepaper/WhitePaperIcon.tsx` (used across pages)

Change them to use `useEffectivePermissions()` instead of `usePermissions()` so they respect impersonation.
Result: When you view as George, docs only appear if George has `white_paper` permission.

---

## Phase B (Add real toggles for xEVENTSx / Initiative Architect / Partner Management / Proposal Generator)
Right now those pages are controlled by the **Deal Rooms** module toggle in the sidebar. To get separate toggles:

### B1) Backend enum expansion (database migration)
Add new `platform_module` enum values for these features, for example:
- `xevents`
- `initiatives`
- `partner_management`
- `proposal_generator`

(Names can be adjusted, but we must keep them stable once created.)

### B2) Update the frontend module type + permission managers
Update:
- `src/hooks/usePermissions.tsx` (PlatformModule union)
- `src/components/PermissionManager.tsx` (module categories list)
- `src/components/user-management/InvitationPermissionManager.tsx`
- `src/pages/UserManagement.tsx` presets (so presets don’t accidentally grant these)

### B3) Update sidebar module mapping
Update `src/components/AppSidebar.tsx`:
- `/xevents` uses `module: 'xevents'`
- `/initiatives` uses `module: 'initiatives'`
- `/partners` uses `module: 'partner_management'`
- `/proposals` uses `module: 'proposal_generator'`
- `/deal-rooms` remains `module: 'deal_rooms'`

Result: you’ll have separate toggles for each, and “Deal Rooms only” will truly mean “Deal Rooms only”.

---

## Phase C (Prevent “URL bypass” with route-level permission guards)
Hiding sidebar links is not enough. We need a route guard like `RequireRole`, but for module permissions.

### C1) Create a `RequirePermission` (or `RequireModulePermission`) component
Behavior:
- Wait for permissions to load
- If user lacks `view` permission for that module, redirect to a safe route (e.g. `/deal-rooms` if that’s the only module they have; otherwise `/dashboard`)
- Use **effective permissions** so impersonation is accurate

### C2) Wrap routes in `src/App.tsx`
Wrap each sensitive route, for example:
- `/dashboard` -> require `dashboard:view`
- `/deal-rooms` and `/deal-rooms/:id` -> require `deal_rooms:view`
- `/xevents` -> require `xevents:view`
- `/initiatives` -> require `initiatives:view`
- `/partners` -> require `partner_management:view`
- `/proposals` -> require `proposal_generator:view`
…etc.

Result: even if a user pastes a URL, the app blocks them consistently.

---

## Phase D (Make “View As” land on a valid page automatically)
Right now “View As” can leave you on an admin-only page, which makes it look like George can access it.

Implementation:
- After `startImpersonation(userId)` completes, navigate to the first allowed module route for the impersonated user:
  - Prefer `/deal-rooms` if they have `deal_rooms:view`
  - Else `/dashboard` if they have `dashboard:view`
  - Else show a “no access” page telling you they currently have zero module access

This makes the “View As” experience deterministic and avoids confusion.

---

## Verification checklist (what we will test before you publish)
1) In User Management, click “View As: George”
2) Confirm sidebar does NOT show:
   - Dashboard
   - Platform Documentation card/button
   - xEVENTSx
   - Initiative Architect
   - Partner Management
   - Proposal Generator
3) Go to `/deal-rooms`:
   - Only “The View Pro Strategic Partnership” appears
   - “Test Deal” is not shown
4) Open “The View Pro Strategic Partnership”:
   - Terms tab is hidden
   - Any financial/settlement/analytics tabs are hidden
   - Agents + Messaging + Documents tabs are available (as intended for Engineer)
5) Paste a blocked URL like `/initiatives`:
   - You are redirected and see an “access denied” toast/message

---

## Decisions I will need from you (so we don’t guess)
1) Do you want separate toggles for all four items (xEVENTSx, Initiative Architect, Partner Management, Proposal Generator), or should any of them remain bundled under Deal Rooms?
2) When “View As” starts, should we always land on `/deal-rooms` (simple), or should we land on the “first allowed module” (smart)?

If you approve this plan, I’ll implement Phase A first (immediate correctness + deal room restrictions), then Phase C (URL bypass protection), then Phase B (new toggles), then Phase D (better View As landing).
