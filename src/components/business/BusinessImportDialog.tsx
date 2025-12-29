import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Rocket,
  Globe,
  Github,
  Database,
  FileText,
  Upload,
  Link2,
  Sparkles,
  Building2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Brain,
  Code2,
  FolderOpen,
} from "lucide-react";

interface ScrapedBusinessData {
  url: string;
  title: string;
  description: string;
  text: string;
  links: string[];
  scraped: boolean;
}

interface BusinessImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scrapedData: ScrapedBusinessData | null;
  onConfirmSpawn: (data: SpawnConfig) => void;
}

interface SpawnConfig {
  businessName: string;
  description: string;
  industry: string;
  url: string;
  runResearch: boolean;
  generateERP: boolean;
  generateWebsite: boolean;
  knowledgeSources: KnowledgeSource[];
}

interface KnowledgeSource {
  type: 'github' | 'deep_integration' | 'url' | 'file' | 'text';
  value: string;
  label: string;
  status?: 'pending' | 'connected' | 'failed';
}

export function BusinessImportDialog({
  open,
  onOpenChange,
  scrapedData,
  onConfirmSpawn,
}: BusinessImportDialogProps) {
  const navigate = useNavigate();
  const [isSpawning, setIsSpawning] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Form state
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [runResearch, setRunResearch] = useState(true);
  const [generateERP, setGenerateERP] = useState(true);
  const [generateWebsite, setGenerateWebsite] = useState(false);
  
  // Knowledge sources
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [githubUrl, setGithubUrl] = useState("");
  const [additionalUrl, setAdditionalUrl] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  
  // Deep integration state
  const [githubPat, setGithubPat] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");

  // Initialize form from scraped data
  useState(() => {
    if (scrapedData) {
      setBusinessName(scrapedData.title || "");
      setDescription(scrapedData.description || "");
      // Add scraped URL as first knowledge source
      setKnowledgeSources([{
        type: 'url',
        value: scrapedData.url,
        label: `Main website: ${scrapedData.url}`,
        status: 'connected'
      }]);
    }
  });

  const addKnowledgeSource = (source: KnowledgeSource) => {
    setKnowledgeSources(prev => [...prev, source]);
  };

  const removeKnowledgeSource = (index: number) => {
    setKnowledgeSources(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddGithub = () => {
    if (githubUrl.trim()) {
      addKnowledgeSource({
        type: 'github',
        value: githubUrl.trim(),
        label: `GitHub: ${githubUrl.trim()}`,
        status: 'pending'
      });
      setGithubUrl("");
    }
  };

  const handleAddUrl = () => {
    if (additionalUrl.trim()) {
      addKnowledgeSource({
        type: 'url',
        value: additionalUrl.trim(),
        label: additionalUrl.trim(),
        status: 'pending'
      });
      setAdditionalUrl("");
    }
  };

  const handleConnectDeepIntegration = () => {
    if (githubPat || (supabaseUrl && supabaseKey)) {
      addKnowledgeSource({
        type: 'deep_integration',
        value: JSON.stringify({ githubPat: !!githubPat, supabase: !!(supabaseUrl && supabaseKey) }),
        label: 'Deep Integration credentials',
        status: 'connected'
      });
      toast.success("Deep Integration credentials saved");
    }
  };

  const handleSpawn = async () => {
    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }

    setIsSpawning(true);

    try {
      // Add manual notes as knowledge source if provided
      const finalSources = [...knowledgeSources];
      if (manualNotes.trim()) {
        finalSources.push({
          type: 'text',
          value: manualNotes.trim(),
          label: 'Manual notes',
          status: 'connected'
        });
      }

      onConfirmSpawn({
        businessName: businessName.trim(),
        description: description.trim() || scrapedData?.description || "",
        industry: industry.trim(),
        url: scrapedData?.url || "",
        runResearch,
        generateERP,
        generateWebsite,
        knowledgeSources: finalSources,
      });

      toast.success("Starting business spawn process...");
      onOpenChange(false);
      
      // Navigate to business spawn page
      navigate("/business-spawn", {
        state: {
          prefill: {
            businessName: businessName.trim(),
            description: description.trim() || scrapedData?.description || "",
            industry: industry.trim(),
            sourceUrl: scrapedData?.url,
            scrapedContent: scrapedData?.text?.substring(0, 5000),
            knowledgeSources: finalSources,
          }
        }
      });
    } catch (error) {
      console.error("Error spawning business:", error);
      toast.error("Failed to start spawn process");
    } finally {
      setIsSpawning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            Import Business to Platform
          </DialogTitle>
          <DialogDescription>
            Create a workspace for this business and optionally connect knowledge sources
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <Globe className="h-3 w-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="text-xs sm:text-sm">
              <Brain className="h-3 w-3 mr-1" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1" />
              Options
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="mt-0 space-y-4">
              {/* Scraped preview */}
              {scrapedData && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Website Analyzed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      <a href={scrapedData.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                        {scrapedData.url}
                      </a>
                    </div>
                    {scrapedData.description && (
                      <p className="text-muted-foreground line-clamp-3">{scrapedData.description}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Business details form */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={scrapedData?.title || "Enter business name"}
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology, Retail, Services"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={scrapedData?.description || "Describe what this business does"}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="mt-0 space-y-4">
              <p className="text-sm text-muted-foreground">
                Add knowledge sources to help the platform learn about this business. This data will be used to generate better ERPs, websites, and recommendations.
              </p>

              {/* Current sources */}
              {knowledgeSources.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Connected Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {knowledgeSources.map((source, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        {source.type === 'github' && <Github className="h-4 w-4 text-muted-foreground" />}
                        {source.type === 'url' && <Link2 className="h-4 w-4 text-muted-foreground" />}
                        {source.type === 'deep_integration' && <Database className="h-4 w-4 text-muted-foreground" />}
                        {source.type === 'file' && <FileText className="h-4 w-4 text-muted-foreground" />}
                        {source.type === 'text' && <FileText className="h-4 w-4 text-muted-foreground" />}
                        <span className="flex-1 text-sm truncate">{source.label}</span>
                        <Badge variant={source.status === 'connected' ? 'default' : 'secondary'} className="text-xs">
                          {source.status}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => removeKnowledgeSource(idx)}>
                          ×
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* GitHub import */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Repository
                  </CardTitle>
                  <CardDescription>If this is a Lovable project, link the synced repo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo"
                    />
                    <Button onClick={handleAddGithub} disabled={!githubUrl.trim()}>
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Deep Integration */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Deep Integration
                  </CardTitle>
                  <CardDescription>Provide credentials for deeper analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="githubPat" className="text-xs">GitHub Personal Access Token</Label>
                    <Input
                      id="githubPat"
                      type="password"
                      value={githubPat}
                      onChange={(e) => setGithubPat(e.target.value)}
                      placeholder="ghp_..."
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label htmlFor="supabaseUrl" className="text-xs">Supabase Project URL</Label>
                    <Input
                      id="supabaseUrl"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://xxx.supabase.co"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supabaseKey" className="text-xs">Supabase Service Key</Label>
                    <Input
                      id="supabaseKey"
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJ..."
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleConnectDeepIntegration}
                    disabled={!githubPat && !(supabaseUrl && supabaseKey)}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Connect Deep Integration
                  </Button>
                </CardContent>
              </Card>

              {/* Additional URLs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Additional Links
                  </CardTitle>
                  <CardDescription>Documentation, social media, etc.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={additionalUrl}
                      onChange={(e) => setAdditionalUrl(e.target.value)}
                      placeholder="https://..."
                    />
                    <Button onClick={handleAddUrl} disabled={!additionalUrl.trim()}>
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manual notes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Manual Notes
                  </CardTitle>
                  <CardDescription>Describe features, architecture, or key information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="This business offers... The app includes features like..."
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Spawn Options</CardTitle>
                  <CardDescription>What should the AGI system generate?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="runResearch"
                      checked={runResearch}
                      onCheckedChange={(checked) => setRunResearch(checked === true)}
                    />
                    <Label htmlFor="runResearch" className="flex items-center gap-2 cursor-pointer">
                      <Brain className="h-4 w-4 text-purple-500" />
                      Run Market Research
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateERP"
                      checked={generateERP}
                      onCheckedChange={(checked) => setGenerateERP(checked === true)}
                    />
                    <Label htmlFor="generateERP" className="flex items-center gap-2 cursor-pointer">
                      <FolderOpen className="h-4 w-4 text-blue-500" />
                      Generate ERP Structure
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generateWebsite"
                      checked={generateWebsite}
                      onCheckedChange={(checked) => setGenerateWebsite(checked === true)}
                    />
                    <Label htmlFor="generateWebsite" className="flex items-center gap-2 cursor-pointer">
                      <Globe className="h-4 w-4 text-green-500" />
                      Generate Landing Page
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="pt-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Since this business already has a website, we'll skip website generation by default. 
                      You can enable it to create an alternative landing page within the platform.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSpawn} disabled={isSpawning || !businessName.trim()}>
            {isSpawning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Spawning...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Spawn Business
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
