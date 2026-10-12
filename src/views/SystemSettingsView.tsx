import React, { useState } from 'react';
import {
  Settings,
  Database,
  Code,
  Shield,
  FileCode,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { formatDateIndonesian, formatTimeWIB } from '../utils/formatters';

export const SystemSettingsView: React.FC = () => {
  const { config, updateConfig, auditLogs, resetToInitialData } = useApp();

  const [activeTab, setActiveTab] = useState<'CONFIG' | 'SUPABASE' | 'API' | 'AUDIT'>('CONFIG');
  const [formConfig, setFormConfig] = useState(config);
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formConfig);
    setSaveMessage('Pengaturan sistem berhasil disimpan.');
    setTimeout(() => setSaveMessage(''), 2500);
  };

  const sampleSqlSnippet = `-- Menjalankan Skema SI-PKL SMART di Supabase SQL Editor:
-- Buka https://supabase.com/dashboard/project/_/sql/new
-- Salin seluruh isi dari file /supabase/schema.sql
-- Termasuk tabel profiles, students, classes, industries, attendance_records,
-- absence_requests, audit_logs, serta Row Level Security (RLS) policies.`;

  const copySql = () => {
    navigator.clipboard.writeText(sampleSqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengaturan Sistem & Backend</h1>
          <p className="text-xs text-slate-500">
            Konfigurasi radius geofence, integrasi Supabase PostgreSQL, dokumentasi API, dan log audit.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'CONFIG'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Parameter Sistem
          </button>
          <button
            onClick={() => setActiveTab('SUPABASE')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'SUPABASE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Koneksi Supabase</span>
          </button>
          <button
            onClick={() => setActiveTab('API')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'API'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Dokumentasi API</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'AUDIT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SYSTEM CONFIG */}
      {activeTab === 'CONFIG' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Parameter Presensi & Geofencing</h2>
              <p className="text-xs text-slate-500">
                Atur ambang batas jarak GPS, toleransi keterlambatan, dan identitas surat resmi.
              </p>
            </div>
            {saveMessage && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                ✓ {saveMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Radius Geofence Standar (Meter)
                </label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={formConfig.defaultRadiusMeters}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      defaultRadiusMeters: parseInt(e.target.value) || 100,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Batas jarak default dari koordinat DUDI yang dianggap dalam area.
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Toleransi Keterlambatan (Menit)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formConfig.lateToleranceMinutes}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      lateToleranceMinutes: parseInt(e.target.value) || 15,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Waktu toleransi sebelum sistem menandai terlambat masuk kerja.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-slate-800 text-xs">Identitas Sekolah untuk Laporan</h3>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={formConfig.schoolName}
                  onChange={(e) => setFormConfig({ ...formConfig, schoolName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={formConfig.schoolAddress}
                  onChange={(e) => setFormConfig({ ...formConfig, schoolAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nama Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formConfig.headmasterName}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, headmasterName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formConfig.headmasterNip}
                    onChange={(e) =>
                      setFormConfig({ ...formConfig, headmasterNip: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Kembalikan semua data ke pengaturan awal?')) {
                    resetToInitialData();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Demo</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SUPABASE STATUS & SQL VIEWER */}
      {activeTab === 'SUPABASE' && (
        <div className="space-y-6">
          {/* Connection Status Banner */}
          <div
            className={`p-5 rounded-2xl border shadow-xs ${
              isSupabaseConfigured
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  <h3 className="font-bold text-sm">
                    {isSupabaseConfigured
                      ? 'Supabase Backend Terhubung (Produksi)'
                      : 'Mode Simulasi / Demo Aktif (Penyimpanan Lokal Persisten)'}
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  {isSupabaseConfigured
                    ? 'Koneksi ke instance Supabase PostgreSQL dan Storage Bucket privat berjalan aktif.'
                    : 'Aplikasi saat ini menggunakan LocalStorage persisten browser. Untuk beralih ke database Supabase PostgreSQL nyata, ikuti panduan di bawah.'}
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-white/80 border border-slate-200">
                {isSupabaseConfigured ? 'STATUS: ONLINE' : 'STATUS: DEMO PERSISTENT'}
              </span>
            </div>
          </div>

          {/* Setup Instructions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Langkah Menghubungkan Supabase Nyata
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700">
              <li>
                Buka file <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">SETUP_SUPABASE_GUIDE.md</code> di root proyek untuk melihat panduan langkah demi langkah.
              </li>
              <li>
                Jalankan script skema SQL dari <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">/supabase/schema.sql</code> di SQL Editor Supabase Anda.
              </li>
              <li>
                Buat bucket privat bernama <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">attendance-photos</code> di Supabase Storage.
              </li>
              <li>
                Isi variabel lingkungan pada file <code className="font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded">.env</code> dengan URL dan Anon Key project Anda:
              </li>
            </ol>

            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto">
              <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
              <div>VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: API DOCUMENTATION */}
      {activeTab === 'API' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Spesifikasi OpenAPI 3.0 (RESTful PostgREST)
              </h3>
              <p className="text-xs text-slate-500">
                Spesifikasi lengkap tersedia pada berkas <code className="font-mono text-teal-700">/docs/openapi.yaml</code>
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold font-mono text-emerald-700">POST /attendance_records</span>
              <p className="text-slate-600">
                Mencatat presensi datang siswa beserta GPS, timestamp server, dan foto watermark. Mencegah presensi ganda pada tanggal yang sama.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold font-mono text-sky-700">PATCH /attendance_records</span>
              <p className="text-slate-600">
                Mencatat presensi pulang siswa atau melakukan koreksi status oleh guru pembimbing / wali kelas.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold font-mono text-amber-700">POST /absence_requests</span>
              <p className="text-slate-600">
                Pengajuan izin atau sakit dengan validasi wajib keterangan alasan dan lampiran surat dokter/orang tua.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold font-mono text-indigo-700">GET /audit_logs</span>
              <p className="text-slate-600">
                Mengambil riwayat audit perubahan data kehadiran dan catatan telaah pembimbing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
          <div className="p-5 pb-0">
            <h3 className="text-sm font-bold text-slate-900">Rekam Jejak Audit Sistem</h3>
            <p className="text-xs text-slate-500">
              Setiap verifikasi, persetujuan izin, dan koreksi resmi kehadiran tercatat secara permanen.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Aksi Audit</th>
                  <th className="py-3 px-4">Oleh Guru / User</th>
                  <th className="py-3 px-4">Peran</th>
                  <th className="py-3 px-4">Alasan / Catatan Resmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada catatan audit.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-slate-600">
                        {formatTimeWIB(log.timestamp)} · {formatDateIndonesian(log.timestamp.split('T')[0])}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {log.performedByName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap uppercase text-[10px] font-bold">
                        {log.performedByRole}
                      </td>
                      <td className="py-3 px-4 max-w-sm text-slate-700">{log.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
