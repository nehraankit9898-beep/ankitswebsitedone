import { useEffect, useState } from 'react';
import { BookOpen, Trophy, FileText, Award, ArrowRight, Check } from 'lucide-react';
import { Link } from '../router/Router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Enrollment, UserAchievement, Certificate, Note } from '../lib/supabase';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      const [enrollRes, achieveRes, certRes, notesRes] = await Promise.all([
        supabase.from('enrollments').select('*, course:courses(*)').eq('user_id', profile.id).order('enrolled_at', { ascending: false }),
        supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', profile.id).order('earned_at', { ascending: false }),
        supabase.from('certificates').select('*, course:courses(*)').eq('user_id', profile.id).order('issued_at', { ascending: false }),
        supabase.from('notes').select('*').eq('user_id', profile.id).order('updated_at', { ascending: false }).limit(5),
      ]);
      setEnrollments(enrollRes.data as Enrollment[] ?? []);
      setAchievements(achieveRes.data as UserAchievement[] ?? []);
      setCertificates(certRes.data as Certificate[] ?? []);
      setNotes(notesRes.data as Note[] ?? []);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  if (loading) {
    return <div className="container-app py-20"><div className="card h-96 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;
  }

  const stats = [
    { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'primary' },
    { label: 'Completed Courses', value: enrollments.filter(e => e.completed).length, icon: Trophy, color: 'success' },
    { label: 'Achievements', value: achievements.length, icon: Award, color: 'accent' },
    { label: 'Certificates', value: certificates.length, icon: FileText, color: 'primary' },
  ];

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Welcome back, {profile?.display_name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-5 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${stat.color}-100 text-${stat.color}-600 dark:bg-${stat.color}-900/30 dark:text-${stat.color}-400`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-neutral-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Enrolled Courses */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="font-semibold">Your Courses</h2>
              <Link to="/courses" className="text-sm text-primary-600 hover:text-primary-700">Browse more</Link>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {enrollments.length === 0 ? (
                <div className="p-8 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-neutral-400" />
                  <p className="mt-3 text-sm text-neutral-500">Not enrolled in any courses yet.</p>
                  <Link to="/courses" className="btn-primary mt-4">Browse Courses</Link>
                </div>
              ) : (
                enrollments.map(enroll => (
                  <Link
                    key={enroll.id}
                    to={`/courses/${enroll.course?.slug}`}
                    className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{enroll.course?.title}</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="h-1.5 w-32 rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <div className="h-1.5 rounded-full bg-primary-500 transition-all" style={{ width: `${enroll.progress}%` }} />
                        </div>
                        <span className="text-xs text-neutral-500">{enroll.progress}%</span>
                        {enroll.completed && <span className="badge-success"><Check className="h-3 w-3" /> Done</span>}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          {/* Recent Achievements */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="font-semibold">Achievements</h2>
              <Link to="/achievements" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
            </div>
            <div className="p-4">
              {achievements.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">No achievements yet. Start learning!</p>
              ) : (
                <div className="space-y-3">
                  {achievements.slice(0, 4).map(ua => (
                    <div key={ua.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ua.achievement?.name}</p>
                        <p className="text-xs text-neutral-500">{ua.achievement?.points} points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="card">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="font-semibold">Recent Notes</h2>
              <Link to="/notes" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
            </div>
            <div className="p-4">
              {notes.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">No notes yet.</p>
              ) : (
                <div className="space-y-2">
                  {notes.map(note => (
                    <Link key={note.id} to="/notes" className="block rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <p className="text-sm font-medium truncate">{note.title || 'Untitled'}</p>
                      <p className="text-xs text-neutral-500 truncate">{note.content}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
