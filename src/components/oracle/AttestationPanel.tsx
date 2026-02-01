import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useOracleAttestations, useSubmitAttestation, OracleAttestationType } from "@/hooks/useOracleNetwork";
import { Loader2, Plus, Shield, FileCheck, MapPin, Clock, User, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AttestationPanelProps {
  dealRoomId?: string;
  subjectEntityType?: string;
  subjectEntityId?: string;
  onAttestationSubmitted?: () => void;
}

const attestationTypeLabels: Record<OracleAttestationType, string> = {
  field_supervisor: "Field Supervisor",
  quality_inspector: "Quality Inspector",
  auditor: "Auditor",
  compliance_officer: "Compliance Officer",
  executive: "Executive",
  third_party: "Third Party",
};

export default function AttestationPanel({
  dealRoomId,
  subjectEntityType,
  subjectEntityId,
  onAttestationSubmitted,
}: AttestationPanelProps) {
  const { data: attestations, isLoading } = useOracleAttestations(dealRoomId);
  const submitAttestation = useSubmitAttestation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    attestation_type: "field_supervisor" as OracleAttestationType,
    subject_entity_type: subjectEntityType || "work_order",
    subject_entity_id: subjectEntityId || "",
    notes: "",
    confirmation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get user's current location if available
    let geolocation: { lat: number; lng: number } | undefined;
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        geolocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      } catch {
        // Location not available, continue without it
      }
    }

    await submitAttestation.mutateAsync({
      attestation_type: formData.attestation_type,
      subject_entity_type: formData.subject_entity_type,
      subject_entity_id: formData.subject_entity_id,
      deal_room_id: dealRoomId,
      attestation_data: {
        notes: formData.notes,
        confirmation: formData.confirmation,
        submitted_at: new Date().toISOString(),
      },
      geolocation,
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
    });

    setIsDialogOpen(false);
    setFormData({
      attestation_type: "field_supervisor",
      subject_entity_type: subjectEntityType || "work_order",
      subject_entity_id: subjectEntityId || "",
      notes: "",
      confirmation: "",
    });

    onAttestationSubmitted?.();
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
              <Shield className="h-5 w-5" />
              Oracle Attestations
            </CardTitle>
            <CardDescription>
              Human-verified confirmations that trigger smart contract actions
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Submit Attestation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Submit Attestation</DialogTitle>
                <DialogDescription>
                  Digitally sign and confirm a real-world event
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="attestation_type">Your Role</Label>
                    <Select
                      value={formData.attestation_type}
                      onValueChange={(value: OracleAttestationType) =>
                        setFormData({ ...formData, attestation_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(attestationTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="subject_entity_type">Subject Type</Label>
                      <Select
                        value={formData.subject_entity_type}
                        onValueChange={(value) =>
                          setFormData({ ...formData, subject_entity_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="work_order">Work Order</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                          <SelectItem value="payment">Payment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="subject_entity_id">Reference ID</Label>
                      <Input
                        id="subject_entity_id"
                        value={formData.subject_entity_id}
                        onChange={(e) =>
                          setFormData({ ...formData, subject_entity_id: e.target.value })
                        }
                        placeholder="Work order #..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmation">I confirm that:</Label>
                    <Input
                      id="confirmation"
                      value={formData.confirmation}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmation: e.target.value })
                      }
                      placeholder="e.g., Work has been completed satisfactorily"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional context or observations..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    <p className="font-medium mb-1">Digital Signature Notice</p>
                    <p className="text-muted-foreground">
                      By submitting this attestation, you are creating a cryptographically signed
                      record that may be anchored to the blockchain and used to trigger automated
                      contract actions.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitAttestation.isPending}>
                    {submitAttestation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Sign & Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!attestations?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attestations submitted yet.</p>
            <p className="text-sm">
              Submit your first attestation to verify a real-world event.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {attestations.map((attestation) => (
              <div
                key={attestation.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {attestationTypeLabels[attestation.attestation_type]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {attestation.subject_entity_type}:{" "}
                          {attestation.subject_entity_id.substring(0, 8)}...
                        </span>
                      </div>
                      {attestation.attestation_data && (
                        <p className="mt-2 text-sm">
                          {(attestation.attestation_data as Record<string, unknown>).confirmation as string ||
                            "Attestation submitted"}
                        </p>
                      )}
                      {(attestation.attestation_data as Record<string, unknown>)?.notes && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {(attestation.attestation_data as Record<string, unknown>).notes as string}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(attestation.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {attestation.geolocation && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location verified
                          </span>
                        )}
                        {attestation.signature_hash && (
                          <span className="font-mono">
                            {attestation.signature_hash.substring(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {attestation.is_verified ? (
                      <Badge className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending Verification</Badge>
                    )}
                    {attestation.xodiak_tx_hash && (
                      <Badge variant="outline" className="font-mono text-xs">
                        ⛓️ Anchored
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
