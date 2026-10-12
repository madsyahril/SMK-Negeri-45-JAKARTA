import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { useApp } from '../context/AppContext';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  const { correctAttendance } = useApp();
  const [newStatus, setNewStatus] = useState<AttendanceStatus>('HADIR');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan koreksi resmi wajib diisi untuk rekam jejak audit.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await correctAttendance(
        record.id,
        {
          status: newStatus,
        },
        reason.trim()
      );
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan koreksi presensi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Koreksi Resmi Kehadiran</h3>
            <p className="text-xs text-slate-500">
              Audit log akan merekam nama guru, alasan, dan stempel waktu.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Siswa:</span>
              <span className="font-semibold text-slate-800">{record.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">NIS / Kelas:</span>
              <span className="text-slate-700">{record.nis} · {record.className}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Saat Ini:</span>
              <span className="font-bold text-rose-600">{record.status}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ubah Status Menjadi <span className="text-rose-500">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="HADIR">HADIR (Siswa terkonfirmasi hadir)</option>
              <option value="IZIN">IZIN (Surat izin sah)</option>
              <option value="SAKIT">SAKIT (Keterangan sakit)</option>
              <option value="ALPA">ALPA (Tanpa keterangan)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alasan Koreksi Resmi (Wajib Audit) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Siswa melapor kendala sinyal HP di lokasi proyek, mentor industri mengonfirmasi hadir langsung pukul 07:20."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Koreksi & Catat Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
