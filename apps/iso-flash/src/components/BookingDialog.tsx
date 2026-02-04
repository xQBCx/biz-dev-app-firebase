import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (bookingData: BookingData) => void;
  photographerName: string;
  hourlyRate: number;
}

export interface BookingData {
  scheduledAt: Date;
  deviceUsed: "client_phone" | "photographer_phone";
  allowPhotographerPortfolio: boolean;
  editingRequested: boolean;
  editingFee?: number;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
];

export function BookingDialog({ open, onClose, onConfirm, photographerName, hourlyRate }: BookingDialogProps) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [deviceUsed, setDeviceUsed] = useState<"client_phone" | "photographer_phone">("photographer_phone");
  const [allowPortfolio, setAllowPortfolio] = useState(false);
  const [editingRequested, setEditingRequested] = useState(false);
  const [editingFee, setEditingFee] = useState<number>(15);

  const handleConfirm = () => {
    if (!date || !time) return;

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    onConfirm({
      scheduledAt,
      deviceUsed,
      allowPhotographerPortfolio: allowPortfolio,
      editingRequested,
      editingFee: editingRequested ? editingFee : undefined,
    });
  };

  const totalCost = editingRequested ? hourlyRate + editingFee : hourlyRate;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Session with {photographerName}</DialogTitle>
          <DialogDescription>
            Choose your preferred date, time, and session preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Select Date
            </Label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
              className={cn("rounded-md border pointer-events-auto")}
            />
          </div>

          {/* Time Selection */}
          {date && (
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Select Time
              </Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Device Preference */}
          {date && time && (
            <>
              <div className="space-y-3">
                <Label>Device to Use</Label>
                <Select value={deviceUsed} onValueChange={(v: any) => setDeviceUsed(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photographer_phone">Photographer's phone</SelectItem>
                    <SelectItem value="client_phone">My phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Portfolio Permission */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Portfolio Use</Label>
                  <p className="text-sm text-muted-foreground">
                    Let the photographer showcase these photos
                  </p>
                </div>
                <Switch checked={allowPortfolio} onCheckedChange={setAllowPortfolio} />
              </div>

              {/* Editing Option */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Professional Editing</Label>
                    <p className="text-sm text-muted-foreground">
                      Include photo editing service
                    </p>
                  </div>
                  <Switch checked={editingRequested} onCheckedChange={setEditingRequested} />
                </div>

                {editingRequested && (
                  <div className="space-y-2">
                    <Label>Editing Fee (${editingFee})</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={editingFee}
                      onChange={(e) => setEditingFee(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session date:</span>
                  <span className="font-medium">
                    {format(date, "PPP")} at {time}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hourly rate:</span>
                  <span className="font-medium">${hourlyRate}/hr</span>
                </div>
                {editingRequested && (
                  <div className="flex justify-between text-sm">
                    <span>Editing fee:</span>
                    <span className="font-medium">${editingFee}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Estimated total:</span>
                  <span className="text-primary">${totalCost}/hr</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!date || !time}
            className="flex-1"
          >
            Confirm Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
