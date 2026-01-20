import { Badge } from "@/components/ui/badge";
import { 
  Image, Music, Video, FileText, X, 
  FileSpreadsheet, Presentation, Archive, 
  Code2, File, Link2, FileType
} from "lucide-react";
import { getFileTypeInfo, formatFileSize } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";

interface FilePreviewBadgeProps {
  file: File;
  onRemove: () => void;
  className?: string;
}

export function FilePreviewBadge({ file, onRemove, className }: FilePreviewBadgeProps) {
  const typeInfo = getFileTypeInfo(file);
  
  const getIcon = () => {
    switch (typeInfo.icon) {
      case 'image':
        return <Image className="h-3 w-3 shrink-0" />;
      case 'audio':
        return <Music className="h-3 w-3 shrink-0" />;
      case 'video':
        return <Video className="h-3 w-3 shrink-0" />;
      case 'pdf':
        return <FileText className="h-3 w-3 shrink-0 text-red-500" />;
      case 'word':
        return <FileType className="h-3 w-3 shrink-0 text-blue-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-3 w-3 shrink-0 text-green-500" />;
      case 'powerpoint':
        return <Presentation className="h-3 w-3 shrink-0 text-orange-500" />;
      case 'archive':
        return <Archive className="h-3 w-3 shrink-0" />;
      case 'code':
        return <Code2 className="h-3 w-3 shrink-0" />;
      case 'text':
        return <FileText className="h-3 w-3 shrink-0" />;
      case 'link':
        return <Link2 className="h-3 w-3 shrink-0" />;
      default:
        return <File className="h-3 w-3 shrink-0" />;
    }
  };

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "gap-1.5 pr-1 text-xs animate-in slide-in-from-bottom-2 max-w-full",
        !typeInfo.canAnalyze && "opacity-70",
        className
      )}
      title={`${file.name} (${formatFileSize(file.size)})${!typeInfo.canAnalyze ? ' - Cannot be analyzed' : ''}`}
    >
      {getIcon()}
      <span className="max-w-[60px] sm:max-w-[100px] truncate">{file.name}</span>
      <span className="text-muted-foreground text-[10px] hidden sm:inline">
        {formatFileSize(file.size)}
      </span>
      <button 
        onClick={onRemove} 
        className="ml-0.5 hover:text-destructive shrink-0 p-0.5 rounded hover:bg-destructive/10"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
