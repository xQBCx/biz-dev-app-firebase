import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoaderFullScreen } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const GeneratedWebsite = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [website, setWebsite] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const { data, error } = await supabase
          .from("generated_websites")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setWebsite(data);
      } catch (error) {
        console.error("Error fetching website:", error);
        toast.error("Failed to load website");
        navigate("/website-builder");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWebsite();
    }
  }, [id, navigate]);

  if (loading) {
    return <LoaderFullScreen />;
  }

  if (!website) {
    return null;
  }

  const content = website.generated_content as any;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/website-builder")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Builder
            </Button>
            <div>
              <h1 className="text-xl font-bold">{website.business_name}</h1>
              <p className="text-sm text-muted-foreground">
                Generated on {new Date(website.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Website Preview */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          {/* Hero Section */}
          {content?.sections?.map((section: any, index: number) => (
            <div key={index} className="p-8 border-b last:border-b-0">
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <div className="prose prose-slate max-w-none">
                {section.content?.split('\n').map((paragraph: string, pIndex: number) => (
                  <p key={pIndex} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          ))}

          {/* If no sections, show raw content */}
          {!content?.sections && (
            <div className="p-8">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratedWebsite;
