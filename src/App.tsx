import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, PermissionKey } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { DataProvider } from './context/DataContext';
import { ToastProvider } from './components/ui/Toast';

import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { PublicQuotePage } from './pages/public/PublicQuotePage';
import { PublicTrackingPage } from './pages/public/PublicTrackingPage';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { QuotesListPage } from './pages/quotes/QuotesListPage';
import { QuoteCreateEditPage } from './pages/quotes/QuoteCreateEditPage';
import { QuoteDetailsPage } from './pages/quotes/QuoteDetailsPage';
import { FollowUpQueuePage } from './pages/quotes/FollowUpQueuePage';
import { ServiceOrdersListPage } from './pages/service-orders/ServiceOrdersListPage';
import { ServiceOrderKanbanPage } from './pages/service-orders/ServiceOrderKanbanPage';
import { ServiceOrderDetailsPage } from './pages/service-orders/ServiceOrderDetailsPage';
import { CustomersListPage } from './pages/customers/CustomersListPage';
import { CustomerDetailsPage } from './pages/customers/CustomerDetailsPage';
import { VehicleHistoryPage } from './pages/vehicles/VehicleHistoryPage';
import { RemindersPage } from './pages/reminders/RemindersPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { SuperadminPage } from './pages/superadmin/SuperadminPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredPermission?: PermissionKey }> = ({
  children,
  requiredPermission,
}) => {
  const { isAuthenticated, isLoading, canAccess } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredPermission && !canAccess(requiredPermission)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <DataProvider>
            <ToastProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/orcamento/:token" element={<PublicQuotePage />} />
                <Route path="/acompanhar/:token" element={<PublicTrackingPage />} />

                <Route
                  path="/onboarding"
                  element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>}
                />

                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<DashboardPage />} />

                  <Route path="/quotes" element={<QuotesListPage />} />
                  <Route path="/quotes/new" element={<QuoteCreateEditPage />} />
                  <Route path="/quotes/follow-up" element={<FollowUpQueuePage />} />
                  <Route path="/quotes/:id" element={<QuoteDetailsPage />} />
                  <Route path="/quotes/:id/edit" element={<QuoteCreateEditPage />} />

                  <Route path="/service-orders" element={<ServiceOrdersListPage />} />
                  <Route path="/service-orders/kanban" element={<ServiceOrderKanbanPage />} />
                  <Route path="/service-orders/:id" element={<ServiceOrderDetailsPage />} />

                  <Route path="/customers" element={<CustomersListPage />} />
                  <Route path="/customers/:id" element={<CustomerDetailsPage />} />
                  <Route path="/vehicles/:id/history" element={<VehicleHistoryPage />} />

                  <Route path="/reminders" element={<RemindersPage />} />

                  <Route
                    path="/reports"
                    element={<ProtectedRoute requiredPermission="view_financial_reports"><ReportsPage /></ProtectedRoute>}
                  />
                  <Route
                    path="/settings"
                    element={<ProtectedRoute requiredPermission="manage_company_settings"><SettingsPage /></ProtectedRoute>}
                  />
                  <Route
                    path="/superadmin"
                    element={<ProtectedRoute requiredPermission="view_superadmin"><SuperadminPage /></ProtectedRoute>}
                  />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </DataProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
