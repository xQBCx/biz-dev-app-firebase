import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function UserIdDisplay() {
  const { user } = useAuth();

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      toast.success("User ID copied to clipboard!");
    }
  };

  const copySqlQuery = () => {
    if (user?.id) {
      const sql = `INSERT INTO public.user_roles (user_id, role)\nVALUES ('${user.id}', 'admin');`;
      navigator.clipboard.writeText(sql);
      toast.success("SQL query copied! Paste it in the backend.");
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User ID</CardTitle>
          <CardDescription>Please log in to see your user ID</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup Admin Access</CardTitle>
        <CardDescription>
          Follow these steps to grant yourself admin access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Your User ID:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
              {user.id}
            </code>
            <Button size="sm" variant="outline" onClick={copyUserId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Your Email:</p>
          <code className="block p-2 bg-muted rounded text-xs">
            {user.email}
          </code>
        </div>

        <div className="pt-4 space-y-2">
          <p className="text-sm font-medium">Quick Setup:</p>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Copy the SQL query below</li>
            <li>Click "View Backend" to open the database</li>
            <li>Run the query in the SQL editor</li>
            <li>Refresh this page to access admin features</li>
          </ol>
          
          <Button 
            onClick={copySqlQuery}
            className="w-full"
            variant="default"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy SQL Query
          </Button>
        </div>

        <div className="p-3 bg-muted rounded">
          <p className="text-xs font-mono break-all">
            INSERT INTO public.user_roles (user_id, role)<br />
            VALUES ('{user.id}', 'admin');
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
