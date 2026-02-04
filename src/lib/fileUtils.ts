// File utility functions for multi-modal input handling

export interface FileTypeInfo {
  icon: 'image' | 'audio' | 'video' | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'archive' | 'code' | 'text' | 'link' | 'document';
  category: 'image' | 'audio' | 'video' | 'document' | 'spreadsheet' | 'presentation' | 'archive' | 'code' | 'text' | 'link' | 'unknown';
  canAnalyze: boolean;
  displayName: string;
}

// Comprehensive file type detection
export function getFileTypeInfo(file: File): FileTypeInfo {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Images
  if (mimeType.startsWith('image/')) {
    return { icon: 'image', category: 'image', canAnalyze: true, displayName: 'Image' };
  }

  // Audio files
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac', 'wma'].includes(extension)) {
    return { icon: 'audio', category: 'audio', canAnalyze: true, displayName: 'Audio' };
  }

  // Video files
  if (mimeType.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv'].includes(extension)) {
    return { icon: 'video', category: 'video', canAnalyze: false, displayName: 'Video' };
  }

  // PDF files
  if (mimeType === 'application/pdf' || extension === 'pdf') {
    return { icon: 'pdf', category: 'document', canAnalyze: true, displayName: 'PDF' };
  }

  // Word documents
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ['doc', 'docx'].includes(extension)
  ) {
    return { icon: 'word', category: 'document', canAnalyze: true, displayName: 'Word' };
  }

  // Excel spreadsheets
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    ['xls', 'xlsx', 'csv'].includes(extension)
  ) {
    return { icon: 'excel', category: 'spreadsheet', canAnalyze: true, displayName: 'Spreadsheet' };
  }

  // PowerPoint presentations
  if (
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    ['ppt', 'pptx'].includes(extension)
  ) {
    return { icon: 'powerpoint', category: 'presentation', canAnalyze: true, displayName: 'Presentation' };
  }

  // Archive files
  if (
    mimeType === 'application/zip' ||
    mimeType === 'application/x-rar-compressed' ||
    mimeType === 'application/x-7z-compressed' ||
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)
  ) {
    return { icon: 'archive', category: 'archive', canAnalyze: false, displayName: 'Archive' };
  }

  // Code files
  if (
    ['js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rb', 'php', 'swift', 'kt', 'rs', 'sql', 'html', 'css', 'scss', 'less', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'sh', 'bash'].includes(extension)
  ) {
    return { icon: 'code', category: 'code', canAnalyze: true, displayName: 'Code' };
  }

  // Plain text files
  if (
    mimeType === 'text/plain' ||
    mimeType.startsWith('text/') ||
    ['txt', 'md', 'log', 'readme'].includes(extension)
  ) {
    return { icon: 'text', category: 'text', canAnalyze: true, displayName: 'Text' };
  }

  // Default to document
  return { icon: 'document', category: 'unknown', canAnalyze: false, displayName: 'File' };
}

// Convert file to base64 for API transmission
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Read text content from text-based files
export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Prepare files for AI analysis
export interface PreparedFile {
  name: string;
  type: string;
  size: number;
  category: FileTypeInfo['category'];
  content?: string; // base64 or text content
  canAnalyze: boolean;
}

export async function prepareFilesForAnalysis(files: File[]): Promise<PreparedFile[]> {
  const preparedFiles: PreparedFile[] = [];

  for (const file of files) {
    const typeInfo = getFileTypeInfo(file);
    const preparedFile: PreparedFile = {
      name: file.name,
      type: file.type,
      size: file.size,
      category: typeInfo.category,
      canAnalyze: typeInfo.canAnalyze,
    };

    if (typeInfo.canAnalyze) {
      try {
        if (typeInfo.category === 'text' || typeInfo.category === 'code') {
          // Read as text for text-based files
          preparedFile.content = await readTextFile(file);
        } else {
          // Convert to base64 for binary files (images, PDFs, docs, etc.)
          preparedFile.content = await fileToBase64(file);
        }
      } catch (error) {
        console.error(`Error preparing file ${file.name}:`, error);
        preparedFile.canAnalyze = false;
      }
    }

    preparedFiles.push(preparedFile);
  }

  return preparedFiles;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Check if file size is within limits (20MB max)
export function isFileSizeValid(file: File): boolean {
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB
  return file.size <= MAX_SIZE;
}

// Get accepted file types for input element
export const ACCEPTED_FILE_TYPES = [
  // Images
  'image/*',
  // Documents
  '.pdf',
  '.doc',
  '.docx',
  // Spreadsheets
  '.xls',
  '.xlsx',
  '.csv',
  // Presentations
  '.ppt',
  '.pptx',
  // Audio
  'audio/*',
  '.mp3',
  '.wav',
  '.m4a',
  // Text/Code
  '.txt',
  '.md',
  '.json',
  '.xml',
  '.js',
  '.ts',
  '.py',
  // Archives
  '.zip',
].join(',');
