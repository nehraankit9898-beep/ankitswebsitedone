import { useEffect, useState } from 'react';
import { StickyNote, Plus, Trash2, Search, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Note } from '../lib/supabase';

export default function NotesPage() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', profile.id)
        .order('updated_at', { ascending: false });
      setNotes(data as Note[] ?? []);
      setLoading(false);
    };
    fetchNotes();
  }, [profile]);

  const handleNew = () => {
    setEditing(null);
    setTitle('');
    setContent('');
  };

  const handleEdit = (note: Note) => {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !content.trim()) return;
    setSaving(true);
    if (editing) {
      const { data } = await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editing.id)
        .select('*')
        .maybeSingle();
      if (data) {
        setNotes(prev => prev.map(n => n.id === editing.id ? data as Note : n));
      }
    } else {
      const { data } = await supabase
        .from('notes')
        .insert({ user_id: profile.id, title, content })
        .select('*')
        .maybeSingle();
      if (data) setNotes(prev => [data as Note, ...prev]);
    }
    setSaving(false);
    setEditing(null);
    setTitle('');
    setContent('');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notes.filter(n =>
    !search ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="container-app py-20"><div className="card h-96 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;
  }

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Personal study notes for your cybersecurity journey.</p>
        </div>
        <button onClick={handleNew} className="btn-primary">
          <Plus className="h-4 w-4" /> New Note
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Notes list */}
        <div className="lg:col-span-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="card p-6 text-center">
                <StickyNote className="mx-auto h-8 w-8 text-neutral-400" />
                <p className="mt-2 text-sm text-neutral-500">No notes yet. Create one!</p>
              </div>
            ) : (
              filtered.map(note => (
                <div
                  key={note.id}
                  className={`card p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 ${editing?.id === note.id ? 'border-primary-400' : ''}`}
                  onClick={() => handleEdit(note)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{note.title || 'Untitled'}</p>
                      <p className="text-xs text-neutral-500 truncate">{note.content}</p>
                      <p className="text-xs text-neutral-400 mt-1">{new Date(note.updated_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="text-neutral-400 hover:text-error-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{editing ? 'Edit Note' : 'New Note'}</h2>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setTitle(''); setContent(''); }} className="btn-ghost">
                  <X className="h-4 w-4" /> Cancel
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input mb-3"
            />
            <textarea
              placeholder="Write your note content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="input resize-none font-mono text-sm"
            />
            <button type="submit" disabled={saving || !content.trim()} className="btn-primary mt-3">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Note'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
