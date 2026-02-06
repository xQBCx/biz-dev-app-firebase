import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GraduationCap, Trophy, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  id: string;
  name: string;
  initials: string;
  xp: number;
  rank: number;
}

interface AcademyData {
  activeAssignments: number;
  leaderboard: LeaderboardEntry[];
  readyForPromotion: number;
}

const AcademyProgress = () => {
  const [academyData, setAcademyData] = useState<AcademyData>({
    activeAssignments: 0,
    leaderboard: [],
    readyForPromotion: 0
  });

  useEffect(() => {
    fetchAcademyData();
  }, []);

  const fetchAcademyData = async () => {
    try {
      // Get profiles for leaderboard
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, initials')
        .limit(3);

      let leaderboardData: LeaderboardEntry[] = [];
      
      if (profiles && profiles.length > 0) {
        leaderboardData = profiles.map((profile, index) => ({
          id: profile.id,
          name: profile.full_name || 'Unknown',
          initials: profile.initials || '??',
          xp: [1250, 980, 745][index] || Math.floor(Math.random() * 500) + 400,
          rank: index + 1
        }));
      } else {
        // Georgetown academy leaderboard
        leaderboardData = [
          { id: 'academy-1', name: 'Jessica Chen', initials: 'JC', xp: 1250, rank: 1 },
          { id: 'academy-2', name: 'David Park', initials: 'DP', xp: 980, rank: 2 },
          { id: 'academy-3', name: 'Sarah Martinez', initials: 'SM', xp: 745, rank: 3 }
        ];
      }

      setAcademyData({
        activeAssignments: 8,
        leaderboard: [
          { id: 'tiara-1', name: 'Tiara Zimmerman', initials: 'TZ', xp: 1850, rank: 1 },
          ...leaderboardData.slice(1, 3)
        ],
        readyForPromotion: 1
      });
    } catch (error) {
      console.error('Error fetching academy data:', error);
      // Fallback to demo data featuring Tiara Zimmerman
      setAcademyData({
        activeAssignments: 8,
        leaderboard: [
          { id: 'tiara-1', name: 'Tiara Zimmerman', initials: 'TZ', xp: 1850, rank: 1 },
          { id: 'academy-2', name: 'David Park', initials: 'DP', xp: 980, rank: 2 },
          { id: 'academy-3', name: 'Sarah Martinez', initials: 'SM', xp: 745, rank: 3 }
        ],
        readyForPromotion: 1
      });
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2: return <Award className="h-4 w-4 text-gray-400" />;
      case 3: return <Award className="h-4 w-4 text-amber-600" />;
      default: return null;
    }
  };

  return (
    <Card className="card-elegant overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-accent/5 border-b">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-lg font-bold text-primary">Academy Progress</div>
            <div className="text-sm text-muted-foreground">Learning & Development</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Active Assignments */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="font-medium text-sm">Active Assignments</span>
          </div>
          <Badge variant="secondary" className="font-semibold">
            {academyData.activeAssignments}
          </Badge>
        </div>

        {/* XP Leaderboard */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border">
            <Trophy className="h-4 w-4 text-primary" />
            <div>
              <span className="font-semibold text-sm">Weekly XP Leaders</span>
              <div className="text-xs text-muted-foreground">Top performers this week</div>
            </div>
          </div>
          
          <div className="space-y-2">
            {academyData.leaderboard.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">#{entry.rank}</span>
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {entry.initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{entry.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {entry.name === 'Tiara Zimmerman' ? 'Promoting to GM' : 'Academy Learner'}
                  </div>
                </div>
                
                <Badge variant="outline" className="shrink-0 font-semibold">
                  {entry.xp.toLocaleString()} XP
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Ready for Promotion - Tiara Zimmerman */}
        {academyData.readyForPromotion > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
              <Award className="h-5 w-5 text-emerald-600" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-emerald-800">🎉 Promotion Ready!</div>
                <div className="text-xs text-emerald-700">Academy certification complete</div>
              </div>
            </div>
            
            {/* Tiara's Promotion Card */}
            <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarFallback className="text-sm bg-primary text-primary-foreground font-bold">
                    TZ
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-bold text-primary">Tiara Zimmerman</div>
                  <div className="text-xs text-muted-foreground">Front Desk Associate</div>
                </div>
                <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                  Promoting to GM
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Academy Progress</div>
                  <div className="font-semibold text-primary">100% Complete</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Total XP Earned</div>
                  <div className="font-semibold text-primary">1,850 XP</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Certifications</div>
                  <div className="font-semibold text-primary">Leadership • Operations</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Start Date</div>
                  <div className="font-semibold text-primary">March 1st, 2025</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademyProgress;