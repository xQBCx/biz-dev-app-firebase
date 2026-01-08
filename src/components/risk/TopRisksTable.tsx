import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { EnterpriseRisk } from "@/hooks/useEnterpriseRisks";

interface TopRisksTableProps {
  risks: EnterpriseRisk[];
  onViewRisk: (id: string) => void;
  showAll?: boolean;
}

export function TopRisksTable({ risks, onViewRisk, showAll = false }: TopRisksTableProps) {
  const getRiskLevelBadge = (score: number | null) => {
    if (!score) return <Badge variant="secondary">N/A</Badge>;
    if (score >= 20) return <Badge variant="destructive">Critical</Badge>;
    if (score >= 12) return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
    if (score >= 6) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Active</Badge>;
      case 'mitigated':
        return <Badge variant="outline" className="border-green-500 text-green-500">Mitigated</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Accepted</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      strategic: 'text-purple-500',
      operational: 'text-blue-500',
      financial: 'text-green-500',
      compliance: 'text-orange-500',
      technology: 'text-cyan-500',
      reputational: 'text-pink-500',
    };
    return colors[category] || 'text-muted-foreground';
  };

  if (risks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No risks found. Add your first risk to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-medium">Risk ID</th>
            <th className="text-left py-3 px-2 font-medium">Title</th>
            <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Category</th>
            <th className="text-center py-3 px-2 font-medium">Score</th>
            <th className="text-center py-3 px-2 font-medium hidden sm:table-cell">Status</th>
            <th className="text-right py-3 px-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {risks.map((risk) => (
            <tr key={risk.id} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-3 px-2 font-mono text-xs">{risk.risk_id}</td>
              <td className="py-3 px-2">
                <div className="font-medium truncate max-w-[200px]">{risk.title}</div>
                {risk.description && (
                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {risk.description}
                  </div>
                )}
              </td>
              <td className={`py-3 px-2 capitalize hidden md:table-cell ${getCategoryColor(risk.category)}`}>
                {risk.category}
              </td>
              <td className="py-3 px-2 text-center">
                {getRiskLevelBadge(risk.inherent_risk_score)}
              </td>
              <td className="py-3 px-2 text-center hidden sm:table-cell">
                {getStatusBadge(risk.status)}
              </td>
              <td className="py-3 px-2 text-right">
                <Button variant="ghost" size="sm" onClick={() => onViewRisk(risk.id)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
