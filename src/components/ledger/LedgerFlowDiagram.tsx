import { useMemo } from "react";
import { Sankey, Tooltip, Layer, Rectangle } from "recharts";
import type { ValueLedgerEntry, LedgerStats } from "@/hooks/useValueLedger";

interface LedgerFlowDiagramProps {
  entries: ValueLedgerEntry[];
  stats: LedgerStats;
}

interface SankeyNode {
  name: string;
}

interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export function LedgerFlowDiagram({ entries, stats }: LedgerFlowDiagramProps) {
  const { nodes, links } = useMemo(() => {
    // Build unique entities and flows
    const entitySet = new Set<string>();
    const flowMap = new Map<string, number>();

    entries.forEach((entry) => {
      // Safely handle potentially null/undefined names
      const source = entry.source_entity_name || "Unknown";
      const destination = entry.destination_entity_name || "Treasury";
      
      entitySet.add(source);
      entitySet.add(destination);

      const flowKey = `${source}|${destination}`;
      const currentFlow = flowMap.get(flowKey) || 0;
      // Use xdk_amount if amount is zero (for XDK-only transfers)
      const flowValue = Number(entry.amount) || Number(entry.xdk_amount) || 0;
      flowMap.set(flowKey, currentFlow + flowValue);
    });

    const entityArray = Array.from(entitySet);
    const nodes: SankeyNode[] = entityArray.map((name) => ({ name }));

    const links: SankeyLink[] = [];
    flowMap.forEach((value, key) => {
      const [source, target] = key.split("|");
      const sourceIndex = entityArray.indexOf(source);
      const targetIndex = entityArray.indexOf(target);
      
      if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
        links.push({
          source: sourceIndex,
          target: targetIndex,
          value,
        });
      }
    });

    return { nodes, links };
  }, [entries]);

  if (entries.length === 0 || links.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Not enough data to generate flow diagram</p>
        <p className="text-sm">At least 2 connected entities required</p>
      </div>
    );
  }

  // Simple fallback visualization if Sankey fails
  if (nodes.length < 2 || links.length < 1) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Value Flow Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stats.byEntityType).map(([type, amount]) => (
            <div key={type} className="border rounded-lg p-4 bg-card">
              <p className="text-xs text-muted-foreground capitalize">{type}</p>
              <p className="text-xl font-bold">
                ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        <Sankey
          width={800}
          height={400}
          data={{ nodes, links }}
          node={<CustomNode />}
          nodePadding={50}
          nodeWidth={10}
          linkCurvature={0.5}
          margin={{ top: 20, right: 200, bottom: 20, left: 200 }}
        >
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0].payload;
              if (data.source !== undefined) {
                return (
                  <div className="bg-popover border rounded p-2 text-sm shadow-lg">
                    <p className="font-medium">
                      {nodes[data.source]?.name} → {nodes[data.target]?.name}
                    </p>
                    <p className="text-muted-foreground">
                      ${data.value?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              }
              return (
                <div className="bg-popover border rounded p-2 text-sm shadow-lg">
                  <p className="font-medium">{data.name}</p>
                </div>
              );
            }}
          />
        </Sankey>
      </div>

      {/* Legend / Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-xl font-bold">
            ${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Total XDK</p>
          <p className="text-xl font-bold text-primary">
            {stats.totalXdk.toLocaleString("en-US", { minimumFractionDigits: 2 })} XDK
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Total Credits</p>
          <p className="text-xl font-bold text-green-600">
            {stats.totalCredits.toLocaleString()}
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Unique Entities</p>
          <p className="text-xl font-bold">{stats.uniqueEntities}</p>
        </div>
      </div>
    </div>
  );
}

// Custom node component for better label display
function CustomNode(props: unknown) {
  const { x, y, width, height, payload } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    payload: { name: string };
  };

  return (
    <Layer>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill="hsl(var(--primary))"
        fillOpacity={0.8}
      />
      <text
        x={x < 400 ? x - 6 : x + width + 6}
        y={y + height / 2}
        textAnchor={x < 400 ? "end" : "start"}
        dominantBaseline="middle"
        className="text-xs fill-foreground"
      >
        {payload.name}
      </text>
    </Layer>
  );
}
