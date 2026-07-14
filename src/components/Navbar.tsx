import { Shield, Menu, X, Bell, LogOut, Settings, BookOpen, Trophy, FileText, MessageSquare, StickyNote, LayoutDashboard, Users, Moon, Sun, Wrench, Sparkles, Newspaper, History } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../router/Router';
import { supabase } from '../lib/supabase';
import type { Notification } from '../lib/supabase';

export default function Navbar() {
  const { profile, signOut, hasRole } = useAuth();
  const { path, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (!profile) return;
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setNotifications(data as Notification[] ?? []);
    };
    fetchNotifs();
  }, [profile]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/tools', label: 'Tools', icon: Wrench },
    { to: '/news', label: 'News', icon: Newspaper },
    { to: '/forum', label: 'Forum', icon: MessageSquare },
    { to: '/achievements', label: 'Awards', icon: Trophy },
  ];

  if (profile) {
    navLinks.push({ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard } as never);
    navLinks.push({ to: '/ai-assistant', label: 'AI Assistant', icon: Sparkles } as never);
  }
  if (hasRole('instructor', 'admin')) {
    navLinks.push({ to: '/admin', label: 'Admin', icon: Users } as never);
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="container-app">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight">CyberLearn</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = path.startsWith(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {profile ? (
              <>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900 animate-scale-in">
                      <div className="flex items-center justify-between border-b border-neutral-200 p-3 dark:border-neutral-800">
                        <span className="text-sm font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto scrollbar-thin">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-sm text-neutral-500">No notifications</p>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              className={`border-b border-neutral-100 p-3 dark:border-neutral-800 ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                            >
                              <p className="text-sm font-medium">{n.title}</p>
                              <p className="text-xs text-neutral-500">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold uppercase">{profile.display_name[0] ?? 'U'}</span>
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900 animate-scale-in">
                      <div className="border-b border-neutral-200 p-3 dark:border-neutral-800">
                        <p className="text-sm font-semibold">{profile.display_name}</p>
                        <p className="text-xs text-neutral-500">{profile.email}</p>
                        <span className="badge-primary mt-1 capitalize">{profile.role}</span>
                      </div>
                      <div className="p-1.5">
                        <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </Link>
                        <Link to="/ai-assistant" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
                          <Sparkles className="h-4 w-4" /> AI Assistant
                        </Link>
                        <Link to="/scan-history" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
                          <History className="h-4 w-4" /> Scan History
                        </Link>
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
                          <Settings className="h-4 w-4" /> Profile
                        </Link>
                        <Link to="/certificates" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
                          <FileText className="h-4 w-4" /> Certificates
                        </Link>
                        <Link to="/notes" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800">
                          <StickyNote className="h-4 w-4" /> Notes
                        </Link>
                        <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/signin" className="btn-ghost">Sign In</Link>
                <Link to="/signup" className="btn-primary">Get Started</Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 dark:text-neutral-400"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-neutral-200 py-3 dark:border-neutral-800 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              {!profile && (
                <div className="flex gap-2 px-3 pt-2">
                  <Link to="/signin" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1">Sign In</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">Get Started</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
