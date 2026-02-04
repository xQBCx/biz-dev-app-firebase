/**
 * CSV Template for Domain Portfolio Import
 * 
 * This generates a downloadable CSV template that admins can use
 * to bulk-upload domains to the digital asset portfolio.
 */

export const generateDomainCSVTemplate = () => {
  const headers = [
    "domain_name",
    "category",
    "estimated_value_low",
    "estimated_value_high",
    "strategic_role",
    "description"
  ];

  const exampleRows = [
    [
      "nanohealth.com",
      "brand",
      "50000",
      "150000",
      "Primary brand domain for health products",
      "Premium .com domain for Nano health and wellness product line"
    ],
    [
      "nanorx.com",
      "product",
      "40000",
      "120000",
      "Pharmaceutical product namespace",
      "Direct match to NANO RX® trademark for pharma applications"
    ],
    [
      "nanodose.io",
      "scientific",
      "15000",
      "45000",
      "Research and dosing technology",
      "Technical domain for precision dosing innovation"
    ],
    [
      "buynanoproducts.com",
      "ecommerce",
      "8000",
      "25000",
      "Future e-commerce channel",
      "Direct-to-consumer sales platform domain"
    ],
  ];

  const csvContent = [
    headers.join(","),
    ...exampleRows.map(row => row.join(","))
  ].join("\n");

  return csvContent;
};

export const downloadDomainCSVTemplate = () => {
  const csvContent = generateDomainCSVTemplate();
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "domain-portfolio-template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Valuation formulas that lenders typically use for domain portfolios
 */
export const domainValuationFormulas = {
  brandMatch: {
    name: "Brand Match Premium",
    description: "Domains that exactly match registered trademarks carry 3-5x premium over comparable generic domains",
    example: "nanohealth.com matches NANO® trademark = $50K-$150K base value"
  },
  
  categoryKiller: {
    name: "Category-Defining Domain",
    description: "Single-word or two-word .com domains in health/tech sectors valued at $100K-$1M+",
    example: "nano.health or nanotech.com"
  },
  
  defensiveValue: {
    name: "Defensive Portfolio Value",
    description: "Bulk domain portfolios protecting brand variants valued at 20-40% of primary domain value",
    example: "400 NANO variants = defensive moat worth $2M-$8M collectively"
  },
  
  licensingPotential: {
    name: "Subdomain Licensing Revenue",
    description: "TLD ownership enables $500-$5000/year per subdomain license",
    example: ".nano TLD with 1000 subdomains = $500K-$5M annual recurring revenue"
  },
  
  comparableSales: {
    name: "Comparable Sales Method",
    description: "Recent sales of similar health/wellness domains inform valuations",
    example: "wellness.com sold for $3M, cbd.com for $3.5M, health.com estimated $10M+"
  }
};

/**
 * Narrative specifically for .nano TLD acquisition
 */
export const nanoTLDInvestorNarrative = `
# Acquiring the .nano Top-Level Domain (TLD)

## Strategic Rationale

The acquisition of the .nano TLD represents a transformational digital infrastructure play that fundamentally expands the monetization capacity and brand sovereignty of the entire NANO IP ecosystem.

## Market Context

Top-level domains are the highest level of domain names in the DNS hierarchy (.com, .org, .health, etc.). Custom TLDs have become increasingly valuable as digital infrastructure assets:

- **Precedent Sales**: .luxury sold for $10M+, .shop for $42M, .gay for $500K
- **.nano Status**: Currently operated by ICANN-approved registrars
- **Acquisition Path**: Available through private acquisition or ICANN secondary market

## Value Drivers

### 1. Brand Sovereignty
- Complete control over the .nano namespace globally
- No risk of brand confusion or cybersquatting
- Defensive protection across all NANO trademarks

### 2. Subdomain Licensing Infrastructure
- Create ecosystem of licensed subdomains (brand.nano, product.nano, research.nano)
- Pricing model: $500-$5,000/year per subdomain license
- Conservative model: 1,000 subdomains = $500K-$5M annual recurring revenue
- Aggressive model: 10,000+ subdomains = $5M-$50M ARR at scale

### 3. Tokenization Layer Foundation
- Every .nano subdomain becomes a tokenizable digital asset
- Enables Web3 integration and blockchain-native identity
- Future revenue: NFT-based domain ownership, smart contract licensing

### 4. Enterprise-Grade Digital Infrastructure
- R&D institutions, healthcare providers, and product manufacturers can operate on .nano
- Positions NANO as category-defining standard (similar to .health, .tech)
- Increases trust and legitimacy for IP-backed lending

## Financial Modeling

**Acquisition Cost**: $50K-$250K (based on comparable TLD sales)

**Year 1-2 Revenue**: $100K-$500K (200-500 early adopter subdomains)

**Year 3-5 Revenue**: $1M-$10M (2,000-10,000 subdomains as ecosystem scales)

**Exit Multiple**: 5-15x ARR for domain infrastructure businesses

**Projected Asset Value in 5 Years**: $5M-$150M

## Integration with IP Trust

The .nano TLD acquisition strengthens the IP Trust's collateral base by:

1. Adding a cash-flowing digital infrastructure asset
2. Expanding the defensive moat around NANO trademarks
3. Creating a scalable, recurring revenue stream that supports debt service
4. Increasing replacement cost valuation (lenders favor assets with operational infrastructure)

## Lender Confidence Factors

- **Tangible Asset**: TLD ownership is a registered, enforceable property right
- **Revenue Visibility**: Subdomain licensing creates predictable cash flow
- **Market Comparables**: Recent TLD sales establish clear valuation benchmarks
- **Synergy with Trademarks**: Reinforces the overall IP collateral package

## Conclusion

Acquiring .nano is not a speculative play—it is a strategic infrastructure investment that materially enhances the NANO IP Trust's ability to secure favorable financing terms, generate licensing revenue, and establish category leadership in the global health and wellness technology market.
`;
