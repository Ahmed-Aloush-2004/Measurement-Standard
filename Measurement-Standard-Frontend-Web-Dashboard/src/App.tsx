
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store/store';
import { fetchProfile } from './store/slices/authSlice';

import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { RoleGuard } from './components/guards/RoleGuard';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage'; // <-- Add this import
import { ExamTypesPage } from './pages/ExamTypesPage';
import { SectionsPage } from './pages/SectionsPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { UsersPage } from './pages/UsersPage';
import { Role } from './types';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { NotificationsPage } from './pages/NotificationsPage';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* NEW UNAUTHORIZED ROUTE */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="notifications" element={<NotificationsPage />} />          
          <Route
            path="exam-types"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}>
                <ExamTypesPage />
              </RoleGuard>
            }
          />

          <Route
            path="sections"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}>
                <SectionsPage />
              </RoleGuard>
            }
          />

          <Route
            path="questions"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPER_ADMIN]}>
                <QuestionsPage />
              </RoleGuard>
            }
          />
          
          <Route
            path="users"
            element={
              <RoleGuard allowedRoles={[Role.SUPER_ADMIN]}>
                <UsersPage />
              </RoleGuard>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}