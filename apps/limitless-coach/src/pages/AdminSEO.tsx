import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "packages/supabase-client/src/client";
import { Plus, TrendingUp, TrendingDown, Minus, Search, Target, ExternalLink } from "lucide-react";

interface Keyword {
  id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  current_rank: number | null;
  target_rank: number | null;
  page_url: string | null;
  created_at: string;
}

const suggestedKeywords = [
  { keyword: "mobile auto detailing Houston", volume: 1200, difficulty: 45 },
  { keyword: "car detailing near me Houston", volume: 2400, difficulty: 55 },
  { keyword: "fleet car wash Houston", volume: 320, difficulty: 30 },
  { keyword: "dealership lot detailing Texas", volume: 180, difficulty: 25 },
  { keyword: "corporate fleet maintenance Houston", volume: 210, difficulty: 35 },
  { keyword: "luxury car detailing Houston", volume: 880, difficulty: 50 },
  { keyword: "mobile car wash Houston TX", volume: 1600, difficulty: 48 },
  { keyword: "auto detailing service Harris County", volume: 140, difficulty: 22 },
  { keyword: "professional car cleaning Houston", volume: 720, difficulty: 42 },
  { keyword: "ceramic coating Houston", volume: 1100, difficulty: 52 }
];

export default function AdminSEO() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    keyword: "",
    search_volume: "",
    difficulty: "",
    current_rank: "",
    target_rank: "",
    page_url: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seo_keywords')
      .select('*')
      .order('search_volume', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch keywords", variant: "destructive" });
    } else {
      setKeywords(data || []);
    }
    setLoading(false);
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.keyword) {
      toast({ title: "Error", description: "Keyword is required", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from('seo_keywords').insert({
      keyword: newKeyword.keyword,
      search_volume: newKeyword.search_volume ? parseInt(newKeyword.search_volume) : null,
      difficulty: newKeyword.difficulty ? parseInt(newKeyword.difficulty) : null,
      current_rank: newKeyword.current_rank ? parseInt(newKeyword.current_rank) : null,
      target_rank: newKeyword.target_rank ? parseInt(newKeyword.target_rank) : null,
      page_url: newKeyword.page_url || null
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add keyword", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Keyword added!" });
      setIsAddDialogOpen(false);
      setNewKeyword({
        keyword: "",
        search_volume: "",
        difficulty: "",
        current_rank: "",
        target_rank: "",
        page_url: ""
      });
      fetchKeywords();
    }
  };

  const addSuggestedKeyword = async (suggestion: typeof suggestedKeywords[0]) => {
    const { error } = await supabase.from('seo_keywords').insert({
      keyword: suggestion.keyword,
      search_volume: suggestion.volume,
      difficulty: suggestion.difficulty
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: "Info", description: "Keyword already exists" });
      } else {
        toast({ title: "Error", description: "Failed to add keyword", variant: "destructive" });
      }
    } else {
      toast({ title: "Success", description: "Keyword added!" });
      fetchKeywords();
    }
  };

  const getDifficultyColor = (difficulty: number | null) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    if (difficulty < 30) return "bg-green-100 text-green-800";
    if (difficulty < 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getRankTrend = (current: number | null, target: number | null) => {
    if (!current || !target) return null;
    if (current < target) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current > target) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SEO & Analytics</h1>
          <p className="text-muted-foreground">Track keywords and optimize your search presence</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Keyword</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Keyword to Track</DialogTitle>
              <DialogDescription>Monitor this keyword's ranking performance</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Keyword *</Label>
                <Input 
                  value={newKeyword.keyword} 
                  onChange={(e) => setNewKeyword({...newKeyword, keyword: e.target.value})}
                  placeholder="mobile auto detailing Houston"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Search Volume</Label>
                  <Input 
                    type="number"
                    value={newKeyword.search_volume} 
                    onChange={(e) => setNewKeyword({...newKeyword, search_volume: e.target.value})}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label>Difficulty (1-100)</Label>
                  <Input 
                    type="number"
                    value={newKeyword.difficulty} 
                    onChange={(e) => setNewKeyword({...newKeyword, difficulty: e.target.value})}
                    placeholder="45"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Rank</Label>
                  <Input 
                    type="number"
                    value={newKeyword.current_rank} 
                    onChange={(e) => setNewKeyword({...newKeyword, current_rank: e.target.value})}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label>Target Rank</Label>
                  <Input 
                    type="number"
                    value={newKeyword.target_rank} 
                    onChange={(e) => setNewKeyword({...newKeyword, target_rank: e.target.value})}
                    placeholder="5"
                  />
                </div>
              </div>
              <div>
                <Label>Target Page URL</Label>
                <Input 
                  value={newKeyword.page_url} 
                  onChange={(e) => setNewKeyword({...newKeyword, page_url: e.target.value})}
                  placeholder="/services/mobile-detailing"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddKeyword}>Add Keyword</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEO Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tracked Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keywords.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top 10 Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {keywords.filter(k => k.current_rank && k.current_rank <= 10).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keywords.length > 0 
                ? Math.round(keywords.reduce((sum, k) => sum + (k.difficulty || 0), 0) / keywords.filter(k => k.difficulty).length)
                : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Search Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {keywords.reduce((sum, k) => sum + (k.search_volume || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Suggested Keywords for Houston Auto Detailing
          </CardTitle>
          <CardDescription>Click to add these high-value keywords to your tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((suggestion) => (
              <Button
                key={suggestion.keyword}
                variant="outline"
                size="sm"
                onClick={() => addSuggestedKeyword(suggestion)}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                {suggestion.keyword}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {suggestion.volume}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tracked Keywords</CardTitle>
          <CardDescription>Monitor your SEO performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No keywords tracked yet. Add keywords above to start monitoring.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Current Rank</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Page</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((kw) => (
                  <TableRow key={kw.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{kw.keyword}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {kw.search_volume ? kw.search_volume.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      {kw.difficulty && (
                        <Badge className={getDifficultyColor(kw.difficulty)}>
                          {kw.difficulty}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {kw.current_rank || '-'}
                        {getRankTrend(kw.current_rank, kw.target_rank)}
                      </div>
                    </TableCell>
                    <TableCell>{kw.target_rank || '-'}</TableCell>
                    <TableCell>
                      {kw.page_url && (
                        <a href={kw.page_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {kw.page_url}
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Google Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Connect External Tools</CardTitle>
          <CardDescription>Integrate with Google for enhanced analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Google Analytics</h3>
                <p className="text-sm text-muted-foreground">Track website traffic and user behavior</p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Google Search Console</h3>
                <p className="text-sm text-muted-foreground">Monitor search performance and indexing</p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Google Ads</h3>
                <p className="text-sm text-muted-foreground">Manage paid advertising campaigns</p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
