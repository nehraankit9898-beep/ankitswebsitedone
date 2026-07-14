import { useEffect, useState } from 'react';
import { ArrowLeft, Zap, Check, Circle, Clock, BookOpen, ChevronDown, ChevronUp, StickyNote, Award } from 'lucide-react';
import { Link } from '../router/Router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Course, Module, Lesson, LessonProgress, Enrollment } from '../lib/supabase';

export default function CourseDetailPage({ slug }: { slug: string }) {
  const { profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: courseData } = await supabase
        .from('courses')
        .select('*, category:categories(*), instructor:profiles(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (!courseData) { setLoading(false); return; }
      setCourse(courseData as Course);

      const { data: modData } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseData.id)
        .order('position', { ascending: true });
      const mods = modData as Module[] ?? [];
      setModules(mods);

      const lessonMap: Record<string, Lesson[]> = {};
      for (const mod of mods) {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', mod.id)
          .order('position', { ascending: true });
        lessonMap[mod.id] = lessonData as Lesson[] ?? [];
      }
      setLessons(lessonMap);

      if (profile) {
        const { data: enrollData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', courseData.id)
          .eq('user_id', profile.id)
          .maybeSingle();
        setEnrollment(enrollData as Enrollment | null);

        const allLessons = Object.values(lessonMap).flat();
        if (allLessons.length > 0) {
          const { data: progData } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', profile.id)
            .in('lesson_id', allLessons.map(l => l.id));
          setProgress(progData as LessonProgress[] ?? []);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, [slug, profile]);

  const allLessons = modules.flatMap(m => lessons[m.id] ?? []);
  const completedLessonIds = new Set(progress.filter(p => p.completed).map(p => p.lesson_id));
  const completedCount = completedLessonIds.size;
  const totalLessons = allLessons.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleEnroll = async () => {
    if (!profile || !course) return;
    setEnrolling(true);
    const { data } = await supabase
      .from('enrollments')
      .insert({ user_id: profile.id, course_id: course.id })
      .select('*')
      .maybeSingle();
    setEnrollment(data as Enrollment | null);
    setEnrolling(false);
  };

  const toggleLesson = async (lesson: Lesson) => {
    if (!profile || !enrollment) return;
    const existing = progress.find(p => p.lesson_id === lesson.id);
    if (existing) {
      const newCompleted = !existing.completed;
      await supabase
        .from('lesson_progress')
        .update({ completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null })
        .eq('id', existing.id);
      setProgress(prev => prev.map(p => p.lesson_id === lesson.id ? { ...p, completed: newCompleted } : p));
    } else {
      const { data } = await supabase
        .from('lesson_progress')
        .insert({ user_id: profile.id, lesson_id: lesson.id, completed: true, completed_at: new Date().toISOString() })
        .select('*')
        .maybeSingle();
      if (data) setProgress(prev => [...prev, data as LessonProgress]);
    }

    const newCompletedCount = progress.filter(p => p.completed && p.lesson_id !== lesson.id).length + (existing?.completed ? 0 : 1);
    const newPct = totalLessons > 0 ? Math.round((newCompletedCount / totalLessons) * 100) : 0;
    if (enrollment) {
      await supabase.from('enrollments').update({ progress: newPct, completed: newPct === 100, completed_at: newPct === 100 ? new Date().toISOString() : null }).eq('id', enrollment.id);
      setEnrollment({ ...enrollment, progress: newPct, completed: newPct === 100 });
    }
  };

  if (loading) {
    return <div className="container-app py-20"><div className="card h-96 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;
  }
  if (!course) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-lg font-medium">Course not found</p>
        <Link to="/courses" className="btn-primary mt-4">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="container-app relative py-12">
          <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-primary-100 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className={`badge bg-white/20 text-white`}>{course.difficulty}</span>
                <span className="text-sm text-primary-100">{course.category?.name}</span>
              </div>
              <h1 className="mt-3 text-3xl font-bold md:text-4xl">{course.title}</h1>
              <p className="mt-3 text-primary-100">{course.description}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-primary-100">
                <span className="flex items-center gap-1"><Zap className="h-4 w-4" /> {course.estimated_hours} hours</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {totalLessons} lessons</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {!profile ? (
                <Link to="/signup" className="btn bg-white text-primary-700 hover:bg-primary-50">Enroll Now</Link>
              ) : !enrollment ? (
                <button onClick={handleEnroll} disabled={enrolling} className="btn bg-white text-primary-700 hover:bg-primary-50">
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : (
                <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm font-medium">Your Progress</p>
                  <p className="mt-1 text-2xl font-bold">{progressPct}%</p>
                  <div className="mt-2 h-2 w-40 rounded-full bg-white/20">
                    <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-primary-100">{completedCount} of {totalLessons} lessons</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Lessons sidebar */}
          <div className="lg:col-span-1">
            <div className="card overflow-hidden">
              <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
                <h2 className="font-semibold">Course Content</h2>
                <p className="text-sm text-neutral-500">{modules.length} modules · {totalLessons} lessons</p>
              </div>
              <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
                {modules.map(mod => {
                  const modLessons = lessons[mod.id] ?? [];
                  const isExpanded = expandedModule === mod.id || modLessons.some(l => l.id === activeLesson?.id);
                  return (
                    <div key={mod.id} className="border-b border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                        className="flex w-full items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{mod.title}</p>
                          <p className="text-xs text-neutral-500">{modLessons.length} lessons</p>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
                      </button>
                      {isExpanded && (
                        <div className="pb-2">
                          {modLessons.map(lesson => {
                            const isCompleted = completedLessonIds.has(lesson.id);
                            const isActive = activeLesson?.id === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                                  isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                }`}
                              >
                                {enrollment ? (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toggleLesson(lesson); }}
                                    className="flex-shrink-0"
                                  >
                                    {isCompleted ? <Check className="h-4 w-4 text-success-500" /> : <Circle className="h-4 w-4 text-neutral-300" />}
                                  </button>
                                ) : (
                                  <Circle className="h-4 w-4 flex-shrink-0 text-neutral-300" />
                                )}
                                <span className="flex-1 truncate">{lesson.title}</span>
                                <span className="flex items-center gap-1 text-xs text-neutral-400">
                                  <Clock className="h-3 w-3" /> {lesson.duration_minutes}m
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lesson content */}
          <div className="lg:col-span-2">
            {activeLesson ? (
              <div className="card p-6 animate-fade-in">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{activeLesson.title}</h2>
                  <span className="flex items-center gap-1 text-xs text-neutral-400">
                    <Clock className="h-3.5 w-3.5" /> {activeLesson.duration_minutes} min
                  </span>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <LessonContent content={activeLesson.content} />
                </div>
                {enrollment && (
                  <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
                    <button
                      onClick={() => toggleLesson(activeLesson)}
                      className={completedLessonIds.has(activeLesson.id) ? 'btn-secondary' : 'btn-primary'}
                    >
                      {completedLessonIds.has(activeLesson.id) ? (
                        <><Check className="h-4 w-4" /> Completed</>
                      ) : (
                        <>Mark as Complete</>
                      )}
                    </button>
                    <Link to="/notes" className="btn-ghost">
                      <StickyNote className="h-4 w-4" /> Take Notes
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-neutral-400" />
                <p className="mt-4 text-lg font-medium">Select a lesson to start learning</p>
                <p className="mt-1 text-sm text-neutral-500">Choose a lesson from the course content sidebar.</p>
                {enrollment && progressPct === 100 && (
                  <div className="mt-6 rounded-lg bg-success-50 p-4 dark:bg-success-900/20">
                    <Award className="mx-auto h-8 w-8 text-success-600" />
                    <p className="mt-2 font-medium text-success-700 dark:text-success-400">Course Completed!</p>
                    <Link to="/certificates" className="btn-primary mt-3">View Certificate</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold mt-3">{line.slice(4)}</h3>;
        if (line.startsWith('- ') || line.match(/^\d+\. /)) {
          return <li key={i} className="ml-4 text-sm">{line.replace(/^[-]\s/, '• ').replace(/^\d+\.\s/, '')}</li>;
        }
        if (line.startsWith('```')) return null;
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-sm text-neutral-700 dark:text-neutral-300">{line}</p>;
      })}
    </div>
  );
}
