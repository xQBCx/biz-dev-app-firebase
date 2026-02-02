export interface DMConversation {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  other_user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email?: string;
  };
  last_message?: DMMessage;
  unread_count?: number;
}

export interface DMMessage {
  id: string;
  connection_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice_memo' | 'link';
  metadata: Record<string, any>;
  read: boolean;
  created_at: string;
  attachments?: DMAttachment[];
}

export interface DMAttachment {
  id: string;
  message_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number | null;
  storage_path: string;
  thumbnail_path: string | null;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
  url?: string;
}

export interface DMUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email?: string;
  messaging_preference?: 'anyone' | 'connections_only';
}
