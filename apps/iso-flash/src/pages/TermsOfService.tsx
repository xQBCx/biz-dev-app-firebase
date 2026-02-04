import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" , year: "numeric" })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ISO Flash, you agree to be bound by these Terms of Service and our 
              Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ISO Flash is a platform that connects clients seeking photography services with photographers 
              offering on-demand sessions. We facilitate bookings, communication, and payments between parties 
              but are not a party to the photography services themselves.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>You may not use another person's account without permission</li>
              <li>You are responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Photographer Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you register as a photographer, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide professional and respectful service</li>
              <li>Set accurate availability and hourly rates</li>
              <li>Deliver photos as agreed during sessions</li>
              <li>Only use session photos in your portfolio with client consent</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Maintain appropriate insurance and licenses as required</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Client Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you use ISO Flash as a client, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Treat photographers with respect and professionalism</li>
              <li>Pay for sessions as agreed upon booking</li>
              <li>Provide accurate location information for sessions</li>
              <li>Arrive on time or provide reasonable notice for cancellations</li>
              <li>Not request inappropriate or illegal content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Payments and Fees</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All payments are processed through our secure payment system</li>
              <li>ISO Flash charges a service fee on each transaction</li>
              <li>Photographers set their own hourly rates</li>
              <li>Payments are released to photographers after session completion</li>
              <li>Refunds are handled on a case-by-case basis</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cancellations</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cancellation policies vary by photographer. Generally, cancellations made with less than 
              24 hours notice may be subject to a cancellation fee. Repeated no-shows may result in 
              account suspension.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Photo Rights and Licensing</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Clients receive a license to use photos for personal, non-commercial purposes</li>
              <li>Photographers retain copyright to their work unless otherwise agreed</li>
              <li>Portfolio usage requires explicit client consent during session setup</li>
              <li>Commercial licensing must be negotiated separately</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Prohibited Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Users may not:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Share inappropriate or offensive content</li>
              <li>Attempt to circumvent platform payments</li>
              <li>Create fake accounts or impersonate others</li>
              <li>Scrape or collect user data without permission</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              ISO Flash is a platform that facilitates connections between photographers and clients. 
              We are not responsible for the quality of photography services, disputes between users, 
              or any damages arising from use of our platform. Our liability is limited to the amount 
              of fees paid to us in the preceding 12 months.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless ISO Flash, its officers, directors, employees, 
              and agents from any claims, damages, or expenses arising from your use of the service 
              or violation of these terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms or for 
              any other reason at our discretion. You may delete your account at any time through 
              the app settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              Any disputes arising from these terms or use of ISO Flash will be resolved through 
              binding arbitration in accordance with the rules of the American Arbitration Association. 
              You waive the right to participate in class action lawsuits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these terms at any time. Continued use of ISO Flash after changes 
              constitutes acceptance of the new terms. We will notify users of significant changes 
              via email or in-app notification.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Email:</strong> legal@isoflash.app
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
