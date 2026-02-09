import { useState } from "react";
import { supabase } from "packages/supabase-client/src";
import { useAuth } from "@/contexts/AuthContext";

interface VerificationResult {
  success: boolean;
  recordId?: string;
  error?: string;
}

export const useVerification = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadVerificationPhoto = async (
    sessionId: string,
    photoBlob: Blob
  ): Promise<VerificationResult> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const fileName = `${user.id}/${sessionId}/${timestamp}.jpg`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("verification-media")
        .upload(fileName, photoBlob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setIsUploading(false);
        return { success: false, error: "Failed to upload verification photo" };
      }

      // Get the public URL (or signed URL for private bucket)
      const { data: urlData } = supabase.storage
        .from("verification-media")
        .getPublicUrl(fileName);

      // Create verification record
      const { data: record, error: recordError } = await supabase
        .from("verification_records")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          verification_type: "facial",
          media_url: uploadData.path,
          metadata: {
            timestamp: new Date().toISOString(),
            device: navigator.userAgent,
          },
        })
        .select()
        .single();

      if (recordError) {
        console.error("Record error:", recordError);
        setIsUploading(false);
        return { success: false, error: "Failed to create verification record" };
      }

      setIsUploading(false);
      return { success: true, recordId: record.id };
    } catch (err) {
      console.error("Verification error:", err);
      setIsUploading(false);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const checkVerificationStatus = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("verification_records")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      return { initiatorVerified: false, partnerVerified: false, error };
    }

    // Get session to determine initiator and partner
    const { data: session } = await supabase
      .from("consent_sessions")
      .select("initiator_id, partner_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return { initiatorVerified: false, partnerVerified: false };
    }

    const initiatorVerified = data.some(r => r.user_id === session.initiator_id);
    const partnerVerified = session.partner_id 
      ? data.some(r => r.user_id === session.partner_id)
      : false;

    return { initiatorVerified, partnerVerified };
  };

  const getUserVerificationForSession = async (sessionId: string) => {
    if (!user) return null;

    const { data } = await supabase
      .from("verification_records")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    return data;
  };

  return {
    isUploading,
    uploadVerificationPhoto,
    checkVerificationStatus,
    getUserVerificationForSession,
  };
};
