import React from 'react';
import {
  Shield,
  User,
  GraduationCap,
  Briefcase,
  Users,
  Settings,
  Database,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, currentRole, switchRole, allProfiles, setCurrentUser } = useApp();

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'Siswa PKL';
      case 'advisor':
        return 'Guru Pembimbing';
      case 'homeroom':
        return 'Wali Kelas';
      case 'admin':
        return 'Admin PKL';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('dashboard');
              }}
              className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center font-black text-sm shadow-xs">
                PKL
              </div>
              <span className="font-bold text-slate-900">SI-PKL SMART</span>
            </a>
          </div>

          {/* Zone 2: Navigation Links (Clean single-line text links) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'dashboard'
                  ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>

            {currentRole === 'student' && (
              <>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`whitespace-nowrap transition-colors py-1 ${
                    activeTab === 'history'
                      ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Riwayat Presensi
                </button>
                <button
                  onClick={() => setActiveTab('absences')}
                  className={`whitespace-nowrap transition-colors py-1 ${
                    activeTab === 'absences'
                      ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Pengajuan Izin & Sakit
                </button>
              </>
            )}

            {(currentRole === 'advisor' || currentRole === 'homeroom' || currentRole === 'admin') && (
              <>
                <button
                  onClick={() => setActiveTab('verification')}
                  className={`whitespace-nowrap transition-colors py-1 ${
                    activeTab === 'verification'
                      ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Verifikasi Kehadiran
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`whitespace-nowrap transition-colors py-1 ${
                    activeTab === 'reports'
                      ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Laporan & Rekap
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveTab('management')}
                className={`whitespace-nowrap transition-colors py-1 ${
                  activeTab === 'management'
                    ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Manajemen Data
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeTab === 'settings'
                  ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Pengaturan & API
            </button>
          </nav>

          {/* Zone 3: Role Switcher & Account Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Role Switcher Pill for Testing / Evaluation */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium hover:bg-slate-100 transition-colors">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="font-semibold">{getRoleLabel(currentRole)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1 hidden group-hover:block hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Ganti Hak Akses (Demo)
                </div>
                {allProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setCurrentUser(profile);
                      setActiveTab('dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.id === profile.id
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="block">{profile.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {getRoleLabel(profile.role)}
                      </span>
                    </div>
                    {currentUser.id === profile.id && (
                      <span className="text-teal-600 font-bold text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* User Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden ring-1 ring-slate-200">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  currentUser.fullName.charAt(0)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 px-1 text-[11px] font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded-md ${
            activeTab === 'dashboard' ? 'bg-slate-900 text-white font-bold' : ''
          }`}
        >
          Dashboard
        </button>

        {currentRole === 'student' && (
          <>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-2.5 py-1 rounded-md ${
                activeTab === 'history' ? 'bg-slate-900 text-white font-bold' : ''
              }`}
            >
              Riwayat
            </button>
            <button
              onClick={() => setActiveTab('absences')}
              className={`px-2.5 py-1 rounded-md ${
                activeTab === 'absences' ? 'bg-slate-900 text-white font-bold' : ''
              }`}
            >
              Izin/Sakit
            </button>
          </>
        )}

        {(currentRole === 'advisor' || currentRole === 'homeroom' || currentRole === 'admin') && (
          <>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-2.5 py-1 rounded-md ${
                activeTab === 'verification' ? 'bg-slate-900 text-white font-bold' : ''
              }`}
            >
              Verifikasi
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-2.5 py-1 rounded-md ${
                activeTab === 'reports' ? 'bg-slate-900 text-white font-bold' : ''
              }`}
            >
              Laporan
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-2.5 py-1 rounded-md ${
            activeTab === 'settings' ? 'bg-slate-900 text-white font-bold' : ''
          }`}
        >
          Pengaturan
        </button>
      </div>
    </header>
  );
};
