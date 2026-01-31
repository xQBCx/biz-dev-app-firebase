
# Plan: Integrate Wallet Settings into Participants Tab

## Problem

The `ParticipantWalletSettingsPanel` component exists but was never integrated into the Deal Room Participants list. This is why you don't see the "enable wallet setup" option for Peter.

## What's Missing

The `DealRoomParticipants.tsx` component needs:
1. Import of `ParticipantWalletSettingsPanel`
2. A new state variable to track which participant's wallet settings panel is open
3. A "Wallet" icon/button in the admin actions for each participant
4. The `ParticipantWalletSettingsPanel` rendered (like the existing permissions dialog)
5. The `Participant` interface updated to include `requires_wallet_setup` and `wallet_address` fields

## Implementation

### Step 1: Update Imports

Add to the imports in `DealRoomParticipants.tsx`:
```typescript
import { Wallet } from "lucide-react";
import { ParticipantWalletSettingsPanel } from "@/components/deal-room/ParticipantWalletSettingsPanel";
```

### Step 2: Update Participant Interface

Add the missing fields to the interface:
```typescript
interface Participant {
  // ...existing fields...
  requires_wallet_setup?: boolean;
  wallet_address?: string | null;
}
```

### Step 3: Add State for Wallet Settings Panel

Add a state variable to track which participant's wallet panel is open:
```typescript
const [walletSettingsParticipant, setWalletSettingsParticipant] = useState<Participant | null>(null);
```

### Step 4: Add Wallet Button to Admin Actions

Add a "Wallet" button alongside the existing "Permissions" and "CRM" buttons for accepted participants:
```typescript
<Button
  size="sm"
  variant="ghost"
  onClick={() => setWalletSettingsParticipant(participant)}
  className="h-7 text-xs"
  title="Wallet settings"
>
  <Wallet className="w-3 h-3 mr-1" />
  <span className="hidden sm:inline">Wallet</span>
</Button>
```

### Step 5: Render the Panel

Add the `ParticipantWalletSettingsPanel` component at the bottom of the component (similar to how `DealRoomParticipantPermissions` is rendered):
```typescript
{walletSettingsParticipant && (
  <ParticipantWalletSettingsPanel
    open={!!walletSettingsParticipant}
    onOpenChange={(open) => {
      if (!open) setWalletSettingsParticipant(null);
    }}
    participant={{
      id: walletSettingsParticipant.id,
      user_id: walletSettingsParticipant.user_id,
      requires_wallet_setup: walletSettingsParticipant.requires_wallet_setup ?? false,
      wallet_address: walletSettingsParticipant.wallet_address ?? null,
      profiles: { full_name: walletSettingsParticipant.name }
    }}
    dealRoomId={dealRoomId}
    dealRoomName={dealRoomName}
    onUpdate={fetchParticipants}
  />
)}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/dealroom/DealRoomParticipants.tsx` | Add import, state, button, and panel rendering |

## Expected Result

After this change:
- You'll see a "Wallet" button next to each participant's "Permissions" and "CRM" buttons
- Clicking it opens a side panel where you can toggle "Requires Wallet Setup" for that participant
- When enabled for Peter, he'll receive a notification to set up his XDK wallet
