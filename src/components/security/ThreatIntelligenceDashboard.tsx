import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  Search,
  Eye,
  Activity,
  Target,
  Skull,
  Bug,
  Zap,
  Globe,
  Server,
  Lock,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock threat intelligence data
const mockThreats = [
  {
    id: '1',
    threat_name: 'Prompt Injection Attack Vector',
    threat_type: 'injection',
    threat_description: 'Sophisticated prompt injection attempts targeting AI model inputs to bypass safety guardrails and extract sensitive information.',
    severity: 'critical',
    active: true,
    occurrence_count: 47,
    last_seen_at: '2024-01-15T14:30:00Z',
    ioc_indicators: {
      patterns: ['ignore previous instructions', 'system prompt leak', 'jailbreak attempt'],
      sources: ['api_gateway', 'chat_interface'],
      attack_vectors: ['user_input', 'file_upload']
    },
    detection_pattern: {
      regex: '(ignore|bypass|override).*(instruction|rule|safety)',
      confidence: 0.92
    },
    mitigation_actions: ['Input sanitization', 'Rate limiting', 'Content filtering', 'User flagging']
  },
  {
    id: '2',
    threat_name: 'Model Extraction Attempt',
    threat_type: 'exfiltration',
    threat_description: 'Systematic queries designed to reconstruct model weights or training data through carefully crafted prompts.',
    severity: 'high',
    active: true,
    occurrence_count: 23,
    last_seen_at: '2024-01-15T12:15:00Z',
    ioc_indicators: {
      patterns: ['weight extraction', 'training data probe', 'model architecture query'],
      sources: ['api_endpoint'],
      attack_vectors: ['repeated_queries', 'adversarial_prompts']
    },
    detection_pattern: {
      regex: '(weight|parameter|training).*(extract|reveal|show)',
      confidence: 0.87
    },
    mitigation_actions: ['Query rate limiting', 'Response filtering', 'Anomaly detection']
  },
  {
    id: '3',
    threat_name: 'Adversarial Input Pattern',
    threat_type: 'adversarial',
    threat_description: 'Crafted inputs designed to cause model misclassification or unexpected behavior through subtle perturbations.',
    severity: 'medium',
    active: true,
    occurrence_count: 156,
    last_seen_at: '2024-01-15T16:45:00Z',
    ioc_indicators: {
      patterns: ['unicode manipulation', 'homoglyph substitution', 'invisible characters'],
      sources: ['text_input', 'document_upload'],
      attack_vectors: ['character_encoding', 'visual_similarity']
    },
    detection_pattern: {
      regex: '[\\u200B-\\u200D\\uFEFF]',
      confidence: 0.95
    },
    mitigation_actions: ['Unicode normalization', 'Character validation', 'Input preprocessing']
  },
  {
    id: '4',
    threat_name: 'Data Poisoning Indicator',
    threat_type: 'poisoning',
    threat_description: 'Signals indicating attempts to inject malicious data into training pipelines or fine-tuning datasets.',
    severity: 'critical',
    active: false,
    occurrence_count: 8,
    last_seen_at: '2024-01-14T09:20:00Z',
    ioc_indicators: {
      patterns: ['backdoor trigger', 'label manipulation', 'gradient attack'],
      sources: ['training_pipeline', 'feedback_loop'],
      attack_vectors: ['data_submission', 'feedback_injection']
    },
    detection_pattern: {
      regex: null,
      confidence: 0.78
    },
    mitigation_actions: ['Data validation', 'Provenance tracking', 'Anomaly detection', 'Human review']
  },
  {
    id: '5',
    threat_name: 'API Abuse Pattern',
    threat_type: 'abuse',
    threat_description: 'Abnormal API usage patterns indicating automated attacks, scraping, or resource exhaustion attempts.',
    severity: 'medium',
    active: true,
    occurrence_count: 312,
    last_seen_at: '2024-01-15T17:00:00Z',
    ioc_indicators: {
      patterns: ['burst requests', 'sequential probing', 'endpoint enumeration'],
      sources: ['api_gateway', 'load_balancer'],
      attack_vectors: ['automation', 'distributed_attack']
    },
    detection_pattern: {
      regex: null,
      confidence: 0.89
    },
    mitigation_actions: ['Rate limiting', 'CAPTCHA', 'IP blocking', 'Token rotation']
  },
  {
    id: '6',
    threat_name: 'Credential Stuffing via AI',
    threat_type: 'authentication',
    threat_description: 'AI-assisted credential stuffing attacks using generated variations and intelligent retry patterns.',
    severity: 'high',
    active: true,
    occurrence_count: 89,
    last_seen_at: '2024-01-15T15:30:00Z',
    ioc_indicators: {
      patterns: ['password variations', 'timing patterns', 'geographic anomalies'],
      sources: ['auth_endpoint', 'login_form'],
      attack_vectors: ['credential_reuse', 'ai_generation']
    },
    detection_pattern: {
      regex: null,
      confidence: 0.91
    },
    mitigation_actions: ['MFA enforcement', 'Behavioral analysis', 'Account lockout', 'Breach detection']
  }
];

