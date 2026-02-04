/**
 * Glyph Decoder UI
 * Upload and decode QBC glyphs back to text
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, FileJson, CheckCircle2, XCircle, Hexagon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { decodePath } from '@/lib/qbc/encoder';
import { EncodedPath } from '@/lib/qbc/types';

interface DecodeResult {
  text: string;
  verified: boolean;
  pathLength: number;
  dimension: '2D' | '3D';
}

export function GlyphDecoder() {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleDecode = useCallback(() => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data');
      return;
    }
    
    setIsDecoding(true);
    setError(null);
    setDecodeResult(null);
    
    try {
      const data = JSON.parse(jsonInput);
      
      // Check if it's a valid encoded path
      if (!data.events && !data.visitedChars) {
        throw new Error('Invalid QBC data format');
      }
      
      // Decode based on dimension
      const is3D = data.dimension === '3D';
      const text = data.visitedChars ? data.visitedChars.join('') : decodePath(data as EncodedPath);
      
      setDecodeResult({
        text,
        verified: true,
        pathLength: data.events?.length || 0,
        dimension: is3D ? '3D' : '2D',
      });
      
      toast({
        title: 'Decoding successful',
        description: `Decoded ${text.length} characters`,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(`Decoding failed: ${message}`);
      toast({
        title: 'Decoding failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsDecoding(false);
    }
  }, [jsonInput, toast]);
  
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setError(null);
      setDecodeResult(null);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
    
    // Reset input for same file re-upload
    e.target.value = '';
  }, []);
  
  const handleClear = useCallback(() => {
    setJsonInput('');
    setDecodeResult(null);
    setError(null);
  }, []);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Glyph Decoder
          </CardTitle>
          <CardDescription>
            Upload or paste QBC JSON data to decode back to text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload">Upload JSON File</Label>
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
          
          {/* JSON Input */}
          <div>
            <Label htmlFor="json-input">Or Paste JSON</Label>
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError(null);
              }}
              placeholder='{"events": [...], "visitedChars": [...]}'
              className="font-mono text-sm h-48"
            />
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleDecode} 
              disabled={!jsonInput.trim() || isDecoding}
              className="flex-1"
            >
              {isDecoding ? 'Decoding...' : 'Decode'}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Result Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Decoded Result</CardTitle>
        </CardHeader>
        <CardContent>
          {decodeResult ? (
            <div className="space-y-4">
              {/* Status Badges */}
              <div className="flex items-center gap-2">
                <Badge variant={decodeResult.verified ? 'default' : 'destructive'}>
                  {decodeResult.verified ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </>
                  )}
                </Badge>
                <Badge variant="outline">{decodeResult.dimension}</Badge>
                <Badge variant="secondary">
                  {decodeResult.pathLength} events
                </Badge>
              </div>
              
              {/* Decoded Text */}
              <div>
                <Label>Decoded Text</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="font-mono text-lg break-all">
                    {decodeResult.text}
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Characters:</span>
                  <span className="ml-2 font-medium">{decodeResult.text.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Unique:</span>
                  <span className="ml-2 font-medium">
                    {new Set(decodeResult.text).size}
                  </span>
                </div>
              </div>
              
              {/* Copy Button */}
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(decodeResult.text);
                  toast({ title: 'Copied to clipboard' });
                }}
              >
                Copy Decoded Text
              </Button>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <Hexagon className="h-12 w-12 mb-4 opacity-30" />
              <p>Upload or paste QBC data to decode</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
