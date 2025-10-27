import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, TrendingDown, Plus, Check } from "lucide-react";
import { useParlayStore } from "@/hooks/useParlayStore";
import { ParlayDrawer } from "@/components/ParlayDrawer";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerProp {
  id: string;
  player_id: string;
  player_name: string;
  team: string;
  stat_type: string;
  projection: number;
  over_odds: number;
  under_odds: number;
  game_opponent: string;
  game_date: string;
}

interface PlayerHistory {
  game_date: string;
  opponent: string;
  stat_value: number;
}

export default function TrueOddsPlayerResearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<string>("passing_yards");
  const { legs, addLeg, openDrawer } = useParlayStore();

  // Fetch available players
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["trueodds-players", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("trueodds_players")
        .select("*")
        .order("name");

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Fetch player props for selected player
  const { data: playerProps } = useQuery({
    queryKey: ["trueodds-player-props", selectedPlayer],
    queryFn: async () => {
      if (!selectedPlayer) return [];
      const { data, error } = await supabase
        .from("trueodds_player_props")
        .select("*")
        .eq("player_id", selectedPlayer)
        .order("stat_type");

      if (error) throw error;
      return data as PlayerProp[];
    },
    enabled: !!selectedPlayer,
  });

  // Fetch historical stats for selected player and stat type
  const { data: history } = useQuery({
    queryKey: ["trueodds-player-history", selectedPlayer, selectedStat],
    queryFn: async () => {
      if (!selectedPlayer) return [];
      const { data, error } = await supabase
        .from("trueodds_player_history")
        .select("*")
        .eq("player_id", selectedPlayer)
        .eq("stat_type", selectedStat)
        .order("game_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PlayerHistory[];
    },
    enabled: !!selectedPlayer,
  });

  const currentProp = playerProps?.find((p) => p.stat_type === selectedStat);
  const selectedPlayerData = players?.find((p) => p.id === selectedPlayer);

  const handleAddToParlay = (
    propId: string,
    selection: "over" | "under",
    odds: number
  ) => {
    if (!currentProp) return;

    addLeg({
      marketId: propId,
      marketLabel: `${currentProp.player_name} - ${formatStatType(
        currentProp.stat_type
      )}`,
      marketCategory: "player_props",
      outcomeId: `${propId}-${selection}`,
      outcomeLabel: `${selection.toUpperCase()} ${currentProp.projection}`,
      odds: odds,
    });
    openDrawer();
  };

  const isInParlay = (propId: string, selection: "over" | "under") => {
    return legs.some((leg) => leg.outcomeId === `${propId}-${selection}`);
  };

  const formatStatType = (stat: string) => {
    return stat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatCategories = () => {
    if (!playerProps) return [];
    const categories = playerProps.reduce((acc, prop) => {
      const category = prop.stat_type.split("_")[0];
      if (!acc.includes(category)) acc.push(category);
      return acc;
    }, [] as string[]);
    return categories;
  };

  const getTrend = () => {
    if (!history || history.length < 2) return null;
    const recent = history.slice(0, 3);
    const avg = recent.reduce((sum, h) => sum + h.stat_value, 0) / recent.length;
    const older = history.slice(3, 6);
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, h) => sum + h.stat_value, 0) / older.length
        : avg;

    return avg > olderAvg ? "up" : avg < olderAvg ? "down" : "stable";
  };

  const statCategories = getStatCategories();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Player Research</h1>
        <p className="text-muted-foreground">
          Analyze player stats and build your perfect parlay
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Search */}
        <Card className="p-6 lg:col-span-1">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {playersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : players?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No players found
                </div>
              ) : (
                players?.map((player) => (
                  <Card
                    key={player.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedPlayer === player.id
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                    onClick={() => setSelectedPlayer(player.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {player.team} • {player.position}
                        </div>
                      </div>
                      {player.status && (
                        <Badge variant={player.status === "active" ? "default" : "secondary"}>
                          {player.status}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Player Stats & Props */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPlayer ? (
            <>
              {/* Player Header */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedPlayerData?.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedPlayerData?.team} • {selectedPlayerData?.position}
                    </p>
                  </div>
                  {selectedPlayerData?.next_game && (
                    <div className="text-right">
                      <div className="font-semibold">Next Game</div>
                      <div className="text-sm text-muted-foreground">
                        vs {selectedPlayerData.next_opponent}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(selectedPlayerData.next_game).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Stats Tabs */}
              <Tabs value={selectedStat} onValueChange={setSelectedStat}>
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(statCategories.length, 4)}, 1fr)` }}>
                  {statCategories.map((category) => (
                    <TabsTrigger key={category} value={`${category}_${playerProps?.find(p => p.stat_type.startsWith(category))?.stat_type.split('_').slice(1).join('_') || 'yards'}`}>
                      {formatStatType(category)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {playerProps
                  ?.filter((prop) => prop.stat_type === selectedStat)
                  .map((prop) => (
                    <TabsContent key={prop.id} value={selectedStat}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Prop */}
                        <Card className="p-6">
                          <h3 className="text-lg font-semibold mb-4">
                            {formatStatType(prop.stat_type)}
                          </h3>
                          <div className="text-center mb-6">
                            <div className="text-4xl font-bold mb-2">
                              {prop.projection}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Projected vs {prop.game_opponent}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              variant={
                                isInParlay(prop.id, "over")
                                  ? "default"
                                  : "outline"
                              }
                              className="h-auto flex-col py-4"
                              onClick={() =>
                                handleAddToParlay(prop.id, "over", prop.over_odds)
                              }
                            >
                              {isInParlay(prop.id, "over") ? (
                                <Check className="h-5 w-5 mb-2" />
                              ) : (
                                <TrendingUp className="h-5 w-5 mb-2" />
                              )}
                              <span className="text-sm">OVER</span>
                              <span className="text-lg font-bold">
                                {prop.over_odds.toFixed(2)}x
                              </span>
                            </Button>

                            <Button
                              variant={
                                isInParlay(prop.id, "under")
                                  ? "default"
                                  : "outline"
                              }
                              className="h-auto flex-col py-4"
                              onClick={() =>
                                handleAddToParlay(
                                  prop.id,
                                  "under",
                                  prop.under_odds
                                )
                              }
                            >
                              {isInParlay(prop.id, "under") ? (
                                <Check className="h-5 w-5 mb-2" />
                              ) : (
                                <TrendingDown className="h-5 w-5 mb-2" />
                              )}
                              <span className="text-sm">UNDER</span>
                              <span className="text-lg font-bold">
                                {prop.under_odds.toFixed(2)}x
                              </span>
                            </Button>
                          </div>
                        </Card>

                        {/* Historical Performance */}
                        <Card className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              Last 10 Games
                            </h3>
                            {getTrend() && (
                              <Badge
                                variant={
                                  getTrend() === "up"
                                    ? "default"
                                    : getTrend() === "down"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {getTrend() === "up" ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : getTrend() === "down" ? (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                ) : null}
                                {getTrend()}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-2">
                            {history?.map((game, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">
                                    vs {game.opponent}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(game.game_date).toLocaleDateString()}
                                  </div>
                                </div>
                                <div
                                  className={`text-xl font-bold ${
                                    currentProp &&
                                    game.stat_value > currentProp.projection
                                      ? "text-green-500"
                                      : currentProp &&
                                        game.stat_value < currentProp.projection
                                      ? "text-red-500"
                                      : ""
                                  }`}
                                >
                                  {game.stat_value}
                                </div>
                              </div>
                            ))}
                            {(!history || history.length === 0) && (
                              <div className="text-center py-8 text-muted-foreground">
                                No historical data available
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>

                      {/* All Props for this Player */}
                      <Card className="p-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4">
                          All Available Props
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {playerProps?.map((p) => (
                            <Card
                              key={p.id}
                              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                                p.stat_type === selectedStat
                                  ? "ring-2 ring-primary"
                                  : ""
                              }`}
                              onClick={() => setSelectedStat(p.stat_type)}
                            >
                              <div className="text-sm font-medium mb-1">
                                {formatStatType(p.stat_type)}
                              </div>
                              <div className="text-2xl font-bold mb-2">
                                {p.projection}
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  O {p.over_odds.toFixed(2)}x
                                </Badge>
                                <Badge variant="outline">
                                  U {p.under_odds.toFixed(2)}x
                                </Badge>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>
                  ))}
              </Tabs>
            </>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a player to view their stats and build your parlay</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ParlayDrawer />
    </div>
  );
}