const threatStats = {
  total_threats: 6,
  active_threats: 5,
  critical_count: 2,
  high_count: 2,
  medium_count: 2,
  total_occurrences: 635,
  blocked_percentage: 94.2,
  avg_detection_time: '1.3s'
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const getSeverityBadge = (severity: string) => {
  const styles: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };
  return (
    <Badge variant="outline" className={styles[severity] || styles.low}>
      {severity.toUpperCase()}
    </Badge>
  );
};

const getThreatTypeIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    injection: <Bug className="h-4 w-4 text-red-400" />,
    exfiltration: <Download className="h-4 w-4 text-orange-400" />,
    adversarial: <Zap className="h-4 w-4 text-yellow-400" />,
    poisoning: <Skull className="h-4 w-4 text-purple-400" />,
    abuse: <Activity className="h-4 w-4 text-blue-400" />,
    authentication: <Lock className="h-4 w-4 text-green-400" />
  };
  return icons[type] || <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
};

export const ThreatIntelligenceDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedThreat, setSelectedThreat] = useState<typeof mockThreats[0] | null>(null);

  const filteredThreats = mockThreats.filter(threat => {
    const matchesSearch = threat.threat_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         threat.threat_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || threat.severity === severityFilter;
    const matchesType = typeFilter === 'all' || threat.threat_type === typeFilter;
    return matchesSearch && matchesSeverity && matchesType;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Threat Intelligence Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time AI threat detection and indicator tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Intel
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <Target className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{threatStats.total_threats}</p>
              <p className="text-xs text-muted-foreground">Total Threats</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <Activity className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{threatStats.active_threats}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{threatStats.critical_count}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-orange-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{threatStats.high_count}</p>
              <p className="text-xs text-muted-foreground">High</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{threatStats.medium_count}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{threatStats.total_occurrences}</p>
              <p className="text-xs text-muted-foreground">Occurrences</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <Shield className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{threatStats.blocked_percentage}%</p>
              <p className="text-xs text-muted-foreground">Blocked</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{threatStats.avg_detection_time}</p>
              <p className="text-xs text-muted-foreground">Avg Detection</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threats by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px] bg-background/50">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-background/50">
                  <SelectValue placeholder="Threat Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="injection">Injection</SelectItem>
                  <SelectItem value="exfiltration">Exfiltration</SelectItem>
                  <SelectItem value="adversarial">Adversarial</SelectItem>
                  <SelectItem value="poisoning">Poisoning</SelectItem>
                  <SelectItem value="abuse">Abuse</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threats List */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Active Threats ({filteredThreats.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {filteredThreats.map((threat) => (
                      <Card
                        key={threat.id}
                        className={`bg-background/50 border-border/50 cursor-pointer transition-all hover:border-primary/50 ${
                          selectedThreat?.id === threat.id ? 'border-primary ring-1 ring-primary/20' : ''
                        }`}
                        onClick={() => setSelectedThreat(threat)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 rounded-lg bg-muted/50">
                                {getThreatTypeIcon(threat.threat_type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-medium text-foreground">{threat.threat_name}</h4>
                                  {getSeverityBadge(threat.severity)}
                                  {threat.active ? (
                                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                      ACTIVE
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                                      INACTIVE
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {threat.threat_description}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3" />
                                    {threat.occurrence_count} occurrences
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTimeAgo(threat.last_seen_at)}
                                  </span>
                                  <span className="capitalize">
                                    {threat.threat_type}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Threat Detail */}
          <div>
            <Card className="bg-card/50 border-border/50 sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Threat Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedThreat ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getThreatTypeIcon(selectedThreat.threat_type)}
                        <h3 className="font-semibold text-foreground">{selectedThreat.threat_name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {getSeverityBadge(selectedThreat.severity)}
                        <Badge variant="outline" className="capitalize">
                          {selectedThreat.threat_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedThreat.threat_description}
                      </p>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        Indicators of Compromise
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Patterns:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedThreat.ioc_indicators.patterns.map((pattern, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {pattern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedThreat.ioc_indicators.sources.map((source, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Attack Vectors:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedThreat.ioc_indicators.attack_vectors.map((vector, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/30">
                                {vector}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedThreat.detection_pattern.regex && (
                      <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                          <Search className="h-4 w-4 text-primary" />
                          Detection Pattern
                        </h4>
                        <code className="block text-xs bg-muted/50 p-2 rounded text-muted-foreground overflow-x-auto">
                          {selectedThreat.detection_pattern.regex}
                        </code>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <Progress value={selectedThreat.detection_pattern.confidence * 100} className="flex-1 h-2" />
                          <span className="text-xs font-medium">
                            {(selectedThreat.detection_pattern.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-400" />
                        Mitigation Actions
                      </h4>
                      <ul className="space-y-1">
                        {selectedThreat.mitigation_actions.map((action, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Occurrences</p>
                          <p className="font-medium text-foreground">{selectedThreat.occurrence_count}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Seen</p>
                          <p className="font-medium text-foreground">{formatTimeAgo(selectedThreat.last_seen_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <Shield className="h-4 w-4 mr-2" />
                        Apply Mitigations
                      </Button>
                      <Button variant="outline" size="sm">
                        <XCircle className="h-4 w-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a threat to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligenceDashboard;
