import { useEffect, useState } from 'react';
import { Trophy, Lock, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Achievement, UserAchievement } from '../lib/supabase';

export default function AchievementsPage() {
  const { profile } = useAuth();
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: achieveData } = await supabase.from('achievements').select('*').order('points', { ascending: true });
      setAllAchievements(achieveData as Achievement[] ?? []);

      if (profile) {
        const { data: userData } = await supabase
          .from('user_achievements')
          .select('*, achievement:achievements(*)')
          .eq('user_id', profile.id);
        setUserAchievements(userData as UserAchievement[] ?? []);
      }
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id));
  const totalPoints = userAchievements.reduce((sum, ua) => sum + (ua.achievement?.points ?? 0), 0);

  if (loading) {
    return <div className="container-app py-20"><div className="card h-96 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;
  }

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Earn badges as you progress through your cybersecurity journey.
        </p>
      </div>

      {profile && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm text-neutral-500">Achievements Earned</p>
            <p className="mt-1 text-3xl font-bold text-primary-600">{userAchievements.length}<span className="text-lg text-neutral-400">/{allAchievements.length}</span></p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-neutral-500">Total Points</p>
            <p className="mt-1 text-3xl font-bold text-accent-600">{totalPoints}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-neutral-500">Completion</p>
            <p className="mt-1 text-3xl font-bold text-success-600">
              {allAchievements.length > 0 ? Math.round((userAchievements.length / allAchievements.length) * 100) : 0}%
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allAchievements.map((ach, i) => {
          const earned = earnedIds.has(ach.id);
          return (
            <div
              key={ach.id}
              className={`card p-6 animate-fade-in-up ${earned ? 'border-accent-300 dark:border-accent-700' : 'opacity-70'}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                  earned
                    ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                }`}>
                  {earned ? <Trophy className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{ach.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">{ach.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="badge-warning">
                      <Star className="h-3 w-3" /> {ach.points} pts
                    </span>
                    {earned && <span className="badge-success">Earned</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
