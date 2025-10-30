import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

interface PostSchedulerProps {
  onUpdate: () => void;
}

export const PostScheduler = ({ onUpdate }: PostSchedulerProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Post Scheduler</CardTitle>
            <CardDescription>
              Create and schedule posts across all connected platforms
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-8">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Scheduled Posts</h3>
        <p className="text-muted-foreground text-center mb-4">
          Create your first post to start scheduling content
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </CardContent>
    </Card>
  );
};