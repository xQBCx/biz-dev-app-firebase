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
            sections.map((section: any, index: number) => {
              const isHero = section.type === 'hero';
              const hasCta = section.type === 'cta';
              
              return (
                <div 
                  key={index} 
                  className={`p-8 border-b last:border-b-0 ${isHero ? 'bg-gradient-to-br from-primary/10 to-background' : ''} ${hasCta ? 'bg-accent/5' : ''}`}
                >
                  {section.title && (
                    <h3 className={`font-bold mb-4 ${isHero ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
                      {section.title}
                    </h3>
                  )}
                  
                  {section.subtitle && (
                    <p className="text-lg text-muted-foreground mb-4 font-medium">
                      {section.subtitle}
                    </p>
                  )}
                  
                  {section.content && (
                    <div className="prose prose-slate max-w-none dark:prose-invert mb-6">
                      {typeof section.content === 'string' 
                        ? section.content.split('\n\n').filter((p: string) => p.trim()).map((paragraph: string, pIndex: number) => (
                            <p key={pIndex} className="mb-3 text-base leading-relaxed">
                              {paragraph}
                            </p>
                          ))
                        : <div>{JSON.stringify(section.content)}</div>
                      }
                    </div>
                  )}

                  {/* Render items for services/features sections */}
                  {section.items && Array.isArray(section.items) && (
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      {section.items.map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="p-4 bg-card border rounded-lg">
                          {typeof item === 'string' ? (
                            <p className="font-medium">{item}</p>
                          ) : (
                            <>
                              {item.title && <h4 className="font-semibold text-lg mb-2">{item.title}</h4>}
                              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA buttons */}
                  {section.cta && (
                    <button className="mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      {section.cta}
                    </button>
                  )}
                  
                  {section.buttonText && (
                    <div className="mt-6">
                      <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                        {section.buttonText}
                      </button>
                      {section.secondaryText && (
                        <p className="mt-3 text-sm text-muted-foreground">{section.secondaryText}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
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
