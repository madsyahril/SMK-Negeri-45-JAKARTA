export type UserRole = 'student' | 'advisor' | 'homeroom' | 'admin';

export type AttendanceType = 'DATANG' | 'PULANG';

export type AttendanceStatus = 'HADIR' | 'ALPA' | 'SAKIT' | 'IZIN';

export type LocationStatus = 'DALAM_AREA' | 'LUAR_AREA' | 'GPS_TIDAK_AKURAT' | 'BELUM_TERVERIFIKASI';

export type RequestStatus = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "XII RPL 1"
  department: string; // e.g. "Rekayasa Perangkat Lunak"
  academicYear: string; // e.g. "2026/2027"
  homeroomTeacherId?: string;
  homeroomTeacherName?: string;
}

export interface Industry {
  id: string;
  name: string; // e.g. "PT Telkom Indonesia (Witel Solo)"
  sector: string; // e.g. "Telekomunikasi & IT"
  address: string;
  contactPerson: string;
  phone: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // default 100m
  checkInStart: string; // "07:00"
  checkInEnd: string; // "08:00"
  checkOutStart: string; // "16:00"
  checkOutEnd: string; // "18:00"
}

export interface Student {
  id: string;
  userId: string;
  nis: string;
  nisn: string;
  fullName: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  industryId: string;
  industryName: string;
  advisorId: string; // Guru Pembimbing
  advisorName: string;
  parentPhone: string;
  studentPhone: string;
  avatarUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  className: string;
  industryId: string;
  industryName: string;
  workDate: string; // YYYY-MM-DD
  status: AttendanceStatus;
  
  // Datang
  checkInTime?: string; // ISO string
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkInAccuracy?: number; // meters
  checkInLocationStatus?: LocationStatus;
  checkInPhotoUrl?: string;
  checkInPhotoWatermarkedUrl?: string;
  checkInDistanceMeters?: number;
  
  // Pulang
  checkOutTime?: string; // ISO string
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutAccuracy?: number; // meters
  checkOutLocationStatus?: LocationStatus;
  checkOutPhotoUrl?: string;
  checkOutPhotoWatermarkedUrl?: string;
  checkOutDistanceMeters?: number;
  
  notes?: string;
  isFieldDuty?: boolean; // Pengecualian tugas luar / lapangan
  fieldDutyReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AbsenceRequest {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  className: string;
  type: 'IZIN' | 'SAKIT';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationDays: number;
  reason: string; // Mandatory explanation
  attachmentUrl?: string; // Photo of doctor's note or parental letter
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entityType: 'ATTENDANCE' | 'ABSENCE' | 'STUDENT' | 'PLACEMENT';
  entityId: string;
  action: 'UPDATE' | 'CORRECTION' | 'VERIFICATION' | 'OVERRIDE';
  previousValue: Record<string, unknown>;
  newValue: Record<string, unknown>;
  reason: string;
  performedByUserId: string;
  performedByName: string;
  performedByRole: UserRole;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemConfig {
  defaultRadiusMeters: number;
  lateToleranceMinutes: number;
  allowFieldDutyException: boolean;
  schoolName: string;
  schoolAddress: string;
  headmasterName: string;
  headmasterNip: string;
}
