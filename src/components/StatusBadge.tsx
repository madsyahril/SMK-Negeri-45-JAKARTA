import React from 'react';
import { AttendanceStatus } from '../types';

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyle = () => {
    switch (status) {
      case 'HADIR':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'SAKIT':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'IZIN':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'ALPA':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-bold px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium tracking-tight ${getStyle()} ${sizeClasses[size]}`}
    >
      {status}
    </span>
  );
};
