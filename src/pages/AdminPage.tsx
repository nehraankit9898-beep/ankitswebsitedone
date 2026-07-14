import { useEffect, useState } from 'react';
import { Users, BookOpen, LayoutDashboard, Shield, Plus, Trash2, X, Activity, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Profile, Course, Category, ScanHistory, SecurityNews } from '../lib/supabase';

export default function AdminPage() {
  const { hasRole } = useAuth();
  const [tab, setTab] = useState<'overview' | 'courses' | 'users' | 'scans' | 'news'>('overview');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [newsItems, setNewsItems] = useState<SecurityNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', slug: '', description: '', category_id: '', difficulty: 'beginner', estimated_hours: 0 });

  useEffect(() => {
    if (!hasRole('admin', 'instructor')) return;
    const fetchData = async () => {
      const [profRes, courseRes, catRes, scanRes, newsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*, category:categories(*)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('scan_history').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('security_news').select('*').order('published_at', { ascending: false }).limit(20),
      ]);
      setProfiles(profRes.data as Profile[] ?? []);
      setCourses(courseRes.data as Course[] ?? []);
      setCategories(catRes.data as Category[] ?? []);
      setScanHistory(scanRes.data as ScanHistory[] ?? []);
      setNewsItems(newsRes.data as SecurityNews[] ?? []);
      setLoading(false);
    };
    fetchData();
  }, [hasRole]);

  if (!hasRole('admin', 'instructor')) {
    return (
      <div className="container-app py-20 text-center">
        <Shield className="mx-auto h-12 w-12 text-neutral-400" />
        <p className="mt-4 text-lg font-medium">Access Denied</p>
        <p className="mt-1 text-sm text-neutral-500">You need admin or instructor privileges to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="container-app py-20"><div className="card h-96 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = courseForm.slug || courseForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    await supabase.from('courses').insert({
      title: courseForm.title,
      slug,
      description: courseForm.description,
      category_id: courseForm.category_id || null,
      difficulty: courseForm.difficulty,
      estimated_hours: Number(courseForm.estimated_hours),
      status: 'published',
    });
    setShowCourseForm(false);
    setCourseForm({ title: '', slug: '', description: '', category_id: '', difficulty: 'beginner', estimated_hours: 0 });
    // Refresh
    const { data } = await supabase.from('courses').select('*, category:categories(*)').order('created_at', { ascending: false });
    setCourses(data as Course[] ?? []);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await supabase.from('courses').delete().eq('id', id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'courses' as const, label: 'Courses', icon: BookOpen },
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'scans' as const, label: 'Scans', icon: Activity },
    { id: 'news' as const, label: 'News', icon: Newspaper },
  ];

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8 flex items-center gap-2">
        <Shield className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold">{courses.length}</p>
            <p className="text-sm text-neutral-500">Total Courses</p>
          </div>
          <div className="card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400">
              <Users className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold">{profiles.length}</p>
            <p className="text-sm text-neutral-500">Total Users</p>
          </div>
          <div className="card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold">{categories.length}</p>
            <p className="text-sm text-neutral-500">Categories</p>
          </div>
          <div className="card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Activity className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold">{scanHistory.length}</p>
            <p className="text-sm text-neutral-500">Total Scans</p>
          </div>
          <div className="card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 dark:bg-secondary-900/30 dark:text-secondary-400">
              <Newspaper className="h-5 w-5" />
            </div>
            <p className="mt-3 text-3xl font-bold">{newsItems.length}</p>
            <p className="text-sm text-neutral-500">News Articles</p>
          </div>
        </div>
      )}

      {tab === 'courses' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button onClick={() => setShowCourseForm(!showCourseForm)} className="btn-primary">
              <Plus className="h-4 w-4" /> New Course
            </button>
          </div>

          {showCourseForm && (
            <form onSubmit={handleCreateCourse} className="card mb-4 p-5 animate-fade-in">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Create New Course</h3>
                <button type="button" onClick={() => setShowCourseForm(false)}><X className="h-4 w-4 text-neutral-400" /></button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input type="text" placeholder="Course title" required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className="input" />
                <input type="text" placeholder="Slug (optional)" value={courseForm.slug} onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })} className="input" />
                <select value={courseForm.category_id} onChange={(e) => setCourseForm({ ...courseForm, category_id: e.target.value })} className="input">
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <select value={courseForm.difficulty} onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })} className="input">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input type="number" placeholder="Estimated hours" value={courseForm.estimated_hours} onChange={(e) => setCourseForm({ ...courseForm, estimated_hours: Number(e.target.value) })} className="input" />
              </div>
              <textarea placeholder="Description" required value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} className="input mt-3 resize-none" />
              <button type="submit" className="btn-primary mt-3">Create Course</button>
            </form>
          )}

          <div className="card">
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {courses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <p className="text-xs text-neutral-500">{course.category?.name ?? 'Uncategorized'} · {course.difficulty} · {course.status}</p>
                  </div>
                  <button onClick={() => handleDeleteCourse(course.id)} className="text-neutral-400 hover:text-error-500 ml-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {profiles.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  <span className="text-sm font-semibold uppercase">{p.display_name[0] ?? 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.display_name}</p>
                  <p className="text-xs text-neutral-500 truncate">{p.email}</p>
                </div>
                <span className={`badge ${
                  p.role === 'admin' ? 'badge-error' :
                  p.role === 'instructor' ? 'badge-warning' :
                  'badge-neutral'
                } capitalize`}>{p.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'scans' && (
        <div className="card">
          <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
            <h2 className="font-semibold">Recent Security Scans</h2>
            <p className="text-sm text-neutral-500">Last {scanHistory.length} scans across all users</p>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {scanHistory.length === 0 ? (
              <p className="p-8 text-center text-sm text-neutral-500">No scans recorded yet.</p>
            ) : (
              scanHistory.map(scan => (
                <div key={scan.id} className="flex items-center gap-3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{scan.target}</p>
                    <p className="text-xs text-neutral-500">{scan.tool_type} · {new Date(scan.created_at).toLocaleString()}</p>
                  </div>
                  <span className="badge-success">{scan.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'news' && (
        <div className="card">
          <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
            <h2 className="font-semibold">Security News Articles</h2>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {newsItems.length === 0 ? (
              <p className="p-8 text-center text-sm text-neutral-500">No news articles.</p>
            ) : (
              newsItems.map(article => (
                <div key={article.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{article.title}</p>
                      <p className="text-xs text-neutral-500 truncate">{article.summary}</p>
                      <p className="text-xs text-neutral-400 mt-1">{article.source} · {new Date(article.published_at).toLocaleDateString()}</p>
                    </div>
                    <span className="badge-neutral capitalize flex-shrink-0">{article.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
