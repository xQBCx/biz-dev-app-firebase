import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMyResponderProfile, useCreateResponderProfile, useUpdateResponderProfile } from "@/hooks/useEROS";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Shield, Plus, X, MapPin, Clock } from "lucide-react";

const SKILL_OPTIONS = [
  "First Aid", "CPR", "Fire Safety", "Water Rescue", "Search & Rescue",
  "Medical Response", "Hazmat", "Communications", "Logistics", "Security",
  "Heavy Equipment", "Drone Operations", "Technical Rescue", "Crisis Counseling"
];

const SPECIALIZATION_OPTIONS = [
  "Urban Search & Rescue", "Wildfire Response", "Flood Response", 
  "Medical Triage", "Incident Command", "Logistics Coordination",
  "Communications", "Animal Rescue", "Hazmat Containment"
];

export default function ErosResponderProfile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyResponderProfile();
  const createProfile = useCreateResponderProfile();
  const updateProfile = useUpdateResponderProfile();

  const [formData, setFormData] = useState({
    skills: [] as string[],
    specializations: [] as string[],
    travel_radius_km: 80,
    response_time_minutes: 30,
    equipment_available: [] as string[],
    vehicles_available: [] as string[],
    availability_status: "available" as "available" | "on_call" | "deployed" | "unavailable" | "standby",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newEquipment, setNewEquipment] = useState("");
  const [newVehicle, setNewVehicle] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        skills: (profile.skills as string[]) || [],
        specializations: (profile.specializations as string[]) || [],
        travel_radius_km: profile.travel_radius_km || 80,
        response_time_minutes: profile.response_time_minutes || 30,
        equipment_available: (profile.equipment_available as string[]) || [],
        vehicles_available: (profile.vehicles_available as string[]) || [],
        availability_status: profile.availability_status || "available",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (profile) {
        await updateProfile.mutateAsync({
          id: profile.id,
          ...formData,
        });
        toast.success("Profile updated successfully");
      } else {
        await createProfile.mutateAsync({
          user_id: user?.id!,
          ...formData,
        });
        toast.success("Profile created successfully");
      }
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addSpecialization = (spec: string) => {
    if (spec && !formData.specializations.includes(spec)) {
      setFormData({ ...formData, specializations: [...formData.specializations, spec] });
    }
    setNewSpecialization("");
  };

  const removeSpecialization = (spec: string) => {
    setFormData({ ...formData, specializations: formData.specializations.filter(s => s !== spec) });
  };

  const addEquipment = () => {
    if (newEquipment && !formData.equipment_available.includes(newEquipment)) {
      setFormData({ ...formData, equipment_available: [...formData.equipment_available, newEquipment] });
    }
    setNewEquipment("");
  };

  const addVehicle = () => {
    if (newVehicle && !formData.vehicles_available.includes(newVehicle)) {
      setFormData({ ...formData, vehicles_available: [...formData.vehicles_available, newVehicle] });
    }
    setNewVehicle("");
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Responder Profile</h1>
          <p className="text-muted-foreground">
            {profile ? "Manage your emergency responder profile" : "Create your emergency responder profile"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Availability & Response</CardTitle>
            <CardDescription>Your availability and response settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Availability Status</Label>
                <Select
                  value={formData.availability_status}
                  onValueChange={(value: any) => setFormData({ ...formData, availability_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="on_call">On Call</SelectItem>
                    <SelectItem value="standby">Standby</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Travel Radius (km)
                </Label>
                <Input
                  type="number"
                  value={formData.travel_radius_km}
                  onChange={(e) => setFormData({ ...formData, travel_radius_km: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Response Time (minutes)
              </Label>
              <Input
                type="number"
                value={formData.response_time_minutes}
                onChange={(e) => setFormData({ ...formData, response_time_minutes: parseInt(e.target.value) || 0 })}
                placeholder="How quickly can you respond?"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add your emergency response skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Select value={newSkill} onValueChange={setNewSkill}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a skill to add" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_OPTIONS.filter(s => !formData.skills.includes(s)).map((skill) => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={() => addSkill(newSkill)} disabled={!newSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Specializations</CardTitle>
            <CardDescription>Add your specialized response areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.specializations.map((spec) => (
                <Badge key={spec} variant="outline" className="flex items-center gap-1">
                  {spec}
                  <button type="button" onClick={() => removeSpecialization(spec)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Select value={newSpecialization} onValueChange={setNewSpecialization}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATION_OPTIONS.filter(s => !formData.specializations.includes(s)).map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={() => addSpecialization(newSpecialization)} disabled={!newSpecialization}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment & Vehicles</CardTitle>
            <CardDescription>List available equipment and vehicles for deployments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Available Equipment</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.equipment_available.map((eq) => (
                  <Badge key={eq} variant="secondary" className="flex items-center gap-1">
                    {eq}
                    <button type="button" onClick={() => setFormData({ ...formData, equipment_available: formData.equipment_available.filter(e => e !== eq) })}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="e.g., Chainsaw, First Aid Kit, Generator"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                />
                <Button type="button" variant="outline" onClick={addEquipment} disabled={!newEquipment}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Vehicles</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.vehicles_available.map((v) => (
                  <Badge key={v} variant="secondary" className="flex items-center gap-1">
                    {v}
                    <button type="button" onClick={() => setFormData({ ...formData, vehicles_available: formData.vehicles_available.filter(ve => ve !== v) })}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  placeholder="e.g., 4x4 Truck, Boat, ATV"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVehicle())}
                />
                <Button type="button" variant="outline" onClick={addVehicle} disabled={!newVehicle}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createProfile.isPending || updateProfile.isPending}>
            {profile ? "Update Profile" : "Create Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
