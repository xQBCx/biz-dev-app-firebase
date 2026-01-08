import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { EnterpriseRisk } from "@/hooks/useEnterpriseRisks";

interface RiskHeatMapProps {
  risks: EnterpriseRisk[];
}

export function RiskHeatMap({ risks }: RiskHeatMapProps) {
  // Create a 5x5 grid for likelihood (1-5) vs impact (1-5)
  const grid = useMemo(() => {
    const cells: { likelihood: number; impact: number; risks: EnterpriseRisk[] }[][] = [];
    
    for (let impact = 5; impact >= 1; impact--) {
      const row: { likelihood: number; impact: number; risks: EnterpriseRisk[] }[] = [];
      for (let likelihood = 1; likelihood <= 5; likelihood++) {
        const cellRisks = risks.filter(
          r => r.likelihood_score === likelihood && r.impact_score === impact
        );
        row.push({ likelihood, impact, risks: cellRisks });
      }
      cells.push(row);
    }
    
    return cells;
  }, [risks]);

  const getCellColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 20) return "bg-red-500/80 hover:bg-red-500";
    if (score >= 12) return "bg-orange-500/80 hover:bg-orange-500";
    if (score >= 6) return "bg-yellow-500/80 hover:bg-yellow-500";
    return "bg-green-500/80 hover:bg-green-500";
  };

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 20) return "Critical";
    if (score >= 12) return "High";
    if (score >= 6) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-2">
      {/* Y-axis label */}
      <div className="flex">
        <div className="w-8 flex items-center justify-center">
          <span className="text-xs text-muted-foreground -rotate-90 whitespace-nowrap">Impact</span>
        </div>
        <div className="flex-1">
          {/* Grid */}
          <div className="grid grid-cols-5 gap-1">
            {grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => (
                <Tooltip key={`${rowIndex}-${colIndex}`}>
                  <TooltipTrigger asChild>
                    <div
                      className={`aspect-square rounded-md flex items-center justify-center text-white font-medium text-sm cursor-pointer transition-colors ${getCellColor(cell.likelihood, cell.impact)}`}
                    >
                      {cell.risks.length > 0 ? cell.risks.length : ""}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div className="font-medium">
                        {getRiskLevel(cell.likelihood, cell.impact)} ({cell.likelihood * cell.impact})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        L:{cell.likelihood} × I:{cell.impact}
                      </div>
                      {cell.risks.length > 0 && (
                        <div className="mt-1 text-xs">
                          {cell.risks.length} risk{cell.risks.length > 1 ? 's' : ''}:
                          <ul className="list-disc list-inside">
                            {cell.risks.slice(0, 3).map(r => (
                              <li key={r.id} className="truncate max-w-[200px]">{r.title}</li>
                            ))}
                            {cell.risks.length > 3 && <li>+{cell.risks.length - 3} more</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))
            ))}
          </div>
        </div>
      </div>

      {/* X-axis label */}
      <div className="flex">
        <div className="w-8" />
        <div className="flex-1 text-center">
          <span className="text-xs text-muted-foreground">Likelihood</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
}
