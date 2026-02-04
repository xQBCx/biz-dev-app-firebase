import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileJson, FileImage, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Glyph2DRenderer } from './Glyph2DRenderer';
import { useLattices } from '@/hooks/useLattices';
import {
  parseGlyphPackage,
  decodeGlyphPackage,
  decodeFromSvg,
  DecodeResult,
  DEFAULT_STYLE,
  DEFAULT_ORIENTATION,
} from '@/lib/qbc';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function GlyphDecoder() {
  const { lattices, getDefaultLattice } = useLattices();
  const [decodeResult, setDecodeResult] = useState<DecodeResult | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [assumeG1, setAssumeG1] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultLattice = getDefaultLattice();

  const handleJsonDecode = useCallback(() => {
    setError(null);
    setDecodeResult(null);

    const pkg = parseGlyphPackage(jsonInput);
    if (!pkg) {
      setError('Invalid glyph package format. Please paste a valid QBC JSON package.');
      return;
    }

    const result = decodeGlyphPackage(pkg);
    setDecodeResult(result);
    toast.success('Glyph decoded successfully');
  }, [jsonInput]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      setDecodeResult(null);

      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      if (file.name.endsWith('.json')) {
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setJsonInput(content);

          const pkg = parseGlyphPackage(content);
          if (!pkg) {
            setError('Invalid glyph package format');
            return;
          }

          const result = decodeGlyphPackage(pkg);
          setDecodeResult(result);
          toast.success('Glyph decoded from JSON');
        };
        reader.readAsText(file);
      } else if (file.name.endsWith('.svg')) {
        reader.onload = (event) => {
          const content = event.target?.result as string;

          const lattice = assumeG1 ? defaultLattice : null;
          const result = decodeFromSvg(content, lattice?.anchors_json);

          if (result) {
            setDecodeResult(result);
            toast.success('Glyph decoded from SVG');
          } else {
            setError(
              'Could not decode SVG. This may not be a QBC-generated SVG or it lacks embedded metadata.'
            );
          }
        };
        reader.readAsText(file);
      } else {
        setError('Please upload a .json or .svg file');
      }
    },
    [assumeG1, defaultLattice]
  );

  const decodedLattice = decodeResult
    ? lattices.find((l) => l.lattice_key === decodeResult.latticeKey) || defaultLattice
    : null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Decode Glyph</h1>
        <p className="text-muted-foreground mt-2">
          Decode a glyph back to text using a JSON package or SVG file
        </p>
      </div>

      <Tabs defaultValue="json" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="json" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            JSON Package
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="json" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Paste Glyph Package JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"version":"1.0","metadata":{...},"path":{...}}'
                rows={10}
                className="font-mono text-sm"
              />
              <Button onClick={handleJsonDecode} disabled={!jsonInput.trim()}>
                Decode
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="file" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Glyph File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-primary hover:underline">Click to upload</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports .json (glyph package) and .svg files
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,.svg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="assume-g1">Assume G1 lattice for SVG files</Label>
                <Switch id="assume-g1" checked={assumeG1} onCheckedChange={setAssumeG1} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {decodeResult && decodedLattice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Decoded Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Decoded Text</Label>
                  <p className="text-3xl font-bold mt-1">{decodeResult.text}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Confidence</Label>
                  <p className="text-lg mt-1">
                    {(decodeResult.confidence * 100).toFixed(0)}%
                    {decodeResult.confidence === 1 && (
                      <span className="text-green-600 ml-2">(Exact)</span>
                    )}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Lattice</Label>
                  <p className="mt-1">{decodeResult.latticeKey}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Path Length</Label>
                  <p className="mt-1">{decodeResult.path.events.length} events</p>
                </div>

                {decodeResult.notes && (
                  <div>
                    <Label className="text-muted-foreground">Notes</Label>
                    <p className="mt-1 text-sm">{decodeResult.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <Glyph2DRenderer
                  path={decodeResult.path}
                  anchors={decodedLattice.anchors_json}
                  style={DEFAULT_STYLE}
                  orientation={DEFAULT_ORIENTATION}
                  size={300}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
