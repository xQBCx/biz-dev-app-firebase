import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import coachBillAvatar from "@/assets/coach-bill.png";

type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  raterName: string;
};

export const CoachSpotlight = () => {
  const navigate = useNavigate();
  const [coachData, setCoachData] = useState<{
    rating: number;
    reviewCount: number;
    specialties: string[];
  } | null>(null);
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    const fetchCoachData = async () => {
      // Fetch Coach Bill's profile
      const { data: coach } = await supabase
        .from('coach_profiles')
        .select('id, rating, review_count, specialties')
        .eq('full_name', 'Coach Bill')
        .eq('status', 'approved')
        .maybeSingle();

      if (coach) {
        setCoachData({
          rating: coach.rating || 5.0,
          reviewCount: coach.review_count || 0,
          specialties: coach.specialties || ["Strength", "Fat Loss", "Re-Entry", "Confidence", "Sober Fitness"]
        });

        // Fetch a featured testimonial for Coach Bill
        const { data: sessions } = await supabase
          .from('coach_sessions')
          .select('client_id, client_name')
          .eq('coach_id', coach.id)
          .eq('status', 'completed')
          .limit(10);

        if (sessions && sessions.length > 0) {
          const clientIds = sessions.map(s => s.client_id).filter(Boolean);
          
          if (clientIds.length > 0) {
            const { data: ratings } = await supabase
              .from('ratings')
              .select('id, rating, comment, rater_id')
              .eq('rating_type', 'coach_rating')
              .eq('featured', true)
              .in('rater_id', clientIds)
              .order('rating', { ascending: false })
              .limit(1);

            if (ratings && ratings.length > 0 && ratings[0].comment) {
              const session = sessions.find(s => s.client_id === ratings[0].rater_id);
              setTestimonial({
                id: ratings[0].id,
                rating: ratings[0].rating,
                comment: ratings[0].comment,
                raterName: session?.client_name?.split(' ')[0] || 'Client'
              });
            }
          }
        }
      }
    };

    fetchCoachData();
  }, []);

  const displayRating = coachData?.rating || 5.0;
  const displayReviewCount = coachData?.reviewCount || 0;
  const displaySpecialties = coachData?.specialties || ["Strength", "Fat Loss", "Re-Entry", "Confidence", "Sober Fitness"];

  return (
    <section className="py-16 sm:py-20 lg:py-24 2xl:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 2xl:gap-16 items-center">
          {/* Coach Info */}
          <div>
            <span className="inline-block px-3 sm:px-4 py-2 bg-accent/20 rounded-full text-accent text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              FEATURED COACH
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-display font-bold mb-4 sm:mb-6">
              Train with Bill
              <span className="block text-accent">Limitless Coach</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl 2xl:text-2xl text-primary-foreground/80 mb-4 sm:mb-6 leading-relaxed">
              No-BS coaching for people who are done making excuses. Whether you're getting back 
              into fitness after a break, building strength for the first time, or pushing past 
              a plateau—I'll meet you where you are and help you become limitless.
            </p>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= Math.round(displayRating) ? 'fill-accent text-accent' : 'text-accent/30'}`} 
                  />
                ))}
              </div>
              <span className="text-sm sm:text-base text-primary-foreground/70">
                {displayRating.toFixed(1)} rating {displayReviewCount > 0 && `• ${displayReviewCount} reviews`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
              {displaySpecialties.map((specialty) => (
                <span 
                  key={specialty}
                  className="px-2.5 sm:px-3 py-1 bg-white/10 rounded-full text-xs sm:text-sm 2xl:text-base"
                >
                  {specialty}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground group text-sm sm:text-base 2xl:text-lg"
              >
                Start with Bill's Program
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/coaches')}
                className="w-full sm:w-auto border-white/30 bg-white/10 text-foreground hover:bg-white/20 text-sm sm:text-base 2xl:text-lg"
              >
                Browse All Coaches
              </Button>
            </div>
          </div>

          {/* Coach Bill Avatar & Testimonial */}
          <div className="relative mt-8 lg:mt-0">
            <div className="flex justify-center mb-6">
              <img 
                src={coachBillAvatar} 
                alt="Coach Bill" 
                className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full object-cover object-top border-4 border-accent shadow-2xl"
              />
            </div>
            
            {testimonial ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-5 sm:p-6 lg:p-8 2xl:p-10">
                  <div className="flex mb-3 sm:mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${star <= testimonial.rating ? 'fill-accent text-accent' : 'text-accent/30'}`} 
                      />
                    ))}
                  </div>
                  <blockquote className="text-base sm:text-lg lg:text-xl 2xl:text-2xl text-primary-foreground/90 mb-4 sm:mb-6 italic">
                    "{testimonial.comment}"
                  </blockquote>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/30 flex items-center justify-center text-lg sm:text-xl font-bold">
                      {testimonial.raterName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{testimonial.raterName}</p>
                      <p className="text-xs sm:text-sm text-primary-foreground/60">Verified Client</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-5 sm:p-6 lg:p-8 2xl:p-10 text-center">
                  <p className="text-base sm:text-lg text-primary-foreground/80 mb-4">
                    Ready to transform your fitness journey?
                  </p>
                  <p className="text-sm text-primary-foreground/60">
                    Join the community and start your path to becoming limitless.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
