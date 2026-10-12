import { LocationStatus } from '../types';

/**
 * Calculates distance between two GPS coordinates using the Haversine formula.
 * Returns distance in meters.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Evaluates whether student's location is within DUDI radius and returns detailed location status.
 */
export function evaluateLocation(
  studentLat: number,
  studentLon: number,
  accuracy: number,
  targetLat: number,
  targetLon: number,
  radiusMeters: number = 100,
  isFieldDuty: boolean = false
): {
  status: LocationStatus;
  distanceMeters: number;
  isWithinRadius: boolean;
  message: string;
} {
  // If GPS accuracy is too poor (> 150m), flag as inaccurate
  if (accuracy > 150) {
    const dist = calculateDistanceMeters(studentLat, studentLon, targetLat, targetLon);
    return {
      status: 'GPS_TIDAK_AKURAT',
      distanceMeters: dist,
      isWithinRadius: false,
      message: `Akurasi GPS rendah (±${Math.round(accuracy)}m). Pindah ke ruang terbuka.`,
    };
  }

  const distanceMeters = calculateDistanceMeters(studentLat, studentLon, targetLat, targetLon);

  if (isFieldDuty) {
    return {
      status: 'DALAM_AREA',
      distanceMeters,
      isWithinRadius: true,
      message: 'Tugas Lapangan / DUDI Eksternal (Pengecualian Lokasi Aktif)',
    };
  }

  // Allow radius + half accuracy tolerance
  const effectiveRadius = radiusMeters + Math.min(accuracy / 2, 20);
  const isWithinRadius = distanceMeters <= effectiveRadius;

  if (isWithinRadius) {
    return {
      status: 'DALAM_AREA',
      distanceMeters,
      isWithinRadius: true,
      message: `Dalam Radius DUDI (${distanceMeters}m dari titik pusat, batas: ${radiusMeters}m)`,
    };
  } else {
    return {
      status: 'LUAR_AREA',
      distanceMeters,
      isWithinRadius: false,
      message: `Di Luar Radius DUDI (${distanceMeters}m, melebihi toleransi ${radiusMeters}m). Catatan verifikasi akan dibuat.`,
    };
  }
}

export function formatDistance(meters?: number): string {
  if (meters === undefined || meters === null) return '-';
  if (meters < 1000) return `${meters} meter`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatCoordinates(lat?: number, lon?: number): string {
  if (lat === undefined || lon === undefined) return '-';
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}
