import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StudentDashboardView } from './views/StudentDashboardView';
import { RiwayatPresensiView } from './views/RiwayatPresensiView';
import { PengajuanIzinView } from './views/PengajuanIzinView';
import { VerificationDashboardView } from './views/VerificationDashboardView';
import { ReportsView } from './views/ReportsView';
import { ManagementView } from './views/ManagementView';
import { SystemSettingsView } from './views/SystemSettingsView';
import { LoginView } from './views/LoginView';

const AppContent: React.FC = () => {
  const { currentRole, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <>
            {currentRole === 'student' ? (
              <StudentDashboardView onNavigateHistory={() => setActiveTab('history')} />
            ) : (
              <VerificationDashboardView />
            )}
          </>
        )}

        {activeTab === 'history' && <RiwayatPresensiView />}
        {activeTab === 'absences' && <PengajuanIzinView />}
        {activeTab === 'verification' && <VerificationDashboardView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'management' && <ManagementView />}
        {activeTab === 'settings' && <SystemSettingsView />}
      </main>

      {/* Quiet Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SI-PKL SMART · Sistem Informasi Presensi Siswa SMK</p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Zona Waktu: Asia/Jakarta (WIB)</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-slate-600 hover:text-rose-600 hover:underline font-medium"
            >
              Keluar Akun
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
