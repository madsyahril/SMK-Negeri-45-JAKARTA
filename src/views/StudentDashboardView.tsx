import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  Camera,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PresensiCameraModal } from '../components/PresensiCameraModal';
import { AbsenceModal } from '../components/AbsenceModal';
import { PhotoPreviewModal } from '../components/PhotoPreviewModal';
import { StatusBadge } from '../components/StatusBadge';
import { LocationStatusBadge } from '../components/LocationStatusBadge';
import {
  formatDateIndonesian,
  formatTimeWIB,
  getCurrentJakartaDate,
  getCurrentJakartaTime,
} from '../utils/formatters';
import { AttendanceRecord, AttendanceType } from '../types';

interface StudentDashboardViewProps {
  onNavigateHistory: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  onNavigateHistory,
}) => {
  const { currentStudent, attendances, industries, absences } = useApp();

  const [cameraType, setCameraType] = useState<AttendanceType | null>(null);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [previewPhotoData, setPreviewPhotoData] = useState<{
    record: AttendanceRecord;
    type: AttendanceType;
  } | null>(null);

  if (!currentStudent) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <p className="text-slate-500 text-sm">
          Akun aktif bukan akun siswa atau profil siswa belum dihubungkan.
        </p>
      </div>
    );
  }

  const today = getCurrentJakartaDate();
  const todayRecord = attendances.find(
    (a) => a.studentId === currentStudent.id && a.workDate === today
  );

  const industry = industries.find((i) => i.id === currentStudent.industryId);

  // Monthly stats calculation for current student
  const studentRecords = attendances.filter((a) => a.studentId === currentStudent.id);
  const totalHadir = studentRecords.filter((a) => a.status === 'HADIR').length;
  const totalSakit = studentRecords.filter((a) => a.status === 'SAKIT').length;
  const totalIzin = studentRecords.filter((a) => a.status === 'IZIN').length;
  const totalAlpa = studentRecords.filter((a) => a.status === 'ALPA').length;
  const totalEntries = totalHadir + totalSakit + totalIzin + totalAlpa;
  const attendanceRate = totalEntries > 0 ? Math.round((totalHadir / totalEntries) * 100) : 100;

  // Active absence request for today
  const activeAbsence = absences.find(
    (ab) =>
      ab.studentId === currentStudent.id &&
      ab.startDate <= today &&
      ab.endDate >= today
  );

  const hasCheckedIn = Boolean(todayRecord?.checkInTime);
  const hasCheckedOut = Boolean(todayRecord?.checkOutTime);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Student Profile & Placement Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-teal-400 font-black text-xl flex items-center justify-center overflow-hidden ring-2 ring-slate-100 shrink-0">
              {currentStudent.avatarUrl ? (
                <img
                  src={currentStudent.avatarUrl}
                  alt={currentStudent.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                currentStudent.fullName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{currentStudent.fullName}</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  {currentStudent.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                NIS: {currentStudent.nis} · NISN: {currentStudent.nisn}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Guru Pembimbing:</span>
            <span className="text-xs font-semibold text-slate-900">
              {currentStudent.advisorName}
            </span>
          </div>
        </div>

        {/* DUDI Placement & Working Hours Strip */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-500 block">Tempat PKL (DUDI):</span>
              <span className="font-semibold text-slate-900 block">{currentStudent.industryName}</span>
              <span className="text-slate-500 text-[11px] block mt-0.5">
                {industry?.address || 'Alamat lokasi industri'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-500 block">Jadwal Jam Kerja PKL:</span>
              <span className="font-semibold text-slate-900">
                Datang: {industry?.checkInStart || '07:00'} - {industry?.checkInEnd || '08:00'} WIB · Pulang: {industry?.checkOutStart || '16:00'} - {industry?.checkOutEnd || '18:00'} WIB
              </span>
              <span className="text-slate-500 text-[11px] block mt-0.5">
                Radius Geofence: {industry?.radiusMeters || 100} meter dari titik koordinat
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Date Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <span className="text-xs text-slate-400 block">Hari & Tanggal Kerja:</span>
          <span className="text-base font-bold text-white">
            {formatDateIndonesian(today)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Waktu Server (WIB):</span>
            <span className="text-sm font-bold font-mono text-teal-400">
              {getCurrentJakartaTime()}
            </span>
          </div>
        </div>
      </div>

      {/* Active Absence Notice if student requested leave */}
      {activeAbsence && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-amber-900 block">
              Pengajuan {activeAbsence.type} Aktif ({activeAbsence.status})
            </span>
            <p className="text-amber-800 mt-0.5">{activeAbsence.reason}</p>
            {activeAbsence.reviewNotes && (
              <p className="text-amber-900 font-medium mt-1">
                Catatan Guru: {activeAbsence.reviewNotes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Section D: TWO MAIN BIG THUMB-FRIENDLY BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* BUTTON 1: PRESENSI DATANG */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">1. Presensi Datang</span>
              {hasCheckedIn ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Sudah Tercatat
                </span>
              ) : (
                <span className="text-xs text-slate-500">Belum Presensi</span>
              )}
            </div>

            {hasCheckedIn ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jam Datang:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {formatTimeWIB(todayRecord?.checkInTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lokasi GPS:</span>
                  <LocationStatusBadge
                    status={todayRecord?.checkInLocationStatus}
                    distanceMeters={todayRecord?.checkInDistanceMeters}
                  />
                </div>
                {todayRecord?.checkInPhotoWatermarkedUrl && (
                  <button
                    onClick={() =>
                      setPreviewPhotoData({ record: todayRecord, type: 'DATANG' })
                    }
                    className="text-[11px] text-teal-700 font-semibold hover:underline flex items-center gap-1 pt-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Bukti Foto Watermark
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Ambil foto dan lokasi GPS saat tiba di lokasi industri {industry?.name}.
              </p>
            )}
          </div>

          <button
            onClick={() => setCameraType('DATANG')}
            disabled={hasCheckedIn}
            className={`w-full min-h-[52px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              hasCheckedIn
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white shadow-lg shadow-teal-700/20'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>{hasCheckedIn ? 'PRESENSI DATANG SELESAI' : 'PRESENSI DATANG'}</span>
          </button>
        </div>

        {/* BUTTON 2: PRESENSI PULANG */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">2. Presensi Pulang</span>
              {hasCheckedOut ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Sudah Pulang
                </span>
              ) : hasCheckedIn ? (
                <span className="text-xs text-amber-600 font-medium">Siap Presensi</span>
              ) : (
                <span className="text-xs text-slate-400">Menunggu Datang</span>
              )}
            </div>

            {hasCheckedOut ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jam Pulang:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {formatTimeWIB(todayRecord?.checkOutTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lokasi GPS:</span>
                  <LocationStatusBadge
                    status={todayRecord?.checkOutLocationStatus}
                    distanceMeters={todayRecord?.checkOutDistanceMeters}
                  />
                </div>
                {todayRecord?.checkOutPhotoWatermarkedUrl && (
                  <button
                    onClick={() =>
                      setPreviewPhotoData({ record: todayRecord, type: 'PULANG' })
                    }
                    className="text-[11px] text-teal-700 font-semibold hover:underline flex items-center gap-1 pt-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Bukti Foto Watermark
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Ambil foto kepulangan saat jam kerja PKL hari ini berakhir. Foto harus terpisah dari foto datang.
              </p>
            )}
          </div>

          <button
            onClick={() => setCameraType('PULANG')}
            disabled={!hasCheckedIn || hasCheckedOut}
            className={`w-full min-h-[52px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              !hasCheckedIn
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : hasCheckedOut
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white shadow-lg shadow-slate-900/20'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>
              {!hasCheckedIn
                ? 'PRESENSI PULANG (HARUS DATANG DULU)'
                : hasCheckedOut
                ? 'PRESENSI PULANG SELESAI'
                : 'PRESENSI PULANG'}
            </span>
          </button>
        </div>
      </div>

      {/* Action: Pengajuan Izin / Sakit button */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-teal-700 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">
              Berhalangan Hadir atau Sakit?
            </span>
            <span className="text-slate-500">
              Ajukan permohonan izin atau sakit resmi disertai alasan dan lampiran surat dokter.
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsAbsenceModalOpen(true)}
          className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold whitespace-nowrap shadow-xs transition-colors shrink-0"
        >
          Ajukan Izin / Sakit
        </button>
      </div>

      {/* Monthly Attendance Recap Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Rekapitulasi Kehadiran Bulan Ini</h3>
            <p className="text-xs text-slate-500">Persentase dihitung dari total hari kerja terjadwal</p>
          </div>
          <button
            onClick={onNavigateHistory}
            className="text-xs text-teal-700 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <span className="text-xs text-slate-500 block">Tingkat Kehadiran</span>
            <span className="text-xl font-black font-mono text-teal-700 tabular-nums">
              {attendanceRate}%
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
            <span className="text-xs text-emerald-800 block">Hadir</span>
            <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
              {totalHadir} Hari
            </span>
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-center">
            <span className="text-xs text-sky-800 block">Sakit</span>
            <span className="text-xl font-bold font-mono text-sky-700 tabular-nums">
              {totalSakit} Hari
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
            <span className="text-xs text-amber-800 block">Izin</span>
            <span className="text-xl font-bold font-mono text-amber-700 tabular-nums">
              {totalIzin} Hari
            </span>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-rose-800 block">Alpa</span>
            <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">
              {totalAlpa} Hari
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      {cameraType && (
        <PresensiCameraModal
          isOpen={Boolean(cameraType)}
          onClose={() => setCameraType(null)}
          type={cameraType}
        />
      )}

      {isAbsenceModalOpen && (
        <AbsenceModal
          isOpen={isAbsenceModalOpen}
          onClose={() => setIsAbsenceModalOpen(false)}
        />
      )}

      {previewPhotoData && (
        <PhotoPreviewModal
          isOpen={Boolean(previewPhotoData)}
          onClose={() => setPreviewPhotoData(null)}
          record={previewPhotoData.record}
          photoType={previewPhotoData.type}
        />
      )}
    </div>
  );
};
