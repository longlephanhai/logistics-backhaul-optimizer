import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppDispatch } from './store';
import { fetchAccountThunk, resetAuth } from './store/slices/authSlice';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { UsersPage } from './pages/users/UsersPage';
import { RolesPage } from './pages/roles/RolesPage';
import { PermissionsPage } from './pages/permissions/PermissionsPage';
import { ForbiddenPage } from './pages/error/ForbiddenPage';
import { ServerErrorPage } from './pages/error/ServerErrorPage';


const GlobalErrorNavigationListener: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleForbidden = () => {
      navigate('/403');
    };

    const handleServerError = () => {
      navigate('/500');
    };

    window.addEventListener('app:forbidden', handleForbidden);
    window.addEventListener('app:server_error', handleServerError);

    return () => {
      window.removeEventListener('app:forbidden', handleForbidden);
      window.removeEventListener('app:server_error', handleServerError);
    };
  }, [navigate]);

  return null;
};

const AppContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAccountThunk());

    const handleUnauthorized = () => {
      dispatch(resetAuth());
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [dispatch]);

  return (
    <BrowserRouter>

      <GlobalErrorNavigationListener />

      <Routes>
      
        <Route path="/login" element={<LoginPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/500" element={<ServerErrorPage />} />

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppContent;
