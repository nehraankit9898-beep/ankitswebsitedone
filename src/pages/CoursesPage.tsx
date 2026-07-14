import { useEffect, useState } from 'react';
import { Search, Zap, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from '../router/Router';
import { supabase } from '../lib/supabase';
import type { Course, Category } from '../lib/supabase';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      const [coursesRes, catRes] = await Promise.all([
        supabase.from('courses').select('*, category:categories(*)').eq('status', 'published').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);
      setCourses(coursesRes.data as Course[] ?? []);
      setCategories(catRes.data as Category[] ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && c.category?.slug !== categoryFilter) return false;
    if (difficultyFilter !== 'all' && c.difficulty !== difficultyFilter) return false;
    return true;
  });

  const difficultyColors: Record<string, string> = {
    beginner: 'badge-success',
    intermediate: 'badge-warning',
    advanced: 'badge-error',
  };

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Courses</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Browse our comprehensive cybersecurity course catalog.</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input sm:w-48"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="input sm:w-44"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-4 text-lg font-medium">No courses found</p>
          <p className="mt-1 text-sm text-neutral-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, i) => (
            <Link
              key={course.id}
              to={`/courses/${course.slug}`}
              className="card-hover group overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="relative h-40 bg-gradient-to-br from-primary-500 to-primary-700 p-6">
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div className="relative flex h-full flex-col justify-end">
                  <span className={`badge ${difficultyColors[course.difficulty]} mb-2 w-fit`}>
                    {course.difficulty}
                  </span>
                  <p className="text-xs text-white/80">{course.category?.name ?? 'General'}</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold leading-snug group-hover:text-primary-600">{course.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-500">{course.description}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    {course.estimated_hours} hours
                  </span>
                  <span className="flex items-center gap-1 text-primary-600">
                    Start <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
