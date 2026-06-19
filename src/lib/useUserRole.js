import { useAuth } from '@/lib/AuthContext';

export function useUserRole() {
  const { user } = useAuth();
  const role = 'admin';
  const isAdmin = true;
  const isEmployee = false;
  return { user, role, isAdmin, isEmployee };
}
