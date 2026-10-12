import React, { useState } from 'react';
import { X, Calendar, Upload, AlertTriangle, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCurrentJakartaDate } from '../utils/formatters';

interface AbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AbsenceModal: React.FC<AbsenceModalProps> = ({ isOpen, onClose }) => {
  const { currentStudent, submitAbsenceRequest } = useApp();
  const today = getCurrentJakartaDate();

  const [type, setType] = useState<'IZIN' | 'SAKIT'>('IZIN');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [reason, setReason] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !currentStudent) return null;

  // Calculate duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError('Ukuran file maksimal 4 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Keterangan / alasan pengajuan wajib diisi secara lengkap.');
      return;
    }

    if (endDate < startDate) {
      setError('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await submitAbsenceRequest({
        type,
        startDate,
        endDate,
        durationDays,
        reason: reason.trim(),
        attachmentUrl: attachmentPreview || undefined,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          setSuccessMsg('');
          onClose();
        }, 1500);
      } else {
        setError(res.message);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal mengirim pengajuan izin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Formulir Pengajuan Izin / Sakit</h3>
            <p className="text-xs text-slate-500">
              Pengajuan akan langsung diteruskan ke Guru Pembimbing & Wali Kelas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {successMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <span className="text-2xl">✅</span>
              <p className="text-xs font-semibold text-emerald-800">{successMsg}</p>
            </div>
          ) : (
            <>
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenis Pengajuan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('IZIN')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      type === 'IZIN'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-400/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    📝 IZIN (Keperluan Mendesak/Keluarga)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('SAKIT')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      type === 'SAKIT'
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-400/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏥 SAKIT (Kondisi Kesehatan)
                  </button>
                </div>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Mulai <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Selesai <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
                <span>Durasi Hari Kerja:</span>
                <span className="font-semibold text-slate-900 font-mono">{durationDays} Hari</span>
              </div>

              {/* Reason textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={
                    type === 'IZIN'
                      ? 'Jelaskan keperluan izin secara rinci (misal: acara keluarga resmi / kegiatan kepramukaan)'
                      : 'Jelaskan gejala sakit dan anjuran dokter (misal: demam tinggi disertai batuk)'
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  * Kolom keterangan tidak boleh dikosongkan.
                </p>
              </div>

              {/* Attachment upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lampiran Pendukung (Foto Surat Dokter / Surat Izin Orang Tua)
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  {attachmentPreview ? (
                    <div className="space-y-2">
                      <img
                        src={attachmentPreview}
                        alt="Pratinjau lampiran"
                        className="max-h-36 mx-auto rounded-lg border border-slate-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAttachmentPreview(null)}
                        className="text-xs text-rose-600 font-medium hover:underline"
                      >
                        Hapus / Ganti Lampiran
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-xs font-medium text-teal-700 hover:text-teal-800">
                        Klik untuk unggah foto surat
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Format JPG, PNG, atau WEBP (Maksimal 4 MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
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
                  className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Izin/Sakit'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
