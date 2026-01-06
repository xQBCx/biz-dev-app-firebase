import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Package, 
  Car, 
  Users, 
  Briefcase, 
  Handshake,
  Laptop,
  Globe
} from "lucide-react";

export interface DealRoomTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  defaultIngredients: Array<{
    name: string;
    ingredient_type: string;
    description: string;
  }>;
  defaultFormulations: Array<{
    name: string;
    trigger_type: string;
    description: string;
  }>;
  suggestedParticipantRoles: string[];
}

export const dealRoomTemplates: DealRoomTemplate[] = [
  {
    id: "real-estate",
    name: "Real Estate Transaction",
    description: "For property sales, referral fees, and commission splits between agents, brokers, and referral partners.",
    category: "sales",
    icon: Building2,
    defaultIngredients: [
      { name: "Property Listing", ingredient_type: "customer_relationships", description: "Access to property or listing" },
      { name: "Buyer Network", ingredient_type: "customer_relationships", description: "Connection to qualified buyers" },
      { name: "Negotiation Expertise", ingredient_type: "industry_knowledge", description: "Deal closing skills" },
    ],
    defaultFormulations: [
      { name: "Commission Split", trigger_type: "sale_completed", description: "Split commission on closed sale" },
      { name: "Referral Fee", trigger_type: "qualified_meeting", description: "Fee for qualified buyer introduction" },
    ],
    suggestedParticipantRoles: ["Listing Agent", "Buyer Agent", "Referral Partner", "Broker"],
  },
  {
    id: "affiliate-sales",
    name: "Affiliate Partnership",
    description: "For affiliate marketers, referral partners, and resellers earning commissions on product/service sales.",
    category: "sales",
    icon: Globe,
    defaultIngredients: [
      { name: "Product/Service", ingredient_type: "software_module", description: "The product or service being sold" },
      { name: "Marketing Channel", ingredient_type: "customer_relationships", description: "Audience or distribution network" },
      { name: "Sales Infrastructure", ingredient_type: "execution_resources", description: "Payment processing, fulfillment" },
    ],
    defaultFormulations: [
      { name: "Sales Commission", trigger_type: "sale_completed", description: "Percentage of gross revenue" },
      { name: "Qualified Lead Fee", trigger_type: "qualified_meeting", description: "Fee for qualified leads" },
    ],
    suggestedParticipantRoles: ["Product Owner", "Affiliate Partner", "Sales Rep", "Marketing Partner"],
  },
  {
    id: "vehicle-sale",
    name: "Vehicle Sale",
    description: "For car dealers, private sales, and finder fees in vehicle transactions.",
    category: "sales",
    icon: Car,
    defaultIngredients: [
      { name: "Vehicle", ingredient_type: "other", description: "The vehicle being sold" },
      { name: "Buyer Connection", ingredient_type: "customer_relationships", description: "Access to qualified buyers" },
      { name: "Financing", ingredient_type: "capital", description: "Financing or payment facilitation" },
    ],
    defaultFormulations: [
      { name: "Finder Fee", trigger_type: "sale_completed", description: "Fee for connecting buyer and seller" },
      { name: "Sales Commission", trigger_type: "sale_completed", description: "Commission on completed sale" },
    ],
    suggestedParticipantRoles: ["Seller", "Finder", "Buyer Representative", "Finance Partner"],
  },
  {
    id: "service-referral",
    name: "Service Referral",
    description: "For connecting service providers (contractors, consultants, professionals) with paying customers.",
    category: "services",
    icon: Users,
    defaultIngredients: [
      { name: "Service Provider", ingredient_type: "execution_resources", description: "The professional providing service" },
      { name: "Customer Access", ingredient_type: "customer_relationships", description: "Connection to customers needing service" },
      { name: "Quality Assurance", ingredient_type: "governance_framework", description: "Vetting and quality control" },
    ],
    defaultFormulations: [
      { name: "Referral Commission", trigger_type: "invoice_paid", description: "Percentage of first invoice" },
      { name: "Introduction Fee", trigger_type: "qualified_meeting", description: "Fixed fee for introduction" },
    ],
    suggestedParticipantRoles: ["Service Provider", "Referrer", "Account Manager", "Quality Reviewer"],
  },
  {
    id: "technology-partnership",
    name: "Technology Partnership",
    description: "For SaaS resellers, technology integrators, and software distribution partnerships.",
    category: "platform_build",
    icon: Laptop,
    defaultIngredients: [
      { name: "Technology Platform", ingredient_type: "software_module", description: "The software or SaaS product" },
      { name: "Distribution Channel", ingredient_type: "customer_relationships", description: "Market access and sales channel" },
      { name: "Integration Expertise", ingredient_type: "industry_knowledge", description: "Technical implementation skills" },
    ],
    defaultFormulations: [
      { name: "Revenue Share", trigger_type: "sale_completed", description: "Percentage of subscription revenue" },
      { name: "Implementation Fee Split", trigger_type: "milestone_reached", description: "Share of implementation fees" },
    ],
    suggestedParticipantRoles: ["Technology Provider", "Reseller", "Implementation Partner", "Support Partner"],
  },
  {
    id: "joint-venture",
    name: "Joint Venture",
    description: "For combining resources, IP, and expertise to create new products or services together.",
    category: "joint_venture",
    icon: Handshake,
    defaultIngredients: [
      { name: "Core IP/Technology", ingredient_type: "software_module", description: "Primary intellectual property" },
      { name: "Market Expertise", ingredient_type: "industry_knowledge", description: "Industry knowledge and positioning" },
      { name: "Capital Investment", ingredient_type: "capital", description: "Financial resources contributed" },
      { name: "Execution Team", ingredient_type: "execution_resources", description: "People and operational capacity" },
    ],
    defaultFormulations: [
      { name: "Profit Distribution", trigger_type: "periodic", description: "Regular profit sharing" },
      { name: "Exit Proceeds", trigger_type: "manual", description: "Distribution on exit event" },
    ],
    suggestedParticipantRoles: ["Technology Partner", "Capital Partner", "Operations Partner", "Market Partner"],
  },
  {
    id: "consulting-project",
    name: "Consulting Project",
    description: "For team-based consulting engagements with multiple contributors and specialists.",
    category: "services",
    icon: Briefcase,
    defaultIngredients: [
      { name: "Lead Consultant", ingredient_type: "industry_knowledge", description: "Primary expertise and client relationship" },
      { name: "Subject Matter Expert", ingredient_type: "industry_knowledge", description: "Specialized technical knowledge" },
      { name: "Project Management", ingredient_type: "governance_framework", description: "Coordination and delivery" },
    ],
    defaultFormulations: [
      { name: "Retainer Split", trigger_type: "periodic", description: "Monthly retainer distribution" },
      { name: "Project Milestone", trigger_type: "milestone_reached", description: "Payments on deliverable completion" },
    ],
    suggestedParticipantRoles: ["Lead Consultant", "Specialist", "Project Manager", "Support Staff"],
  },
  {
    id: "custom",
    name: "Custom Deal Room",
    description: "Start from scratch and define your own ingredients, formulations, and participants.",
    category: "other",
    icon: Package,
    defaultIngredients: [],
    defaultFormulations: [],
    suggestedParticipantRoles: [],
  },
];

interface DealRoomTemplateCardProps {
  template: DealRoomTemplate;
  selected: boolean;
  onSelect: () => void;
}

export const DealRoomTemplateCard = ({ 
  template, 
  selected, 
  onSelect 
}: DealRoomTemplateCardProps) => {
  const Icon = template.icon;

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
        selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${selected ? "bg-primary/20" : "bg-muted"}`}>
          <Icon className={`w-5 h-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium">{template.name}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {template.description}
          </p>
          {template.defaultFormulations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.defaultFormulations.slice(0, 2).map((form, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {form.name}
                </Badge>
              ))}
              {template.defaultFormulations.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{template.defaultFormulations.length - 2} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
