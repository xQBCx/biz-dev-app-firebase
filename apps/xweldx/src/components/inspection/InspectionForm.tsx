import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons/IndustrialIcons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Minus, Plus, Upload, RotateCcw, Camera, X } from "lucide-react";
import { CameraCapture, MediaGallery } from "@/components/camera";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const departments = [
  { value: "a_cut_shop", label: "A-Cut Shop" },
  { value: "b_bechtel", label: "B-Bechtel" },
  { value: "f_fab", label: "F-Fab" },
  { value: "n_galvanizing", label: "N-Galvanizing" },
  { value: "o_foam_fab", label: "O-Foam Fab" },
  { value: "p_constants_variable_spring_line", label: "P-Constants Variable / Spring Line" },
];

const inspectionTypes = [
  { value: "visual", label: "Visual" },
  { value: "dimensional", label: "Dimensional" },
  { value: "ndt", label: "NDT" },
  { value: "pressure_test", label: "Pressure Test" },
  { value: "final", label: "Final" },
];

const formSchema = z.object({
  department: z.string().optional(),
  job: z.string().max(100).optional(),
  item: z.string().max(100).optional(),
  quantity: z.number().min(1).default(1),
  inspection_type: z.string().optional(),
  pass_count: z.number().min(1).default(1),
  weld_stamp: z.string().max(50).optional(),
  weld_stamp_not_required: z.boolean().default(false),
  weld_stamp_none: z.boolean().default(false),
  part: z.string().max(100).optional(),
  parts_accepted: z.number().min(0).default(0),
  parts_rejected: z.number().min(0).default(0),
  location: z.string().min(1, "Location is required").max(200),
  welder_name: z.string().min(1, "Welder name is required").max(100),
  welder_id: z.string().min(1, "Welder ID is required").max(50),
  notes: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InspectionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function InspectionForm({ onSuccess, onCancel }: InspectionFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; type: 'photo' | 'video'; timestamp: Date }[]>([]);
  const [createdInspectionId, setCreatedInspectionId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: undefined,
      job: "",
      item: "",
      quantity: 1,
      inspection_type: undefined,
      pass_count: 1,
      weld_stamp: "",
      weld_stamp_not_required: false,
      weld_stamp_none: false,
      part: "",
      parts_accepted: 0,
      parts_rejected: 0,
      location: "",
      welder_name: "",
      welder_id: "",
      notes: "",
    },
  });

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleReset = () => {
    form.reset();
    setDuration(0);
    setSelectedFiles([]);
    setCapturedMedia([]);
    setIsTimerRunning(true);
  };

  const handleMediaCaptured = (url: string, type: 'photo' | 'video') => {
    setCapturedMedia(prev => [...prev, { url, type, timestamp: new Date() }]);
    setIsCameraOpen(false);
  };

  const handleRemoveMedia = (url: string) => {
    setCapturedMedia(prev => prev.filter(m => m.url !== url));
  };

  const incrementValue = (field: "parts_accepted" | "parts_rejected" | "pass_count" | "quantity") => {
    const currentValue = form.getValues(field);
    form.setValue(field, currentValue + 1);
  };

  const decrementValue = (field: "parts_accepted" | "parts_rejected" | "pass_count" | "quantity") => {
    const currentValue = form.getValues(field);
    if (currentValue > 0) {
      form.setValue(field, currentValue - 1);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to create an inspection");
      return;
    }

    setIsSubmitting(true);
    setIsTimerRunning(false);

    try {
      const { data, error } = await supabase
        .from("inspections")
        .insert({
          inspector_id: user.id,
          department: values.department as any,
          job: values.job || null,
          item: values.item || null,
          quantity: values.quantity,
          inspection_type: values.inspection_type || null,
          pass_count: values.pass_count,
          weld_stamp: values.weld_stamp || null,
          weld_stamp_not_required: values.weld_stamp_not_required,
          weld_stamp_none: values.weld_stamp_none,
          part: values.part || null,
          parts_accepted: values.parts_accepted,
          parts_rejected: values.parts_rejected,
          location: values.location,
          welder_name: values.welder_name,
          welder_id: values.welder_id,
          notes: values.notes || null,
          duration_seconds: duration,
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Inspection created successfully");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating inspection:", error);
      toast.error(error.message || "Failed to create inspection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const partsAccepted = form.watch("parts_accepted");
  const partsRejected = form.watch("parts_rejected");
  const total = partsAccepted + partsRejected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="steel">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center justify-between text-xl font-black uppercase tracking-wider">
            <span>InProcess Inspection</span>
            <span className="font-mono text-lg text-accent">
              Duration: {formatDuration(duration)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Inspector Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Inspector
                  </Label>
                  <p className="mt-1 font-medium">{user?.email || "Not logged in"}</p>
                </div>
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Department
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Job & Item */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="job"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Job
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Job number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="item"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Item
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Item" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Qty
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => decrementValue("quantity")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-16 text-center"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => incrementValue("quantity")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Welder Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="welder_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Welder Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Welder name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="welder_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Welder ID
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Welder ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Type & Pass */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="inspection_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {inspectionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pass_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Pass
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => decrementValue("pass_count")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-16 text-center"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => incrementValue("pass_count")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Weld Stamp */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="weld_stamp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Weld Stamp
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Weld stamp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col justify-end gap-3 pb-2">
                  <FormField
                    control={form.control}
                    name="weld_stamp_not_required"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium">Not Required</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weld_stamp_none"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium">None</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Part */}
              <FormField
                control={form.control}
                name="part"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Part
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Part" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parts Accepted/Rejected */}
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="parts_accepted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Parts Accepted
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="industrial"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => decrementValue("parts_accepted")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-16 text-center"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="industrial"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => incrementValue("parts_accepted")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parts_rejected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Parts Rejected
                      </FormLabel>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="industrial"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => decrementValue("parts_rejected")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-16 text-center"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="industrial"
                          size="icon"
                          className="h-10 w-10"
                          onClick={() => incrementValue("parts_rejected")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col justify-end pb-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Total
                  </Label>
                  <p className="mt-1 text-2xl font-bold text-accent">{total}</p>
                </div>
              </div>

              {/* Media Capture & Upload */}
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Photos & Videos
                </Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="industrial"
                    className="flex-1"
                    onClick={() => setIsCameraOpen(true)}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Open Camera
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </div>
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedFiles.length} file(s) selected for upload
                  </p>
                )}
                
                {/* Captured Media Gallery */}
                {capturedMedia.length > 0 && (
                  <MediaGallery
                    media={capturedMedia}
                    onRemove={handleRemoveMedia}
                    title="Captured Media"
                  />
                )}
              </div>

              {/* Camera Dialog */}
              <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                <DialogContent className="max-w-lg p-0 overflow-hidden">
                  <CameraCapture
                    inspectionId={createdInspectionId || undefined}
                    onMediaCaptured={handleMediaCaptured}
                    onClose={() => setIsCameraOpen(false)}
                  />
                </DialogContent>
              </Dialog>

              {/* Comments */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Comments
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add comments..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="order-2 sm:order-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <div className="order-1 flex gap-3 sm:order-2">
                  {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" variant="industrial" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
