

# Plan: Engineer Role Preset + Permission Enforcement + Partner Self-Service Team Management

## Overview

This plan implements three interconnected features to ensure George (and future partner engineers) can be properly managed with appropriate access restrictions:

1. **Engineer Role Preset** - A new Deal Room role specifically designed for implementers like George
2. **Permission Enforcement on Deal Room Tabs** - Ensures Financial Rails, Deal Terms, and other sensitive tabs actually check permissions before rendering
3. **Partner Self-Service Team Management** - Allows Peter to invite and manage his own employees without admin intervention

---

## Part 1: Add "Engineer" Role Preset for Deal Rooms

### What George Needs
- Access to Agent Setup Guide (to implement the AI agents)
- Document view/upload (for agent configs and deliverables)
- Messaging (to coordinate with the team)
- View participants (to know who to contact)

### What George Should NOT See
- Financial Rails tab (shows Peter's 1/3 cut, escrow, XDK)
- Deal Terms/Ingredients (shows deal structure)
- Payouts/Settlement (shows money distribution)
- Credits/Attribution (shows who earns what %)
- View Own Financials (George has no earnings here)

### Changes

**File: `src/components/deal-room/DealRoomPermissionManager.tsx`**

Add new "Engineer" preset to `ROLE_PRESETS`:

```text
engineer: {
  label: 'Engineer',
  color: '#14b8a6',  // Teal color
  permissions: [
    'view_documents', 
    'upload_documents', 
    'view_participants', 
    'view_own_deliverables', 
    'send_messages'
  ],
  visibility: { 
    financials: 'none', 
    participants: 'all', 
    documents: 'all', 
    deal_terms: 'none', 
    contributions: 'none', 
    earnings: 'none' 
  },
}
```

This preset:
- Enables: View/upload documents, view participants, send messages, view own deliverables
- Disables: All financial visibility, deal terms, contributions, earnings
- Perfect for implementers who are paid externally

---

## Part 2: Enforce Permission Checks on Deal Room Tabs

### The Problem
Currently, Deal Room tabs render for everyone regardless of their `default_permissions` or `visibility_config`. The permission manager stores the settings, but the tabs do not check them before rendering.

### The Solution
Create a `useDealRoomPermissions` hook and use it to conditionally render/hide tabs.

### New Hook: `src/hooks/useDealRoomPermissions.ts`

```text
export function useDealRoomPermissions(dealRoomId: string) {
  - Fetches current user's participant record
  - Returns their default_permissions and visibility_config
  - Provides helper methods:
    - canView(permissionKey) 
    - canAccess(tabName)
    - getVisibility(dataType)
  - Handles loading state
}
```

### Changes to `src/pages/DealRoomDetail.tsx`

1. Import and use the new hook
2. Conditionally render tabs based on permissions:

```text
Tabs to gate by permission:
- financial-rails: requires view_all_financials OR view_own_financials
- settlement: requires view_all_financials
- structures: requires view_deal_terms
- credits: requires view_own_financials OR view_all_financials
- ingredients: requires view_ingredients
- contributions: requires view_all_deliverables OR view_own_deliverables
- formulations: requires view_deal_terms
- governance: requires manage_deal_settings (already admin-gated)
```

3. Show "Access Restricted" message if user navigates to a restricted tab via URL

### Permission Mapping Table

| Tab | Required Permission(s) |
|-----|----------------------|
| overview | Always visible |
| participants | view_participants |
| ingredients | view_ingredients OR view_deal_terms |
| contributions | view_own_deliverables OR view_all_deliverables |
| credits | view_own_financials OR view_all_financials |
| structures | view_deal_terms |
| settlement | view_all_financials |
| formulations | view_deal_terms |
| analytics | view_all_financials |
| financial-rails | view_own_financials OR view_all_financials |
| chat | send_messages OR view_all_messages |
| agents | view_documents (for setup guide access) |
| governance | manage_deal_settings |

---

## Part 3: Partner Self-Service Team Management

### The Problem
Peter cannot currently add employees like George to his partner team OR to Deal Rooms. He has to ask an admin to do it.

### The Solution
Add a "Team" tab to the Partner Portal that embeds the existing `PartnerTeamManager` component, enabling partners to:
- Invite team members (engineers like George)
- Set their role and permissions
- View pending invites
- Deactivate/remove members

### Changes to `src/pages/PartnerPortal.tsx`

1. Add a third tab: "Team"
2. Fetch the partner's integration record to get their `partner_integration_id`
3. Render `PartnerTeamManager` component with appropriate props
4. Add indication that team members can be synced to Deal Rooms

### New Tab Layout:

```text
TabsList:
- Partners (existing)
- Commissions (existing)  
- My Team (NEW)

My Team tab content:
- PartnerTeamManager component
- Info card explaining that team members get API access
- Future: Toggle to "auto-sync to Deal Rooms"
```

### Optional Enhancement: Auto-Sync Team to Deal Rooms

Add a database trigger or edge function that:
- When a partner team member joins, automatically adds them as a participant to all Deal Rooms where the partner is involved
- Applies the "Engineer" role preset by default
- This ensures George gets Deal Room access as soon as Peter invites him

**Database changes needed:**
- New column on `partner_team_members`: `auto_sync_to_deal_rooms` (boolean)
- New edge function: `sync-partner-team-to-deal-rooms`

---

## Implementation Order

1. **Phase 1: Engineer Role Preset** (lowest risk)
   - Add the preset to DealRoomPermissionManager
   - Test by applying it to George

2. **Phase 2: Permission Enforcement** (medium complexity)
   - Create useDealRoomPermissions hook
   - Update DealRoomDetail.tsx to gate tabs
   - Test with George's restricted permissions

3. **Phase 3: Partner Self-Service** (medium complexity)
   - Add Team tab to PartnerPortal
   - Wire up PartnerTeamManager
   - Test invitation flow

4. **Phase 4 (Optional): Auto-Sync** (higher complexity)
   - Database migration for new column
   - Edge function for sync logic
   - UI toggle in PartnerTeamManager

---

## Technical Details

### Files to Create
- `src/hooks/useDealRoomPermissions.ts` - Permission checking hook

### Files to Modify
- `src/components/deal-room/DealRoomPermissionManager.tsx` - Add Engineer preset
- `src/pages/DealRoomDetail.tsx` - Gate tabs based on permissions
- `src/pages/PartnerPortal.tsx` - Add Team tab with PartnerTeamManager

### Database Changes
- None required for Phase 1-3
- Phase 4 (optional): Add `auto_sync_to_deal_rooms` column to `partner_team_members`

---

## What This Means for George

After implementation:

1. **When you add George now:**
   - Add him as Deal Room participant
   - Click "Manage Permissions"
   - Select the "Engineer" preset
   - George sees: Documents, Participants, Messages, Agent Setup Guide
   - George does NOT see: Financial Rails, Deal Terms, Credits, Payouts

2. **When Peter wants to add another employee in the future:**
   - Peter goes to Partner Portal > My Team tab
   - Clicks "Invite Member"
   - Enters email, selects "Engineer" role
   - Employee accepts invite and gets appropriate access

---

## Summary

| Feature | Benefit | Complexity |
|---------|---------|------------|
| Engineer Preset | One-click setup for implementers | Low |
| Tab Enforcement | Actually hides sensitive data | Medium |
| Partner Self-Service | Peter can manage his own team | Medium |
| Auto-Sync (optional) | Team members auto-get Deal Room access | Higher |

