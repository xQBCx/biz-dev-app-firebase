import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Book, 
  FileText, 
  Download,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  Upload
} from "lucide-react";

interface DigitalBook {
  id: string;
  title: string;
  description: string | null;
  author: string;
  cover_image_url: string | null;
  pdf_url: string | null;
  epub_url: string | null;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
  category: string | null;
  pages: number | null;
  preview_url: string | null;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  fitness: "Fitness & Training",
  nutrition: "Nutrition",
  mindset: "Mindset",
  lifestyle: "Lifestyle",
  training_program: "Training Program",
};

export default function AdminBooks() {
  const [books, setBooks] = useState<DigitalBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<DigitalBook | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "Coach Bill",
    price: "",
    compare_at_price: "",
    category: "fitness",
    pages: "",
    is_active: true,
  });

  const [files, setFiles] = useState({
    cover: null as File | null,
    pdf: null as File | null,
    epub: null as File | null,
    preview: null as File | null,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("digital_books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("digital-books")
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("digital-books")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({
        title: "Missing Info",
        description: "Please provide a title",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let cover_image_url = editingBook?.cover_image_url || null;
      let pdf_url = editingBook?.pdf_url || null;
      let epub_url = editingBook?.epub_url || null;
      let preview_url = editingBook?.preview_url || null;

      // Upload files if provided
      if (files.cover) {
        cover_image_url = await uploadFile(files.cover, "covers");
      }
      if (files.pdf) {
        pdf_url = await uploadFile(files.pdf, "pdfs");
      }
      if (files.epub) {
        epub_url = await uploadFile(files.epub, "epubs");
      }
      if (files.preview) {
        preview_url = await uploadFile(files.preview, "previews");
      }

      const bookData = {
        title: formData.title,
        description: formData.description || null,
        author: formData.author,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category: formData.category,
        pages: formData.pages ? parseInt(formData.pages) : null,
        is_active: formData.is_active,
        cover_image_url,
        pdf_url,
        epub_url,
        preview_url,
      };

      if (editingBook) {
        const { error } = await supabase
          .from("digital_books")
          .update(bookData)
          .eq("id", editingBook.id);
        if (error) throw error;
        toast({ title: "Success", description: "Book updated!" });
      } else {
        const { error } = await supabase
          .from("digital_books")
          .insert(bookData);
        if (error) throw error;
        toast({ title: "Success", description: "Book created!" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBooks();
    } catch (error: any) {
      console.error("Error saving book:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save book",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      author: "Coach Bill",
      price: "",
      compare_at_price: "",
      category: "fitness",
      pages: "",
      is_active: true,
    });
    setFiles({ cover: null, pdf: null, epub: null, preview: null });
    setEditingBook(null);
  };

  const handleEdit = (book: DigitalBook) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      description: book.description || "",
      author: book.author,
      price: book.price.toString(),
      compare_at_price: book.compare_at_price?.toString() || "",
      category: book.category || "fitness",
      pages: book.pages?.toString() || "",
      is_active: book.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const { error } = await supabase
        .from("digital_books")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Deleted", description: "Book removed" });
      fetchBooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from("digital_books")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
      fetchBooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Digital Books</h1>
          <p className="text-muted-foreground">
            Upload and sell ebooks, training guides, and educational content
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Book title..."
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your book..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Author</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="19.99"
                />
              </div>
              <div>
                <Label>Compare at Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.compare_at_price}
                  onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value })}
                  placeholder="29.99"
                />
              </div>
              <div>
                <Label>Page Count</Label>
                <Input
                  type="number"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                  placeholder="150"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active (visible in store)</Label>
              </div>
              <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="font-medium mb-3">Files</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cover Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFiles({ ...files, cover: e.target.files?.[0] || null })}
                    />
                  </div>
                  <div>
                    <Label>PDF File</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFiles({ ...files, pdf: e.target.files?.[0] || null })}
                    />
                  </div>
                  <div>
                    <Label>ePub File</Label>
                    <Input
                      type="file"
                      accept=".epub"
                      onChange={(e) => setFiles({ ...files, epub: e.target.files?.[0] || null })}
                    />
                  </div>
                  <div>
                    <Label>Preview/Sample</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFiles({ ...files, preview: e.target.files?.[0] || null })}
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <Button onClick={handleSubmit} disabled={uploading} className="w-full">
                  {uploading ? "Saving..." : editingBook ? "Update Book" : "Create Book"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : books.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No books yet</h3>
            <p className="text-muted-foreground">
              Add your first digital book to start selling
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="relative aspect-[3/4] bg-muted">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Book className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant={book.is_active ? "default" : "secondary"}>
                    {book.is_active ? "Active" : "Hidden"}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-1">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold">${book.price}</span>
                  {book.compare_at_price && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${book.compare_at_price}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  {book.category && (
                    <Badge variant="outline">{categoryLabels[book.category]}</Badge>
                  )}
                  {book.pages && <span>{book.pages} pages</span>}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {book.pdf_url && (
                    <Badge variant="secondary" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      PDF
                    </Badge>
                  )}
                  {book.epub_url && (
                    <Badge variant="secondary" className="text-xs">
                      <Book className="h-3 w-3 mr-1" />
                      ePub
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(book)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(book.id, !book.is_active)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(book.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}