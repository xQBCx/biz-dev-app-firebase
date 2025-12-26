import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ASSET_TYPES, VALUATION_METHODS, useValueRegistry } from '@/hooks/useValueRegistry';
import { Loader2, Plus } from 'lucide-react';

interface AssetRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentAssetId?: string;
}

export function AssetRegistrationForm({ open, onOpenChange, parentAssetId }: AssetRegistrationFormProps) {
  const { createAsset } = useValueRegistry();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    asset_type: 'physical',
    description: '',
    external_id: '',
    serial_number: '',
    custom_category: '',
    current_value: '',
    value_currency: 'USD',
    valuation_method: 'market',
    jurisdiction: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAsset({
        name: formData.name,
        asset_type: formData.asset_type,
        description: formData.description || null,
        external_id: formData.external_id || null,
        serial_number: formData.serial_number || null,
        custom_category: formData.custom_category || null,
        current_value: formData.current_value ? parseFloat(formData.current_value) : null,
        value_currency: formData.value_currency,
        valuation_method: formData.valuation_method,
        jurisdiction: formData.jurisdiction || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : null,
        parent_asset_id: parentAssetId || null,
        status: 'active',
      });

      onOpenChange(false);
      setFormData({
        name: '',
        asset_type: 'physical',
        description: '',
        external_id: '',
        serial_number: '',
        custom_category: '',
        current_value: '',
        value_currency: 'USD',
        valuation_method: 'market',
        jurisdiction: '',
        tags: '',
      });
    } catch (err) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Register Asset
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Solar Panel Array #1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset_type">Asset Type *</Label>
                <Select
                  value={formData.asset_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, asset_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the asset..."
                rows={3}
              />
            </div>
          </div>

          {/* Identification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="external_id">External ID</Label>
                <Input
                  id="external_id"
                  value={formData.external_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_id: e.target.value }))}
                  placeholder="VIN, GTIN, Contract Address..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                  placeholder="Manufacturer serial..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom_category">Category</Label>
                <Input
                  id="custom_category"
                  value={formData.custom_category}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_category: e.target.value }))}
                  placeholder="Custom classification..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Input
                  id="jurisdiction"
                  value={formData.jurisdiction}
                  onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction: e.target.value }))}
                  placeholder="Country, state, or region..."
                />
              </div>
            </div>
          </div>

          {/* Valuation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Valuation</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_value">Current Value</Label>
                <Input
                  id="current_value"
                  type="number"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value_currency">Currency</Label>
                <Select
                  value={formData.value_currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, value_currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="valuation_method">Method</Label>
                <Select
                  value={formData.valuation_method}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, valuation_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUATION_METHODS.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="energy, renewable, solar (comma-separated)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Register Asset
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
