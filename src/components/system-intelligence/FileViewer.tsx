import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Copy, 
  Download, 
  FileCode, 
  Maximize2, 
  Minimize2,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CodeFile {
  id: string;
  file_path: string;
  file_size: number;
  language: string;
  last_fetched_at: string;
  file_content?: string;
}

interface FileViewerProps {
  file: CodeFile | null;
  onClose?: () => void;
}

export function FileViewer({ file, onClose }: FileViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!file) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <FileCode className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a file from the tree to view its contents
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const copyToClipboard = () => {
    if (file.file_content) {
      navigator.clipboard.writeText(file.file_content);
      toast({ title: "Copied", description: "File content copied to clipboard" });
    }
  };

  const downloadFile = () => {
    if (file.file_content) {
      const blob = new Blob([file.file_content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_path.split('/').pop() || 'file.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      typescript: 'bg-blue-500',
      javascript: 'bg-yellow-500',
      python: 'bg-green-500',
      json: 'bg-orange-500',
      css: 'bg-purple-500',
      html: 'bg-red-500',
      markdown: 'bg-gray-500',
    };
    return colors[lang] || 'bg-muted';
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : 'h-full'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{file.file_path}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className={`${getLanguageColor(file.language)} text-white`}
              >
                {file.language}
              </Badge>
              <span>{(file.file_size / 1024).toFixed(1)}KB</span>
              <span>•</span>
              <span>Fetched {formatDate(file.last_fetched_at)}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={downloadFile}>
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={isFullscreen ? 'h-[calc(100vh-12rem)]' : 'h-[400px]'}>
          <pre className="text-sm font-mono bg-muted/30 p-4 rounded-lg overflow-x-auto">
            <code>
              {file.file_content || 'No content available'}
            </code>
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
