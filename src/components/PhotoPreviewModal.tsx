import React from 'react';
import { X, Download, ShieldCheck, MapPin, Calendar, Clock, User } from 'lucide-react';
import { AttendanceRecord, AttendanceType } from '../types';
import { formatCoordinates, formatDistance } from '../utils/geo';
import { formatDateIndonesian, formatTimeWIB } from '../utils/formatters';

interface PhotoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  photoType: AttendanceType;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  isOpen,
  onClose,
  record,
  photoType,
}) => {
  if (!isOpen || !record) return null;

  const isCheckIn = photoType === 'DATANG';
  const photoUrl = isCheckIn
    ? record.checkInPhotoWatermarkedUrl || record.checkInPhotoUrl
    : record.checkOutPhotoWatermarkedUrl || record.checkOutPhotoUrl;

  const timestamp = isCheckIn ? record.checkInTime : record.checkOutTime;
  const latitude = isCheckIn ? record.checkInLatitude : record.checkOutLatitude;
  const longitude = isCheckIn ? record.checkInLongitude : record.checkOutLongitude;
  const accuracy = isCheckIn ? record.checkInAccuracy : record.checkOutAccuracy;
  const distance = isCheckIn ? record.checkInDistanceMeters : record.checkOutDistanceMeters;
  const locationStatus = isCheckIn ? record.checkInLocationStatus : record.checkOutLocationStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Photo Container */}
        <div className="relative md:w-3/5 bg-slate-900 flex items-center justify-center min-h-[300px] max-h-[500px] md:max-h-none overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`Foto Presensi ${photoType} - ${record.studentName}`}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">Tidak ada foto bukti yang tersimpan.</p>
            </div>
          )}

          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs border border-white/20 text-white px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Watermark Server Verified</span>
          </div>
        </div>

        {/* Metadata Details Sidebar */}
        <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Bukti Presensi {photoType}
                </span>
                <h3 className="text-base font-bold text-slate-900">{record.studentName}</h3>
                <p className="text-xs text-slate-500">NIS: {record.nis} · {record.className}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 block">Tanggal Kerja:</span>
                  <span className="font-semibold text-slate-900">
                    {formatDateIndonesian(record.workDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 block">Waktu Penerimaan Server:</span>
                  <span className="font-semibold font-mono text-slate-900">
                    {formatTimeWIB(timestamp)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-slate-500 block">Koordinat GPS:</span>
                  <span className="font-semibold font-mono text-slate-900 block">
                    {formatCoordinates(latitude, longitude)}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    Akurasi: ±{Math.round(accuracy || 0)} meter
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status Geofence:</span>
                  <span className="font-semibold text-teal-700">
                    {locationStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Jarak ke DUDI:</span>
                  <span className="font-semibold font-mono text-slate-900">
                    {formatDistance(distance)}
                  </span>
                </div>
              </div>

              {record.notes && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                  <span className="font-semibold block text-[11px] mb-0.5">Catatan Sistem / Guru:</span>
                  <p>{record.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {photoUrl && (
              <a
                href={photoUrl}
                download={`presensi_${record.nis}_${photoType}_${record.workDate}.jpg`}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Foto</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium text-xs transition-colors ml-auto"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
