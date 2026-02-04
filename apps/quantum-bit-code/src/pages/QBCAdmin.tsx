import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Home, Plus, Save, Trash2, Check, X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';
import type { LatticeRules } from '@/lib/qbc/types';
import type { Json } from '@/integrations/supabase/types';

interface LatticeRow {
  id: string;
  lattice_key: string;
  name: string;
  description: string | null;
  version: number;
  anchors_json: Json;
  rules_json: Json;
  style_json: Json;
  is_default: boolean;
  is_active: boolean;
  is_locked: boolean;
  created_at: string;
}

type SubmissionStatus = 'pending' | 'approved' | 'rejected';

interface LibrarySubmission {
  id: string;
  glyph_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  glyphs: {
    text: string;
    visibility: string;
  } | null;
}

export default function QBCAdmin() {
  const { isAdmin, isLoading: loadingRole } = useUserRole();
  type LatticePartialUpdate = Partial<LatticeRow> & { id: string };
  const queryClient = useQueryClient();
  const [selectedLattice, setSelectedLattice] = useState<LatticeRow | null>(null);

  const { data: lattices, isLoading: loadingLattices } = useQuery({
    queryKey: ['admin-lattices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lattices')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as LatticeRow[];
    },
    enabled: isAdmin,
  });

  const { data: submissions, isLoading: loadingSubmissions } = useQuery({
    queryKey: ['library-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_submissions')
        .select('*, glyphs(text, visibility)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as LibrarySubmission[];
    },
    enabled: isAdmin,
  });

  const updateLatticeMutation = useMutation({
    mutationFn: async (lattice: LatticePartialUpdate) => {
      const { id, ...updateData } = lattice;
      const { error } = await supabase
        .from('lattices')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lattices'] });
      toast.success('Lattice updated');
    },
    onError: (error) => {
      toast.error('Failed to update lattice: ' + error.message);
    },
  });

  const reviewSubmissionMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: SubmissionStatus; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('library_submissions')
        .update({
          status,
          notes,
          moderator_id: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;

      // If approved, make the glyph public
      if (status === 'approved') {
        const submission = submissions?.find(s => s.id === id);
        if (submission) {
          await supabase
            .from('glyphs')
            .update({ visibility: 'public' })
            .eq('id', submission.glyph_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['public-glyphs'] });
      toast.success('Submission reviewed');
    },
    onError: (error) => {
      toast.error('Failed to review: ' + error.message);
    },
  });

  if (loadingRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need admin privileges to access this page.
            </p>
            <Button asChild>
              <Link to="/qbc">Back to QBC</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/qbc" className="flex items-center gap-2 text-lg font-semibold">
            <Settings className="h-5 w-5" />
            QBC Admin
          </Link>
          <nav className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/qbc/simulator">Simulator</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="lattices">
          <TabsList className="mb-6">
            <TabsTrigger value="lattices">Lattices</TabsTrigger>
            <TabsTrigger value="moderation">
              Moderation
              {submissions && submissions.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {submissions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="lattices">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Lattice List</h3>
                {loadingLattices ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : (
                  lattices?.map((lattice) => (
                    <Card
                      key={lattice.id}
                      className={`cursor-pointer transition-colors ${
                        selectedLattice?.id === lattice.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedLattice(lattice)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{lattice.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              v{lattice.version} • {lattice.lattice_key}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {lattice.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                            {lattice.is_locked && (
                              <Badge variant="outline">Locked</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="lg:col-span-2">
                {selectedLattice ? (
                  <LatticeEditor
                    lattice={selectedLattice}
                    onSave={(updates) => 
                      updateLatticeMutation.mutate({ id: selectedLattice.id, ...updates })
                    }
                    isSaving={updateLatticeMutation.isPending}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Select a lattice to edit
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="moderation">
            <Card>
              <CardHeader>
                <CardTitle>Pending Submissions</CardTitle>
                <CardDescription>
                  Review user submissions to the public library
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSubmissions ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : submissions && submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {submission.glyphs?.text || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted {new Date(submission.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => 
                              reviewSubmissionMutation.mutate({
                                id: submission.id,
                                status: 'approved',
                              })
                            }
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => 
                              reviewSubmissionMutation.mutate({
                                id: submission.id,
                                status: 'rejected',
                                notes: 'Does not meet guidelines',
                              })
                            }
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No pending submissions
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Global Settings</CardTitle>
                <CardDescription>
                  Configure global QBC simulator settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Public Submissions</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to submit glyphs to the public library
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit image exports to 100 per hour per user
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Link Expiration</Label>
                    <p className="text-sm text-muted-foreground">
                      Public share links expire after 30 days
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function LatticeEditor({
  lattice,
  onSave,
  isSaving,
}: {
  lattice: LatticeRow;
  onSave: (updates: Partial<LatticeRow>) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(lattice.name);
  const [description, setDescription] = useState(lattice.description || '');
  const [isActive, setIsActive] = useState(lattice.is_active);
  const defaultRules: LatticeRules = {
    enableTick: true,
    tickLengthFactor: 0.08,
    insideBoundaryPreference: true,
    nodeSpacing: 0.15,
  };
  const rules = (lattice.rules_json as unknown as LatticeRules) || defaultRules;
  const [rulesState, setRulesState] = useState<LatticeRules>(rules);

  const handleSave = () => {
    onSave({
      name,
      description,
      is_active: isActive,
      rules_json: rulesState as unknown as Json,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Lattice: {lattice.name}</CardTitle>
        <CardDescription>
          {lattice.is_locked ? 'This lattice is locked and some fields cannot be edited.' : 'Modify lattice properties and rules.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={lattice.is_locked}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Rules</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable tick for repeats</Label>
                <p className="text-sm text-muted-foreground">
                  Draw a short tick for repeated letters (doubles or revisits)
                </p>
              </div>
              <Switch
                checked={rulesState.enableTick}
                onCheckedChange={(v) => 
                  setRulesState({ ...rulesState, enableTick: v })
                }
                disabled={lattice.is_locked}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Inside-boundary preference</Label>
                <p className="text-sm text-muted-foreground">
                  Keep ticks inside the lattice square boundary
                </p>
              </div>
              <Switch
                checked={rulesState.insideBoundaryPreference}
                onCheckedChange={(v) => 
                  setRulesState({ ...rulesState, insideBoundaryPreference: v })
                }
                disabled={lattice.is_locked}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
}
