import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateRegionInput } from "@/hooks/useCRMRegions";
import { MapPin, Loader2 } from "lucide-react";

interface CRMRegionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRegionInput) => Promise<any>;
}

export function CRMRegionForm({ open, onOpenChange, onSubmit }: CRMRegionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateRegionInput>({
    name: '',
    region_type: undefined,
    country: '',
    state_province: '',
    population: undefined,
    gdp_estimate: undefined,
    investment_climate: '',
    tags: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    const result = await onSubmit(formData);
    setIsSubmitting(false);

    if (result) {
      setFormData({
        name: '',
        region_type: undefined,
        country: '',
        state_province: '',
        population: undefined,
        gdp_estimate: undefined,
        investment_climate: '',
        tags: []
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Add Region
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Denver Metro, Silicon Valley, Front Range Corridor..."
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Region Type</Label>
              <Select
                value={formData.region_type || ''}
                onValueChange={(v) => setFormData({ ...formData, region_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metropolitan">Metropolitan</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                  <SelectItem value="economic_zone">Economic Zone</SelectItem>
                  <SelectItem value="trade_corridor">Trade Corridor</SelectItem>
                  <SelectItem value="county">County</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="territory">Territory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="United States"
              />
            </div>

            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state_province || ''}
                onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                placeholder="Colorado"
              />
            </div>

            <div>
              <Label htmlFor="population">Population</Label>
              <Input
                id="population"
                type="number"
                value={formData.population || ''}
                onChange={(e) => setFormData({ ...formData, population: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="2900000"
              />
            </div>

            <div>
              <Label htmlFor="gdp">GDP Estimate ($)</Label>
              <Input
                id="gdp"
                type="number"
                value={formData.gdp_estimate || ''}
                onChange={(e) => setFormData({ ...formData, gdp_estimate: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="200000000000"
              />
            </div>

            <div>
              <Label htmlFor="climate">Investment Climate</Label>
              <Input
                id="climate"
                value={formData.investment_climate || ''}
                onChange={(e) => setFormData({ ...formData, investment_climate: e.target.value })}
                placeholder="Favorable, Growing, Emerging..."
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="industries">Major Industries (comma separated)</Label>
              <Input
                id="industries"
                value={formData.major_industries?.join(', ') || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  major_industries: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Technology, Aerospace, Energy, Healthcare..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create & Research
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
