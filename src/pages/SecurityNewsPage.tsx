import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Clock, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SecurityNews } from '../lib/supabase';

export default function SecurityNewsPage() {
  const [news, setNews] = useState<SecurityNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      const { data } = await supabase
        .from('security_news')
        .select('*')
        .order('published_at', { ascending: false });
      setNews(data as SecurityNews[] ?? []);
      setLoading(false);
    };
    fetchNews();
  }, []);

  const categories = ['all', 'vulnerability', 'malware', 'threat', 'cryptography', 'supply-chain', 'general'];

  const filtered = news.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.summary.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && n.category !== category) return false;
    return true;
  });

  const categoryColors: Record<string, string> = {
    vulnerability: 'badge-error',
    malware: 'badge-warning',
    threat: 'badge-error',
    cryptography: 'badge-primary',
    'supply-chain': 'badge-warning',
    general: 'badge-neutral',
  };

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Security News</h1>
            <p className="text-sm text-neutral-500">Stay updated with the latest cybersecurity news and alerts.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input sm:w-48">
          {categories.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Newspaper className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-4 text-lg font-medium">No news found</p>
          <p className="mt-1 text-sm text-neutral-500">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((article, i) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover group p-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`${categoryColors[article.category] ?? 'badge-neutral'} capitalize`}>
                  {article.category}
                </span>
                <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-600" />
              </div>
              <h3 className="mt-3 font-semibold leading-snug group-hover:text-primary-600">{article.title}</h3>
              <p className="mt-2 text-sm text-neutral-500 line-clamp-2">{article.summary}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
                <span className="font-medium">{article.source}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(article.published_at).toLocaleDateString()}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
