import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Eye,
  Filter,
  Download,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { LocationStatusBadge } from '../components/LocationStatusBadge';
import { PhotoPreviewModal } from '../components/PhotoPreviewModal';
import {
  formatDateIndonesian,
  formatTimeWIB,
  formatShortDateIndonesian,
} from '../utils/formatters';
import { AttendanceRecord, AttendanceType } from '../types';

export const RiwayatPresensiView: React.FC = () => {
  const { currentStudent, attendances } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [previewPhotoData, setPreviewPhotoData] = useState<{
    record: AttendanceRecord;
    type: AttendanceType;
  } | null>(null);

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">Data siswa tidak ditemukan.</div>;
  }

  const studentRecords = attendances
    .filter((a) => a.studentId === currentStudent.id)
    .sort((a, b) => b.workDate.localeCompare(a.workDate));

  const filteredRecords = studentRecords.filter((rec) => {
    if (statusFilter === 'ALL') return true;
    return rec.status === statusFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Riwayat Presensi PKL</h1>
          <p className="text-xs text-slate-500">
            Daftar lengkap kehadiran, stempel waktu server, dan koordinat GPS Anda.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="HADIR">Hadir</option>
            <option value="SAKIT">Sakit</option>
            <option value="IZIN">Izin</option>
            <option value="ALPA">Alpa</option>
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <Calendar className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Belum Ada Data Presensi</p>
          <p className="text-xs text-slate-400">
            Data kehadiran akan muncul di sini setelah Anda melakukan presensi datang.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Tanggal Kerja</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Presensi Datang</th>
                  <th className="py-3 px-4">Presensi Pulang</th>
                  <th className="py-3 px-4">Lokasi & GPS</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 block">
                        {formatShortDateIndonesian(rec.workDate)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatDateIndonesian(rec.workDate).split(',')[0]}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={rec.status} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {rec.checkInTime ? (
                        <div className="space-y-1">
                          <span className="font-mono font-medium text-slate-900 block">
                            {formatTimeWIB(rec.checkInTime)}
                          </span>
                          {rec.checkInPhotoWatermarkedUrl && (
                            <button
                              onClick={() =>
                                setPreviewPhotoData({ record: rec, type: 'DATANG' })
                              }
                              className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Eye className="w-3 h-3" />
                              Foto Datang
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {rec.checkOutTime ? (
                        <div className="space-y-1">
                          <span className="font-mono font-medium text-slate-900 block">
                            {formatTimeWIB(rec.checkOutTime)}
                          </span>
                          {rec.checkOutPhotoWatermarkedUrl && (
                            <button
                              onClick={() =>
                                setPreviewPhotoData({ record: rec, type: 'PULANG' })
                              }
                              className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Eye className="w-3 h-3" />
                              Foto Pulang
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {rec.checkInLocationStatus ? (
                        <LocationStatusBadge
                          status={rec.checkInLocationStatus}
                          distanceMeters={rec.checkInDistanceMeters}
                        />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-500">
                      {rec.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
