import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  MapPin,
  Edit3,
  Calendar,
  Building2,
  Check,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { LocationStatusBadge } from '../components/LocationStatusBadge';
import { PhotoPreviewModal } from '../components/PhotoPreviewModal';
import { LeafletMapModal } from '../components/LeafletMapModal';
import { CorrectionModal } from '../components/CorrectionModal';
import {
  formatDateIndonesian,
  formatTimeWIB,
  getCurrentJakartaDate,
} from '../utils/formatters';
import { AttendanceRecord, AttendanceType } from '../types';

export const VerificationDashboardView: React.FC = () => {
  const {
    currentRole,
    currentUser,
    students,
    classes,
    industries,
    attendances,
    absences,
    reviewAbsenceRequest,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'ATTENDANCE' | 'ABSENCE'>('ATTENDANCE');
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentJakartaDate());
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [photoModalData, setPhotoModalData] = useState<{
    record: AttendanceRecord;
    type: AttendanceType;
  } | null>(null);

  const [mapModalData, setMapModalData] = useState<{
    studentName: string;
    studentLat?: number;
    studentLon?: number;
    studentAccuracy?: number;
    industryName: string;
    industryLat: number;
    industryLon: number;
    radiusMeters: number;
    distanceMeters?: number;
    isFieldDuty?: boolean;
  } | null>(null);

  const [correctionRecord, setCorrectionRecord] = useState<AttendanceRecord | null>(null);

  // Review Absence notes modal
  const [reviewingAbsenceId, setReviewingAbsenceId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'DISETUJUI' | 'DITOLAK'>('DISETUJUI');
  const [reviewNotes, setReviewNotes] = useState('');

  // Filter students based on role
  // If Advisor: only mentored students
  // If Homeroom: only assigned class students
  // If Admin: all students
  const filteredStudents = students.filter((s) => {
    if (currentRole === 'advisor') {
      return s.advisorId === currentUser.id;
    }
    if (currentRole === 'homeroom') {
      const cls = classes.find((c) => c.homeroomTeacherId === currentUser.id);
      return cls ? s.classId === cls.id : true;
    }
    return true;
  });

  // Calculate 10 key metrics for selected date
  const totalStudentsCount = filteredStudents.length;

  const dateAttendances = attendances.filter(
    (a) =>
      a.workDate === selectedDate &&
      filteredStudents.some((s) => s.id === a.studentId)
  );

  const countDatang = dateAttendances.filter((a) => a.checkInTime).length;
  const countPulang = dateAttendances.filter((a) => a.checkOutTime).length;
  const countBelumPresensi = totalStudentsCount - countDatang;

  const countHadir = dateAttendances.filter((a) => a.status === 'HADIR').length;
  const countSakit = dateAttendances.filter((a) => a.status === 'SAKIT').length;
  const countIzin = dateAttendances.filter((a) => a.status === 'IZIN').length;
  const countAlpa = totalStudentsCount - (countHadir + countSakit + countIzin);

  const pendingAbsenceCount = absences.filter(
    (ab) =>
      ab.status === 'MENUNGGU' &&
      filteredStudents.some((s) => s.id === ab.studentId)
  ).length;

  const needsVerificationCount = dateAttendances.filter(
    (a) =>
      a.checkInLocationStatus === 'LUAR_AREA' ||
      a.checkInLocationStatus === 'GPS_TIDAK_AKURAT' ||
      a.isFieldDuty
  ).length;

  // Build rows combining students with attendance record
  const studentRows = filteredStudents.map((std) => {
    const record = dateAttendances.find((a) => a.studentId === std.id);
    const ind = industries.find((i) => i.id === std.industryId);
    return {
      student: std,
      record: record || null,
      industry: ind,
    };
  });

  // Filter student rows
  const visibleRows = studentRows.filter(({ student, record, industry }) => {
    if (classFilter !== 'ALL' && student.classId !== classFilter) return false;
    if (industryFilter !== 'ALL' && student.industryId !== industryFilter) return false;

    if (statusFilter !== 'ALL') {
      const status = record?.status || 'ALPA';
      if (statusFilter === 'BELUM' && record?.checkInTime) return false;
      if (statusFilter !== 'BELUM' && status !== statusFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.fullName.toLowerCase().includes(q);
      const matchNis = student.nis.toLowerCase().includes(q);
      const matchInd = (industry?.name || '').toLowerCase().includes(q);
      if (!matchName && !matchNis && !matchInd) return false;
    }

    return true;
  });

  const handleOpenMap = (
    studentName: string,
    rec: AttendanceRecord | null,
    ind?: typeof industries[0]
  ) => {
    if (!ind) return;
    setMapModalData({
      studentName,
      studentLat: rec?.checkInLatitude,
      studentLon: rec?.checkInLongitude,
      studentAccuracy: rec?.checkInAccuracy,
      industryName: ind.name,
      industryLat: ind.latitude,
      industryLon: ind.longitude,
      radiusMeters: ind.radiusMeters,
      distanceMeters: rec?.checkInDistanceMeters,
      isFieldDuty: rec?.isFieldDuty,
    });
  };

  const handleReviewAbsenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingAbsenceId) return;
    await reviewAbsenceRequest(reviewingAbsenceId, reviewAction, reviewNotes.trim());
    setReviewingAbsenceId(null);
    setReviewNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {currentRole === 'advisor'
              ? 'Monitoring Siswa Bimbingan PKL'
              : currentRole === 'homeroom'
              ? 'Monitoring & Verifikasi Presensi Kelas'
              : 'Pusat Verifikasi & Monitoring PKL'}
          </h1>
          <p className="text-xs text-slate-500">
            Pantau kehadiran real-time, verifikasi foto watermark & geofence GPS industri.
          </p>
        </div>

        {/* Date Selector & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
            <Calendar className="w-4 h-4 text-teal-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-hidden font-mono"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('ATTENDANCE')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeSubTab === 'ATTENDANCE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Presensi Siswa
            </button>
            <button
              onClick={() => setActiveSubTab('ABSENCE')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'ABSENCE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Izin & Sakit</span>
              {pendingAbsenceCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 10 Dashboard Key Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Total Siswa</span>
          <span className="text-xl font-black font-mono text-slate-900 tabular-nums">
            {totalStudentsCount}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Sudah Datang</span>
          <span className="text-xl font-bold font-mono text-teal-700 tabular-nums">
            {countDatang}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Sudah Pulang</span>
          <span className="text-xl font-bold font-mono text-indigo-700 tabular-nums">
            {countPulang}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Belum Presensi</span>
          <span className="text-xl font-bold font-mono text-amber-600 tabular-nums">
            {Math.max(0, countBelumPresensi)}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Hadir Valid</span>
          <span className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
            {countHadir}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Sakit</span>
          <span className="text-xl font-bold font-mono text-sky-700 tabular-nums">
            {countSakit}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Izin</span>
          <span className="text-xl font-bold font-mono text-amber-700 tabular-nums">
            {countIzin}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Alpa / Belum Hadir</span>
          <span className="text-xl font-bold font-mono text-rose-600 tabular-nums">
            {Math.max(0, countAlpa)}
          </span>
        </div>

        <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-xs text-amber-800 block">Izin Menunggu Review</span>
          <span className="text-xl font-black font-mono text-amber-700 tabular-nums">
            {pendingAbsenceCount}
          </span>
        </div>

        <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-xs text-rose-800 block">Perlu Verifikasi Lokasi</span>
          <span className="text-xl font-black font-mono text-rose-700 tabular-nums">
            {needsVerificationCount}
          </span>
        </div>
      </div>

      {activeSubTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama siswa, NIS, atau DUDI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-hidden"
              >
                <option value="ALL">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-hidden max-w-xs truncate"
              >
                <option value="ALL">Semua Tempat PKL</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-hidden"
              >
                <option value="ALL">Semua Status</option>
                <option value="HADIR">Hadir</option>
                <option value="BELUM">Belum Presensi</option>
                <option value="SAKIT">Sakit</option>
                <option value="IZIN">Izin</option>
                <option value="ALPA">Alpa</option>
              </select>
            </div>
          </div>

          {/* Main Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa / NIS</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Tempat PKL (DUDI)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Jam Datang</th>
                    <th className="py-3 px-4">Jam Pulang</th>
                    <th className="py-3 px-4">Foto Datang</th>
                    <th className="py-3 px-4">Foto Pulang</th>
                    <th className="py-3 px-4">Status GPS</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Tidak ada data siswa yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map(({ student, record, industry }) => {
                      const status = record?.status || 'ALPA';
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-slate-900 block">
                              {student.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              NIS: {student.nis}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-medium text-slate-700">{student.className}</span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs truncate">
                            <span className="font-medium text-slate-900 block truncate">
                              {industry?.name || student.industryName}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <StatusBadge status={status} />
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-800">
                            {record?.checkInTime ? formatTimeWIB(record.checkInTime) : '-'}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-800">
                            {record?.checkOutTime ? formatTimeWIB(record.checkOutTime) : '-'}
                          </td>

                          {/* Foto Datang */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {record?.checkInPhotoWatermarkedUrl ? (
                              <button
                                onClick={() =>
                                  setPhotoModalData({ record, type: 'DATANG' })
                                }
                                className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat Foto</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>

                          {/* Foto Pulang */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {record?.checkOutPhotoWatermarkedUrl ? (
                              <button
                                onClick={() =>
                                  setPhotoModalData({ record, type: 'PULANG' })
                                }
                                className="inline-flex items-center gap-1 text-[11px] text-teal-700 hover:text-teal-900 font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat Foto</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">-</span>
                            )}
                          </td>

                          {/* Status GPS & Peta */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {record?.checkInLocationStatus ? (
                              <div className="flex items-center gap-2">
                                <LocationStatusBadge
                                  status={record.checkInLocationStatus}
                                  distanceMeters={record.checkInDistanceMeters}
                                />
                                <button
                                  onClick={() => handleOpenMap(student.fullName, record, industry)}
                                  className="p-1 text-slate-400 hover:text-teal-700 rounded transition-colors"
                                  title="Buka Peta OpenStreetMap"
                                >
                                  <MapPin className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Belum Presensi</span>
                            )}
                          </td>

                          {/* Tindakan */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => {
                                const targetRec =
                                  record || {
                                    id: `att-temp-${student.id}`,
                                    studentId: student.id,
                                    studentName: student.fullName,
                                    nis: student.nis,
                                    className: student.className,
                                    industryId: student.industryId,
                                    industryName: student.industryName,
                                    workDate: selectedDate,
                                    status: 'ALPA',
                                  };
                                setCorrectionRecord(targetRec);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors text-[11px]"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Koreksi</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pengajuan Izin & Sakit */}
      {activeSubTab === 'ABSENCE' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Daftar Permohonan Izin & Keterangan Sakit Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Guru pembimbing dan wali kelas berwenang menyetujui atau menolak permohonan.
            </p>
          </div>

          <div className="space-y-3">
            {absences.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                Tidak ada permohonan izin atau sakit.
              </div>
            ) : (
              absences.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{req.studentName}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-500">NIS: {req.nis} · {req.className}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] border ${
                            req.type === 'SAKIT'
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {req.type}
                        </span>
                        <span className="text-slate-500">
                          {req.startDate} s/d {req.endDate} ({req.durationDays} Hari)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                          req.status === 'DISETUJUI'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : req.status === 'DITOLAK'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs space-y-2">
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <strong>Keterangan Siswa:</strong> {req.reason}
                    </p>

                    {req.attachmentUrl && (
                      <div>
                        <span className="text-slate-500 block mb-1 font-medium">Lampiran:</span>
                        <img
                          src={req.attachmentUrl}
                          alt="Lampiran Surat"
                          className="h-28 rounded-xl border border-slate-200 object-cover"
                        />
                      </div>
                    )}

                    {req.reviewNotes && (
                      <p className="text-teal-900 bg-teal-50 p-2.5 rounded-xl border border-teal-100">
                        <strong>Catatan Pembinaan:</strong> {req.reviewNotes} (Ditinjau oleh:{' '}
                        {req.reviewedBy})
                      </p>
                    )}
                  </div>

                  {req.status === 'MENUNGGU' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setReviewingAbsenceId(req.id);
                          setReviewAction('DITOLAK');
                          setReviewNotes('');
                        }}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Tolak Pengajuan
                      </button>
                      <button
                        onClick={() => {
                          setReviewingAbsenceId(req.id);
                          setReviewAction('DISETUJUI');
                          setReviewNotes('');
                        }}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        Setujui Pengajuan
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Absence Notes Dialog */}
      {reviewingAbsenceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Konfirmasi Keputusan: {reviewAction}
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan catatan pembinaan atau alasan keputusan untuk siswa.
            </p>

            <form onSubmit={handleReviewAbsenceSubmit} className="space-y-3">
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Contoh: Disetujui, jaga kondisi kesehatan dan laporkan tugas modul ke pembimbing."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingAbsenceId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-bold text-white rounded-lg ${
                    reviewAction === 'DISETUJUI' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  Kirim Keputusan & Catat Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {photoModalData && (
        <PhotoPreviewModal
          isOpen={Boolean(photoModalData)}
          onClose={() => setPhotoModalData(null)}
          record={photoModalData.record}
          photoType={photoModalData.type}
        />
      )}

      {mapModalData && (
        <LeafletMapModal
          isOpen={Boolean(mapModalData)}
          onClose={() => setMapModalData(null)}
          title={`Lokasi Presensi: ${mapModalData.studentName}`}
          {...mapModalData}
        />
      )}

      {correctionRecord && (
        <CorrectionModal
          isOpen={Boolean(correctionRecord)}
          onClose={() => setCorrectionRecord(null)}
          record={correctionRecord}
        />
      )}
    </div>
  );
};
