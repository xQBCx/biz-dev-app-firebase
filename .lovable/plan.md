
# Fix DM Image Not Appearing + Add New Conversation Feature

## Summary
Two issues prevent your DM with attachment from appearing:
1. No way to start a new DM conversation (requires pre-existing connection)
2. Attachments don't load when messages arrive via realtime

---

## Problem 1: Cannot Start New Conversations

The DM system currently requires an entry in the `connections` table with `status: 'accepted'` before you can message someone. There's no UI to initiate a new DM.

### Solution: Add "New Message" Button

Add ability to search for users and start a conversation directly, creating the connection record on-the-fly.

**Files to modify:**
- `src/components/direct-messages/DirectMessages.tsx` - Add "New Message" button
- Create `src/components/direct-messages/NewDMDialog.tsx` - User search and selection dialog

**How it works:**
1. Click "New Message" button in the Messages header
2. Search for users by name or email
3. Select a recipient
4. System creates/finds a connection record and opens the chat

---

## Problem 2: Attachments Not Loading on Realtime

When a new message arrives via Supabase Realtime (line 107 in `useDMMessages.ts`), the code adds the raw message to state without fetching attachments or generating signed URLs.

### Solution: Fetch Attachments for Realtime Messages

**File to modify:** `src/components/direct-messages/useDMMessages.ts`

**Change:** When a new message arrives via realtime that has a non-text message type, fetch its attachments and signed URLs before adding to state.

```text
Current Flow:
  Realtime event → Add raw message to state → No attachment URLs

Fixed Flow:
  Realtime event → Check message_type → 
  If has attachment → Fetch from dm_attachments + get signed URL →
  Add complete message to state
```

---

## Implementation Details

### 1. NewDMDialog Component

```typescript
// New dialog with:
// - Search input with debounced profile search
// - Results list showing name + email
// - Click to start conversation
```

**Search query:**
```sql
SELECT id, email, full_name 
FROM profiles 
WHERE (full_name ILIKE '%query%' OR email ILIKE '%query%')
AND id != current_user_id
LIMIT 10
```

### 2. Connection Creation Logic

When starting a new conversation:
1. Check if connection exists between users
2. If not, create one with `status: 'accepted'` (for DM purposes)
3. Navigate to the new conversation

### 3. Fix Realtime Attachment Loading

In `useDMMessages.ts`, update the realtime handler:

```typescript
// Before adding message to state:
if (newMsg.message_type !== 'text' && newMsg.message_type !== 'link') {
  // Fetch attachment record
  const { data: attachments } = await supabase
    .from('dm_attachments')
    .select('*')
    .eq('message_id', newMsg.id);
  
  // Generate signed URLs
  const attachmentsWithUrls = await Promise.all(
    attachments.map(async (att) => {
      const { data } = await supabase.storage
        .from('dm-attachments')
        .createSignedUrl(att.storage_path, 3600);
      return { ...att, url: data?.signedUrl };
    })
  );
  
  newMsg.attachments = attachmentsWithUrls;
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/direct-messages/NewDMDialog.tsx` | Create | User search + new conversation dialog |
| `src/components/direct-messages/DirectMessages.tsx` | Modify | Add "New Message" button |
| `src/components/direct-messages/useDMMessages.ts` | Modify | Fix realtime attachment loading |
| `src/components/direct-messages/useDMConversations.ts` | Modify | Add createConversation function |
| `src/components/direct-messages/index.ts` | Modify | Export new component |

---

## User Experience After Fix

1. **Start New DM**: Click "New Message" → Search "Hamzat" → Select user → Start chatting
2. **Send Image**: Attach file → Send → Image appears immediately in chat
3. **Receive Image**: Other user sends image → Image loads automatically with signed URL

---

## Database Note

No schema changes required. The `connections` table already supports the needed structure. We'll create connection records with `status: 'accepted'` for direct DM initiation.
