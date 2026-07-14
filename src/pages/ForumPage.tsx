import { useEffect, useState } from 'react';
import { Plus, ArrowLeft, MessageCircle, Eye, Send } from 'lucide-react';
import { Link, useRouter } from '../router/Router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ForumCategory, ForumTopic, ForumPost } from '../lib/supabase';

export default function ForumPage() {
  const { path } = useRouter();

  // Parse route: /forum, /forum/category/:slug, /forum/topic/:id
  const topicMatch = path.match(/^\/forum\/topic\/(.+)/);
  const categoryMatch = path.match(/^\/forum\/category\/(.+)/);

  if (topicMatch) return <TopicView topicId={topicMatch[1]} />;
  if (categoryMatch) return <CategoryView slug={categoryMatch[1]} />;
  return <ForumHome />;
}

function ForumHome() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, topicRes] = await Promise.all([
        supabase.from('forum_categories').select('*').order('name'),
        supabase.from('forum_topics')
          .select('*, author:profiles(*), category:forum_categories(*)')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      setCategories(catRes.data as ForumCategory[] ?? []);
      setTopics(topicRes.data as ForumTopic[] ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="container-app py-20"><div className="card h-96 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;
  }

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Discuss cybersecurity topics with the community.</p>
        </div>
        {profile && <Link to="/forum/new" className="btn-primary"><Plus className="h-4 w-4" /> New Topic</Link>}
      </div>

      {/* Categories */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/forum/category/${cat.slug}`}
            className="card-hover p-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">{cat.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{cat.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Topics */}
      <div className="card">
        <div className="border-b border-neutral-200 p-4 dark:border-neutral-800">
          <h2 className="font-semibold">Recent Discussions</h2>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {topics.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">No topics yet. Start a discussion!</p>
          ) : (
            topics.map(topic => (
              <Link
                key={topic.id}
                to={`/forum/topic/${topic.id}`}
                className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  <span className="text-sm font-semibold uppercase">
                    {topic.author?.display_name?.[0] ?? 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{topic.title}</p>
                  <p className="text-xs text-neutral-500">
                    by {topic.author?.display_name ?? 'Unknown'} · {topic.category?.name ?? 'General'} · {new Date(topic.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {topic.views}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryView({ slug }: { slug: string }) {
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from('forum_categories').select('*').eq('slug', slug).maybeSingle();
      setCategory(catData as ForumCategory | null);
      if (catData) {
        const { data: topicData } = await supabase
          .from('forum_topics')
          .select('*, author:profiles(*)')
          .eq('category_id', catData.id)
          .order('pinned', { ascending: false })
          .order('created_at', { ascending: false });
        setTopics(topicData as ForumTopic[] ?? []);
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  if (loading) return <div className="container-app py-20"><div className="card h-64 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;

  return (
    <div className="container-app py-8 animate-fade-in">
      <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Forum
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">{category?.name ?? 'Category'}</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">{category?.description}</p>

      <div className="mt-8 card">
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {topics.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">No topics in this category yet.</p>
          ) : (
            topics.map(topic => (
              <Link
                key={topic.id}
                to={`/forum/topic/${topic.id}`}
                className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  <span className="text-sm font-semibold uppercase">{topic.author?.display_name?.[0] ?? 'A'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {topic.pinned && <span className="badge-warning">Pinned</span>}
                    <p className="text-sm font-medium truncate">{topic.title}</p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    by {topic.author?.display_name ?? 'Unknown'} · {new Date(topic.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="hidden sm:flex items-center gap-1 text-xs text-neutral-400">
                  <Eye className="h-3.5 w-3.5" /> {topic.views}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TopicView({ topicId }: { topicId: string }) {
  const { profile } = useAuth();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: topicData } = await supabase
        .from('forum_topics')
        .select('*, author:profiles(*), category:forum_categories(*)')
        .eq('id', topicId)
        .maybeSingle();
      setTopic(topicData as ForumTopic | null);

      const { data: postData } = await supabase
        .from('forum_posts')
        .select('*, author:profiles(*)')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      setPosts(postData as ForumPost[] ?? []);
      setLoading(false);

      // Increment views
      if (topicData) {
        await supabase.from('forum_topics').update({ views: (topicData.views ?? 0) + 1 }).eq('id', topicId);
      }
    };
    fetchData();
  }, [topicId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !reply.trim()) return;
    setSubmitting(true);
    const { data } = await supabase
      .from('forum_posts')
      .insert({ topic_id: topicId, author_id: profile.id, content: reply })
      .select('*, author:profiles(*)')
      .maybeSingle();
    if (data) setPosts(prev => [...prev, data as ForumPost]);
    setReply('');
    setSubmitting(false);
  };

  if (loading) return <div className="container-app py-20"><div className="card h-64 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;
  if (!topic) return <div className="container-app py-20 text-center"><p>Topic not found</p><Link to="/forum" className="btn-primary mt-4">Back to Forum</Link></div>;

  return (
    <div className="container-app py-8 animate-fade-in max-w-4xl">
      <Link to={`/forum/category/${topic.category?.slug ?? ''}`} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to {topic.category?.name}
      </Link>

      {topic.pinned && <span className="badge-warning mb-2">Pinned</span>}
      <h1 className="text-2xl font-bold tracking-tight">{topic.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">
        by {topic.author?.display_name ?? 'Unknown'} · {new Date(topic.created_at).toLocaleDateString()} · {topic.views} views
      </p>

      <div className="mt-6 space-y-4">
        {/* Original post */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              <span className="text-sm font-semibold uppercase">{topic.author?.display_name?.[0] ?? 'A'}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{topic.author?.display_name ?? 'Unknown'}</p>
              <p className="text-xs text-neutral-500">{new Date(topic.created_at).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{topic.content}</p>
        </div>

        {/* Replies */}
        {posts.map(post => (
          <div key={post.id} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                <span className="text-sm font-semibold uppercase">{post.author?.display_name?.[0] ?? 'A'}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{post.author?.display_name ?? 'Unknown'}</p>
                <p className="text-xs text-neutral-500">{new Date(post.created_at).toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{post.content}</p>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {profile ? (
        <form onSubmit={handleReply} className="mt-6 card p-5">
          <h3 className="font-semibold mb-3">Post a Reply</h3>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            className="input resize-none"
            placeholder="Write your reply..."
          />
          <button type="submit" disabled={submitting || !reply.trim()} className="btn-primary mt-3">
            <Send className="h-4 w-4" /> {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      ) : (
        <div className="mt-6 card p-5 text-center">
          <p className="text-sm text-neutral-500">Sign in to join the discussion.</p>
          <Link to="/signin" className="btn-primary mt-3">Sign In</Link>
        </div>
      )}
    </div>
  );
}
