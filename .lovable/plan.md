
## What’s happening now (root cause)

This is **not** because Peter hasn’t set up his XDK wallet.

Peter’s wallet **does exist** in `xodiak_accounts` (address `xdk1a7eb...`), and the Deal Room treasury **does exist** in `deal_room_xdk_treasury` (address `xdk11dd...`, balance `485.20`).

The transfer fails because of a **database foreign key constraint**:

- Error returned to the browser:  
  `insert or update on table "xodiak_transactions" violates foreign key constraint "xodiak_transactions_from_address_fkey"`
- Details:  
  `Key (from_address)=(xdk11dd...) is not present in table "xodiak_accounts".`

### Why that matters
`xodiak_transactions.from_address` must reference an existing row in `xodiak_accounts(address)`.  
Right now, your treasury address lives in `deal_room_xdk_treasury`, but **there is no matching row in `xodiak_accounts`**, so the transaction insert fails before any balances can update.

---

## Fix approach (what I will change)

### A) Backfill missing treasury accounts in `xodiak_accounts` (one-time data fix)
Create `xodiak_accounts` rows for any treasury addresses found in `deal_room_xdk_treasury` that are currently missing.

**Migration SQL (conceptual):**
- Insert rows with:
  - `address = deal_room_xdk_treasury.xdk_address`
  - `balance = deal_room_xdk_treasury.balance`
  - `account_type = 'treasury'`
  - `metadata` includes `{ deal_room_id }`
- This will immediately satisfy the FK constraint for existing treasuries.

This will fix your current Deal Room treasury (`xdk11dd...`) without requiring any manual setup by Peter.

---

### B) Keep treasury in sync going forward (prevent future repeats)
Add a trigger on `deal_room_xdk_treasury` so whenever a treasury row is inserted/updated, we ensure a corresponding `xodiak_accounts` row exists (and optionally keep the mirrored balance up to date).

This prevents future Deal Rooms from breaking transfers the same way.

---

### C) Update `xdk-internal-transfer` function to ensure treasury account exists before writing `xodiak_transactions`
Even with the migration, this is an extra safety net so the function becomes robust if a treasury account is ever missing.

In `supabase/functions/xdk-internal-transfer/index.ts`:
1. After loading `treasuryData` from `deal_room_xdk_treasury`, upsert into `xodiak_accounts`:
   - `address: treasuryAccount.address`
   - `account_type: 'treasury'`
   - `balance: treasuryAccount.balance`
   - `metadata: { deal_room_id }`
2. Then insert into `xodiak_transactions` as you do now (signature already fixed).
3. When decrementing the treasury, also update the mirrored `xodiak_accounts.balance` for the treasury address to keep the ledger consistent (recommended).

---

### D) (Optional but recommended) Improve the UI error message
Right now, the UI often shows a generic error (from the functions wrapper), even when the backend returns a helpful JSON message.

In `src/components/deal-room/XdkTransferPanel.tsx`:
- When `supabase.functions.invoke(...)` returns `response.error`, attempt to parse `response.error.context.json()` and display `{ error: "..." }` from the backend response if present.
This will prevent “mystery failures” and make debugging much faster.

---

## How we’ll verify it’s fixed (end-to-end)

1. Reload the Deal Room page.
2. Click **Transfer XDK** → **Participant Wallet** → select Peter.
3. Transfer a small amount first (e.g. `1.00`), then `485.20`.
4. Confirm:
   - The UI toast shows **success**.
   - `xodiak_transactions` contains a new row with:
     - `from_address = xdk11dd...` (treasury)
     - `to_address = xdk1a7eb...` (Peter)
     - `signature` is non-null
   - `deal_room_xdk_treasury.balance` decreased appropriately.
   - `xodiak_accounts.balance` for Peter increased appropriately.

---

## Risks / notes
- This fix is safe because:
  - `xodiak_accounts` already supports `account_type = 'treasury'`.
  - treasury `user_id` will remain null (avoids auth-user FK issues).
- The mirrored treasury balance in `xodiak_accounts` is mainly to satisfy FK + consistency; the authoritative treasury balance can remain `deal_room_xdk_treasury`.

---

## Scope of files & backend changes

**Database**
- New migration: backfill + trigger for treasury accounts

**Backend function**
- `supabase/functions/xdk-internal-transfer/index.ts`: upsert treasury account before insert; keep balances consistent

**Frontend (optional)**
- `src/components/deal-room/XdkTransferPanel.tsx`: show backend error JSON instead of generic “non-2xx” message

---

## Next (once you approve this plan)
I will:
1) Create the migration (backfill + trigger).  
2) Update `xdk-internal-transfer` to upsert treasury account + sync treasury mirror balance.  
3) (Optional) Improve the UI toast to display the backend JSON error message.  
4) Re-test the transfer flow.
