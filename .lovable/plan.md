
# Plan: Enable All Deal Room Features Universally

## Problem Summary

The "Test Deal" Deal Room is missing the AI Analysis tab because:
1. The `ai_analysis_enabled` field is `false` in the database for this room
2. The "Enable AI Analysis" toggle defaults to OFF when creating a new Deal Room
3. There is currently **no settings panel** to turn on AI Analysis (or other features) after a room is created

This means admins cannot enable capabilities on existing Deal Rooms - they would need to delete and recreate them.

## Solution Overview

We'll add a **Deal Room Settings Panel** accessible from the Governance tab (or a new "Settings" tab) that allows admins to toggle room-level features like:
- AI Analysis
- DAO Voting
- Other room configuration options

Additionally, we'll change the default for `ai_analysis_enabled` to `true` so new Deal Rooms get AI capabilities by default.

---

## Implementation Details

### 1. Create Deal Room Settings Component

**New file:** `src/components/dealroom/DealRoomSettingsPanel.tsx`

This panel will allow admins to:
- Toggle AI Analysis on/off
- Toggle DAO Voting on/off
- Update voting rules
- Update time horizon
- (Future) Other room-level settings

The component will:
- Display current settings with toggle switches
- Update the `deal_rooms` table on change
- Show confirmation toast on successful update
- Refresh the parent component's room data

### 2. Add Settings Panel to Governance Tab

**Modify:** `src/pages/DealRoomDetail.tsx`

Add the new `DealRoomSettingsPanel` component to the Governance tab content area, giving admins a single location for all room configuration:

```text
Governance Tab
├── ContractLockPanel
├── VotingQuestionsPanel  
├── ChangeOrderPanel
└── [NEW] DealRoomSettingsPanel  ← Add here
```

### 3. Change Default for AI Analysis

**Modify:** `src/pages/DealRoomNew.tsx`

Change the initial form state:
```typescript
// Before
ai_analysis_enabled: false

// After  
ai_analysis_enabled: true
```

This ensures all new Deal Rooms have AI capabilities enabled by default (users can still turn it off if needed).

### 4. Fix Current "Test Deal" Room

**Database update** (one-time fix):
```sql
UPDATE deal_rooms 
SET ai_analysis_enabled = true 
WHERE id = '1bf494eb-ccfc-4e7d-b000-f6f380f82882';
```

---

## Technical Implementation

### DealRoomSettingsPanel Component Structure

```typescript
interface DealRoomSettingsPanelProps {
  dealRoomId: string;
  aiAnalysisEnabled: boolean;
  votingEnabled: boolean;
  votingRule: string;
  timeHorizon: string;
  isAdmin: boolean;
  onUpdate: () => void;
}
```

Features:
- Card layout with sections for each setting category
- Real-time toggle switches for boolean settings
- Select dropdowns for enum settings (voting rule, time horizon)
- Disabled state when user is not admin
- Optimistic UI updates with rollback on error

### Settings Available

| Setting | Type | Description |
|---------|------|-------------|
| AI Analysis | Toggle | Enable AI-powered analysis, fairness scoring, and deal structure generation |
| DAO Voting | Toggle | Enable governance voting on questions |
| Voting Rule | Select | Unanimous / Majority / Weighted / Founder Override |
| Time Horizon | Select | One-time / Recurring / Perpetual |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/dealroom/DealRoomSettingsPanel.tsx` | Create | New settings panel component |
| `src/pages/DealRoomDetail.tsx` | Modify | Add settings panel to Governance tab, pass room props |
| `src/pages/DealRoomNew.tsx` | Modify | Default `ai_analysis_enabled` to `true` |

---

## Verification Checklist

After implementation:
1. Open "Test Deal" Deal Room
2. Navigate to Governance tab
3. Verify new Settings Panel appears
4. Toggle "AI Analysis" ON
5. Confirm AI Analysis tab now appears in the tab list
6. Create a new Deal Room - verify AI Analysis is enabled by default
7. Verify non-admins cannot access the settings toggles
