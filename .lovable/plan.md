

# Fix Deal Room Invite Links to Use Biz Dev Branding

## Problem Summary

When you copy a deal room invite link and send it via iMessage, it shows:
- **Lovable-branded URL** (`9eb4fb51-331f-4c3e-bbd2-12bd5e26ea30.lovableproject.com`)
- **Lovable logo and description** in the link preview card

This is unprofessional for client-facing communications and undermines your brand.

## Root Causes

**1. URL Origin Inconsistency**
```text
DealRoomInviteManager.tsx → Uses window.location.origin (returns lovableproject.com in preview)
InvitationsTab.tsx        → Hardcodes https://thebdapp.com (correct)
send-deal-room-invite     → Hardcodes https://thebdapp.com (correct)
```

**2. Missing OG Meta Tags**
The `DealRoomInviteAccept.tsx` page has no `<Helmet>` meta tags. When iMessage/social platforms scrape the URL, they fall back to default meta tags that show Lovable branding.

## Solution

### Part 1: Fix All Invite Link URLs

Update components to consistently use `https://thebdapp.com` for all invite links:

| File | Current | Fix |
|------|---------|-----|
| `DealRoomInviteManager.tsx` | `window.location.origin` | `https://thebdapp.com` |
| `DealRoomParticipants.tsx` | `window.location.origin` | `https://thebdapp.com` |

This ensures when you copy the link, it's already the branded thebdapp.com URL.

### Part 2: Add OG Meta Tags to Deal Room Invite Page

Add proper `<Helmet>` meta tags to `DealRoomInviteAccept.tsx`:

```jsx
<Helmet>
  <title>Join {dealRoomName} | Biz Dev App</title>
  <meta name="description" content="You've been invited to join a secure deal room on Biz Dev App" />
  <meta property="og:title" content="You're Invited to a Deal Room" />
  <meta property="og:description" content="Join a secure business collaboration space on Biz Dev App" />
  <meta property="og:image" content="https://thebdapp.com/bizdev-logo.png" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="https://thebdapp.com/bizdev-logo.png" />
</Helmet>
```

### Part 3: Ensure Custom Domain is Publishing Correctly

For the OG meta tags to be scraped correctly by iMessage, the app must be **published** to `thebdapp.com`. The preview URL will always show Lovable branding because that's the development environment.

```text
Preview Environment:     *.lovableproject.com → Lovable branding (development)
Published Environment:   thebdapp.com         → Biz Dev branding (production)
```

**Action Required**: Click "Publish" to deploy to thebdapp.com if not already done.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/deal-room/DealRoomInviteManager.tsx` | Hardcode `https://thebdapp.com` |
| `src/components/dealroom/DealRoomParticipants.tsx` | Hardcode `https://thebdapp.com` |
| `src/pages/DealRoomInviteAccept.tsx` | Add `<Helmet>` with OG meta tags |

## Technical Details

**Why iMessage shows Lovable branding:**
1. iMessage scrapes the URL when you paste it
2. If the URL points to lovableproject.com, Lovable's default meta tags are returned
3. Even if the URL is thebdapp.com, if that page doesn't have explicit OG tags, it may fall back to defaults

**The Fix:**
1. Always generate thebdapp.com links (not window.location.origin)
2. Add explicit OG tags to the invite accept page
3. Ensure the logo at `https://thebdapp.com/bizdev-logo.png` is accessible (it already exists in `/public/bizdev-logo.png`)

## Expected Result After Fix

When you send Harley the invite link:

```text
URL:         https://thebdapp.com/deal-room-invite/invite-harley-viewpro-2026
Card Title:  You're Invited to a Deal Room
Card Desc:   Join a secure business collaboration space on Biz Dev App
Card Image:  [Biz Dev App logo - the blue 3-bar icon]
```

