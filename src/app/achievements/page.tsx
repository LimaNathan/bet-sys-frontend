'use client';

import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { BADGE_INFO, CATEGORY_LABELS } from '@/lib/badge-constants';
import { Award, Loader2, Lock, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BadgeCatalog {
  code: string;
  title: string;
  description: string;
  category: string;
  rewardAmount: number;
}

interface UserBadge {
  code: string;
  earnedAt: string;
}

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<BadgeCatalog[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catalogRes, myBadgesRes] = await Promise.all([
          api.get('/api/badges/catalog'),
          api.get('/api/badges/my'),
        ]);
        setCatalog(catalogRes.data);
        setEarnedBadges(new Set(myBadgesRes.data.map((b: UserBadge) => b.code)));
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group by category
  const groupedBadges = catalog.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, BadgeCatalog[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Sala de Troféus
        </h1>
        <p className="text-muted-foreground">
          Conquistas desbloqueadas: {earnedBadges.size} / {catalog.length}
        </p>
      </div>

      <TooltipProvider>
        {Object.entries(groupedBadges).map(([category, badges]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-muted-foreground">
              {CATEGORY_LABELS[category] || category}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge) => {
                const isUnlocked = earnedBadges.has(badge.code);
                const info = BADGE_INFO[badge.code];
                const IconComponent = info?.icon || Award;

                return (
                  <Tooltip key={badge.code}>
                    <TooltipTrigger asChild>
                      <Card
                        className={`p-4 cursor-pointer transition-all duration-300 ${
                          isUnlocked
                            ? 'glass border-primary/50 hover:shadow-lg hover:shadow-primary/20'
                            : 'bg-muted/30 opacity-60 grayscale'
                        } ${badge.category === 'PLATINUM' && isUnlocked ? 'animate-pulse ring-2 ring-yellow-500/50' : ''}`}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <div
                            className={`rounded-full p-3 ${
                              isUnlocked
                                ? `bg-primary/10 ${info?.color || 'text-primary'}`
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isUnlocked ? (
                              <IconComponent className="h-8 w-8" />
                            ) : (
                              <Lock className="h-8 w-8" />
                            )}
                          </div>

                          <h3 className="font-semibold text-sm">
                            {isUnlocked ? badge.title : '???'}
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            {isUnlocked ? (
                              <span className="text-primary font-bold">
                                + R$ {badge.rewardAmount.toFixed(2)}
                              </span>
                            ) : (
                              'Bloqueado'
                            )}
                          </p>
                        </div>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs bg-popover border-border">
                      <p className="font-semibold text-foreground">{badge.title}</p>
                      <p className="text-sm text-foreground/80 italic">
                        &quot;{badge.description}&quot;
                      </p>
                      <p className="text-sm mt-1 text-foreground">
                        Recompensa: <span className="text-primary font-bold">R$ {badge.rewardAmount.toFixed(2)}</span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </TooltipProvider>
    </div>
  );
}
