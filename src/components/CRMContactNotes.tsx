import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Note {
  id: string;
  note: string;
  created_at: string;
}

interface CRMContactNotesProps {
  contactId: string;
}

export const CRMContactNotes = ({ contactId }: CRMContactNotesProps) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [contactId]);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_contact_notes")
        .select("id, note, created_at")
        .eq("contact_id", contactId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !user) return;

    setIsAdding(true);
    try {
      const { error } = await supabase.from("crm_contact_notes").insert({
        contact_id: contactId,
        user_id: user.id,
        note: newNote.trim(),
      });

      if (error) throw error;

      toast.success("Note added");
      setNewNote("");
      loadNotes();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("crm_contact_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      toast.success("Note deleted");
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Notes</h3>

      <div className="flex gap-2">
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={2}
          className="flex-1"
        />
        <Button onClick={addNote} disabled={!newNote.trim() || isAdding}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No notes yet</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-sm">{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
