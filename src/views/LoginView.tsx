import React, { useState } from 'react';
import { Shield, User, Lock, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { allProfiles, setCurrentUser, config } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDemoLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    onLoginSuccess();
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = allProfiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      onLoginSuccess();
    } else {
      setError('Akun tidak ditemukan. Silakan gunakan salah satu Akun Demo Cepat di bawah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 text-slate-950 font-black text-2xl shadow-lg shadow-teal-500/20 mb-2">
          PKL
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">SI-PKL SMART</h1>
        <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
          Sistem Informasi Presensi & Monitoring PKL Siswa SMK berbasis GPS Geolocation & Watermark
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-100 space-y-6">
          <form onSubmit={handleFormLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email / NIS
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi.santoso@smk.sch.id"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              <span>Masuk Aplikasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              Atau Pilih Akun Demo Cepat (1-Klik):
            </span>

            <div className="space-y-2">
              {allProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleDemoLogin(p)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      {p.role === 'student' ? '🎓' : p.role === 'advisor' ? '👨‍🏫' : p.role === 'homeroom' ? '📋' : '⚙️'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">
                        {p.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {p.role === 'student'
                          ? 'Siswa (Budi Santoso - XII RPL 1)'
                          : p.role === 'advisor'
                          ? 'Guru Pembimbing PKL'
                          : p.role === 'homeroom'
                          ? 'Wali Kelas XII RPL 1'
                          : 'Administrator'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    Pilih →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          {config.schoolName} · Sistem Informasi Presensi PKL SMK
        </p>
      </div>
    </div>
  );
};
