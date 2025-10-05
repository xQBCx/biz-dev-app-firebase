import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  Building2,
  Award,
  Users,
  Calendar,
  Globe,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  GraduationCap,
  CheckCircle2,
  Star,
} from "lucide-react";
import { useState } from "react";
import { FranchiseApplicationModal } from "./FranchiseApplicationModal";
import { FranchiseReviews } from "./FranchiseReviews";
import { WriteReviewModal } from "./WriteReviewModal";
import { FranchiseApplicationsList } from "./FranchiseApplicationsList";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface FranchiseDetailsModalProps {
  franchise: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function FranchiseDetailsModal({
  franchise,
  open,
  onOpenChange,
  onUpdate,
}: FranchiseDetailsModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const isOwner = user && franchise.user_id === user.id;

  if (!franchise) return null;

  const handleReviewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["franchise-reviews", franchise.id] });
    queryClient.invalidateQueries({ queryKey: ["franchises"] });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {/* Banner */}
            {franchise.banner_url && (
              <div className="relative -mx-6 -mt-6 h-48 mb-6">
                <img
                  src={franchise.banner_url}
                  alt={franchise.brand_name}
                  className="w-full h-full object-cover"
                />
                {franchise.logo_url && (
                  <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-lg border-4 border-background bg-card overflow-hidden shadow-lg">
                    <img
                      src={franchise.logo_url}
                      alt={franchise.brand_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            <div className={franchise.banner_url ? "mt-10" : ""}>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-3xl mb-2">{franchise.brand_name}</DialogTitle>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary">{franchise.industry}</Badge>
                    {franchise.is_featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>
                </div>
                <Button size="lg" onClick={() => setShowApplicationModal(true)}>
                  Apply Now
                </Button>
              </div>
              <p className="text-muted-foreground">{franchise.description}</p>
            </div>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className={`grid w-full ${isOwner ? 'grid-cols-6' : 'grid-cols-5'}`}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="investment">Investment</TabsTrigger>
              <TabsTrigger value="support">Support & Training</TabsTrigger>
              <TabsTrigger value="sops">SOPs</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              {isOwner && <TabsTrigger value="applications">Applications</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <Building2 className="w-8 h-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{franchise.total_units || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Units</p>
                </Card>
                <Card className="p-4">
                  <Calendar className="w-8 h-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{franchise.year_established || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Established</p>
                </Card>
                <Card className="p-4">
                  <Award className="w-8 h-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{franchise.franchise_since || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Franchising Since</p>
                </Card>
                <Card className="p-4">
                  <MapPin className="w-8 h-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">{franchise.territories_available || 0}</p>
                  <p className="text-xs text-muted-foreground">Territories Available</p>
                </Card>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {franchise.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <a
                        href={franchise.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {franchise.website}
                      </a>
                    </div>
                  )}
                  {franchise.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <a href={`mailto:${franchise.contact_email}`} className="hover:underline">
                        {franchise.contact_email}
                      </a>
                    </div>
                  )}
                  {franchise.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <a href={`tel:${franchise.contact_phone}`} className="hover:underline">
                        {franchise.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="investment" className="space-y-6 mt-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Investment Details
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Total Investment Range</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(franchise.investment_min)} - {formatCurrency(franchise.investment_max)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">Franchise Fee</span>
                    <span className="font-semibold">{formatCurrency(franchise.franchise_fee)}</span>
                  </div>
                  {franchise.royalty_fee_percent && (
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-muted-foreground">Ongoing Royalty</span>
                      <span className="font-semibold">{franchise.royalty_fee_percent}%</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Financial Support Available</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with our funding partners to explore financing options for your franchise investment.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6 mt-6">
              {franchise.training_provided && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Training Program
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Comprehensive training provided</span>
                    </div>
                    {franchise.training_duration_weeks && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>{franchise.training_duration_weeks} weeks of initial training</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {franchise.support_provided && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Ongoing Support
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {franchise.support_provided}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sops" className="space-y-6 mt-6">
              {franchise.sop_content ? (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Standard Operating Procedures</h3>
                  <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                    {franchise.sop_content}
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    SOPs will be provided to approved franchisees during the onboarding process.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{franchise.rating?.toFixed(1) || "0.0"}</span>
                  </div>
                  <span className="text-muted-foreground">overall rating</span>
                </div>
                {user && (
                  <Button onClick={() => setShowReviewModal(true)}>
                    <Star className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                )}
              </div>
              
              <FranchiseReviews franchiseId={franchise.id} />
            </TabsContent>

            {isOwner && (
              <TabsContent value="applications" className="space-y-6 mt-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">Applications Received</h3>
                  <p className="text-sm text-muted-foreground">
                    Review and manage applications from interested franchisees
                  </p>
                </div>
                <FranchiseApplicationsList franchiseId={franchise.id} />
              </TabsContent>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>

      <FranchiseApplicationModal
        franchise={franchise}
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
        onSuccess={() => {
          setShowApplicationModal(false);
          onUpdate?.();
        }}
      />

      <WriteReviewModal
        franchiseId={franchise.id}
        franchiseName={franchise.brand_name}
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        onSuccess={handleReviewSuccess}
      />
    </>
  );
}
