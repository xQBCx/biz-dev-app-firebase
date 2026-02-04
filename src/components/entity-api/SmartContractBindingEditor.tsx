import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  useSmartContractBindings, 
  useCreateSmartContractBinding, 
  useUpdateSmartContractBinding,
  useDeleteSmartContractBinding,
  BindingSourceType 
} from "@/hooks/useEntityAPIs";
import { Loader2, Plus, Link2, Zap, Trash2, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const sourceTypeLabels: Record<BindingSourceType, string> = {
  oracle_feed: "Oracle Data Feed",
  entity_api: "Entity API",
  attestation: "Human Attestation",
  manual: "Manual Trigger",
};

const actionOptions = [
  { value: "execute_settlement", label: "Execute Settlement" },
  { value: "notify_parties", label: "Notify Parties" },
  { value: "update_status", label: "Update Status" },
  { value: "log_event", label: "Log Event Only" },
  { value: "custom", label: "Custom Action" },
];

interface SmartContractBindingEditorProps {
  settlementContractId: string;
  dealRoomId?: string;
}

export default function SmartContractBindingEditor({ 
  settlementContractId, 
  dealRoomId 
}: SmartContractBindingEditorProps) {
  const { data: bindings, isLoading } = useSmartContractBindings(settlementContractId, dealRoomId);
  const createBinding = useCreateSmartContractBinding();
  const updateBinding = useUpdateSmartContractBinding();
  const deleteBinding = useDeleteSmartContractBinding();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    binding_name: "",
    binding_description: "",
    binding_source_type: "entity_api" as BindingSourceType,
    binding_source_id: "",
    condition_expression: "",
    action_on_trigger: "execute_settlement",
    priority: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBinding.mutateAsync({
      settlement_contract_id: settlementContractId,
      deal_room_id: dealRoomId,
      ...formData,
    });
    setIsDialogOpen(false);
    setFormData({
      binding_name: "",
      binding_description: "",
      binding_source_type: "entity_api",
      binding_source_id: "",
      condition_expression: "",
      action_on_trigger: "execute_settlement",
      priority: 1,
    });
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    await updateBinding.mutateAsync({ id, is_active: !currentState });
  };

  const handleDelete = async (id: string) => {
    await deleteBinding.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Smart Contract Bindings
            </CardTitle>
            <CardDescription>
              Connect data sources and APIs to trigger smart contract actions
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Binding
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Smart Contract Binding</DialogTitle>
                <DialogDescription>
                  Link a data source or API to trigger contract actions when conditions are met
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="binding_name">Binding Name</Label>
                    <Input
                      id="binding_name"
                      value={formData.binding_name}
                      onChange={(e) => setFormData({ ...formData, binding_name: e.target.value })}
                      placeholder="e.g., Work Completion Triggers Payment"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="binding_description">Description</Label>
                    <Textarea
                      id="binding_description"
                      value={formData.binding_description}
                      onChange={(e) => setFormData({ ...formData, binding_description: e.target.value })}
                      placeholder="Describe when and how this binding should trigger..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="binding_source_type">Source Type</Label>
                      <Select
                        value={formData.binding_source_type}
                        onValueChange={(value: BindingSourceType) => 
                          setFormData({ ...formData, binding_source_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(sourceTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                      />
                      <p className="text-xs text-muted-foreground">Lower = higher priority</p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="binding_source_id">Source ID</Label>
                    <Input
                      id="binding_source_id"
                      value={formData.binding_source_id}
                      onChange={(e) => setFormData({ ...formData, binding_source_id: e.target.value })}
                      placeholder="UUID of the oracle feed, API endpoint, or attestation config"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="condition_expression">Condition Expression</Label>
                    <Textarea
                      id="condition_expression"
                      value={formData.condition_expression}
                      onChange={(e) => setFormData({ ...formData, condition_expression: e.target.value })}
                      placeholder="e.g., response.status == 'approved' && response.amount > 0"
                      rows={2}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Expression evaluated against the source response to determine if action should trigger
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="action_on_trigger">Action on Trigger</Label>
                    <Select
                      value={formData.action_on_trigger}
                      onValueChange={(value) => 
                        setFormData({ ...formData, action_on_trigger: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createBinding.isPending}>
                    {createBinding.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Binding
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!bindings?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bindings configured yet.</p>
            <p className="text-sm">Add bindings to connect data sources to contract actions.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bindings.map((binding) => (
              <div
                key={binding.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg mt-1">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{binding.binding_name}</h4>
                      <Badge variant="outline">
                        {sourceTypeLabels[binding.binding_source_type]}
                      </Badge>
                      <Badge variant="secondary">
                        Priority: {binding.priority}
                      </Badge>
                    </div>
                    {binding.binding_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {binding.binding_description}
                      </p>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                        {binding.condition_expression}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        → {actionOptions.find(a => a.value === binding.action_on_trigger)?.label || binding.action_on_trigger}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {binding.evaluation_count} evaluations
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {binding.trigger_count} triggers
                      </span>
                      {binding.last_triggered_at && (
                        <span>
                          Last triggered: {new Date(binding.last_triggered_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={binding.is_active}
                      onCheckedChange={() => handleToggleActive(binding.id, binding.is_active)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {binding.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Binding</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this binding? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(binding.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
