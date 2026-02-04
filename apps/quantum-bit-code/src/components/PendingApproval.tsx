import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PendingApproval = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Account Pending Approval</h2>
              <p className="text-muted-foreground">
                Your account has been created successfully. An administrator will review and approve your access shortly.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground">
                You'll receive full access to the QBC Platform once approved. This typically takes 1-2 business days.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = "mailto:bill@quantumbitcode.com"}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
