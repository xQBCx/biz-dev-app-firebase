import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, TrendingUp, Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const ForVenues = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              List Your Venue on LIIVE
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Showcase your venue with live video feeds, manage reservations effortlessly, 
              and send instant promotional alerts to drive traffic during slow hours or promote special events.
            </p>
            <Button size="lg" className="gap-2" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </section>

          {/* Features Grid */}
          <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Live Video Streaming</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stream your venue in real-time to attract customers looking for the perfect spot.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Flash Deal Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Send instant promotional alerts to nearby users. Drive traffic during quiet hours with special offers and announcements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Increase Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get discovered by customers searching for venues with the vibe they want. Boost foot traffic when you need it most.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Seamless Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Accept table bookings, bottle service requests, and VIP reservations—all managed in one streamlined dashboard.
                </CardDescription>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="bg-primary/5 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to showcase your venue?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Join LIIVE today and connect with customers in real-time. Manage bookings, send promotional alerts, 
              and showcase your venue's energy to drive more foot traffic.
            </p>
            <Button size="lg" variant="default" asChild>
              <Link to="/auth">List Your Venue</Link>
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ForVenues;
