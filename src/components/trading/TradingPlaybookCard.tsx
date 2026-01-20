import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, AlertTriangle, Lock, ChevronRight, Target
} from 'lucide-react';
import { 
  TradingPlaybook, 
  TradingSkillLevel,
  skillLevelConfig
} from '@/hooks/useTradingCommand';

interface TradingPlaybookCardProps {
  playbook: TradingPlaybook;
  userSkillLevel: TradingSkillLevel;
  expanded?: boolean;
}

const skillLevelOrder: TradingSkillLevel[] = ['recruit', 'trainee', 'operator', 'specialist', 'commander', 'strategist'];

export function TradingPlaybookCard({ playbook, userSkillLevel, expanded = false }: TradingPlaybookCardProps) {
  const userIndex = skillLevelOrder.indexOf(userSkillLevel);
  const requiredIndex = skillLevelOrder.indexOf(playbook.min_skill_level);
  const isUnlocked = userIndex >= requiredIndex;
  const skillConfig = skillLevelConfig[playbook.min_skill_level];

  const riskColors = {
    1: 'bg-green-500',
    2: 'bg-blue-500',
    3: 'bg-yellow-500',
    4: 'bg-orange-500',
    5: 'bg-red-500',
  };

  const riskLabels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Very High',
  };

  const rules = playbook.rules as Record<string, unknown> || {};
  const entryCriteria = (playbook.entry_criteria as unknown[]) || [];
  const exitCriteria = (playbook.exit_criteria as unknown[]) || [];

  return (
    <Card className={!isUnlocked ? 'opacity-60' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {!isUnlocked && <Lock className="h-4 w-4" />}
              {playbook.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {playbook.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={riskColors[playbook.risk_level as keyof typeof riskColors]} variant="secondary">
              Risk: {riskLabels[playbook.risk_level as keyof typeof riskLabels]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {skillConfig.label}+
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {expanded && (
          <>
            {/* Rules */}
            {Object.keys(rules).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Rules of Engagement
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {Object.entries(rules).map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {key.replace(/_/g, ' ')}: {String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Entry Criteria */}
            {entryCriteria.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Entry Criteria
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {entryCriteria.map((criteria: any, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {criteria.type}: {criteria.condition} {criteria.value || criteria.multiplier || ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exit Criteria */}
            {exitCriteria.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Exit Criteria
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {exitCriteria.map((criteria: any, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {criteria.type}: {criteria.percent ? `${criteria.percent}%` : criteria.above || criteria.max_hours || ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <Button 
          className="w-full" 
          variant={isUnlocked ? 'default' : 'outline'}
          disabled={!isUnlocked}
        >
          {isUnlocked ? (
            <>
              Use Playbook
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-1" />
              Requires {skillConfig.label}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
