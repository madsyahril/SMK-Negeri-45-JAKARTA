import React from 'react';
import { LocationStatus } from '../types';
import { formatDistance } from '../utils/geo';

interface LocationStatusBadgeProps {
  status?: LocationStatus;
  distanceMeters?: number;
  showDistance?: boolean;
}

export const LocationStatusBadge: React.FC<LocationStatusBadgeProps> = ({
  status = 'BELUM_TERVERIFIKASI',
  distanceMeters,
  showDistance = true,
}) => {
  const getDetails = () => {
    switch (status) {
      case 'DALAM_AREA':
        return {
          label: 'Dalam Area PKL',
          classes: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        };
      case 'LUAR_AREA':
        return {
          label: 'Di Luar Area PKL',
          classes: 'text-rose-700 bg-rose-50 border-rose-200',
        };
      case 'GPS_TIDAK_AKURAT':
        return {
          label: 'GPS Tidak Akurat',
          classes: 'text-amber-700 bg-amber-50 border-amber-200',
        };
      case 'BELUM_TERVERIFIKASI':
      default:
        return {
          label: 'Belum Terverifikasi',
          classes: 'text-slate-600 bg-slate-50 border-slate-200',
        };
    }
  };

  const { label, classes } = getDetails();

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classes}`}>
        {label}
      </span>
      {showDistance && distanceMeters !== undefined && (
        <span className="text-[11px] text-slate-500 font-mono">
          ({formatDistance(distanceMeters)})
        </span>
      )}
    </div>
  );
};
