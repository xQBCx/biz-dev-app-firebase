import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  FileText, 
  Video, 
  Headphones, 
  Image, 
  Table2, 
  HelpCircle,
  BookOpen,
  Presentation,
  Network,
  Lock,
  Calendar,
  MessageSquare,
  ArrowRight,
  Building2,
  Mail,
  ExternalLink
} from "lucide-react";
import { Helmet } from "react-helmet-async";

interface Prospect {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  slug: string;
  logo_url: string | null;
  status: string;
  settings: any;
}

interface ProspectMedia {
  id: string;
  media_type: string;
  title: string;
  description: string | null;
  storage_key: string | null;
  external_url: string | null;
  content: any;
  visibility: string;
  display_order: number;
}

const mediaTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
  deck: { icon: FileText, color: "bg-orange-500/10 text-orange-500", label: "Presentation Deck" },
  video: { icon: Video, color: "bg-red-500/10 text-red-500", label: "Video" },
  audio: { icon: Headphones, color: "bg-purple-500/10 text-purple-500", label: "Audio Overview" },
  infographic: { icon: Image, color: "bg-indigo-500/10 text-indigo-500", label: "Infographic" },
  flashcards: { icon: BookOpen, color: "bg-green-500/10 text-green-500", label: "Flashcards" },
  data_table: { icon: Table2, color: "bg-teal-500/10 text-teal-500", label: "Data Analysis" },
  quiz: { icon: HelpCircle, color: "bg-amber-500/10 text-amber-500", label: "Interactive Quiz" },
  study_guide: { icon: BookOpen, color: "bg-blue-500/10 text-blue-500", label: "Study Guide" },
  briefing: { icon: FileText, color: "bg-orange-500/10 text-orange-500", label: "Briefing" },
  slides: { icon: Presentation, color: "bg-pink-500/10 text-pink-500", label: "Slide Deck" },
  mind_map: { icon: Network, color: "bg-cyan-500/10 text-cyan-500", label: "Mind Map" },
};

