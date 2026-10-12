import React, { useState } from 'react';
import {
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
  Building2,
  Users,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateIndonesian, formatShortDateIndonesian, getCurrentJakartaDate } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { students, classes, industries, attendances, config } = useApp();

  const today = getCurrentJakartaDate();
  const [reportType, setReportType] = useState<'MONTHLY' | 'RANGE'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState('10'); // Oktober
  const [selectedYear, setSelectedYear] = useState('2026');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState(today);
  const [classFilter, setClassFilter] = useState('ALL');
  const [industryFilter, setIndustryFilter] = useState('ALL');

  // Filter students based on selectors
  const filteredStudents = students.filter((std) => {
    if (classFilter !== 'ALL' && std.classId !== classFilter) return false;
    if (industryFilter !== 'ALL' && std.industryId !== industryFilter) return false;
    return true;
  });

  // Scheduled work days in period (e.g. 10 days for current demo period)
  const scheduledDays = 10;

  // Calculate stats for each student in the specified period
  const studentStats = filteredStudents.map((std) => {
    const studentRecords = attendances.filter((a) => {
      if (a.studentId !== std.id) return false;
      if (reportType === 'MONTHLY') {
        return a.workDate.startsWith(`${selectedYear}-${selectedMonth}`);
      }
      return a.workDate >= startDate && a.workDate <= endDate;
    });

    const hadirCount = studentRecords.filter((a) => a.status === 'HADIR').length;
    const sakitCount = studentRecords.filter((a) => a.status === 'SAKIT').length;
    const izinCount = studentRecords.filter((a) => a.status === 'IZIN').length;
    const alpaCount = Math.max(0, scheduledDays - (hadirCount + sakitCount + izinCount));
    const attendancePercentage = Math.round((hadirCount / scheduledDays) * 100);

    return {
      student: std,
      scheduledDays,
      hadirCount,
      sakitCount,
      izinCount,
      alpaCount,
      attendancePercentage,
    };
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    const periodLabel =
      reportType === 'MONTHLY'
        ? `Bulan_${selectedMonth}_${selectedYear}`
        : `${startDate}_sd_${endDate}`;

    const headers = [
      'No',
      'NIS',
      'NISN',
      'Nama Siswa',
      'Kelas',
      'Tempat PKL (DUDI)',
      'Guru Pembimbing',
      'Total Hari Terjadwal',
      'Hadir',
      'Sakit',
      'Izin',
      'Alpa',
      'Persentase Kehadiran (%)',
    ];

    const rows = studentStats.map((item, index) => [
      index + 1,
      `"${item.student.nis}"`,
      `"${item.student.nisn}"`,
      `"${item.student.fullName}"`,
      `"${item.student.className}"`,
      `"${item.student.industryName}"`,
      `"${item.student.advisorName}"`,
      item.scheduledDays,
      item.hadirCount,
      item.sakitCount,
      item.izinCount,
      item.alpaCount,
      `${item.attendancePercentage}%`,
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Microsoft Excel
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Presensi_PKL_${periodLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Non-print controls toolbar */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Laporan & Rekapitulasi Presensi PKL
            </h1>
            <p className="text-xs text-slate-500">
              Generate laporan kehadiran siswa SMK per kelas, tempat PKL, atau rentang waktu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh CSV / Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Configuration Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Jenis Periode</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'MONTHLY' | 'RANGE')}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="MONTHLY">Bulanan (Bulan Kalender)</option>
              <option value="RANGE">Rentang Tanggal Khusus</option>
            </select>
          </div>

          {reportType === 'MONTHLY' ? (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Bulan & Tahun</label>
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-2/3 px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-hidden"
                >
                  <option value="10">Oktober</option>
                  <option value="09">September</option>
                  <option value="08">Agustus</option>
                  <option value="07">Juli</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-1/3 px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-hidden font-mono"
                >
                  <option value="2026">2026</option>
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Rentang Tanggal</label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 px-2 py-2 border border-slate-300 rounded-xl bg-white text-[11px] font-mono"
                />
                <span>-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 px-2 py-2 border border-slate-300 rounded-xl bg-white text-[11px] font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Filter Kelas</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-hidden"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Filter Tempat PKL</label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:outline-hidden truncate"
            >
              <option value="ALL">Semua Industri (DUDI)</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div className="print-page bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Kop Surat Sekolah Resmi (Government/School Official Header) */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            DINAS PENDIDIKAN DAN KEBUDAYAAN PROVINSI JAWA TENGAH
          </h2>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            {config.schoolName}
          </h1>
          <p className="text-[11px] text-slate-600">
            {config.schoolAddress} · Website: smk2solo.sch.id · Email: info@smk2solo.sch.id
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold uppercase border-y border-slate-400 py-0.5 px-4 tracking-wider">
              REKAPITULASI PRESENSI PRAKTIK KERJA LAPANGAN (PKL)
            </span>
          </div>
        </div>

        {/* Report Metadata */}
        <div className="grid grid-cols-2 text-xs gap-2 text-slate-700">
          <div>
            <span className="text-slate-500">Tahun Ajaran:</span>{' '}
            <span className="font-semibold text-slate-900">2026/2027</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Tanggal Cetak:</span>{' '}
            <span className="font-semibold text-slate-900 font-mono">
              {formatDateIndonesian(today)}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Periode Rekap:</span>{' '}
            <span className="font-semibold text-slate-900">
              {reportType === 'MONTHLY'
                ? `Bulan ${selectedMonth === '10' ? 'Oktober' : selectedMonth} ${selectedYear}`
                : `${formatShortDateIndonesian(startDate)} s/d ${formatShortDateIndonesian(endDate)}`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">Total Siswa Terdaftar:</span>{' '}
            <span className="font-semibold text-slate-900 font-mono">
              {studentStats.length} Siswa
            </span>
          </div>
        </div>

        {/* Printable Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                <th className="py-2.5 px-3 border-r border-slate-300">NIS / NISN</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Nama Lengkap</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Kelas</th>
                <th className="py-2.5 px-3 border-r border-slate-300">Perusahaan (DUDI)</th>
                <th className="py-2.5 px-2 border-r border-slate-300 text-center">Jadwal</th>
                <th className="py-2.5 px-2 border-r border-slate-300 text-center">Hadir</th>
                <th className="py-2.5 px-2 border-r border-slate-300 text-center">Sakit</th>
                <th className="py-2.5 px-2 border-r border-slate-300 text-center">Izin</th>
                <th className="py-2.5 px-2 border-r border-slate-300 text-center">Alpa</th>
                <th className="py-2.5 px-2 text-center">% Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {studentStats.map((item, index) => (
                <tr key={item.student.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 border-r border-slate-200 text-center font-mono">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-mono whitespace-nowrap text-[11px]">
                    {item.student.nis}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900 whitespace-nowrap">
                    {item.student.fullName}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap">
                    {item.student.className}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-[11px]">
                    {item.student.industryName}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono">
                    {item.scheduledDays}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono font-bold text-emerald-700">
                    {item.hadirCount}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-sky-700">
                    {item.sakitCount}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-amber-700">
                    {item.izinCount}
                  </td>
                  <td className="py-2 px-2 border-r border-slate-200 text-center font-mono text-rose-600 font-semibold">
                    {item.alpaCount}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-slate-900">
                    {item.attendancePercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature Section for Official School Validation */}
        <div className="pt-8 grid grid-cols-2 text-xs text-slate-800">
          <div className="space-y-16">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">Koordinator Pokja PKL</p>
            </div>
            <div>
              <p className="font-bold underline">Sri Wahyuni, S.Pd</p>
              <p className="text-slate-500 text-[11px] font-mono">NIP. 19820415 200801 2 014</p>
            </div>
          </div>

          <div className="text-right space-y-16">
            <div>
              <p>Surakarta, {formatDateIndonesian(today)}</p>
              <p className="font-semibold">Kepala Sekolah {config.schoolName}</p>
            </div>
            <div>
              <p className="font-bold underline">{config.headmasterName}</p>
              <p className="text-slate-500 text-[11px] font-mono">NIP. {config.headmasterNip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
