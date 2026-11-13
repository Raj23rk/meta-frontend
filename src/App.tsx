import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { DashboardOverview } from './pages/client/DashboardOverview';
import { WhatsAppConnection } from './pages/client/WhatsAppConnection';
import { Templates } from './pages/client/Templates';
import { Contacts } from './pages/client/Contacts';
import { Campaigns } from './pages/client/Campaigns';
import { LiveChatInbox } from './pages/client/LiveChatInbox';
import { TeamMembers } from './pages/client/TeamMembers';
import { BillingUsage } from './pages/client/BillingUsage';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Super Admin Center */}
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<SuperAdminDashboard />} />
          </Route>

          {/* Client Workspace */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="connect" element={<WhatsAppConnection />} />
            <Route path="templates" element={<Templates />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="inbox" element={<LiveChatInbox />} />
            <Route path="team" element={<TeamMembers />} />
            <Route path="billing" element={<BillingUsage />} />
          </Route>

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

