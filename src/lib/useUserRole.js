import { useAuth } from '@/lib/AuthContext';

export function useUserRole() {
  const { user } = useAuth();
  const role = user?.role || 'employee';
  const isAdmin = role === 'admin';
  const isEmployee = role === 'employee';
  return { user, role, isAdmin, isEmployee };
}