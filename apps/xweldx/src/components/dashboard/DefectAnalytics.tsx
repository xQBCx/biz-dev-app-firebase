import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Icons } from "@/components/icons/IndustrialIcons";

const defectData = [
  { name: "Undercut", value: 28, color: "hsl(25, 95%, 53%)" },
  { name: "Porosity", value: 22, color: "hsl(0, 72%, 51%)" },
  { name: "Lack of Fusion", value: 18, color: "hsl(45, 93%, 47%)" },
  { name: "Cold Lap", value: 12, color: "hsl(200, 80%, 50%)" },
  { name: "Other", value: 9, color: "hsl(210, 30%, 40%)" },
];

export function DefectAnalytics() {
  const total = defectData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card variant="steel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.barChart className="h-5 w-5 text-accent" />
          Defect Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <div className="h-40 w-40 shrink-0 sm:h-48 sm:w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={defectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {defectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(210, 80%, 8%)",
                    border: "1px solid hsl(210, 30%, 18%)",
                    borderRadius: "8px",
                    color: "hsl(210, 20%, 95%)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full flex-1 space-y-2 sm:space-y-3">
            {defectData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs sm:text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{item.value}</span>
                  <span className="text-xs text-muted-foreground">
                    ({((item.value / total) * 100).toFixed(0)}%)
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
