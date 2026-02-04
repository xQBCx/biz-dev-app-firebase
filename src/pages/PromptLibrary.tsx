import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb, BookOpen } from "lucide-react";
import { usePromptLibrary, PromptItem } from "@/hooks/usePromptLibrary";
import { PromptEditor } from "@/components/prompts/PromptEditor";
import { PromptCard } from "@/components/prompts/PromptCard";
import { PromptFilters } from "@/components/prompts/PromptFilters";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const PromptLibrary = () => {
  const {
    prompts,
    loading,
    filters,
    setFilters,
    createPrompt,
    updatePrompt,
    deletePrompt,
    copyToClipboard,
    exportAsMarkdown,
    exportAsJSON,
  } = usePromptLibrary();

  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleNewPrompt = () => {
    setEditingPrompt(null);
    setShowEditor(true);
  };

  const handleEditPrompt = (prompt: PromptItem) => {
    setEditingPrompt(prompt);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setEditingPrompt(null);
    setShowEditor(false);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this prompt?");
    if (confirmed) {
      await deletePrompt(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Prompt Library</h1>
              <p className="text-sm text-muted-foreground">
                Store and organize your prompts and feature ideas
              </p>
            </div>
          </div>
          <Button onClick={handleNewPrompt}>
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <PromptFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No prompts yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Start capturing your feature ideas, AI prompts, and thoughts for later.
            </p>
            <Button onClick={handleNewPrompt}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Prompt
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={copyToClipboard}
                onEdit={handleEditPrompt}
                onDelete={handleDelete}
                onExportMarkdown={exportAsMarkdown}
                onExportJSON={exportAsJSON}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {prompts.length > 0 && (
          <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
            {prompts.length} prompt{prompts.length !== 1 ? "s" : ""} in your library
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={(open) => !open && handleCloseEditor()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <PromptEditor
            prompt={editingPrompt}
            onSave={createPrompt}
            onUpdate={updatePrompt}
            onDelete={deletePrompt}
            onCancel={handleCloseEditor}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromptLibrary;
