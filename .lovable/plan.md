
# Plan: Admin-Controlled XDK Wallet Setup with Notification System

## Summary

Instead of auto-creating XDK wallets for all participants, this plan implements an admin-controlled toggle that determines which participants need wallet setup. When enabled for a participant (like Peter), they receive an in-app notification prompting them to set up their XDK wallet. Participants like George (who are paid externally) can have this disabled.

---

## Database Changes

### 1. Add `requires_wallet_setup` Column to `deal_room_participants`

This boolean field will be set by the Deal Room admin when inviting or managing participants.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| requires_wallet_setup | boolean | false | Admin toggle for whether participant needs XDK wallet |

### 2. Add `requires_wallet_setup` Column to `deal_room_invitations`

So admins can configure this setting during the invitation process.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| requires_wallet_setup | boolean | false | Pre-configure wallet requirement for invitee |

---

## Components to Create/Modify

### 1. Update Invite Dialog (`DealRoomInviteManager.tsx`)

Add a toggle in the invitation form:

```text
┌─────────────────────────────────────────────────────┐
│ Invite to Deal Room                                 │
├─────────────────────────────────────────────────────┤
│ Email: [participant@company.com]                    │
│ Name:  [Peter Smith]                                │
│ ...existing fields...                               │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 💳 Requires Wallet Setup                    [✓] │ │
│ │ Participant will receive XDK payouts and        │ │
│ │ needs to set up their withdrawal wallet.        │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Responsive behavior:**
- Mobile: Full-width toggle card, stacked layout
- Tablet/Desktop: Inline toggle with description

### 2. Create Participant Settings Panel (`ParticipantWalletSettingsPanel.tsx`)

A new component for managing wallet settings for existing participants, accessible from the participants list.

**Features:**
- Toggle "Requires Wallet Setup" on/off for existing participants
- Show current wallet status (connected/not connected)
- "Send Notification" button to push wallet setup reminder
- Responsive grid layout for mobile/tablet/desktop

### 3. Create Wallet Setup Notification Component (`WalletSetupNotification.tsx`)

An in-app notification banner/card that appears for participants who:
- Have `requires_wallet_setup = true`
- Have NOT set up their wallet yet (`wallet_address IS NULL`)

**Design:**
```text
┌─────────────────────────────────────────────────────────────┐
│ 💳  Set Up Your XDK Wallet                           [Setup]│
│ You've been added to receive payouts in this Deal Room.    │
│ Complete your wallet setup to receive funds.               │
└─────────────────────────────────────────────────────────────┘
```

**Responsive behavior:**
- Mobile: Full-width card, stacked CTA button
- Tablet/Desktop: Inline with button on right

### 4. Integrate with Notification System

Use the existing `ai_proactive_notifications` table to send wallet setup notifications:

```text
notification_type: "wallet_setup_required"
title: "Set Up Your XDK Wallet"
message: "You've been added to [Deal Room Name] to receive payouts. Complete your wallet setup to receive funds."
action_type: "navigate"
action_payload: { route: "/profile", tab: "wallet" }
priority: "high"
```

### 5. Update Deal Room Participants List

Add visual indicator and quick action in the participants table:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Name          │ Role    │ Wallet Status       │ Actions              │
├──────────────────────────────────────────────────────────────────────┤
│ Peter Smith   │ Partner │ ⚠️ Setup Required   │ [📧 Notify] [⚙️ Edit]│
│ George Wilson │ Engineer│ — Not Required      │ [⚙️ Edit]            │
│ Lisa Chen     │ Advisor │ ✅ Connected        │ [⚙️ Edit]            │
└──────────────────────────────────────────────────────────────────────┘
```

**Responsive behavior:**
- Mobile: Card-based layout with stacked info, action buttons in dropdown
- Tablet: Condensed table with icon-only buttons
- Desktop: Full table with labels

---

## Edge Function: `send-wallet-setup-notification`

Creates a notification record when admin enables wallet setup or clicks "Send Reminder":

```text
Input:
- participant_id
- deal_room_id
- deal_room_name

Process:
1. Get participant's user_id from deal_room_participants
2. Insert notification into ai_proactive_notifications
3. Optionally send email notification
```

---

## User Flows

### Flow 1: New Invite with Wallet Requirement

1. Admin opens "Send Invitation" dialog
2. Fills in participant details
3. Toggles ON "Requires Wallet Setup"
4. Sends invitation
5. When participant accepts, they see wallet setup notification

### Flow 2: Enable Wallet for Existing Participant (Peter's Case)

1. Admin goes to Participants tab in Deal Room
2. Clicks settings icon on Peter's row
3. Opens "Participant Wallet Settings" panel
4. Toggles ON "Requires Wallet Setup"
5. Clicks "Send Notification"
6. Peter receives in-app notification
7. Peter clicks notification, goes to Profile/Wallet
8. Peter sets up XDK wallet via existing `PartnerWalletSetup` component

### Flow 3: Participant Without Wallet Requirement (George's Case)

1. Admin invites George with "Requires Wallet Setup" OFF
2. George joins Deal Room
3. George has access to messaging, documents per his permissions
4. No wallet notification shown
5. If needed later, admin can enable wallet requirement

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/deal-room/ParticipantWalletSettingsPanel.tsx` | Settings dialog for wallet config per participant |
| `src/components/deal-room/WalletSetupNotification.tsx` | In-app notification banner for wallet setup |
| `supabase/functions/send-wallet-setup-notification/index.ts` | Edge function to create/send notifications |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/deal-room/DealRoomInviteManager.tsx` | Add wallet setup toggle to invite form |
| `src/components/deal-room/DealRoomDetailPage.tsx` | Add wallet status column and actions to participants list |
| `src/components/dealroom/PartnerWalletSetup.tsx` | Check `requires_wallet_setup` flag before showing |
| `src/hooks/useDealRoomPermissions.ts` | Add `requiresWalletSetup` to return value |

---

## Responsive Design Approach

All new components will follow the existing codebase patterns using:

1. **Tailwind responsive classes**: `sm:`, `md:`, `lg:` prefixes
2. **Conditional layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
3. **useIsMobile hook**: For logic-based responsive behavior
4. **Stacked vs inline**: Mobile uses stacked layouts, desktop uses inline
5. **Icon-only buttons on mobile**: Full labels on desktop

Example responsive pattern from codebase:
```text
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <!-- Content adapts from stacked (mobile) to inline (desktop) -->
</div>
```

---

## Implementation Order

1. **Database migration**: Add `requires_wallet_setup` columns
2. **Update invite dialog**: Add toggle to new invitations
3. **Create participant settings panel**: Admin controls for existing participants
4. **Create notification component**: In-app wallet setup prompt
5. **Create edge function**: Push notifications to participants
6. **Update participants list**: Add status indicators and actions
7. **Test end-to-end**: Peter receives notification, sets up wallet, can withdraw

---

## Technical Notes

- The existing `ai_proactive_notifications` table already supports action payloads and navigation
- The `PartnerWalletSetup.tsx` component handles the actual wallet creation flow
- Stripe Connect onboarding (already implemented with in-app drawer) enables USD withdrawal after wallet setup
- All responsive classes will be tested across breakpoints (320px mobile, 768px tablet, 1024px+ desktop)
