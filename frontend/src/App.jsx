import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import ThemeManager from './components/ThemeManager';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CreateTaskPage from './pages/CreateTaskPage';
import EditTaskPage from './pages/EditTaskPage';
import KanbanPage from './pages/KanbanPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FocusModePage from './pages/FocusModePage';
import SettingsPage from './pages/SettingsPage';
import AchievementsPage from './pages/AchievementsPage';
import ActivityPage from './pages/ActivityPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <ThemeManager>
      <Routes>
        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tasks" element={<Navigate to="/" replace />} />
                  <Route path="/tasks/new" element={<CreateTaskPage />} />
                  <Route path="/tasks/:id/edit" element={<EditTaskPage />} />
                  <Route path="/kanban" element={<KanbanPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/focus" element={<FocusModePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  
                  {/* New SaaS Routes */}
                  <Route path="/achievements" element={<AchievementsPage />} />
                  <Route path="/activity" element={<ActivityPage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  
                  {/* Extra Pages */}
                  <Route path="/about" element={<AboutPage />} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeManager>
  );
}
