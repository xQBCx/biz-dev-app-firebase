
# TLD Registry & Marketplace System for .globalnet

## Overview

Build a complete **TLD Registry Management & Marketplace** system that lets you:
1. Manage owned TLDs (starting with `.globalnet`, ready for more)
2. Create and sell premium domain names (like `nike.globalnet` for $10M+)
3. Allocate free domains to your own businesses/initiatives
4. Accept payments via XODIAK blockchain wallet integration
5. Connect domains to spawned businesses for WWW launch

This creates a revenue-generating digital asset marketplace where you control the entire registry.

---

## What You'll See When Complete

### 1. TLD Registry Dashboard (`/tld-registry`)
- Card showing `.globalnet` TLD with stats (total domains, allocated, available)
- "Add TLD" button for future acquisitions
- List of priority domain names you want to reserve
- Revenue analytics from domain sales

### 2. Domain Marketplace (`/domain-marketplace`)
- Public-facing page where external users can search and buy domains
- Premium pricing display (e.g., `nike.globalnet` - $10,000,000)
- Standard pricing tiers based on length and category
- Checkout flow via XODIAK wallet (XDK tokens)

### 3. Priority Domain Categories
Pre-populated list of valuable SLDs (Second-Level Domains) to reserve:

**Trades & Industries:**
- roofing, electrical, plumbing, hvac, construction, contracting, welding, carpentry, masonry, landscaping

**Business & Tech:**
- businesses, enterprise, startup, nano, quantum, datacenter, cloud, ai, robotics, automation

**Health & Wellness:**
- health, medical, wellness, fitness, pharma, biotech, nutrition, therapy

**Vehicles & Transport:**
- cars, trucks, transportation, logistics, fleet, aviation, maritime, rail, freight, delivery

**Real Estate & Property:**
- realestate, property, commercial, residential, industrial, development, mortgage, rentals

**Communications:**
- telecommunications, wireless, broadband, satellite, media, broadcast

**Premium Brands (Reserved for High-Value Sales):**
- nike, google, apple, microsoft, amazon, tesla, meta, nvidia (priced $10M+)

---

## Database Schema

### Table: `owned_tlds`
```sql
CREATE TABLE owned_tlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld_name TEXT NOT NULL UNIQUE,           -- e.g., "globalnet"
  display_name TEXT,                        -- e.g., ".globalnet"
  provider TEXT NOT NULL,                   -- "freename" | "other"
  blockchain_network TEXT,                  -- "polygon" | "bsc" | "aurora"
  token_id TEXT,                            -- NFT token ID
  owner_wallet_address TEXT,                -- Wallet that owns the TLD
  owner_user_id UUID REFERENCES auth.users, -- Platform user owner
  acquisition_date TIMESTAMPTZ,
  acquisition_cost_usd NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `tld_registered_domains`
```sql
CREATE TABLE tld_registered_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld_id UUID NOT NULL REFERENCES owned_tlds(id),
  domain_name TEXT NOT NULL,                -- e.g., "roofing"
  full_domain TEXT NOT NULL,                -- e.g., "roofing.globalnet"
  
  -- Ownership
  owner_type TEXT NOT NULL,                 -- "internal" | "sold" | "reserved"
  owner_user_id UUID REFERENCES auth.users,
  owner_business_id UUID REFERENCES spawned_businesses(id),
  owner_initiative_id UUID,
  
  -- Pricing
  price_xdk NUMERIC,                        -- Price in XDK tokens
  price_usd NUMERIC,                        -- Price in USD (for display)
  is_premium BOOLEAN DEFAULT FALSE,
  pricing_tier TEXT,                        -- "standard" | "premium" | "ultra_premium"
  
  -- Status
  status TEXT DEFAULT 'available',          -- "available" | "reserved" | "allocated" | "sold" | "parked"
  registration_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  
  -- DNS & Resolution
  dns_configured BOOLEAN DEFAULT FALSE,
  a_record_ip TEXT,
  web2_mirrored BOOLEAN DEFAULT FALSE,
  resolution_status TEXT,
  
  -- Blockchain
  nft_token_id TEXT,
  blockchain_tx_hash TEXT,
  
  -- Category
  category TEXT,                            -- "trades" | "tech" | "health" | etc.
  
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tld_id, domain_name)
);
```

### Table: `tld_pricing_tiers`
```sql
CREATE TABLE tld_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld_id UUID REFERENCES owned_tlds(id),
  tier_name TEXT NOT NULL,                  -- "standard" | "premium" | "ultra_premium"
  min_length INT,                           -- Min domain length for tier
  max_length INT,
  base_price_usd NUMERIC NOT NULL,
  base_price_xdk NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `tld_domain_sales`
