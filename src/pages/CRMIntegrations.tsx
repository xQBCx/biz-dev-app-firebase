import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Copy, Check, Link2, Code } from "lucide-react";
import { toast } from "sonner";

const CRMIntegrations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crm-webhook`;
  const apiKey = user?.id || "your-user-id";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const examplePayload = {
    action: "create",
    type: "contact",
    data: {
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone: "+1-555-0123",
      title: "CEO",
      company_id: null,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">CRM Integrations</h1>
            <p className="text-muted-foreground">
              Connect Lindy.ai and other automation tools to your CRM
            </p>
          </div>
        </div>

        <Card className="p-8 shadow-elevated border border-border mb-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Link2 className="w-6 h-6 text-primary" />
                Webhook Endpoint
              </h2>
              <p className="text-muted-foreground mb-4">
                Use this endpoint to create and update CRM data from external tools
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted p-3 rounded text-sm overflow-x-auto">
                  {webhookUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhookUrl)}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Your API Key</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted p-3 rounded text-sm overflow-x-auto">
                  {apiKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Include this as "x-api-key" header in your requests
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 shadow-elevated border border-border mb-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Code className="w-6 h-6 text-primary" />
            Supported Operations
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Contacts</h3>
              <div className="space-y-2">
                <Badge>POST</Badge>
                <p className="text-sm text-muted-foreground">
                  Create or update contacts in your CRM
                </p>
                <div className="bg-muted p-4 rounded text-sm">
                  <strong>Types:</strong> contact
                  <br />
                  <strong>Actions:</strong> create, update
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Companies</h3>
              <div className="space-y-2">
                <Badge>POST</Badge>
                <p className="text-sm text-muted-foreground">
                  Create or update companies in your CRM
                </p>
                <div className="bg-muted p-4 rounded text-sm">
                  <strong>Types:</strong> company
                  <br />
                  <strong>Actions:</strong> create, update
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Deals</h3>
              <div className="space-y-2">
                <Badge>POST</Badge>
                <p className="text-sm text-muted-foreground">Track sales opportunities</p>
                <div className="bg-muted p-4 rounded text-sm">
                  <strong>Types:</strong> deal
                  <br />
                  <strong>Actions:</strong> create, update
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Activities</h3>
              <div className="space-y-2">
                <Badge>POST</Badge>
                <p className="text-sm text-muted-foreground">Log tasks and interactions</p>
                <div className="bg-muted p-4 rounded text-sm">
                  <strong>Types:</strong> activity
                  <br />
                  <strong>Actions:</strong> create
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 shadow-elevated border border-border">
          <h2 className="text-2xl font-semibold mb-4">Example Request</h2>
          <div className="bg-muted p-4 rounded">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(examplePayload, null, 2)}
            </pre>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">cURL Example:</h3>
            <div className="bg-muted p-4 rounded text-sm overflow-x-auto">
              <code>
                {`curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '${JSON.stringify(examplePayload)}'`}
              </code>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border bg-muted mt-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Lindy.ai Integration
          </h3>
          <p className="text-sm text-muted-foreground">
            In Lindy.ai, create a new HTTP action and use the webhook URL above with your API
            key in the headers. Configure the request body to match the examples above.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default CRMIntegrations;
