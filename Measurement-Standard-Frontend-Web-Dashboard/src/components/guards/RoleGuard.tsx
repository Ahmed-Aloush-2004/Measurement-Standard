import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Role } from '../../types';
import type { RootState } from '../../store/store';

export function RoleGuard({ allowedRoles, children }: { allowedRoles: Role[]; children: ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}