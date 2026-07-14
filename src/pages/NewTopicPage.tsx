import { useEffect, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Link, useRouter } from '../router/Router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ForumCategory } from '../lib/supabase';

export default function NewTopicPage() {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('forum_categories').select('*').order('name');
      setCategories(data as ForumCategory[] ?? []);
      if (data && data.length > 0) setCategoryId(data[0].id);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !categoryId || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        category_id: categoryId,
        author_id: profile.id,
        title: title.trim(),
        content: content.trim(),
      })
      .select('id')
      .maybeSingle();

    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data) {
      navigate(`/forum/topic/${data.id}`);
    }
  };

  if (!profile) {
    return (
      <div className="container-app py-20 text-center">
        <p className="text-lg font-medium">Sign in to create a topic</p>
        <Link to="/signin" className="btn-primary mt-4">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 animate-fade-in max-w-3xl">
      <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Forum
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">New Discussion Topic</h1>

      {error && (
        <div className="mt-4 rounded-lg bg-error-50 p-3 text-sm text-error-700 dark:bg-error-900/20 dark:text-error-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input" required>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Topic title..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Content</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="input resize-none"
            placeholder="Write your topic content..."
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          <Send className="h-4 w-4" /> {submitting ? 'Creating...' : 'Create Topic'}
        </button>
      </form>
    </div>
  );
}
