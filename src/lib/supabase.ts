import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type UserRole = 'student' | 'instructor' | 'admin';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string | null;
  instructor_id: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  thumbnail_url: string | null;
  estimated_hours: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  instructor?: Profile;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url: string | null;
  position: number;
  duration_minutes: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed: boolean;
  enrolled_at: string;
  completed_at: string | null;
  course?: Course;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  course?: Course;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  created_at: string;
}

export interface ForumTopic {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
  category?: ForumCategory;
  post_count?: number;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Note {
  id: string;
  user_id: string;
  lesson_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export interface ScanHistory {
  id: string;
  user_id: string;
  tool_type: string;
  target: string;
  result: Record<string, unknown>;
  status: string;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface SecurityNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  category: string;
  published_at: string;
  created_at: string;
}

export async function callSecurityTool(tool: string, target: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/security-tools`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tool, target }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed (${response.status})`);
  }

  return response.json();
}

export async function callAIAssistant(message: string, conversationId?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Authentication required');

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed (${response.status})`);
  }

  return response.json();
}
