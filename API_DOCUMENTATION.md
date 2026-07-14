# API Documentation

## Overview

CyberLearn uses Supabase as its backend, providing a PostgreSQL database with auto-generated REST APIs via PostgREST. All data access is secured with Row Level Security (RLS) policies.

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: { data: { display_name: 'John Doe' } }
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

### Get Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

## Database Tables

### profiles
- `id` (uuid, PK, references auth.users)
- `email` (text)
- `display_name` (text)
- `role` (text: 'student' | 'instructor' | 'admin')
- `avatar_url` (text, nullable)
- `bio` (text)
- `created_at`, `updated_at` (timestamp)

### categories
- `id` (uuid, PK)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `icon` (text)

### courses
- `id` (uuid, PK)
- `title` (text)
- `slug` (text, unique)
- `description` (text)
- `category_id` (uuid, FK → categories)
- `instructor_id` (uuid, FK → profiles)
- `difficulty` (text: 'beginner' | 'intermediate' | 'advanced')
- `status` (text: 'draft' | 'published')
- `estimated_hours` (numeric)

### modules
- `id` (uuid, PK)
- `course_id` (uuid, FK → courses)
- `title` (text)
- `description` (text)
- `position` (int)

### lessons
- `id` (uuid, PK)
- `module_id` (uuid, FK → modules)
- `title` (text)
- `content` (text)
- `video_url` (text, nullable)
- `position` (int)
- `duration_minutes` (int)

### enrollments
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `course_id` (uuid, FK → courses)
- `progress` (numeric)
- `completed` (boolean)
- `enrolled_at`, `completed_at` (timestamp)

### lesson_progress
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `lesson_id` (uuid, FK → lessons)
- `completed` (boolean)
- `completed_at` (timestamp)

### achievements
- `id` (uuid, PK)
- `name` (text, unique)
- `description` (text)
- `icon` (text)
- `criteria` (text)
- `points` (int)

### user_achievements
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `achievement_id` (uuid, FK → achievements)
- `earned_at` (timestamp)

### certificates
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `course_id` (uuid, FK → courses)
- `certificate_number` (text, unique)
- `issued_at` (timestamp)

### forum_categories
- `id` (uuid, PK)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `icon` (text)

### forum_topics
- `id` (uuid, PK)
- `category_id` (uuid, FK → forum_categories)
- `author_id` (uuid, FK → profiles)
- `title` (text)
- `content` (text)
- `pinned` (boolean)
- `views` (int)

### forum_posts
- `id` (uuid, PK)
- `topic_id` (uuid, FK → forum_topics)
- `author_id` (uuid, FK → profiles)
- `content` (text)

### notes
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `lesson_id` (uuid, nullable, FK → lessons)
- `title` (text)
- `content` (text)

### notifications
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `type` (text)
- `title` (text)
- `message` (text)
- `read` (boolean)
- `link` (text, nullable)

## Common Queries

### Get published courses with category
```typescript
const { data } = await supabase
  .from('courses')
  .select('*, category:categories(*)')
  .eq('status', 'published');
```

### Get user enrollments with course data
```typescript
const { data } = await supabase
  .from('enrollments')
  .select('*, course:courses(*)')
  .eq('user_id', userId);
```

### Get forum topics with author and category
```typescript
const { data } = await supabase
  .from('forum_topics')
  .select('*, author:profiles(*), category:forum_categories(*)')
  .order('created_at', { ascending: false });
```

### Get user achievements
```typescript
const { data } = await supabase
  .from('user_achievements')
  .select('*, achievement:achievements(*)')
  .eq('user_id', userId);
```

## RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | All authenticated | Own only | Own only | - |
| categories | Public | Admin/Instructor | Admin | Admin |
| courses | Public | Admin/Instructor | Admin/Instructor | Admin |
| modules | Public | Admin/Instructor | Admin/Instructor | Admin/Instructor |
| lessons | Public | Admin/Instructor | Admin/Instructor | Admin/Instructor |
| enrollments | Own only | Own only | Own only | Own only |
| lesson_progress | Own only | Own only | Own only | Own only |
| achievements | Public | Admin | Admin | Admin |
| user_achievements | All authenticated | Own only | - | Own only |
| certificates | Own only | Own only | - | Own only |
| forum_categories | Public | Admin/Instructor | Admin/Instructor | Admin |
| forum_topics | Public | Own (author) | Own/Admin | Own/Admin |
| forum_posts | Public | Own (author) | Own/Admin | Own/Admin |
| notes | Own only | Own only | Own only | Own only |
| notifications | Own only | Own only | Own only | Own only |
