import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, FileCode, FileText, Bot, Copy, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditResult {
  overallScore: number;
  structuredData: { score: number; findings: string[]; recommendations: string[] };
  contentQuality: { score: number; findings: string[]; recommendations: string[] };
  technicalSEO: { score: number; findings: string[]; recommendations: string[] };
  eatSignals: { score: number; findings: string[]; recommendations: string[] };
}

interface SchemaOutput {
  type: string;
  schema: object;
}

export default function GEOTools() {
  const [activeTab, setActiveTab] = useState("audit");
  
  // Audit state
  const [auditUrl, setAuditUrl] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  
  // Schema generator state
  const [schemaType, setSchemaType] = useState<"product" | "organization" | "faq" | "article">("product");
  const [schemaInput, setSchemaInput] = useState("");
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaOutput, setSchemaOutput] = useState<SchemaOutput | null>(null);
  
  // Content optimizer state
  const [contentInput, setContentInput] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState("");
  
  // llms.txt state
  const [llmsCompany, setLlmsCompany] = useState("");
  const [llmsDescription, setLlmsDescription] = useState("");
  const [llmsLoading, setLlmsLoading] = useState(false);
  const [llmsOutput, setLlmsOutput] = useState("");
  
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  const runAudit = async () => {
    if (!auditUrl) {
      toast.error("Please enter a URL to audit");
      return;
    }
    
    setAuditLoading(true);
    setAuditResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("geo-audit", {
        body: { url: auditUrl },
      });
      
      if (error) throw error;
      setAuditResult(data);
      toast.success("Audit completed");
    } catch (error) {
      console.error("Audit error:", error);
      toast.error("Failed to run audit. Make sure the URL is accessible.");
    } finally {
      setAuditLoading(false);
    }
  };

  const generateSchema = async () => {
    if (!schemaInput) {
      toast.error("Please provide information about your product/organization");
      return;
    }
    
    setSchemaLoading(true);
    setSchemaOutput(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("geo-schema", {
        body: { type: schemaType, input: schemaInput },
      });
      
      if (error) throw error;
      setSchemaOutput(data);
      toast.success("Schema generated");
    } catch (error) {
      console.error("Schema error:", error);
      toast.error("Failed to generate schema");
    } finally {
      setSchemaLoading(false);
    }
  };

  const optimizeContent = async () => {
    if (!contentInput) {
      toast.error("Please provide content to optimize");
      return;
    }
    
    setContentLoading(true);
    setOptimizedContent("");
    
    try {
      const { data, error } = await supabase.functions.invoke("geo-optimize", {
        body: { content: contentInput },
      });
      
      if (error) throw error;
      setOptimizedContent(data.optimizedContent);
      toast.success("Content optimized for AI discoverability");
    } catch (error) {
      console.error("Optimize error:", error);
      toast.error("Failed to optimize content");
    } finally {
      setContentLoading(false);
    }
  };

  const generateLlmsTxt = async () => {
    if (!llmsCompany || !llmsDescription) {
      toast.error("Please provide company name and description");
      return;
    }
    
    setLlmsLoading(true);
    setLlmsOutput("");
    
    try {
      const { data, error } = await supabase.functions.invoke("geo-llmstxt", {
        body: { company: llmsCompany, description: llmsDescription },
      });
      
      if (error) throw error;
      setLlmsOutput(data.llmsTxt);
      toast.success("llms.txt generated");
    } catch (error) {
      console.error("llms.txt error:", error);
      toast.error("Failed to generate llms.txt");
    } finally {
      setLlmsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">GEO Tools</h1>
        <p className="text-muted-foreground mt-1">
          Generative Engine Optimization - Make your content discoverable by ChatGPT, Perplexity, and other AI systems
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Schema
          </TabsTrigger>
          <TabsTrigger value="optimize" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Optimize
          </TabsTrigger>
          <TabsTrigger value="llmstxt" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            llms.txt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>GEO Audit</CardTitle>
              <CardDescription>
                Analyze any URL for AI discoverability and get actionable recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/product-page"
                  value={auditUrl}
                  onChange={(e) => setAuditUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={runAudit} disabled={auditLoading}>
                  {auditLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Audit
                </Button>
              </div>

              {auditResult && (
                <div className="space-y-6 mt-6">
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <div className={`text-5xl font-bold ${getScoreColor(auditResult.overallScore)}`}>
                      {auditResult.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Overall GEO Score</div>
                    <Progress value={auditResult.overallScore} className="mt-3 h-2" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { key: "structuredData", label: "Structured Data" },
                      { key: "contentQuality", label: "Content Quality" },
                      { key: "technicalSEO", label: "Technical SEO" },
                      { key: "eatSignals", label: "E-E-A-T Signals" },
                    ].map(({ key, label }) => {
                      const section = auditResult[key as keyof AuditResult] as { score: number; findings: string[]; recommendations: string[] };
                      return (
                        <Card key={key}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{label}</CardTitle>
                              <Badge variant={getScoreBadge(section.score)}>{section.score}/100</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {section.findings.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Findings</p>
                                <ul className="text-sm space-y-1">
                                  {section.findings.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <AlertCircle className="h-3 w-3 mt-1 text-yellow-500 flex-shrink-0" />
                                      {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {section.recommendations.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Recommendations</p>
                                <ul className="text-sm space-y-1">
                                  {section.recommendations.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <CheckCircle2 className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                                      {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>JSON-LD Schema Generator</CardTitle>
              <CardDescription>
                Generate structured data markup that helps AI systems understand your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(["product", "organization", "faq", "article"] as const).map((type) => (
                  <Button
                    key={type}
                    variant={schemaType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSchemaType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder={
                  schemaType === "product"
                    ? "Describe your product: name, description, price, brand, features..."
                    : schemaType === "organization"
                    ? "Describe your organization: name, description, industry, location, contact info..."
                    : schemaType === "faq"
                    ? "List your FAQs: Q: question? A: answer..."
                    : "Describe your article: title, author, date, summary..."
                }
                value={schemaInput}
                onChange={(e) => setSchemaInput(e.target.value)}
                rows={6}
              />

              <Button onClick={generateSchema} disabled={schemaLoading}>
                {schemaLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileCode className="h-4 w-4 mr-2" />}
                Generate Schema
              </Button>

              {schemaOutput && (
                <div className="relative">
                  <ScrollArea className="h-80 rounded-lg border bg-muted p-4">
                    <pre className="text-xs">{JSON.stringify(schemaOutput.schema, null, 2)}</pre>
                  </ScrollArea>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(JSON.stringify(schemaOutput.schema, null, 2), "schema")}
                  >
                    {copied === "schema" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Optimizer</CardTitle>
              <CardDescription>
                Enhance your content with statistics, FAQ sections, and clear answers for AI citation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your existing content here..."
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                rows={8}
              />

              <Button onClick={optimizeContent} disabled={contentLoading}>
                {contentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                Optimize for AI
              </Button>

              {optimizedContent && (
                <div className="relative">
                  <ScrollArea className="h-80 rounded-lg border bg-muted p-4">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">{optimizedContent}</div>
                  </ScrollArea>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(optimizedContent, "content")}
                  >
                    {copied === "content" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llmstxt" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>llms.txt Generator</CardTitle>
              <CardDescription>
                Create an llms.txt file - the new standard for telling AI crawlers about your site (like robots.txt for AI)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Company/Product Name</label>
                  <Input
                    placeholder="Acme Inc."
                    value={llmsCompany}
                    onChange={(e) => setLlmsCompany(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description & Key Information</label>
                <Textarea
                  placeholder="Describe your company, products, services, unique value propositions, key facts AI should know..."
                  value={llmsDescription}
                  onChange={(e) => setLlmsDescription(e.target.value)}
                  rows={6}
                  className="mt-1"
                />
              </div>

              <Button onClick={generateLlmsTxt} disabled={llmsLoading}>
                {llmsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bot className="h-4 w-4 mr-2" />}
                Generate llms.txt
              </Button>

              {llmsOutput && (
                <div className="relative">
                  <ScrollArea className="h-80 rounded-lg border bg-muted p-4">
                    <pre className="text-xs whitespace-pre-wrap">{llmsOutput}</pre>
                  </ScrollArea>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(llmsOutput, "llmstxt")}
                  >
                    {copied === "llmstxt" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Save this as <code>llms.txt</code> in your website's root directory
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
