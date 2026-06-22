import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { I18nProvider } from '@/lib/i18n';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import AccessGate from '@/components/AccessGate';
import xLogo from '@/assets/x-logo.png';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Equipment from '@/pages/Equipment';
import EquipmentDetail from '@/pages/EquipmentDetail';
import Consumables from '@/pages/Consumables';
import Parts from '@/pages/Parts';
import Movements from '@/pages/Movements';
import Locations from '@/pages/Locations';
import Suppliers from '@/pages/Suppliers';
import UsersPage from '@/pages/Users';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <img
            src={xLogo}
            alt="XEKmate"
            className="w-14 h-14 object-contain"
          />
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipamentos" element={<Equipment />} />
          <Route path="/equipamentos/:id" element={<EquipmentDetail />} />
          <Route path="/consumiveis" element={<Consumables />} />
          <Route path="/pecas" element={<Parts />} />
          <Route path="/movimentos" element={<Movements />} />
          <Route path="/localizacoes" element={<Locations />} />
          <Route path="/fornecedores" element={<Suppliers />} />
          <Route path="/utilizadores" element={<UsersPage />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/definicoes" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AccessGate>
              <AuthenticatedApp />
            </AccessGate>
          </Router>
          <Toaster />
          <SonnerToaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'border-red-200 bg-red-50 text-red-700',
                success: 'border-red-200 bg-red-50 text-red-700',
                error: 'border-red-200 bg-red-50 text-red-700',
                info: 'border-red-200 bg-red-50 text-red-700',
                warning: 'border-red-200 bg-red-50 text-red-700',
              },
            }}
          />
        </QueryClientProvider>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App
