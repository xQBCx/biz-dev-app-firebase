import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Edit,
  Trash2,
  MoreHorizontal,
  FileJson,
  FileText,
  Image as ImageIcon,
  Clock,
  Flag,
} from "lucide-react";
import { PromptItem } from "@/hooks/usePromptLibrary";
import { formatDistanceToNow } from "date-fns";

interface PromptCardProps {
  prompt: PromptItem;
  onCopy: (content: string) => void;
  onEdit: (prompt: PromptItem) => void;
  onDelete: (id: string) => void;
  onExportMarkdown: (prompt: PromptItem) => void;
  onExportJSON: (prompt: PromptItem) => void;
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
};

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-primary/10 text-primary",
  used: "bg-accent/50 text-accent-foreground",
  archived: "bg-muted text-muted-foreground opacity-60",
};

export const PromptCard = ({
  prompt,
  onCopy,
  onEdit,
  onDelete,
  onExportMarkdown,
  onExportJSON,
}: PromptCardProps) => {
  const truncatedContent = prompt.content.length > 150
    ? prompt.content.substring(0, 150) + "..."
    : prompt.content;

  return (
    <Card className="group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => onEdit(prompt)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{prompt.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {prompt.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              <Badge className={`text-xs ${priorityColors[prompt.priority]}`}>
                <Flag className="h-3 w-3 mr-1" />
                {prompt.priority}
              </Badge>
              <Badge className={`text-xs ${statusColors[prompt.status]}`}>
                {prompt.status}
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCopy(prompt.content); }}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(prompt); }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExportMarkdown(prompt); }}>
                <FileText className="h-4 w-4 mr-2" />
                Export Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExportJSON(prompt); }}>
                <FileJson className="h-4 w-4 mr-2" />
                Export JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(prompt.id); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 font-mono">
          {truncatedContent}
        </p>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
          </div>
          
          <div className="flex items-center gap-2">
            {prompt.images.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                {prompt.images.length}
              </div>
            )}
            {prompt.tags.length > 0 && (
              <div className="flex gap-1">
                {prompt.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
                {prompt.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    +{prompt.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
