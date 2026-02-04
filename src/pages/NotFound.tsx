import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center px-6">
          <h1 className="mb-4 text-6xl font-bold bg-gradient-to-r from-foreground via-chrome to-foreground bg-clip-text text-transparent">
            404
          </h1>
          <p className="mb-8 text-2xl text-muted-foreground">Oops! Page not found</p>
          <p className="mb-8 text-sm text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
