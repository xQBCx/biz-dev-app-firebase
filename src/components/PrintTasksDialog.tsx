import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface Task {
  id: string;
  subject: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  status: string;
}

interface PrintTasksDialogProps {
  tasks: Task[];
}

export function PrintTasksDialog({ tasks }: PrintTasksDialogProps) {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(['all']);
  const [open, setOpen] = useState(false);

  const togglePriority = (priority: string) => {
    if (priority === 'all') {
      setSelectedPriorities(['all']);
    } else {
      const newPriorities = selectedPriorities.filter(p => p !== 'all');
      if (selectedPriorities.includes(priority)) {
        const filtered = newPriorities.filter(p => p !== priority);
        setSelectedPriorities(filtered.length === 0 ? ['all'] : filtered);
      } else {
        setSelectedPriorities([...newPriorities, priority]);
      }
    }
  };

  const getFilteredTasks = () => {
    if (selectedPriorities.includes('all')) {
      return tasks;
    }
    return tasks.filter(task => selectedPriorities.includes(task.priority));
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredTasks = getFilteredTasks();
  const groupedTasks = {
    high: filteredTasks.filter(t => t.priority === 'high'),
    medium: filteredTasks.filter(t => t.priority === 'medium'),
    low: filteredTasks.filter(t => t.priority === 'low'),
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print List
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Print To-Do List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Select Priority Levels</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all"
                    checked={selectedPriorities.includes('all')}
                    onCheckedChange={() => togglePriority('all')}
                  />
                  <label htmlFor="all" className="text-sm font-medium cursor-pointer">
                    All Priorities ({tasks.length} tasks)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="high"
                    checked={selectedPriorities.includes('high') || selectedPriorities.includes('all')}
                    onCheckedChange={() => togglePriority('high')}
                    disabled={selectedPriorities.includes('all')}
                  />
                  <label htmlFor="high" className="text-sm font-medium cursor-pointer">
                    High Priority ({tasks.filter(t => t.priority === 'high').length} tasks)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medium"
                    checked={selectedPriorities.includes('medium') || selectedPriorities.includes('all')}
                    onCheckedChange={() => togglePriority('medium')}
                    disabled={selectedPriorities.includes('all')}
                  />
                  <label htmlFor="medium" className="text-sm font-medium cursor-pointer">
                    Medium Priority ({tasks.filter(t => t.priority === 'medium').length} tasks)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="low"
                    checked={selectedPriorities.includes('low') || selectedPriorities.includes('all')}
                    onCheckedChange={() => togglePriority('low')}
                    disabled={selectedPriorities.includes('all')}
                  />
                  <label htmlFor="low" className="text-sm font-medium cursor-pointer">
                    Low Priority ({tasks.filter(t => t.priority === 'low').length} tasks)
                  </label>
                </div>
              </div>
            </div>
            <Button onClick={handlePrint} className="w-full gap-2">
              <Printer className="h-4 w-4" />
              Print {filteredTasks.length} Tasks
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print-only content */}
      <div className="print-only">
        <div className="print-header">
          <h1>To-Do List</h1>
          <p>{format(new Date(), "MMMM d, yyyy")}</p>
        </div>

        {groupedTasks.high.length > 0 && (
          <div className="print-section">
            <h2 className="print-priority-header high">High Priority</h2>
            {groupedTasks.high.map((task) => (
              <div key={task.id} className="print-task">
                <div className="print-checkbox">☐</div>
                <div className="print-task-content">
                  <div className="print-task-title">{task.subject}</div>
                  {task.description && (
                    <div className="print-task-description">{task.description}</div>
                  )}
                  {task.due_date && (
                    <div className="print-task-due">
                      Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                    </div>
                  )}
                  <div className="print-notes-space">Notes: _______________________________________________</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {groupedTasks.medium.length > 0 && (
          <div className="print-section">
            <h2 className="print-priority-header medium">Medium Priority</h2>
            {groupedTasks.medium.map((task) => (
              <div key={task.id} className="print-task">
                <div className="print-checkbox">☐</div>
                <div className="print-task-content">
                  <div className="print-task-title">{task.subject}</div>
                  {task.description && (
                    <div className="print-task-description">{task.description}</div>
                  )}
                  {task.due_date && (
                    <div className="print-task-due">
                      Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                    </div>
                  )}
                  <div className="print-notes-space">Notes: _______________________________________________</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {groupedTasks.low.length > 0 && (
          <div className="print-section">
            <h2 className="print-priority-header low">Low Priority</h2>
            {groupedTasks.low.map((task) => (
              <div key={task.id} className="print-task">
                <div className="print-checkbox">☐</div>
                <div className="print-task-content">
                  <div className="print-task-title">{task.subject}</div>
                  {task.description && (
                    <div className="print-task-description">{task.description}</div>
                  )}
                  {task.due_date && (
                    <div className="print-task-due">
                      Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                    </div>
                  )}
                  <div className="print-notes-space">Notes: _______________________________________________</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only,
          .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .print-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          .print-header p {
            font-size: 14px;
            margin: 0;
          }
          .print-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .print-priority-header {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            padding: 8px 12px;
            border-left: 4px solid #000;
          }
          .print-priority-header.high {
            background-color: #fee;
            border-left-color: #f00;
          }
          .print-priority-header.medium {
            background-color: #fef7e0;
            border-left-color: #f90;
          }
          .print-priority-header.low {
            background-color: #f0f0f0;
            border-left-color: #666;
          }
          .print-task {
            display: flex;
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #ddd;
            page-break-inside: avoid;
          }
          .print-checkbox {
            font-size: 20px;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .print-task-content {
            flex: 1;
          }
          .print-task-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .print-task-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          .print-task-due {
            font-size: 11px;
            color: #999;
            margin-bottom: 8px;
          }
          .print-notes-space {
            font-size: 11px;
            color: #999;
            margin-top: 8px;
            border-top: 1px dashed #ddd;
            padding-top: 8px;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </>
  );
}
