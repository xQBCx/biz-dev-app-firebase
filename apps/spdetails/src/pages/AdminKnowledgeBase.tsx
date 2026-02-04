import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, BookOpen, DollarSign, MapPin, Star, HelpCircle, Info, Search } from "lucide-react";

type KnowledgeCategory = 'services' | 'pricing' | 'service_areas' | 'usp' | 'about' | 'faq';

interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const categoryConfig: Record<KnowledgeCategory, { label: string; icon: React.ElementType; color: string }> = {
  services: { label: "Services", icon: BookOpen, color: "bg-blue-500" },
  pricing: { label: "Pricing", icon: DollarSign, color: "bg-green-500" },
  service_areas: { label: "Service Areas", icon: MapPin, color: "bg-purple-500" },
  usp: { label: "Unique Selling Points", icon: Star, color: "bg-yellow-500" },
  about: { label: "About Us", icon: Info, color: "bg-cyan-500" },
  faq: { label: "FAQ", icon: HelpCircle, color: "bg-orange-500" }
};

export default function AdminKnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<KnowledgeCategory | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [formData, setFormData] = useState({
    category: "services" as KnowledgeCategory,
    title: "",
    content: "",
    tags: "",
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, [filterCategory]);

  const fetchEntries = async () => {
    setLoading(true);
    let query = supabase.from('knowledge_base').select('*').order('category').order('title');
    
    if (filterCategory !== "all") {
      query = query.eq('category', filterCategory);
    }

    const { data, error } = await query;
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch knowledge base", variant: "destructive" });
    } else {
      setEntries((data || []) as KnowledgeEntry[]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const entryData = {
      category: formData.category,
      title: formData.title,
      content: formData.content,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_active: formData.is_active
    };

    if (editingEntry) {
      const { error } = await supabase
        .from('knowledge_base')
        .update(entryData)
        .eq('id', editingEntry.id);

      if (error) {
        toast({ title: "Error", description: "Failed to update entry", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Entry updated successfully" });
        closeDialog();
        fetchEntries();
      }
    } else {
      const { error } = await supabase.from('knowledge_base').insert(entryData);

      if (error) {
        toast({ title: "Error", description: "Failed to add entry", variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Entry added successfully" });
        closeDialog();
        fetchEntries();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
    
    if (error) {
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Entry deleted" });
      fetchEntries();
    }
  };

  const toggleActive = async (entry: KnowledgeEntry) => {
    const { error } = await supabase
      .from('knowledge_base')
      .update({ is_active: !entry.is_active })
      .eq('id', entry.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      fetchEntries();
    }
  };

  const openEditDialog = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setFormData({
      category: entry.category,
      title: entry.title,
      content: entry.content,
      tags: entry.tags.join(', '),
      is_active: entry.is_active
    });
    setIsAddDialogOpen(true);
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setEditingEntry(null);
    setFormData({
      category: "services",
      title: "",
      content: "",
      tags: "",
      is_active: true
    });
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, KnowledgeEntry[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Store business information for AI agents to reference</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => open ? setIsAddDialogOpen(true) : closeDialog()}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Edit Entry" : "Add Knowledge Entry"}</DialogTitle>
              <DialogDescription>
                Add information that AI agents will use when generating content and outreach
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v as KnowledgeCategory})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Premium Interior Detail"
                  />
                </div>
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Detailed description that AI agents can reference..."
                  rows={6}
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input 
                  value={formData.tags} 
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="interior, premium, leather"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label>Active (available to AI agents)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formData.title || !formData.content}>
                {editingEntry ? "Update" : "Add"} Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = entries.filter(e => e.category === key).length;
          return (
            <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterCategory(key as KnowledgeCategory)}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                    <config.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search knowledge base..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as KnowledgeCategory | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No knowledge entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Add information about your services, pricing, and service areas so AI agents can create accurate content.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([category, categoryEntries]) => {
            const config = categoryConfig[category as KnowledgeCategory];
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                      <config.icon className="h-4 w-4 text-white" />
                    </div>
                    {config.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryEntries.map((entry) => (
                      <div key={entry.id} className={`p-4 border rounded-lg ${!entry.is_active ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{entry.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{entry.content}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Switch 
                              checked={entry.is_active} 
                              onCheckedChange={() => toggleActive(entry)}
                            />
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        {entry.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {entry.tags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
