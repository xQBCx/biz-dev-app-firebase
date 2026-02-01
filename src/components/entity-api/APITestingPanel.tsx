import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  RotateCcw,
  History,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEntityApiEndpoints, useInvokeEntityApi, useEntityApiCallLogs, type EntityApiEndpoint } from "@/hooks/useEntityAPIs";
import { toast } from "sonner";
import { format } from "date-fns";

interface APITestingPanelProps {
  entityId: string;
  dealRoomId?: string;
}

const payloadSchema = z.object({
  payload: z.string().optional(),
});

interface TestResult {
  success: boolean;
  statusCode?: number;
  responseTime?: number;
  response?: unknown;
  error?: string;
  timestamp: Date;
}

export function APITestingPanel({ entityId, dealRoomId }: APITestingPanelProps) {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { data: endpoints = [] } = useEntityApiEndpoints(entityId);
  const { data: callLogs = [] } = useEntityApiCallLogs(selectedEndpointId);
  const invokeApi = useInvokeEntityApi();

  const form = useForm<z.infer<typeof payloadSchema>>({
    resolver: zodResolver(payloadSchema),
    defaultValues: {
      payload: "{}",
    },
  });

  const selectedEndpoint = endpoints.find((e: EntityApiEndpoint) => e.id === selectedEndpointId);

  const handleTest = async () => {
    if (!selectedEndpointId) {
      toast.error("Please select an endpoint");
      return;
    }

    const payloadStr = form.getValues("payload") || "{}";
    let payload: unknown;
    
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      toast.error("Invalid JSON payload");
      return;
    }

    const startTime = Date.now();
    
    try {
      const result = await invokeApi.mutateAsync({
        endpoint_id: selectedEndpointId,
        payload: payload as import("@/integrations/supabase/types").Json,
        deal_room_id: dealRoomId,
      });

      const responseTime = Date.now() - startTime;
      
      setTestResult({
        success: true,
        statusCode: result.status_code || 200,
        responseTime,
        response: result.response,
        timestamp: new Date(),
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      setTestResult({
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(form.getValues("payload") || "{}");
    toast.success("Payload copied to clipboard");
  };

  const handleCopyResponse = () => {
    if (testResult?.response) {
      navigator.clipboard.writeText(JSON.stringify(testResult.response, null, 2));
      toast.success("Response copied to clipboard");
    }
  };

  const handleLoadSamplePayload = () => {
    if (!selectedEndpoint?.request_schema) return;
    
    // Generate sample payload from schema
    const schema = selectedEndpoint.request_schema as Record<string, unknown>;
    const sample = generateSampleFromSchema(schema);
    form.setValue("payload", JSON.stringify(sample, null, 2));
  };

  const generateSampleFromSchema = (schema: Record<string, unknown>): Record<string, unknown> => {
    // Simple schema-to-sample generator
    const properties = schema.properties as Record<string, Record<string, unknown>> || {};
    const sample: Record<string, unknown> = {};
    
    for (const [key, prop] of Object.entries(properties)) {
      const type = prop.type as string;
      switch (type) {
        case "string":
          sample[key] = prop.example || `sample_${key}`;
          break;
        case "number":
        case "integer":
          sample[key] = prop.example || 0;
          break;
        case "boolean":
          sample[key] = prop.example || false;
          break;
        case "object":
          sample[key] = {};
          break;
        case "array":
          sample[key] = [];
          break;
        default:
          sample[key] = null;
      }
    }
    
    return sample;
  };

  const getStatusBadge = (statusCode?: number) => {
    if (!statusCode) return null;
    
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{statusCode}</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{statusCode}</Badge>;
    } else if (statusCode >= 500) {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">{statusCode}</Badge>;
    }
    return <Badge variant="outline">{statusCode}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            API Testing Panel
          </CardTitle>
          <CardDescription>
            Test registered entity API endpoints with custom payloads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Endpoint Selection */}
          <div className="space-y-2">
            <Label>Select Endpoint</Label>
            <Select value={selectedEndpointId} onValueChange={setSelectedEndpointId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an endpoint to test..." />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((endpoint: EntityApiEndpoint) => (
                  <SelectItem key={endpoint.id} value={endpoint.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {endpoint.http_method}
                      </Badge>
                      {endpoint.endpoint_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEndpoint && (
            <>
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Badge>{selectedEndpoint.http_method}</Badge>
                  <code className="text-xs">{selectedEndpoint.base_url}{selectedEndpoint.endpoint_path}</code>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>Auth: {selectedEndpoint.auth_type}</span>
                  <span>Timeout: {selectedEndpoint.timeout_seconds}s</span>
                  <span className={selectedEndpoint.is_active ? "text-green-500" : "text-red-500"}>
                    {selectedEndpoint.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Payload Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Request Payload (JSON)</Label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadSamplePayload}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Sample
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPayload}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>
                <Textarea
                  {...form.register("payload")}
                  className="font-mono text-sm min-h-[150px]"
                  placeholder='{"key": "value"}'
                />
              </div>

              {/* Test Button */}
              <Button
                onClick={handleTest}
                disabled={invokeApi.isPending}
                className="w-full"
              >
                {invokeApi.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Invoking...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test Endpoint
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Test Result */}
      {testResult && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Test Result
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(testResult.statusCode)}
                {testResult.responseTime && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {testResult.responseTime}ms
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{format(testResult.timestamp, "HH:mm:ss.SSS")}</span>
                {testResult.response && (
                  <Button variant="ghost" size="sm" onClick={handleCopyResponse}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy Response
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[200px] rounded-md border bg-muted/30 p-3">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {testResult.error 
                    ? testResult.error 
                    : JSON.stringify(testResult.response, null, 2)
                  }
                </pre>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call History */}
      {selectedEndpointId && callLogs.length > 0 && (
        <Collapsible open={showHistory} onOpenChange={setShowHistory}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Call History
                    <Badge variant="secondary">{callLogs.length}</Badge>
                  </CardTitle>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="space-y-2">
                  {callLogs.slice(0, 10).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-muted-foreground">
                          {format(new Date(log.created_at), "MMM dd, HH:mm:ss")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.response_status_code && getStatusBadge(log.response_status_code)}
                        {log.response_time_ms && (
                          <span className="text-xs text-muted-foreground">
                            {log.response_time_ms}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
