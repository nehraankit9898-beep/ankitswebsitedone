import { useEffect, useState } from 'react';
import { Shield, Network, Bug, KeyRound, ArrowRight, BookOpen, Users, Award, Zap, Wrench, Sparkles, Newspaper, Lock } from 'lucide-react';
import { Link } from '../router/Router';
import { supabase } from '../lib/supabase';
import type { Course, Category } from '../lib/supabase';

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [coursesRes, catRes] = await Promise.all([
        supabase.from('courses').select('*, category:categories(*)').eq('status', 'published').limit(6),
        supabase.from('categories').select('*'),
      ]);
      setCourses(coursesRes.data as Course[] ?? []);
      setCategories(catRes.data as Category[] ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const features = [
    { icon: BookOpen, title: 'Interactive Courses', desc: 'Learn through hands-on lessons covering real-world security scenarios.' },
    { icon: Wrench, title: 'Security Tools', desc: 'Professional tools: DNS lookup, header analyzer, SSL checker, CVE search, and more.' },
    { icon: Sparkles, title: 'AI Security Assistant', desc: 'Get instant answers to cybersecurity questions from our AI assistant.' },
    { icon: Newspaper, title: 'Security News', desc: 'Stay updated with the latest vulnerabilities, threats, and security news.' },
    { icon: Shield, title: 'Practical Security', desc: 'Master defensive and offensive techniques used by industry professionals.' },
    { icon: Award, title: 'Achievements', desc: 'Earn badges and certificates as you progress through your learning journey.' },
    { icon: Users, title: 'Community Forum', desc: 'Connect with fellow security enthusiasts and share knowledge.' },
    { icon: Lock, title: 'Scan History', desc: 'Track all your security scans and download detailed PDF reports.' },
  ];

  const stats = [
    { value: '5+', label: 'Courses' },
    { value: '10+', label: 'Security Tools' },
    { value: '8', label: 'Achievements' },
    { value: '5', label: 'Forum Categories' },
  ];

  const difficultyColors: Record<string, string> = {
    beginner: 'badge-success',
    intermediate: 'badge-warning',
    advanced: 'badge-error',
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-neutral-50 dark:from-neutral-900 dark:to-neutral-950">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary-500/10 blur-3xl" />

        <div className="container-app relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
              <Shield className="h-4 w-4" />
              Learn Cybersecurity the Right Way
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-6xl">
              Master <span className="text-gradient">Cybersecurity</span> Through Hands-On Learning
            </h1>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              From web application security to network defense and ethical hacking —
              build real-world skills with interactive courses, a community forum, and achievement tracking.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary px-6 py-3 text-base">
                Start Learning Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/courses" className="btn-secondary px-6 py-3 text-base">
                Browse Courses
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="card p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</p>
                <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose CyberLearn?</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Everything you need to build a strong foundation in cybersecurity.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="glass-card p-6 animate-fade-in-up hover:shadow-lg"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-neutral-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-neutral-100 py-20 dark:bg-neutral-900/50">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Explore Security Topics</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Dive into specialized areas of cybersecurity.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/courses?category=${cat.slug}`}
                className="card-hover group p-5 text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 group-hover:bg-primary-100 group-hover:text-primary-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {cat.icon === 'Globe' && <Network className="h-6 w-6" />}
                  {cat.icon === 'Network' && <Network className="h-6 w-6" />}
                  {cat.icon === 'KeyRound' && <KeyRound className="h-6 w-6" />}
                  {cat.icon === 'Bug' && <Bug className="h-6 w-6" />}
                  {cat.icon === 'Search' && <Shield className="h-6 w-6" />}
                  {cat.icon === 'Sword' && <Shield className="h-6 w-6" />}
                </div>
                <p className="mt-3 text-sm font-medium">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20">
        <div className="container-app">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Courses</h2>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">Start your journey with our most popular courses.</p>
            </div>
            <Link to="/courses" className="hidden md:flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card h-64 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, i) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className="card-hover group overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
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
                        Start learning <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Security Tools Showcase */}
      <section className="py-20 bg-gradient-to-b from-neutral-50 to-primary-50/30 dark:from-neutral-900/50 dark:to-neutral-950">
        <div className="container-app">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Professional Security Tools</h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              A complete toolkit for cybersecurity analysis and investigation.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[
              { icon: KeyRound, label: 'Password Checker' },
              { icon: Network, label: 'DNS Lookup' },
              { icon: Shield, label: 'Header Analyzer' },
              { icon: Lock, label: 'SSL Checker' },
              { icon: Bug, label: 'CVE Search' },
              { icon: BookOpen, label: 'WHOIS Lookup' },
              { icon: Wrench, label: 'Port Scanner' },
              { icon: Sparkles, label: 'URL Reputation' },
              { icon: Award, label: 'Hash Generator' },
              { icon: Newspaper, label: 'Security News' },
            ].map((tool, i) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={i}
                  to="/tools"
                  className="glass-card group p-5 text-center animate-fade-in-up hover:shadow-lg"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-transform group-hover:scale-110 dark:bg-primary-900/30 dark:text-primary-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{tool.label}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link to="/tools" className="btn-primary">
              Try All Tools <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-16">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start Your Security Journey?</h2>
          <p className="mt-3 text-primary-100">Join CyberLearn today and build skills that matter.</p>
          <Link to="/signup" className="mt-6 inline-flex btn bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 text-base">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