export default function ProspectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [media, setMedia] = useState<ProspectMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<ProspectMedia | null>(null);

  useEffect(() => {
    const fetchProspect = async () => {
      if (!slug) return;

      try {
        // Fetch prospect by slug
        const { data: prospectData, error: prospectError } = await supabase
          .from("prospects")
          .select("*")
          .eq("slug", slug)
          .eq("status", "active")
          .single();

        if (prospectError) throw prospectError;
        setProspect(prospectData);

        // Log page view
        await supabase.from("prospect_actions").insert({
          prospect_id: prospectData.id,
          action_type: "view",
          metadata: { source: "direct" },
          user_agent: navigator.userAgent,
        });

        // Fetch media
        const { data: mediaData, error: mediaError } = await supabase
          .from("prospect_media")
          .select("*")
          .eq("prospect_id", prospectData.id)
          .in("visibility", ["public", "teaser"])
          .order("display_order", { ascending: true });

        if (mediaError) throw mediaError;
        setMedia(mediaData || []);
      } catch (err: any) {
        setError(err.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    fetchProspect();
  }, [slug]);

  const logAction = async (actionType: string, mediaId?: string) => {
    if (!prospect) return;
    await supabase.from("prospect_actions").insert({
      prospect_id: prospect.id,
      action_type: actionType,
      media_id: mediaId,
      user_agent: navigator.userAgent,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !prospect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Page Not Found</CardTitle>
            <CardDescription>
              This prospect page doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{prospect.company_name} | Bill Mercer - BDSRVS</title>
        <meta name="description" content={`Strategic materials prepared for ${prospect.company_name} by Bill Mercer, Business Development Services.`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {prospect.logo_url ? (
                <img 
                  src={prospect.logo_url} 
                  alt={prospect.company_name} 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
              )}
              <div>
                <h1 className="font-semibold text-foreground">{prospect.company_name}</h1>
                <p className="text-sm text-muted-foreground">Prepared by Bill Mercer</p>
              </div>
            </div>
            <Button 
              onClick={() => {
                logAction("biz_dev_entry");
                window.location.href = "/auth";
              }}
              className="gap-2"
            >
              Enter Biz Dev App
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Strategic Materials</Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Materials for {prospect.company_name}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Review the materials below to understand our strategic approach. 
              For detailed analysis and next steps, enter the Biz Dev App.
            </p>
          </div>

          {/* Media Grid */}
          {media.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {media.map((item) => {
                const config = mediaTypeConfig[item.media_type] || mediaTypeConfig.briefing;
                const IconComponent = config.icon;
                const isTeaser = item.visibility === "teaser";

                return (
                  <Card 
                    key={item.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer group relative overflow-hidden"
                    onClick={() => {
                      logAction("media_view", item.id);
                      if (!isTeaser) {
                        setSelectedMedia(item);
                      }
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        {isTeaser && (
                          <Badge variant="outline" className="gap-1">
                            <Lock className="h-3 w-3" />
                            Preview
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-4">{item.title}</CardTitle>
                      <CardDescription>{item.description || config.label}</CardDescription>
                    </CardHeader>
                    {isTeaser && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Full content available in Biz Dev App
                        </p>
                      </CardContent>
                    )}
                    {!isTeaser && (
                      <CardContent>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Play className="h-4 w-4" />
                          View Content
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="max-w-md mx-auto text-center p-8 mb-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Materials Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Strategic materials for this engagement are being prepared.
              </p>
            </Card>
          )}

          <Separator className="my-12" />

          {/* CTA Section */}
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader className="text-center">
                <CardTitle>Ready to Take the Next Step?</CardTitle>
                <CardDescription>
                  Access detailed analysis, deal room setup, and collaborative tools
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gap-2"
                  onClick={() => {
                    logAction("cta_click");
                    window.location.href = "/auth";
                  }}
                >
                  Enter Biz Dev App
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    logAction("meeting_request");
                    window.open("mailto:bill@bdsrvs.com?subject=Meeting Request", "_blank");
                  }}
                >
                  <Calendar className="h-4 w-4" />
                  Schedule a Call
                </Button>
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="gap-2"
                  onClick={() => {
                    logAction("cta_click");
                    window.open("mailto:bill@bdsrvs.com", "_blank");
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Contact
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Note */}
            <p className="text-xs text-muted-foreground text-center mt-8 max-w-md mx-auto">
              All materials are confidential and prepared exclusively for {prospect.company_name}. 
              Your privacy and discretion are paramount.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-slate-50 py-8">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Business Development Services
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="mailto:bill@bdsrvs.com" className="hover:text-foreground transition-colors">
                bill@bdsrvs.com
              </a>
              <span>•</span>
              <span>bdsrvs.com</span>
            </div>
          </div>
        </footer>

        {/* Media Viewer Dialog */}
        {selectedMedia && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <Card 
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedMedia.title}</CardTitle>
                  <CardDescription>{selectedMedia.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedMedia(null)}>
                  Close
                </Button>
              </CardHeader>
              <ScrollArea className="max-h-[70vh]">
                <CardContent>
                  {/* Render content based on media type */}
                  {selectedMedia.media_type === "audio" && selectedMedia.external_url && (
                    <audio controls className="w-full">
                      <source src={selectedMedia.external_url} type="audio/mpeg" />
                    </audio>
                  )}
                  {selectedMedia.media_type === "video" && selectedMedia.external_url && (
                    <video controls className="w-full rounded-lg">
                      <source src={selectedMedia.external_url} type="video/mp4" />
                    </video>
                  )}
                  {(selectedMedia.media_type === "briefing" || selectedMedia.media_type === "study_guide") && (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedMedia.content?.html || selectedMedia.content?.text || "" }}
                    />
                  )}
                  {selectedMedia.media_type === "flashcards" && selectedMedia.content?.cards && (
                    <div className="space-y-4">
                      {selectedMedia.content.cards.map((card: any, i: number) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <p className="font-medium mb-2">Q: {card.question}</p>
                            <p className="text-muted-foreground">A: {card.answer}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {selectedMedia.media_type === "slides" && selectedMedia.content?.slides && (
                    <div className="space-y-4">
                      {selectedMedia.content.slides.map((slide: any, i: number) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <h3 className="font-bold mb-2">{slide.title}</h3>
                            <ul className="list-disc pl-4 space-y-1">
                              {slide.bullets?.map((b: string, j: number) => (
                                <li key={j} className="text-sm">{b}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {selectedMedia.media_type === "data_table" && selectedMedia.content?.tables && (
                    <div className="space-y-6">
                      {selectedMedia.content.tables.map((table: any, i: number) => (
                        <div key={i}>
                          <h4 className="font-semibold mb-2">{table.title}</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                              <thead>
                                <tr className="bg-muted">
                                  {table.columns?.map((col: string, j: number) => (
                                    <th key={j} className="border p-2 text-left">{col}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows?.map((row: string[], k: number) => (
                                  <tr key={k}>
                                    {row.map((cell, l) => (
                                      <td key={l} className="border p-2">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Fallback for other types */}
                  {!["audio", "video", "briefing", "study_guide", "flashcards", "slides", "data_table"].includes(selectedMedia.media_type) && (
                    <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                      {JSON.stringify(selectedMedia.content, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}