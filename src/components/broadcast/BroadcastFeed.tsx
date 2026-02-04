import { useEffect, useState } from 'react';
import { RefreshCw, Filter, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBroadcast } from '@/hooks/useBroadcast';
import { BroadcastPlayer } from './BroadcastPlayer';
import { AchievementCard } from './AchievementCard';

const SECTORS = [
  { value: 'all', label: 'All Sectors' },
  { value: 'housing', label: 'Housing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'energy', label: 'Energy' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'general', label: 'General Business' },
];

export function BroadcastFeed() {
  const [sector, setSector] = useState<string>('all');
  const { 
    loading, 
    segments, 
    achievements,
    fetchSegments, 
    fetchAchievements,
    curateNews,
    logInteraction,
  } = useBroadcast();

  useEffect(() => {
    fetchSegments(sector === 'all' ? undefined : sector);
    fetchAchievements();
  }, [sector, fetchSegments, fetchAchievements]);

  const handleRefresh = async () => {
    await curateNews(sector === 'all' ? undefined : sector);
  };

  const handleInteraction = (segmentId: string) => (type: string) => {
    logInteraction(segmentId, type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">UPN Broadcast</h2>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map(s => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleRefresh} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Generate News
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="news" className="w-full">
        <TabsList>
          <TabsTrigger value="news">News Feed</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="mt-4">
          {segments.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No broadcasts yet</h3>
              <p className="text-muted-foreground mb-4">
                Generate news segments to start your broadcast feed
              </p>
              <Button onClick={handleRefresh} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate First Broadcast
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {segments.map(segment => (
                <BroadcastPlayer
                  key={segment.id}
                  segment={segment}
                  onInteraction={handleInteraction(segment.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="mt-4">
          {achievements.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No verified achievements yet</h3>
              <p className="text-muted-foreground">
                Achievements from the network will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onView={() => logInteraction(achievement.id, 'view')}
                  onConnect={() => logInteraction(achievement.id, 'connect_request')}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}