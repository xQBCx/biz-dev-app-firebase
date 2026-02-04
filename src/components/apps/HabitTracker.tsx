import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plus } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", name: "Morning Exercise", streak: 7, completed: false },
    { id: "2", name: "Read 30 min", streak: 12, completed: true },
  ]);
  const [newHabit, setNewHabit] = useState("");

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([...habits, { id: Date.now().toString(), name: newHabit, streak: 0, completed: false }]);
      setNewHabit("");
    }
  };

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak } : h));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="New habit..." />
          <Button onClick={addHabit}><Plus className="h-4 w-4" /></Button>
        </div>
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-3">
              <Checkbox checked={habit.completed} onCheckedChange={() => toggleHabit(habit.id)} />
              <span className={habit.completed ? "line-through text-muted-foreground" : ""}>{habit.name}</span>
            </div>
            <Badge>{habit.streak} day streak 🔥</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
