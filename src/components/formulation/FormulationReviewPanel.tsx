import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  Edit2, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  FileText,
  Sparkles,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  History,
  Beaker,
  Percent,
  Scale
} from 'lucide-react';

interface ExtractedField {
  id: string;
  fieldName: string;
  extractedValue: string;
  originalValue?: string;
  confidence: number;
  source: string;
  lineNumber?: number;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  editedValue?: string;
  notes?: string;
}

interface FormulationDocument {
  id: string;
  name: string;
  type: 'contract' | 'proposal' | 'agreement' | 'invoice';
  uploadedAt: string;
  processedAt: string;
  status: 'pending_review' | 'in_review' | 'approved' | 'needs_changes';
  overallConfidence: number;
  extractedFields: ExtractedField[];
  reviewer?: string;
  reviewedAt?: string;
}

const mockDocuments: FormulationDocument[] = [
  {
    id: '1',
    name: 'Partnership Agreement v2.1',
    type: 'agreement',
    uploadedAt: '2024-01-14T10:00:00Z',
    processedAt: '2024-01-14T10:02:00Z',
    status: 'in_review',
    overallConfidence: 87,
    extractedFields: [
      { id: 'f1', fieldName: 'Partner A', extractedValue: 'Acme Corp', confidence: 98, source: 'Page 1, Section 1.1', status: 'approved' },
      { id: 'f2', fieldName: 'Partner B', extractedValue: 'TechStart Inc', confidence: 95, source: 'Page 1, Section 1.1', status: 'approved' },
      { id: 'f3', fieldName: 'Revenue Split', extractedValue: '60/40', confidence: 72, source: 'Page 3, Section 4.2', status: 'pending', notes: 'May be 55/45 based on context' },
      { id: 'f4', fieldName: 'Term Duration', extractedValue: '24 months', confidence: 89, source: 'Page 2, Section 2.1', status: 'pending' },
      { id: 'f5', fieldName: 'Minimum Commitment', extractedValue: '$50,000', originalValue: '$75,000', confidence: 65, source: 'Page 4, Section 5.1', status: 'edited', editedValue: '$75,000' },
      { id: 'f6', fieldName: 'Exclusivity Clause', extractedValue: 'Non-exclusive', confidence: 91, source: 'Page 5, Section 6.3', status: 'pending' },
    ]
  },
  {
    id: '2',
    name: 'Deal Room Attribution Rules',
    type: 'contract',
    uploadedAt: '2024-01-13T14:30:00Z',
    processedAt: '2024-01-13T14:32:00Z',
    status: 'pending_review',
    overallConfidence: 79,
    extractedFields: [
      { id: 'f7', fieldName: 'Lead Provider Weight', extractedValue: '35%', confidence: 88, source: 'Page 1', status: 'pending' },
      { id: 'f8', fieldName: 'Closer Weight', extractedValue: '25%', confidence: 85, source: 'Page 1', status: 'pending' },
      { id: 'f9', fieldName: 'Support Weight', extractedValue: '20%', confidence: 82, source: 'Page 1', status: 'pending' },
      { id: 'f10', fieldName: 'AI Agent Weight', extractedValue: '20%', confidence: 78, source: 'Page 2', status: 'pending' },
    ]
  },
  {
    id: '3',
    name: 'Q4 Revenue Distribution',
    type: 'invoice',
    uploadedAt: '2024-01-12T09:00:00Z',
    processedAt: '2024-01-12T09:01:00Z',
    status: 'approved',
    overallConfidence: 94,
    reviewer: 'John Smith',
    reviewedAt: '2024-01-12T11:00:00Z',
    extractedFields: [
      { id: 'f11', fieldName: 'Total Revenue', extractedValue: '$125,000', confidence: 99, source: 'Line 1', status: 'approved' },
      { id: 'f12', fieldName: 'Partner A Share', extractedValue: '$75,000', confidence: 98, source: 'Line 5', status: 'approved' },
      { id: 'f13', fieldName: 'Partner B Share', extractedValue: '$50,000', confidence: 97, source: 'Line 6', status: 'approved' },
    ]
  }
];

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-green-500';
  if (confidence >= 75) return 'text-yellow-500';
  return 'text-red-500';
};

const getConfidenceBg = (confidence: number) => {
  if (confidence >= 90) return 'bg-green-500/10 border-green-500/20';
  if (confidence >= 75) return 'bg-yellow-500/10 border-yellow-500/20';
  return 'bg-red-500/10 border-red-500/20';
};

const getStatusBadge = (status: ExtractedField['status']) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
    case 'edited':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><Edit2 className="h-3 w-3 mr-1" />Edited</Badge>;
    default:
      return <Badge className="bg-muted text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  }
};

const getDocStatusBadge = (status: FormulationDocument['status']) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
    case 'needs_changes':
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Needs Changes</Badge>;
    case 'in_review':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">In Review</Badge>;
    default:
      return <Badge className="bg-muted text-muted-foreground">Pending Review</Badge>;
  }
};

