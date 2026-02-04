import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ReferralCode {
  code: string;
  total_referrals: number;
  total_lifetime_earnings: number;
}

interface Referral {
  id: string;
  referred_id: string;
  created_at: string;
  total_earnings: number;
  referred_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useReferrals() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchReferralData = async () => {
      try {
        // Fetch user's referral code
        const { data: codeData, error: codeError } = await supabase
          .from("referral_codes")
          .select("code, total_referrals, total_lifetime_earnings")
          .eq("user_id", user.id)
          .single();

        if (codeData && !codeError) {
          setReferralCode(codeData);
        }

        // Fetch referrals made by this user
        const { data: referralsData, error: referralsError } = await supabase
          .from("referrals")
          .select("id, referred_id, created_at, total_earnings")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });

        if (referralsData && !referralsError) {
          // Fetch profile data for each referral
          const referralsWithProfiles = await Promise.all(
            referralsData.map(async (referral) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", referral.referred_id)
                .single();
              
              return {
                ...referral,
                referred_profile: profile || undefined
              };
            })
          );
          
          setReferrals(referralsWithProfiles);
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralData();
  }, [user]);

  const getReferralLink = () => {
    if (!referralCode) return null;
    return `${window.location.origin}/?ref=${referralCode.code}`;
  };

  const copyReferralLink = async () => {
    const link = getReferralLink();
    if (link) {
      await navigator.clipboard.writeText(link);
      return true;
    }
    return false;
  };

  return {
    referralCode,
    referrals,
    loading,
    getReferralLink,
    copyReferralLink
  };
}
