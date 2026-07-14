import { useEffect, useState } from 'react';
import { User, Mail, Save, Shield, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio);
      setAvatarUrl(profile.avatar_url ?? '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: displayName,
      bio,
      avatar_url: avatarUrl || null,
    }).eq('id', profile.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return null;

  return (
    <div className="container-app py-8 animate-fade-in max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">Manage your account and preferences.</p>

      <div className="mt-8 grid grid-cols-1 gap-6">
        {/* Profile info card */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold uppercase">{profile.display_name[0] ?? 'U'}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{profile.display_name}</h2>
              <p className="text-sm text-neutral-500">{profile.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="badge-primary capitalize">
                  <Shield className="h-3 w-3" /> {profile.role}
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Joined {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="card p-6">
          <h3 className="font-semibold mb-4">Edit Profile</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input pl-10"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="input pl-10 opacity-60"
                />
              </div>
              <p className="mt-1 text-xs text-neutral-400">Email cannot be changed.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && <span className="text-sm text-success-600">Saved successfully!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
