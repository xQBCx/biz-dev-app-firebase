import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileArchive, CheckCircle, AlertCircle, Pause, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ChunkedUploaderProps {
  onUploadComplete: (storagePath: string, sha256: string, fileSize: number) => void;
  onError: (error: string) => void;
  maxFileSizeMB?: number;
  className?: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export function ChunkedUploader({
  onUploadComplete,
  onError,
  maxFileSizeMB = 2000, // 2GB max
  className,
}: ChunkedUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedChunks, setUploadedChunks] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [status, setStatus] = useState<'idle' | 'hashing' | 'uploading' | 'complete' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const pausedRef = useRef(false);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.zip')) {
      onError('Please upload a ZIP file');
      return;
    }
    
    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      onError(`File too large. Maximum size is ${maxFileSizeMB}MB`);
      return;
    }
    
    setFile(selectedFile);
    setStatus('idle');
    setProgress(0);
  };

  const computeSHA256 = async (file: File): Promise<string> => {
    setStatus('hashing');
    setStatusMessage('Computing file hash...');
    
    // For large files, compute hash in chunks
    const chunkSize = 64 * 1024 * 1024; // 64MB chunks for hashing
    let offset = 0;
    
    // Use SubtleCrypto for streaming hash (not available in all browsers for streaming)
    // Fallback: read entire file
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const uploadChunked = async () => {
    if (!file) return;

    setUploading(true);
    setPaused(false);
    pausedRef.current = false;
    abortControllerRef.current = new AbortController();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Compute hash first
      const sha256 = await computeSHA256(file);
      
      setStatus('uploading');
      const importId = crypto.randomUUID();
      const storagePath = `raw/openai_exports/${user.id}/${importId}/openai_export.zip`;
      
      const chunks = Math.ceil(file.size / CHUNK_SIZE);
      setTotalChunks(chunks);
      
      // For files that fit in one chunk, upload directly
      if (chunks === 1) {
        setStatusMessage('Uploading file...');
        const { error: uploadError } = await supabase.storage
          .from('vault')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        
        setProgress(100);
        setUploadedChunks(1);
        setStatus('complete');
        setStatusMessage('Upload complete!');
        onUploadComplete(storagePath, sha256, file.size);
        return;
      }

      // For large files, upload in chunks using resumable upload
      // Supabase Storage supports resumable uploads via TUS protocol
      // But for simplicity, we'll upload chunks and reassemble
      
      setStatusMessage(`Uploading ${chunks} chunks...`);
      
      // Upload each chunk as a separate file, then combine
      const chunkPaths: string[] = [];
      
      for (let i = 0; i < chunks; i++) {
        // Check for pause/abort
        while (pausedRef.current) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Upload cancelled');
          }
        }
        
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        const chunkPath = `${storagePath}.chunk${i}`;
        
        const { error: chunkError } = await supabase.storage
          .from('vault')
          .upload(chunkPath, chunk, {
            cacheControl: '3600',
            upsert: true,
          });

        if (chunkError) {
          throw new Error(`Chunk ${i + 1} upload failed: ${chunkError.message}`);
        }

        chunkPaths.push(chunkPath);
        setUploadedChunks(i + 1);
        setProgress(Math.round(((i + 1) / chunks) * 90)); // Reserve 10% for assembly
        setStatusMessage(`Uploaded chunk ${i + 1} of ${chunks}`);
      }

      // Now call an edge function to assemble the chunks
      setStatusMessage('Assembling chunks on server...');
      setProgress(92);
      
      const { data: assembleResult, error: assembleError } = await supabase.functions.invoke(
        'archive-assemble-chunks',
        {
          body: {
            chunk_paths: chunkPaths,
            final_path: storagePath,
            total_chunks: chunks,
          },
        }
      );

      if (assembleError) {
        console.error('Assembly function error:', assembleError);
        throw new Error(`Failed to assemble chunks: ${assembleError.message}`);
      }

      if (assembleResult?.error) {
        console.error('Assembly returned error:', assembleResult.error);
        throw new Error(`Chunk assembly failed: ${assembleResult.error}`);
      }

      setProgress(100);
      setStatus('complete');
      setStatusMessage('Upload complete!');
      onUploadComplete(storagePath, sha256, file.size);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setStatus('error');
      setStatusMessage(message);
      onError(message);
    } finally {
      setUploading(false);
    }
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    setStatusMessage(pausedRef.current ? 'Upload paused' : 'Resuming...');
  };

  const cancelUpload = () => {
    abortControllerRef.current?.abort();
    setUploading(false);
    setPaused(false);
    setStatus('idle');
    setProgress(0);
    setStatusMessage('');
  };

  const resetUploader = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setStatusMessage('');
    setUploadedChunks(0);
    setTotalChunks(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          uploading && 'pointer-events-none opacity-75'
        )}
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {file ? (
          <div className="flex flex-col items-center gap-4">
            {status === 'complete' ? (
              <CheckCircle className="w-12 h-12 text-green-500" />
            ) : status === 'error' ? (
              <AlertCircle className="w-12 h-12 text-destructive" />
            ) : (
              <FileArchive className="w-12 h-12 text-primary" />
            )}
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
                {totalChunks > 1 && ` • ${totalChunks} chunks`}
              </p>
            </div>
            
            {!uploading && status !== 'complete' && (
              <Button variant="outline" size="sm" onClick={resetUploader}>
                Change file
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-muted-foreground" />
            <div>
              <p className="font-medium">Drop your large ZIP file here</p>
              <p className="text-sm text-muted-foreground">
                Supports files up to {maxFileSizeMB >= 1000 ? `${(maxFileSizeMB / 1000).toFixed(0)}GB` : `${maxFileSizeMB}MB`}
              </p>
            </div>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
              id="chunked-file-upload"
            />
            <Label htmlFor="chunked-file-upload" className="cursor-pointer">
              <Button variant="outline" asChild>
                <span>Select file</span>
              </Button>
            </Label>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {(uploading || status === 'complete' || status === 'error') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={cn(
              status === 'complete' && 'text-green-600',
              status === 'error' && 'text-destructive'
            )}>
              {statusMessage}
            </span>
            <span className="text-muted-foreground">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {uploading && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
              >
                {paused ? (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={cancelUpload}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Start upload button */}
      {file && !uploading && status !== 'complete' && (
        <Button
          onClick={uploadChunked}
          className="w-full"
          size="lg"
        >
          <Upload className="w-4 h-4 mr-2" />
          Start Upload ({formatFileSize(file.size)})
        </Button>
      )}
    </div>
  );
}
