
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { Role } from '../../types';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, user } = useSelector((state: RootState) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If the user profile is loaded and they are a normal user, send to unauthorized
  if (user && user.role === Role.USER) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}