```sql
CREATE TABLE tld_domain_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID NOT NULL REFERENCES tld_registered_domains(id),
  buyer_user_id UUID REFERENCES auth.users,
  buyer_wallet_address TEXT,
  
  sale_price_xdk NUMERIC NOT NULL,
  sale_price_usd NUMERIC NOT NULL,
  payment_method TEXT,                      -- "xodiak" | "stripe" | "manual"
  payment_tx_hash TEXT,
  payment_status TEXT DEFAULT 'pending',
  
  -- Revenue split
  platform_fee_percent NUMERIC DEFAULT 10,
  platform_fee_amount NUMERIC,
  
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `tld_priority_domains`
```sql
CREATE TABLE tld_priority_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tld_id UUID REFERENCES owned_tlds(id),
  domain_name TEXT NOT NULL,
  category TEXT,
  suggested_price_usd NUMERIC,
  notes TEXT,
  is_reserved BOOLEAN DEFAULT TRUE,
  added_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Files to Create

### Pages
| File | Purpose |
|------|---------|
| `src/pages/TLDRegistry.tsx` | Main TLD management dashboard |
| `src/pages/DomainMarketplace.tsx` | Public domain purchase marketplace |
| `src/pages/DomainMarketplaceCheckout.tsx` | XDK payment checkout for domains |

### Components
| File | Purpose |
|------|---------|
| `src/components/tld/TLDCard.tsx` | Display card for each owned TLD |
| `src/components/tld/TLDDomainList.tsx` | List of domains under a TLD |
| `src/components/tld/AddTLDDialog.tsx` | Dialog to add new TLD |
| `src/components/tld/MintDomainDialog.tsx` | Create/register new domain |
| `src/components/tld/DomainPricingEditor.tsx` | Set/edit domain prices |
| `src/components/tld/PriorityDomainsPanel.tsx` | Manage priority domain list |
| `src/components/tld/AssignDomainDialog.tsx` | Assign domain to business/initiative |
| `src/components/tld/DomainSalesHistory.tsx` | View sales and revenue |
| `src/components/marketplace/DomainSearchCard.tsx` | Search available domains |
| `src/components/marketplace/DomainPurchaseCard.tsx` | Purchase flow for domain |
| `src/components/marketplace/XdkDomainPayment.tsx` | XODIAK payment integration |

### Edge Functions
| Function | Purpose |
|----------|---------|
| `tld-register-domain` | Register/mint a new domain |
| `tld-configure-dns` | Configure DNS for web2 resolution |
| `tld-purchase-domain` | Handle domain purchase via XDK |
| `tld-assign-domain` | Assign domain to business/entity |
| `tld-sync-blockchain` | Sync ownership from blockchain |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes for `/tld-registry` and `/domain-marketplace` |
| `src/components/layout/Sidebar.tsx` | Add TLD Registry navigation item |
| `src/components/business/DomainManagement.tsx` | Add option to use `.globalnet` domains |
| `supabase/config.toml` | Add new edge function configurations |

---

## XODIAK Wallet Integration

The domain marketplace will use your existing XODIAK infrastructure:

1. **Buyer connects wallet** (via `WalletConnector` component)
2. **Price displayed in XDK** (using `xdk_exchange_rates` for USD conversion)
3. **Payment via `xodiak-chain-core`** edge function with `submit-transaction`
4. **Sale recorded** in `tld_domain_sales` with blockchain tx hash
5. **Domain transferred** to buyer's wallet as NFT (for Web3 TLDs)

