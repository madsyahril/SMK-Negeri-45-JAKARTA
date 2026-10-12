import React, { useState } from 'react';
import { Plus, Calendar, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AbsenceModal } from '../components/AbsenceModal';
import { formatDateIndonesian, formatShortDateIndonesian } from '../utils/formatters';

export const PengajuanIzinView: React.FC = () => {
  const { currentStudent, absences } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">Data siswa tidak ditemukan.</div>;
  }

  const studentAbsences = absences
    .filter((ab) => ab.studentId === currentStudent.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DISETUJUI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Disetujui
          </span>
        );
      case 'DITOLAK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Ditolak
          </span>
        );
      case 'MENUNGGU':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Menunggu Persetujuan
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengajuan Izin & Sakit</h1>
          <p className="text-xs text-slate-500">
            Status verifikasi surat dan catatan pembinaan dari guru pembimbing/wali kelas.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengajuan Baru</span>
        </button>
      </div>

      {studentAbsences.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm font-semibold text-slate-700">Belum Ada Pengajuan Izin/Sakit</p>
          <p className="text-xs text-slate-400">
            Klik tombol di atas untuk mengajukan izin tidak masuk PKL atau keterangan sakit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {studentAbsences.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold border ${
                      req.type === 'SAKIT'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {req.type}
                  </span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs font-semibold text-slate-900">
                    {formatShortDateIndonesian(req.startDate)} - {formatShortDateIndonesian(req.endDate)} ({req.durationDays} Hari)
                  </span>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">Alasan / Keterangan:</span>
                  <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {req.reason}
                  </p>
                </div>

                {req.reviewNotes && (
                  <div className="p-2.5 bg-teal-50 border border-teal-100 rounded-lg text-teal-900">
                    <span className="font-semibold block text-[11px] mb-0.5">
                      Catatan Pembimbing ({req.reviewedBy}):
                    </span>
                    <p>{req.reviewNotes}</p>
                  </div>
                )}

                {req.attachmentUrl && (
                  <div className="pt-1">
                    <span className="text-slate-500 block text-[11px] mb-1 font-medium">
                      Lampiran Dokumen:
                    </span>
                    <img
                      src={req.attachmentUrl}
                      alt="Bukti Lampiran"
                      className="h-24 rounded-lg border border-slate-200 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AbsenceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
