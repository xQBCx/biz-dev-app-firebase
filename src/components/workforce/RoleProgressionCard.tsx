import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Lock, Target, LucideIcon } from "lucide-react";
import { WorkforceRole } from "@/hooks/useWorkforce";

interface RoleInfo {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  nextRole?: WorkforceRole;
  requirements?: string[];
}

interface RoleProgressionCardProps {
  role: WorkforceRole;
  roleInfo: RoleInfo;
  isCurrentRole: boolean;
  isCompleted: boolean;
}

export function RoleProgressionCard({ 
  role, 
  roleInfo, 
  isCurrentRole, 
  isCompleted 
}: RoleProgressionCardProps) {
  const RoleIcon = roleInfo.icon;
  
  return (
    <Card className={`transition-all ${
      isCurrentRole 
        ? 'border-primary shadow-lg' 
        : isCompleted 
          ? 'border-green-500/50' 
          : 'opacity-60'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isCompleted 
                ? 'bg-green-500/10' 
                : isCurrentRole 
                  ? 'bg-primary/10' 
                  : 'bg-muted'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <RoleIcon className={`h-6 w-6 ${isCurrentRole ? roleInfo.color : 'text-muted-foreground'}`} />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{roleInfo.label}</CardTitle>
              <CardDescription>{roleInfo.description}</CardDescription>
            </div>
          </div>
          {isCurrentRole && (
            <Badge className="bg-primary">Current</Badge>
          )}
          {isCompleted && (
            <Badge className="bg-green-500">Completed</Badge>
          )}
          {!isCurrentRole && !isCompleted && (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {roleInfo.requirements && roleInfo.requirements.length > 0 && (
          <div className="space-y-3">
            <span className="text-sm font-medium">Requirements:</span>
            <div className="space-y-2">
              {roleInfo.requirements.map((req, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-2 text-sm ${
                    isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Target className="h-4 w-4" />
                  )}
                  {req}
                </div>
              ))}
            </div>
            {isCurrentRole && (
              <Progress value={30} className="h-2 mt-4" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
