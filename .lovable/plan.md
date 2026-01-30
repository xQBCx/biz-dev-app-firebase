

# Remove Incorrect Attribution Rule

## Summary

Remove the `reply_received` attribution rule ($25 per reply) from The View Pro deal room, as this fee was never agreed upon in the partnership terms.

## What Will Be Done

Delete the following record from `agent_attribution_rules`:

| Field | Value |
|-------|-------|
| ID | `295849f9-1949-4803-af29-f222c90d5b4b` |
| Outcome Type | `reply_received` |
| Base Amount | $25 |
| Deal Room | The View Pro Strategic Partnership |

## Resulting Attribution Rules (After Removal)

| Outcome Type | Amount | Purpose |
|--------------|--------|---------|
| meeting_set | $250 | Qualified meeting fee (per agreement) |
| trigger_detected | $0 | Signal Scout tracking |
| enrichment_complete | $0 | Account Intel tracking |
| draft_created | $0 | Sequence Draft tracking |

## SQL Command

```sql
DELETE FROM agent_attribution_rules 
WHERE id = '295849f9-1949-4803-af29-f222c90d5b4b';
```

## Updated Message for Peter, Harley & Casey

After this change, I'll provide the corrected update message with only the $250/meeting fee mentioned (removing the $25/reply reference).

