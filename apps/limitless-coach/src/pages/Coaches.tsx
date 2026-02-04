import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft, Search, Star, MapPin, Filter,
  Dumbbell, CheckCircle, Loader2, LayoutDashboard
} from "lucide-react";

type Coach = {
  id: string;
  full_name: string;
  bio: string | null;
  rating: number | null;
  review_count: number | null;
  location: string | null;
  specialties: string[] | null;
  session_price: number;
  avatar_url: string | null;
  featured: boolean | null;
};

const Coaches = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch coaches
      const { data, error } = await supabase
        .from('coach_profiles')
        .select('id, full_name, bio, rating, review_count, location, specialties, session_price, avatar_url, featured')
        .eq('status', 'approved')
        .order('featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching coaches:', error);
      } else {
        setCoaches(data || []);
      }

      // Check if current user is an approved coach
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: coachProfile } = await supabase
          .from('coach_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('status', 'approved')
          .maybeSingle();
        
        setIsCoach(!!coachProfile);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const allSpecialties = Array.from(
    new Set(coaches.flatMap(c => c.specialties || []))
  ).sort();

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = coach.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coach.specialties || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || (coach.specialties || []).includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">Find a Coach</h1>
              <p className="text-primary-foreground/70 text-sm">
                Work with expert trainers in-person or online
              </p>
            </div>
            </div>
            {isCoach && (
              <Button
                variant="secondary"
                onClick={() => navigate('/coach-dashboard')}
                className="mt-4"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Coach Dashboard
              </Button>
            )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Filters */}
            {allSpecialties.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                <Button
                  variant={selectedSpecialty === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSpecialty(null)}
                  className="flex-shrink-0"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  All
                </Button>
                {allSpecialties.map(specialty => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpecialty(specialty)}
                    className="flex-shrink-0"
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            )}

            {/* Results count */}
            <p className="text-muted-foreground text-sm mb-4">
              {filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''} found
            </p>

            {/* Coach Cards */}
            {filteredCoaches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCoaches.map(coach => (
                  <Card 
                    key={coach.id}
                    className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                      coach.featured ? 'border-2 border-accent' : ''
                    }`}
                    onClick={() => navigate(`/coach/${coach.id}`)}
                  >
                    <CardContent className="p-0">
                      {/* Coach Avatar/Header */}
                      <div className={`h-24 flex items-center justify-center relative ${
                        coach.featured 
                          ? 'bg-gradient-to-br from-primary to-primary/80' 
                          : 'bg-gradient-to-br from-muted to-muted/80'
                      }`}>
                        {coach.avatar_url ? (
                          <img 
                            src={coach.avatar_url} 
                            alt={coach.full_name} 
                            className="w-16 h-16 rounded-full object-cover object-top border-2 border-accent"
                          />
                        ) : (
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                            coach.featured 
                              ? 'bg-accent text-accent-foreground' 
                              : 'bg-background text-foreground'
                          }`}>
                            {coach.full_name.charAt(0)}
                          </div>
                        )}
                        {coach.featured && (
                          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground">
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Coach Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-1">
                              {coach.full_name}
                              {coach.featured && (
                                <CheckCircle className="h-4 w-4 text-accent" />
                              )}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="font-medium text-foreground">{coach.rating || 5.0}</span>
                            <span>({coach.review_count || 0})</span>
                          </div>
                          {coach.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{coach.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-4">
                          {(coach.specialties || []).slice(0, 3).map(specialty => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {(coach.specialties || []).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(coach.specialties || []).length - 3}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold">
                            ${coach.session_price}<span className="text-sm font-normal text-muted-foreground">/session</span>
                          </p>
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Coaches Available Yet</h3>
                <p className="text-muted-foreground mb-4">
                  We're building our coach network. Check back soon or become our first coach partner!
                </p>
              </Card>
            )}
          </>
        )}

        {/* CTA for becoming a coach */}
        <Card className="mt-8 border-2 border-accent bg-gradient-to-br from-primary/5 to-accent/10">
          <CardContent className="p-8 text-center">
            <Dumbbell className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="font-display font-bold text-2xl mb-3">Become a Coach Partner</h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Are you a certified trainer ready to grow your business? Join the Limitless Coach network 
              to reach more clients, manage bookings, and build your brand.
            </p>
            <div className="space-y-3 text-left max-w-sm mx-auto mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm">Create your profile and set your rates</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm">Get discovered by clients in your area</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm">Manage availability and bookings in one place</span>
              </div>
            </div>
            <Button size="lg" onClick={() => navigate('/coach-register')} className="bg-accent hover:bg-accent/90">
              Apply to Become a Coach
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Coaches;