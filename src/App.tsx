import { useEffect } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './router/Router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import DashboardPage from './pages/DashboardPage';
import AchievementsPage from './pages/AchievementsPage';
import CertificatesPage from './pages/CertificatesPage';
import ForumPage from './pages/ForumPage';
import NewTopicPage from './pages/NewTopicPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import SecurityToolsPage from './pages/SecurityToolsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import SecurityNewsPage from './pages/SecurityNewsPage';
import ScanHistoryPage from './pages/ScanHistoryPage';

function AppContent() {
  const { path, navigate } = useRouter();
  const { profile, loading } = useAuth();

  // Protected routes
  const protectedRoutes = ['/dashboard', '/notes', '/profile', '/certificates', '/admin', '/forum/new', '/ai-assistant', '/scan-history'];
  const isProtected = protectedRoutes.some(r => path.startsWith(r));

  useEffect(() => {
    if (!loading && isProtected && !profile) {
      navigate('/signin');
    }
  }, [loading, isProtected, profile, navigate]);

  let page: React.ReactNode;

  if (path === '/' || path === '') {
    page = <LandingPage />;
  } else if (path === '/signin') {
    page = <SignInPage />;
  } else if (path === '/signup') {
    page = <SignUpPage />;
  } else if (path === '/courses') {
    page = <CoursesPage />;
  } else if (path.startsWith('/courses/')) {
    page = <CourseDetailPage slug={path.split('/courses/')[1]} />;
  } else if (path === '/dashboard') {
    page = profile ? <DashboardPage /> : <SignInPage />;
  } else if (path === '/achievements') {
    page = <AchievementsPage />;
  } else if (path === '/certificates') {
    page = profile ? <CertificatesPage /> : <SignInPage />;
  } else if (path.startsWith('/forum')) {
    if (path === '/forum/new') {
      page = profile ? <NewTopicPage /> : <SignInPage />;
    } else {
      page = <ForumPage />;
    }
  } else if (path === '/notes') {
    page = profile ? <NotesPage /> : <SignInPage />;
  } else if (path === '/profile') {
    page = profile ? <ProfilePage /> : <SignInPage />;
  } else if (path === '/admin') {
    page = <AdminPage />;
  } else if (path === '/tools') {
    page = <SecurityToolsPage />;
  } else if (path === '/ai-assistant') {
    page = profile ? <AIAssistantPage /> : <SignInPage />;
  } else if (path === '/news') {
    page = <SecurityNewsPage />;
  } else if (path === '/scan-history') {
    page = profile ? <ScanHistoryPage /> : <SignInPage />;
  } else {
    page = (
      <div className="container-app py-20 text-center">
        <p className="text-2xl font-bold">404 - Page Not Found</p>
        <p className="mt-2 text-neutral-500">The page you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{page}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