export function FormulationReviewPanel() {
  const [documents, setDocuments] = useState<FormulationDocument[]>(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<FormulationDocument | null>(mockDocuments[0]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const handleApproveField = (docId: string, fieldId: string) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        extractedFields: doc.extractedFields.map(field => 
          field.id === fieldId ? { ...field, status: 'approved' as const } : field
        )
      };
    }));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(prev => prev ? {
        ...prev,
        extractedFields: prev.extractedFields.map(field => 
          field.id === fieldId ? { ...field, status: 'approved' as const } : field
        )
      } : null);
    }
  };

  const handleRejectField = (docId: string, fieldId: string) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        extractedFields: doc.extractedFields.map(field => 
          field.id === fieldId ? { ...field, status: 'rejected' as const } : field
        )
      };
    }));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(prev => prev ? {
        ...prev,
        extractedFields: prev.extractedFields.map(field => 
          field.id === fieldId ? { ...field, status: 'rejected' as const } : field
        )
      } : null);
    }
  };

  const handleEditField = (fieldId: string, currentValue: string) => {
    setEditingField(fieldId);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (docId: string, fieldId: string) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        extractedFields: doc.extractedFields.map(field => 
          field.id === fieldId ? { ...field, status: 'edited' as const, editedValue: editValue } : field
        )
      };
    }));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(prev => prev ? {
        ...prev,
        extractedFields: prev.extractedFields.map(field => 
          field.id === fieldId ? { ...field, status: 'edited' as const, editedValue: editValue } : field
        )
      } : null);
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleApproveAll = (docId: string) => {
    setDocuments(docs => docs.map(doc => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        status: 'approved',
        extractedFields: doc.extractedFields.map(field => ({ ...field, status: 'approved' as const }))
      };
    }));
    if (selectedDoc?.id === docId) {
      setSelectedDoc(prev => prev ? {
        ...prev,
        status: 'approved',
        extractedFields: prev.extractedFields.map(field => ({ ...field, status: 'approved' as const }))
      } : null);
    }
  };

  const pendingDocs = documents.filter(d => d.status === 'pending_review' || d.status === 'in_review');
  const reviewedDocs = documents.filter(d => d.status === 'approved' || d.status === 'needs_changes');

  const pendingFields = selectedDoc?.extractedFields.filter(f => f.status === 'pending') || [];
  const reviewedFields = selectedDoc?.extractedFields.filter(f => f.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Beaker className="h-8 w-8 text-primary" />
              Formulation Review Panel
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve AI-extracted formulation data with confidence scoring
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">{pendingDocs.length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{reviewedDocs.filter(d => d.status === 'approved').length}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  <p className="text-2xl font-bold">86%</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fields Reviewed</p>
                  <p className="text-2xl font-bold">42</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Scale className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>Select a document to review</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full rounded-none border-b">
                  <TabsTrigger value="pending" className="flex-1">Pending ({pendingDocs.length})</TabsTrigger>
                  <TabsTrigger value="reviewed" className="flex-1">Reviewed ({reviewedDocs.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="m-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-2 space-y-2">
                      {pendingDocs.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedDoc?.id === doc.id 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{doc.name}</span>
                            </div>
                            {getDocStatusBadge(doc.status)}
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className={getConfidenceColor(doc.overallConfidence)}>
                              {doc.overallConfidence}% confidence
                            </span>
                            <span>{doc.extractedFields.length} fields</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="reviewed" className="m-0">
                  <ScrollArea className="h-[400px]">
                    <div className="p-2 space-y-2">
                      {reviewedDocs.map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedDoc?.id === doc.id 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{doc.name}</span>
                            </div>
                            {getDocStatusBadge(doc.status)}
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Reviewed by {doc.reviewer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Review Panel */}
          <Card className="lg:col-span-2">
            {selectedDoc ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {selectedDoc.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Processed {new Date(selectedDoc.processedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDocStatusBadge(selectedDoc.status)}
                      <div className={`px-3 py-1 rounded-full border ${getConfidenceBg(selectedDoc.overallConfidence)}`}>
                        <span className={`text-sm font-medium ${getConfidenceColor(selectedDoc.overallConfidence)}`}>
                          {selectedDoc.overallConfidence}% Overall
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Source
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveAll(selectedDoc.id)}
                      disabled={selectedDoc.status === 'approved'}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    {pendingFields.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Pending Review ({pendingFields.length})
                        </h3>
                        <div className="space-y-3">
                          {pendingFields.map(field => (
                            <div 
                              key={field.id} 
                              className={`p-4 rounded-lg border ${getConfidenceBg(field.confidence)}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{field.fieldName}</span>
                                    {getStatusBadge(field.status)}
                                  </div>
                                  {editingField === field.id ? (
                                    <div className="mt-2 flex gap-2">
                                      <Input 
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        className="flex-1"
                                      />
                                      <Button size="sm" onClick={() => handleSaveEdit(selectedDoc.id, field.id)}>
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => setEditingField(null)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <p className="text-lg mt-1">{field.extractedValue}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Percent className="h-3 w-3" />
                                      <span className={getConfidenceColor(field.confidence)}>
                                        {field.confidence}% confidence
                                      </span>
                                    </span>
                                    <span>Source: {field.source}</span>
                                  </div>
                                  {field.notes && (
                                    <div className="mt-2 flex items-start gap-2 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-2 rounded">
                                      <AlertTriangle className="h-3 w-3 mt-0.5" />
                                      {field.notes}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1 ml-4">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                    onClick={() => handleApproveField(selectedDoc.id, field.id)}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                    onClick={() => handleRejectField(selectedDoc.id, field.id)}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleEditField(field.id, field.extractedValue)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reviewedFields.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Reviewed ({reviewedFields.length})
                        </h3>
                        <div className="space-y-2">
                          {reviewedFields.map(field => (
                            <div 
                              key={field.id} 
                              className="p-3 rounded-lg border border-border/50 bg-muted/30"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{field.fieldName}</span>
                                    {getStatusBadge(field.status)}
                                  </div>
                                  <p className="text-sm mt-1">
                                    {field.editedValue || field.extractedValue}
                                    {field.editedValue && (
                                      <span className="text-xs text-muted-foreground ml-2 line-through">
                                        {field.extractedValue}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => handleEditField(field.id, field.editedValue || field.extractedValue)}>
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a document to review</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
