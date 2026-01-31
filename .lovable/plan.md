
# Add Mobile Navigation Menu to BDSRVS Website

## Problem
The BDSRVS website header currently hides all navigation links (About, Services, Contact) on mobile devices with no way to access them. The screenshot shows only the logo and "Enter Platform" button are visible.

## Solution
Add a hamburger menu button that appears on mobile devices and reveals the navigation links when tapped.

## Changes

### File: `src/pages/BdSrvsHome.tsx`

1. **Add imports**
   - Import `useState` from React
   - Import `Menu` and `X` icons from lucide-react

2. **Add mobile menu state**
   - Add `const [mobileMenuOpen, setMobileMenuOpen] = useState(false);`

3. **Add hamburger button to header**
   - Add a hamburger/X toggle button that appears only on mobile (`md:hidden`)
   - Place it between the navigation and "Enter Platform" button

4. **Add mobile menu dropdown**
   - Show navigation links when menu is open
   - Include About, Services, Contact links
   - Include "Enter Platform" button in mobile menu
   - Close menu when a link is clicked

## Visual Result
- **Mobile**: Logo + hamburger icon + "Enter Platform" button in header
- **When tapped**: Dropdown with About, Services, Contact links
- **Desktop**: No change - navigation links remain visible inline

## Technical Details

The header structure will change from:
```text
[Logo] [Hidden Nav] [Enter Platform]
```

To:
```text
[Logo] [Hidden Nav] [Hamburger (mobile only)] [Enter Platform]
       |
       v (when open)
   [About]
   [Services]
   [Contact]
```

The implementation follows the same pattern used in `NewsPublicHeader.tsx` which already has a working mobile menu.
