// Utility functions for file attachments

/**
 * Chunked base64 encoding to avoid stack overflow on large files
 * Processes data in 8KB chunks as recommended for browser memory safety
 */
export function arrayBufferToBase64Chunked(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192; // 8KB chunks
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}

/**
 * Convert a File to base64 using chunked processing
 */
export async function fileToBase64Chunked(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      try {
        const base64 = arrayBufferToBase64Chunked(arrayBuffer);
        resolve(`data:${file.type};base64,${base64}`);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract base64 data from data URL
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
  const parts = dataUrl.split(',');
  return parts.length > 1 ? parts[1] : dataUrl;
}

/**
 * Entity type display names
 */
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  proposal: 'Proposal',
  deal_room: 'Deal Room',
  contact: 'Contact',
  company: 'Company',
  deal: 'Deal',
  task: 'Task',
  initiative: 'Initiative',
  knowledge_item: 'Knowledge Item',
};

/**
 * Get entity icon name based on type
 */
export function getEntityIconName(entityType: string): string {
  switch (entityType) {
    case 'proposal': return 'FileText';
    case 'deal_room': return 'Briefcase';
    case 'contact': return 'User';
    case 'company': return 'Building2';
    case 'deal': return 'DollarSign';
    case 'task': return 'CheckCircle2';
    case 'initiative': return 'Lightbulb';
    case 'knowledge_item': return 'Brain';
    default: return 'File';
  }
}

export interface EntityAttachment {
  id: string;
  user_id: string;
  client_id: string | null;
  entity_type: string;
  entity_id: string;
  storage_bucket: string;
  storage_path: string;
  filename: string;
  file_type: string | null;
  file_size: number | null;
  attached_via_chat: boolean | null;
  ai_conversation_id: string | null;
  ai_suggested: boolean | null;
  notes: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}
