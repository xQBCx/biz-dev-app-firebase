import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { XRepairxLogo } from "@/components/XRepairxLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <XRepairxLogo size="sm" />
          </Link>
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertTriangle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Page not found. The route you're looking for doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/request-support">Request Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
