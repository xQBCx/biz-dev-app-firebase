

# Implement ComposeEmail Upgrades: Attach Files + Recipient Search

## Summary
Two features need to be added to the ComposeEmail component:
1. Make the "Attach Files" button functional
2. Add quick search for To/CC/BCC fields to find recipients by name or email

---

## 1. Fix Attach Files Button

**What will happen:**
- Hidden file input connected via React ref
- Button click triggers file picker
- Selected files displayed with remove option
- 50MB size limit per file

**Changes to ComposeEmail.tsx:**
- Add `useRef` for hidden file input
- Add `attachments` state array
- Add `handleFileSelect` function
- Wire button's `onClick` to trigger file input
- Display attachment list below the button

---

## 2. Add Recipient Search Component

**New file: `src/components/RecipientSearchInput.tsx`**

A reusable autocomplete input that:
- Searches `profiles` table by `full_name` or `email`
- Uses Popover + Command pattern (shadcn)
- Shows dropdown with matching contacts
- Allows selecting from results or typing custom email
- Debounces search (300ms)

**Query:**
```sql
SELECT id, email, full_name, avatar_url 
FROM profiles 
WHERE (full_name ILIKE '%search%' OR email ILIKE '%search%')
LIMIT 10
```

---

## 3. Integration

**Update ComposeEmail.tsx:**
- Replace `Input` for To field with `RecipientSearchInput`
- Replace `Input` for CC field with `RecipientSearchInput`  
- Replace `Input` for BCC field with `RecipientSearchInput`

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/RecipientSearchInput.tsx` | Create |
| `src/components/ComposeEmail.tsx` | Modify |

---

## Technical Details

### RecipientSearchInput Props
```typescript
interface RecipientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

### Attachment State
```typescript
const [attachments, setAttachments] = useState<File[]>([]);
const fileInputRef = useRef<HTMLInputElement>(null);
```

### File Validation
- Max 50MB per file
- Show toast error if file too large
- Support multiple files

---

## User Experience After Implementation

1. **Attach Files**: Click button → file picker opens → selected file appears with [X] to remove
2. **To/CC/BCC**: Type "ham" → dropdown shows "Hamzat (hamzat.executive@...)" → click to select

