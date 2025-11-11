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

  const sections = website.sections as any[];
  const theme = website.theme as any;

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
                Generated on {new Date(website.created_at).toLocaleDateString()} • {website.ai_tokens_used?.toLocaleString()} AI tokens used
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Website Preview */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Title & Description */}
          <div className="p-8 border-b bg-gradient-to-br from-primary/5 to-background">
            <h2 className="text-3xl font-bold mb-2">{website.title}</h2>
            <p className="text-muted-foreground">{website.meta_description}</p>
          </div>

          {/* Sections */}
          {sections && sections.length > 0 ? (
            sections.map((section: any, index: number) => (
              <div key={index} className="p-8 border-b last:border-b-0">
                {section.title && <h3 className="text-2xl font-bold mb-4">{section.title}</h3>}
                {section.subtitle && <p className="text-lg text-muted-foreground mb-4">{section.subtitle}</p>}
                
                <div className="prose prose-slate max-w-none dark:prose-invert">
                  {typeof section.content === 'string' 
                    ? section.content.split('\n').filter((p: string) => p.trim()).map((paragraph: string, pIndex: number) => (
                        <p key={pIndex} className="mb-3">{paragraph}</p>
                      ))
                    : <div>{JSON.stringify(section.content)}</div>
                  }
                </div>
              </div>
            ))
          ) : (
            <div className="p-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Business Description</h3>
                <div className="prose prose-slate max-w-none dark:prose-invert whitespace-pre-wrap">
                  {website.business_description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Preview */}
        {theme && Object.keys(theme).length > 0 && (
          <div className="mt-6 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Theme Colors</h3>
            <div className="flex gap-4 flex-wrap">
              {theme.colors && Object.entries(theme.colors).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded border" 
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-sm">{key}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedWebsite;
