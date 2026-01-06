import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface MarketplaceListing {
  id: string;
  workflow_id: string;
  publisher_id: string;
  name: string;
  description: string | null;
  long_description: string | null;
  category: string;
  tags: string[];
  pricing_model: string;
  price_cents: number;
  currency: string;
  subscription_interval: string | null;
  status: string;
  compliance_level: string;
  version: string;
  icon_url: string | null;
  preview_images: string[];
  documentation_url: string | null;
  total_installs: number;
  total_runs: number;
  average_rating: number;
  review_count: number;
  featured: boolean;
  published_at: string | null;
  created_at: string;
}

export interface MarketplaceSubscription {
  id: string;
  listing_id: string;
  user_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  usage_count: number;
  usage_limit: number | null;
  listing?: MarketplaceListing;
}

export interface MarketplaceReview {
  id: string;
  listing_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
}

export function useWorkflowMarketplace() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch published marketplace listings
  const { data: listings = [], isLoading: isLoadingListings } = useQuery({
    queryKey: ["workflow-marketplace-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_marketplace_listings")
        .select("*")
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("total_installs", { ascending: false });

      if (error) throw error;
      return data as MarketplaceListing[];
    },
  });

  // Fetch user's listings (as publisher)
  const { data: myListings = [], isLoading: isLoadingMyListings } = useQuery({
    queryKey: ["workflow-marketplace-my-listings", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_marketplace_listings")
        .select("*")
        .eq("publisher_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MarketplaceListing[];
    },
  });

  // Fetch user's subscriptions
  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ["workflow-subscriptions", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_subscriptions")
        .select(`
          *,
          listing:workflow_marketplace_listings(*)
        `)
        .eq("user_id", user!.id)
        .eq("status", "active");

      if (error) throw error;
      return data as MarketplaceSubscription[];
    },
  });

  // Fetch reviews for a listing
  const fetchReviews = async (listingId: string) => {
    const { data, error } = await supabase
      .from("workflow_marketplace_reviews")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as MarketplaceReview[];
  };

  // Create a marketplace listing
  const createListing = useMutation({
    mutationFn: async (listing: {
      workflow_id: string;
      name: string;
      description?: string;
      long_description?: string;
      category: string;
      tags?: string[];
      pricing_model: string;
      price_cents?: number;
      compliance_level?: string;
    }) => {
      const { data, error } = await supabase
        .from("workflow_marketplace_listings")
        .insert({
          ...listing,
          publisher_id: user!.id,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-marketplace-my-listings"] });
      toast.success("Listing created as draft");
    },
    onError: (error: any) => {
      toast.error(`Failed to create listing: ${error.message}`);
    },
  });

  // Update a listing
  const updateListing = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MarketplaceListing> }) => {
      const { data, error } = await supabase
        .from("workflow_marketplace_listings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-marketplace-my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-marketplace-listings"] });
      toast.success("Listing updated");
    },
    onError: (error: any) => {
      toast.error(`Failed to update listing: ${error.message}`);
    },
  });

  // Publish a listing (submit for review or publish directly)
  const publishListing = useMutation({
    mutationFn: async (listingId: string) => {
      const { data, error } = await supabase
        .from("workflow_marketplace_listings")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", listingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-marketplace-my-listings"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-marketplace-listings"] });
      toast.success("Workflow published to marketplace!");
    },
    onError: (error: any) => {
      toast.error(`Failed to publish: ${error.message}`);
    },
  });

  // Subscribe to a workflow
  const subscribe = useMutation({
    mutationFn: async (listingId: string) => {
      // First get current install count
      const { data: listing } = await supabase
        .from("workflow_marketplace_listings")
        .select("total_installs")
        .eq("id", listingId)
        .single();

      const { data, error } = await supabase
        .from("workflow_subscriptions")
        .insert({
          listing_id: listingId,
          user_id: user!.id,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      // Increment install count
      await supabase
        .from("workflow_marketplace_listings")
        .update({ total_installs: (listing?.total_installs || 0) + 1 })
        .eq("id", listingId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-marketplace-listings"] });
      toast.success("Subscribed to workflow!");
    },
    onError: (error: any) => {
      toast.error(`Failed to subscribe: ${error.message}`);
    },
  });

  // Add a review
  const addReview = useMutation({
    mutationFn: async (review: {
      listing_id: string;
      rating: number;
      title?: string;
      review_text?: string;
    }) => {
      // Check if user has subscription (verified purchase)
      const { data: subscription } = await supabase
        .from("workflow_subscriptions")
        .select("id")
        .eq("listing_id", review.listing_id)
        .eq("user_id", user!.id)
        .single();

      const { data, error } = await supabase
        .from("workflow_marketplace_reviews")
        .insert({
          ...review,
          user_id: user!.id,
          verified_purchase: !!subscription,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("You've already reviewed this workflow");
      } else {
        toast.error(`Failed to submit review: ${error.message}`);
      }
    },
  });

  // Helper functions
  const getListingsByCategory = (category: string) => 
    listings.filter(l => l.category === category);

  const getFeaturedListings = () => 
    listings.filter(l => l.featured);

  const searchListings = (query: string) =>
    listings.filter(l => 
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.description?.toLowerCase().includes(query.toLowerCase()) ||
      l.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    );

  const isSubscribed = (listingId: string) =>
    subscriptions.some(s => s.listing_id === listingId);

  return {
    listings,
    myListings,
    subscriptions,
    isLoading: isLoadingListings || isLoadingMyListings || isLoadingSubscriptions,
    createListing,
    updateListing,
    publishListing,
    subscribe,
    addReview,
    fetchReviews,
    getListingsByCategory,
    getFeaturedListings,
    searchListings,
    isSubscribed,
  };
}
