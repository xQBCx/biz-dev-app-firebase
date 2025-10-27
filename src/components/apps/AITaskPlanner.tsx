import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  estimatedTime: string;
}

export function AITaskPlanner() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Review quarterly reports", priority: "high", estimatedTime: "2h" },
    { id: "2", title: "Team sync meeting", priority: "medium", estimatedTime: "30m" },
  ]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (input.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), title: input, priority: "medium", estimatedTime: "1h" }]);
      setInput("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Task Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="What needs to be done?" />
          <Button onClick={addTask}>Add</Button>
        </div>
        {tasks.map((task) => (
          <div key={task.id} className="p-3 border rounded space-y-2">
            <div className="flex items-start justify-between">
              <span className="font-medium">{task.title}</span>
              <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>{task.priority}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.estimatedTime}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
