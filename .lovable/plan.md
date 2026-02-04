
# Selective Refresh & Pull-to-Refresh Implementation

## Summary of Changes

### 1. Global React Query Config (`src/App.tsx`)
- Set `refetchOnWindowFocus: false` to stop auto-refresh on tab switch
- Add `staleTime: 5 minutes` so data stays fresh without constant refetching

### 2. URL-Persisted Tabs (`src/pages/DealRoomDetail.tsx`)
- Sync `activeTab` with URL search params (`?tab=agents`)
- Tab state survives re-renders and can be bookmarked

### 3. Smart Loading States (DealRoomDetail + other pages)
- Add `initialLoadComplete` flag
- Full-page loader only on first load; background refetches keep UI visible
- Form inputs preserved during data updates

### 4. Targeted Data Refresh After Mutations
- After funding/transfers, only invalidate relevant queries (`xdk-balance`, `treasury-balance`, etc.)
- Numbers update without full page reload
- Already partially implemented in `FundContributionPaymentModal.tsx` and similar components

### 5. Manual Refresh Button
- Add a `RefreshCw` icon button in page headers
- Calls `queryClient.invalidateQueries()` for on-demand sync
- Applied globally to main pages

### 6. Mobile Pull-to-Refresh
- Create a reusable `PullToRefresh` wrapper component
- Uses touch events to detect pull-down gesture
- Triggers `queryClient.invalidateQueries()` on release
- Apply to all main page layouts

---

## Technical Details

| Change | Files Affected |
|--------|----------------|
| Global Query config | `src/App.tsx` |
| URL tab persistence | `src/pages/DealRoomDetail.tsx` + similar tabbed pages |
| Smart loading states | All major page components with loading checks |
| Pull-to-refresh component | New `src/components/ui/pull-to-refresh.tsx` |
| Refresh button | Layout/header components |

---

## What This Solves

| Problem | Solution |
|---------|----------|
| Page resets when switching browser tabs | `refetchOnWindowFocus: false` |
| Tab position lost (e.g., Agents → Overview) | URL-persisted `activeTab` |
| Form inputs deleted on tab switch | Smart loading that preserves UI during refetch |
| Fund additions don't update numbers | Targeted `invalidateQueries()` after mutations |
| No manual refresh option | Header refresh button |
| No mobile-friendly refresh | Pull-to-refresh gesture |
