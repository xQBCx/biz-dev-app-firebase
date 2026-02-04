import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Camera, Image, Upload, Share2 } from "lucide-react";
import { toast } from "sonner";
import { EndSessionDialog } from "@/components/EndSessionDialog";
import { useProfile } from "@/hooks/useProfile";
import { takePicture, requestCameraPermissions } from "@/lib/capacitor";
import { PhotoGallery } from "@/components/PhotoGallery";
import { useSessionPhotos } from "@/hooks/useSessionPhotos";
import { EditedPhotosReview } from "@/components/EditedPhotosReview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useShare } from "@/hooks/useShare";
import { PullToRefresh } from "@/components/PullToRefresh";

export default function ChatView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: userProfile } = useProfile(user?.id);
  const { data: sessionPhotos = [] } = useSessionPhotos(sessionId);
  const { shareSession } = useShare();

  // Validation schema for image files
  const imageFileSchema = z.object({
    type: z.string().refine(
      (type) => type.startsWith('image/'),
      { message: "File must be an image" }
    ),
    size: z.number().max(10 * 1024 * 1024, { message: "Image must be less than 10MB" })
  });

  useRealtimeMessages(sessionId);

  const { data: session } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, photographer:profiles!photographer_id(*), client:profiles!client_id(*)")
        .eq("id", sessionId!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:sender_id(*)")
        .eq("session_id", sessionId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !sessionId) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("messages")
        .insert({
          session_id: sessionId,
          sender_id: user.id,
          content,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessage.mutate(messageText);
  };

  const handleTakePhoto = async () => {
    if (!userProfile?.is_photographer) {
      toast.error("Only photographers can take photos");
      return;
    }

    setIsCapturing(true);
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        toast.error("Camera permission denied");
        setIsCapturing(false);
        return;
      }

      const photoBase64 = await takePicture();
      if (photoBase64) {
        // Convert base64 to blob
        const response = await fetch(photoBase64);
        const blob = await response.blob();
        
        // Generate unique filename
        const fileName = `${sessionId}/${Date.now()}.jpg`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("session-photos")
          .upload(fileName, blob, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("session-photos")
          .getPublicUrl(fileName);

        // Save message with photo URL
        await supabase.from("messages").insert({
          session_id: sessionId!,
          sender_id: user!.id,
          content: "📸 Photo",
          photo_url: publicUrl,
        });

        // If editing was requested, also save to session_photos table
        if (session?.editing_requested) {
          await supabase.from("session_photos").insert({
            session_id: sessionId!,
            uploader_id: user!.id,
            original_url: publicUrl,
            editing_status: "pending_edit",
          });
        }
        
        toast.success("Photo uploaded!");
        queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
        queryClient.invalidateQueries({ queryKey: ["session-photos", sessionId] });
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userProfile?.is_photographer) {
      toast.error("Only photographers can upload photos");
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadPromises: Promise<void>[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file
      const validation = imageFileSchema.safeParse({
        type: file.type,
        size: file.size
      });

      if (!validation.success) {
        toast.error(`${file.name}: ${validation.error.errors[0].message}`);
        continue;
      }

      const uploadPromise = (async () => {
        try {
          const fileName = `${sessionId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          
          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("session-photos")
            .upload(fileName, file, {
              contentType: file.type,
              upsert: false,
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("session-photos")
            .getPublicUrl(fileName);

          // Save message with photo URL
          await supabase.from("messages").insert({
            session_id: sessionId!,
            sender_id: user!.id,
            content: "📸 Photo",
            photo_url: publicUrl,
          });

          // If editing was requested, also save to session_photos table
          if (session?.editing_requested) {
            await supabase.from("session_photos").insert({
              session_id: sessionId!,
              uploader_id: user!.id,
              original_url: publicUrl,
              editing_status: "pending_edit",
            });
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          throw error;
        }
      })();

      uploadPromises.push(uploadPromise);
    }

    try {
      await Promise.all(uploadPromises);
      toast.success(`${files.length} photo${files.length > 1 ? 's' : ''} uploaded!`);
      queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["session-photos", sessionId] });
    } catch (error) {
      toast.error("Some photos failed to upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRefreshMessages = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["messages", sessionId] });
    await queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
  }, [queryClient, sessionId]);

  const otherPerson = user?.id === session?.client_id ? session?.photographer : session?.client;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/chats")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-bold text-primary">
                {otherPerson?.full_name?.[0] || "U"}
              </span>
            </div>
            <div>
              <p className="font-bold">{otherPerson?.full_name || "User"}</p>
              <p className="text-xs text-muted-foreground capitalize">{session?.status}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(session?.status === "completed" || session?.status === "active") && sessionPhotos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGallery(true)}
              >
                <Image className="h-4 w-4 mr-2" />
                Gallery ({sessionPhotos.length})
              </Button>
            )}
            {userProfile?.is_photographer && session?.status === "completed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => session && shareSession({
                id: session.id,
                photographer: session.photographer,
                location_name: session.location_name || undefined,
              })}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {session?.status === "active" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEndDialog(true)}
              >
                End Session
              </Button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </header>

      {/* Messages */}
      <PullToRefresh onRefresh={handleRefreshMessages} className="flex-1">
        <div className="p-4 space-y-4 min-h-full">
          <div className="max-w-lg mx-auto">
            {/* Edited Photos Section - Show for clients when editing was requested */}
            {!userProfile?.is_photographer && 
             session?.editing_requested && 
             session?.status === "completed" && (
              <div className="mb-6">
                <h3 className="text-sm font-bold mb-3">Edited Photos</h3>
                <EditedPhotosReview sessionId={sessionId!} />
              </div>
            )}

            {messages.map((msg: any) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}
                >
                <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    {msg.photo_url && (
                      <img
                        src={msg.photo_url}
                        alt="Session photo"
                        className="rounded-lg mb-2 max-w-full h-auto"
                        loading="lazy"
                      />
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PullToRefresh>

      {/* Input */}
      <div className="bg-card border-t border-border p-4">
        <div className="max-w-lg mx-auto flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
          />
          {userProfile?.is_photographer && session?.status === "active" && (
            <Button
              onClick={handleTakePhoto}
              disabled={isCapturing}
              size="icon"
              variant="outline"
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sendMessage.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EndSessionDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        session={session}
        userId={user?.id || ""}
      />

      <PhotoGallery
        open={showGallery}
        onOpenChange={setShowGallery}
        photos={sessionPhotos}
        sessionId={sessionId || ""}
      />
    </div>
  );
}
