import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ValueRegistryAsset, ASSET_TYPES } from '@/hooks/useValueRegistry';
import { formatDistanceToNow } from 'date-fns';
import { 
  Package, 
  HardDrive, 
  DollarSign, 
  Wrench, 
  Building2, 
  Lightbulb,
  TrendingUp,
  History,
  ExternalLink
} from 'lucide-react';

interface AssetCardProps {
  asset: ValueRegistryAsset;
  onClick?: () => void;
}

const ASSET_ICONS: Record<string, React.ReactNode> = {
  physical: <Package className="h-5 w-5" />,
  digital: <HardDrive className="h-5 w-5" />,
  financial: <DollarSign className="h-5 w-5" />,
  service: <Wrench className="h-5 w-5" />,
  infrastructure: <Building2 className="h-5 w-5" />,
  ip: <Lightbulb className="h-5 w-5" />,
};

export function AssetCard({ asset, onClick }: AssetCardProps) {
  const typeInfo = ASSET_TYPES.find(t => t.value === asset.asset_type);
  
  const formatValue = (value: number | null, currency: string) => {
    if (!value) return 'Not valued';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card 
      className="hover:border-primary/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {ASSET_ICONS[asset.asset_type] || <Package className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {asset.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {typeInfo?.label || asset.asset_type}
              </p>
            </div>
          </div>
          <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
            {asset.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {asset.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {asset.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current Value</p>
            <p className="text-lg font-semibold text-primary">
              {formatValue(asset.current_value, asset.value_currency)}
            </p>
          </div>
          {asset.valuation_method && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Method</p>
              <p className="text-sm capitalize">{asset.valuation_method}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {asset.custom_category && (
            <Badge variant="outline" className="text-xs">
              {asset.custom_category}
            </Badge>
          )}
          {asset.jurisdiction && (
            <Badge variant="outline" className="text-xs">
              {asset.jurisdiction}
            </Badge>
          )}
          {asset.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {asset.tags && asset.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{asset.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <History className="h-3 w-3" />
            {formatDistanceToNow(new Date(asset.updated_at), { addSuffix: true })}
          </span>
          {asset.external_id && (
            <span className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {asset.external_id.slice(0, 12)}...
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
