import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAuth from './components/shared/RequireAuth';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AdminProvider } from './context/AdminContext';
import LoginModal from './components/auth/LoginModal';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const Paper = lazy(() => import('./pages/public/Paper'));
const Event = lazy(() => import('./pages/public/Event'));
const Blog = lazy(() => import('./pages/public/Blog'));
const BlogDetail = lazy(() => import('./pages/public/BlogDetail'));
const EventDetail = lazy(() => import('./pages/public/EventDetail')); // New
const PaperDetail = lazy(() => import('./pages/public/PaperDetail')); // New
const Contact = lazy(() => import('./pages/public/Contact'));
const CertificateVerification = lazy(() => import('./pages/public/CertificateVerification'));

const CertificateResult = lazy(() => import('./pages/public/CertificateResult'));
const AuthorProfile = lazy(() => import('./pages/public/AuthorProfile'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const Gallery = lazy(() => import('./pages/public/Gallery'));

// Admin Pages
const Login = lazy(() => import('./pages/admin/Login'));
const Signup = lazy(() => import('./pages/admin/Signup'));
const ResetPassword = lazy(() => import('./pages/admin/ResetPassword')); // New
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const PanelManager = lazy(() => import('./pages/admin/PanelManager'));
const EventManager = lazy(() => import('./pages/admin/EventManager'));
const PaperManager = lazy(() => import('./pages/admin/PaperManager'));
const CertificateManager = lazy(() => import('./pages/admin/CertificateManager'));
const MailCenter = lazy(() => import('./pages/admin/MailCenter'));
const ContactManager = lazy(() => import('./pages/admin/ContactManager'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const UserManagement = lazy(() => import('./pages/admin/UserManager'));

// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] bg-(--bg-primary)">
    <div className="w-8 h-8 border-4 border-(--ieee-blue) border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AdminProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="papers" element={<Paper />} />
                <Route path="events" element={<Event />} />
                <Route path="event/:id" element={<EventDetail />} /> {/* New */}
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:id" element={<BlogDetail />} />
                <Route path="author/:authorName" element={<AuthorProfile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password" element={<ResetPassword />} /> {/* New */}
                <Route path="paper/:id" element={<PaperDetail />} /> {/* New */}
                <Route path="contact" element={<Contact />} />
                <Route path="certificate" element={<CertificateVerification />} />

                <Route path="cirt/:id" element={<CertificateResult />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="gallery/:id" element={<Gallery />} />
              </Route>

              {/* Admin Login */}
              <Route path="/admin/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<RequireAuth />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="blogs" element={<BlogManager />} />
                  <Route path="panel" element={<PanelManager />} />
                  <Route path="events" element={<EventManager />} />
                  <Route path="papers" element={<PaperManager />} />
                  <Route path="certificates" element={<CertificateManager />} />
                  <Route path="mail" element={<MailCenter />} />
                  <Route path="contact" element={<ContactManager />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="users" element={<UserManagement />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
        <LoginModal />
      </AdminProvider>
    </ThemeProvider>
  );
}

export default App;
