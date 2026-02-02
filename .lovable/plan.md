

# Fix DM Image Not Appearing + Add New Conversation Feature

## Summary
Two fixes to make your Direct Messages work properly:
1. Add ability to start new conversations with any user
2. Fix images/attachments not appearing when sent

---

## What You'll Get

### 1. "New Message" Button
- Click to open a search dialog
- Find users by name or email (type "Hamzat" to find Mark)
- Select a user to start chatting immediately
- No need to have a pre-existing connection

### 2. Images Load Correctly
- When you send an image, it appears immediately
- When you receive an image, it loads automatically
- All attachment types (photos, videos, files) will work

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/direct-messages/NewDMDialog.tsx` | Create | User search + start conversation dialog |
| `src/components/direct-messages/DirectMessages.tsx` | Modify | Add "New Message" button in header |
| `src/components/direct-messages/useDMMessages.ts` | Modify | Fix realtime attachment loading |
| `src/components/direct-messages/useDMConversations.ts` | Modify | Add createConversation function |
| `src/components/direct-messages/index.ts` | Modify | Export new component |

---

## Technical Details

### NewDMDialog Component
- Debounced search against `profiles` table
- Shows results with name + email
- Creates connection record with `status: 'accepted'` on selection
- Opens chat immediately after selection

### Realtime Attachment Fix
When a message arrives via realtime:
1. Check if it has attachments (message_type !== 'text')
2. Fetch attachment records from `dm_attachments` table
3. Generate signed URLs from storage
4. Add complete message with URLs to state

### Connection Creation
```sql
-- Check for existing connection
SELECT * FROM connections 
WHERE (requester_id = :user1 AND receiver_id = :user2)
   OR (requester_id = :user2 AND receiver_id = :user1)

-- If none exists, create one
INSERT INTO connections (requester_id, receiver_id, status)
VALUES (:current_user, :other_user, 'accepted')
```

---

## No Database Changes Required
The existing `connections` table structure supports this. We'll create connection records directly with `status: 'accepted'` for DM purposes.

