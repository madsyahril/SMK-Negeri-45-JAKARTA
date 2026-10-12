import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { X, Navigation, Building2 } from 'lucide-react';
import { formatCoordinates, formatDistance } from '../utils/geo';

interface LeafletMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
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
}

export const LeafletMapModal: React.FC<LeafletMapModalProps> = ({
  isOpen,
  onClose,
  title,
  studentName,
  studentLat,
  studentLon,
  studentAccuracy = 15,
  industryName,
  industryLat,
  industryLon,
  radiusMeters,
  distanceMeters,
  isFieldDuty,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Default student coordinates if missing
    const sLat = studentLat ?? industryLat;
    const sLon = studentLon ?? industryLon;

    // Small delay to allow modal rendering in DOM
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current).setView([industryLat, industryLon], 16);
      mapInstanceRef.current = map;

      // Add OpenStreetMap TileLayer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Icon for DUDI (Office)
      const officeIcon = L.divIcon({
        className: 'custom-office-marker',
        html: `<div style="background-color: #0F172A; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); border: 2px solid white;">🏢</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Marker for DUDI
      const officeMarker = L.marker([industryLat, industryLon], { icon: officeIcon })
        .addTo(map)
        .bindPopup(
          `<strong>${industryName}</strong><br/>Titik Lokasi Resmi DUDI<br/>Radius Izin: ${radiusMeters} meter`
        );

      // Geofence Radius Circle around DUDI
      const isWithin = distanceMeters !== undefined ? distanceMeters <= radiusMeters : true;
      L.circle([industryLat, industryLon], {
        radius: radiusMeters,
        color: isWithin ? '#0D9488' : '#F59E0B',
        fillColor: isWithin ? '#0D9488' : '#F59E0B',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: isWithin ? undefined : '4, 6',
      }).addTo(map);

      // Marker for Student Check-In (if available)
      if (studentLat !== undefined && studentLon !== undefined) {
        const studentIcon = L.divIcon({
          className: 'custom-student-marker',
          html: `<div style="background-color: ${isWithin ? '#0D9488' : '#E11D48'}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); border: 2px solid white; font-weight: bold; font-size: 14px;">📍</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const studentMarker = L.marker([sLat, sLon], { icon: studentIcon })
          .addTo(map)
          .bindPopup(
            `<strong>${studentName}</strong><br/>Posisi Presensi<br/>Akurasi GPS: ±${Math.round(studentAccuracy)}m`
          );

        // Accuracy Circle around student
        L.circle([sLat, sLon], {
          radius: Math.max(5, studentAccuracy),
          color: '#38BDF8',
          fillColor: '#38BDF8',
          fillOpacity: 0.12,
          weight: 1,
        }).addTo(map);

        // Line connecting student to DUDI
        L.polyline(
          [
            [sLat, sLon],
            [industryLat, industryLon],
          ],
          {
            color: isWithin ? '#0D9488' : '#E11D48',
            weight: 2,
            dashArray: '5, 5',
          }
        ).addTo(map);

        // Fit bounds to show both points nicely
        const group = L.featureGroup([officeMarker, studentMarker]);
        map.fitBounds(group.getBounds().pad(0.3));
      } else {
        officeMarker.openPopup();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, studentLat, studentLon, studentAccuracy, industryLat, industryLon, radiusMeters, distanceMeters, industryName, studentName]);

  if (!isOpen) return null;

  const isWithin = distanceMeters !== undefined ? distanceMeters <= radiusMeters : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">Verifikasi Geofence OpenStreetMap & GPS Perangkat</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Metadata Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-600" />
              <span>{industryName}</span>
            </div>
            <p className="text-slate-500 font-mono">
              Lokasi Resmi: {formatCoordinates(industryLat, industryLon)} (Radius: {radiusMeters}m)
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-900 font-medium">
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              <span>Lokasi {studentName}</span>
            </div>
            <p className="text-slate-500 font-mono">
              Koordinat: {formatCoordinates(studentLat, studentLon)} (±{Math.round(studentAccuracy)}m)
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-slate-500">Jarak:</span>
              <span
                className={`font-semibold font-mono ${
                  isWithin ? 'text-teal-700' : isFieldDuty ? 'text-sky-700' : 'text-rose-600'
                }`}
              >
                {formatDistance(distanceMeters)}
              </span>
              <span className="text-slate-400">·</span>
              <span
                className={`font-medium ${
                  isWithin ? 'text-teal-700' : isFieldDuty ? 'text-sky-700' : 'text-rose-600'
                }`}
              >
                {isFieldDuty
                  ? 'Tugas Luar Terverifikasi'
                  : isWithin
                  ? 'Dalam Geofence DUDI'
                  : 'Di Luar Radius DUDI'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup Peta
          </button>
        </div>
      </div>
    </div>
  );
};