Payment Flow:
```text
Buyer selects domain → Connects XDK wallet → 
Transfer XDK to Platform Treasury → 
Domain ownership updated → 
NFT minted to buyer (Freename API)
```

---

## Priority Domains Pre-Population

When you set up the system, these categories will be pre-populated in `tld_priority_domains`:

**Trades (30+ domains):**
roofing, electrical, plumbing, hvac, construction, contracting, welding, carpentry, masonry, landscaping, painting, flooring, concrete, demolition, excavation, fencing, gutters, insulation, drywall, siding, windows, doors, garage, foundation, waterproofing, restoration, remodeling, handyman, maintenance, inspection

**Technology (20+ domains):**
nano, quantum, datacenter, cloud, ai, robotics, automation, blockchain, cyber, iot, biotech, fintech, proptech, healthtech, edtech, cleantech, agritech, spacetech, deeptech, hardtech

**Vehicles & Transport (15+ domains):**
cars, trucks, transportation, logistics, fleet, aviation, maritime, rail, freight, delivery, shipping, cargo, dispatch, routing, telematics

**Ultra Premium (Reserved for $10M+ sales):**
nike, google, apple, microsoft, amazon, tesla, meta, nvidia, openai, anthropic, spacex, oracle, ibm, intel, cisco, adobe, salesforce, netflix, disney, spotify

---

## Pricing Tiers

Default pricing structure (editable):

| Tier | Domain Length | Price (USD) | Price (XDK) |
|------|---------------|-------------|-------------|
| Ultra Premium | N/A (brand names) | $1,000,000 - $100,000,000 | Same (1:1) |
| Premium | 1-3 chars | $50,000 | 50,000 XDK |
| Standard+ | 4-5 chars | $5,000 | 5,000 XDK |
| Standard | 6-10 chars | $500 | 500 XDK |
| Basic | 11+ chars | $50 | 50 XDK |

**Internal allocations are always FREE** - just mark as "internal" owner type.

---

## User Experience

### For You (Admin)
1. Go to `/tld-registry`
2. See `.globalnet` TLD card with stats
3. Browse/add priority domains
4. Allocate `thebdapp.globalnet` to your platform (FREE)
5. Set `nike.globalnet` price to $10,000,000
6. View sales revenue dashboard

### For External Buyers
1. Go to `/domain-marketplace`
2. Search "roofing.globalnet"
3. See price: 500 XDK ($500)
4. Connect XODIAK wallet
5. Confirm purchase
6. Domain transferred to their wallet

---

## Integration with Spawned Businesses

When spawning a new business, the flow will include:

1. Generate business name: "Elite Roofing Solutions"
2. **NEW**: Check if `eliteroofing.globalnet` is available
3. Offer to allocate the domain (free for internal use)
4. Configure DNS to point to platform infrastructure
5. Business launches at both:
   - `eliteroofing.bizdev.app` (platform subdomain)
   - `eliteroofing.globalnet` (Web3 TLD)

---

## Implementation Phases

### Phase 1: Foundation (This Implementation)
- Database tables for TLD management
- TLD Registry dashboard page
- Priority domains list with categories
- Domain registration (internal allocation)
- Pricing tier system

### Phase 2: Marketplace
- Public marketplace page
- XODIAK payment integration
- Sales tracking and revenue

### Phase 3: Freename Integration
- Connect to Freename API (when ready to link TLD)
- NFT minting for sold domains
- Web2 DNS mirroring via Freename

### Phase 4: Business Integration
- Auto-suggest `.globalnet` domains during business spawn
- One-click domain allocation
- DNS auto-configuration

---

## Next Steps After Approval

1. Create database tables with migrations
2. Build TLD Registry page and components
3. Pre-populate priority domains list
4. Set up pricing tiers
5. Integrate with XODIAK wallet for payments
6. Ready to demo to Jason Lopez!
