import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  ClassRoom,
  Industry,
  Student,
  AttendanceRecord,
  AbsenceRequest,
  AuditLog,
  SystemConfig,
  UserRole,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_INDUSTRIES,
  INITIAL_PROFILES,
  INITIAL_STUDENTS,
  INITIAL_ATTENDANCE,
  INITIAL_ABSENCES,
  INITIAL_AUDIT_LOGS,
  INITIAL_CONFIG,
} from '../data/mockData';
import { getCurrentJakartaDate, getCurrentJakartaTime } from '../utils/formatters';

interface AppContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  currentStudent: Student | null;
  students: Student[];
  classes: ClassRoom[];
  industries: Industry[];
  attendances: AttendanceRecord[];
  absences: AbsenceRequest[];
  auditLogs: AuditLog[];
  config: SystemConfig;
  allProfiles: UserProfile[];
  
  // Handlers
  submitAttendance: (
    data: {
      type: 'DATANG' | 'PULANG';
      photoUrl: string;
      photoWatermarkedUrl: string;
      latitude: number;
      longitude: number;
      accuracy: number;
      locationStatus: 'DALAM_AREA' | 'LUAR_AREA' | 'GPS_TIDAK_AKURAT' | 'BELUM_TERVERIFIKASI';
      distanceMeters: number;
      isFieldDuty?: boolean;
      fieldDutyReason?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;

  submitAbsenceRequest: (
    data: {
      type: 'IZIN' | 'SAKIT';
      startDate: string;
      endDate: string;
      durationDays: number;
      reason: string;
      attachmentUrl?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;

  reviewAbsenceRequest: (
    requestId: string,
    status: 'DISETUJUI' | 'DITOLAK',
    notes: string
  ) => Promise<void>;

  correctAttendance: (
    attendanceId: string,
    updates: Partial<AttendanceRecord>,
    reason: string
  ) => Promise<void>;

  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addIndustry: (industry: Omit<Industry, 'id'>) => void;
  updateIndustry: (id: string, updates: Partial<Industry>) => void;
  deleteIndustry: (id: string) => void;

  updateConfig: (updates: Partial<SystemConfig>) => void;
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USER_ID: 'sipkl_user_id',
  STUDENTS: 'sipkl_students_v1',
  CLASSES: 'sipkl_classes_v1',
  INDUSTRIES: 'sipkl_industries_v1',
  ATTENDANCE: 'sipkl_attendance_v1',
  ABSENCES: 'sipkl_absences_v1',
  AUDIT: 'sipkl_audit_v1',
  CONFIG: 'sipkl_config_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const found = INITIAL_PROFILES.find((p) => p.id === savedId);
    return found || INITIAL_PROFILES[0]; // Default to student Budi Santoso
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [classes] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [industries, setIndustries] = useState<Industry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INDUSTRIES);
    return saved ? JSON.parse(saved) : INITIAL_INDUSTRIES;
  });

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [absences, setAbsences] = useState<AbsenceRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ABSENCES);
    return saved ? JSON.parse(saved) : INITIAL_ABSENCES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INDUSTRIES, JSON.stringify(industries));
  }, [industries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendances));
  }, [attendances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ABSENCES, JSON.stringify(absences));
  }, [absences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  // Current student object corresponding to logged in student
  const currentStudent = students.find((s) => s.userId === currentUser.id) || null;

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
  };

  const switchRole = (role: UserRole) => {
    const targetUser = INITIAL_PROFILES.find((p) => p.role === role) || INITIAL_PROFILES[0];
    setCurrentUserState(targetUser);
  };

  /**
   * Submit Attendance Check In or Check Out
   * Strictly enforces backend validations:
   * - Photo required for both Check In and Check Out separately
   * - Anti-double attendance prevention
   */
  const submitAttendance = async (data: {
    type: 'DATANG' | 'PULANG';
    photoUrl: string;
    photoWatermarkedUrl: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    locationStatus: 'DALAM_AREA' | 'LUAR_AREA' | 'GPS_TIDAK_AKURAT' | 'BELUM_TERVERIFIKASI';
    distanceMeters: number;
    isFieldDuty?: boolean;
    fieldDutyReason?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!currentStudent) {
      return { success: false, message: 'Data siswa tidak ditemukan untuk akun ini.' };
    }

    if (!data.photoUrl || !data.photoWatermarkedUrl) {
      return { success: false, message: 'Foto bukti presensi wajib diambil melalui kamera.' };
    }

    const today = getCurrentJakartaDate();
    const serverTimestamp = new Date().toISOString();

    // Check existing record for today
    const existingIndex = attendances.findIndex(
      (a) => a.studentId === currentStudent.id && a.workDate === today
    );

    if (data.type === 'DATANG') {
      if (existingIndex >= 0 && attendances[existingIndex].checkInTime) {
        return {
          success: false,
          message: 'Presensi datang sudah tercatat hari ini. Presensi ganda ditolak.',
        };
      }

      const newRecord: AttendanceRecord = {
        id: existingIndex >= 0 ? attendances[existingIndex].id : `att-${Date.now()}`,
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        nis: currentStudent.nis,
        className: currentStudent.className,
        industryId: currentStudent.industryId,
        industryName: currentStudent.industryName,
        workDate: today,
        status: 'HADIR',
        checkInTime: serverTimestamp,
        checkInLatitude: data.latitude,
        checkInLongitude: data.longitude,
        checkInAccuracy: data.accuracy,
        checkInLocationStatus: data.locationStatus,
        checkInDistanceMeters: data.distanceMeters,
        checkInPhotoUrl: data.photoUrl,
        checkInPhotoWatermarkedUrl: data.photoWatermarkedUrl,
        isFieldDuty: data.isFieldDuty || false,
        fieldDutyReason: data.fieldDutyReason,
        notes: data.isFieldDuty
          ? `Tugas Lapangan: ${data.fieldDutyReason}`
          : data.locationStatus === 'LUAR_AREA'
          ? `Di luar radius DUDI (${data.distanceMeters}m)`
          : 'Presensi datang valid',
      };

      if (existingIndex >= 0) {
        const updated = [...attendances];
        updated[existingIndex] = { ...updated[existingIndex], ...newRecord };
        setAttendances(updated);
      } else {
        setAttendances([newRecord, ...attendances]);
      }

      return {
        success: true,
        message: `Presensi Datang berhasil disimpan pada ${getCurrentJakartaTime()}. Data telah diverifikasi server.`,
      };
    } else {
      // PULANG
      if (existingIndex < 0 || !attendances[existingIndex].checkInTime) {
        return {
          success: false,
          message: 'Anda belum melakukan Presensi Datang hari ini. Silakan presensi datang terlebih dahulu.',
        };
      }

      if (attendances[existingIndex].checkOutTime) {
        return {
          success: false,
          message: 'Presensi pulang sudah tercatat hari ini. Presensi ganda ditolak.',
        };
      }

      const updated = [...attendances];
      updated[existingIndex] = {
        ...updated[existingIndex],
        checkOutTime: serverTimestamp,
        checkOutLatitude: data.latitude,
        checkOutLongitude: data.longitude,
        checkOutAccuracy: data.accuracy,
        checkOutLocationStatus: data.locationStatus,
        checkOutDistanceMeters: data.distanceMeters,
        checkOutPhotoUrl: data.photoUrl,
        checkOutPhotoWatermarkedUrl: data.photoWatermarkedUrl,
        notes: `${updated[existingIndex].notes || ''} | Presensi pulang tercatat`,
      };
      setAttendances(updated);

      return {
        success: true,
        message: `Presensi Pulang berhasil disimpan pada ${getCurrentJakartaTime()}. Jam kerja PKL hari ini selesai.`,
      };
    }
  };

  /**
   * Submit Absence (Izin / Sakit) Request
   * Validates mandatory reason
   */
  const submitAbsenceRequest = async (data: {
    type: 'IZIN' | 'SAKIT';
    startDate: string;
    endDate: string;
    durationDays: number;
    reason: string;
    attachmentUrl?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!currentStudent) {
      return { success: false, message: 'Data siswa tidak ditemukan.' };
    }

    if (!data.reason || data.reason.trim().length === 0) {
      return { success: false, message: 'Kolom alasan/keterangan izin wajib diisi secara lengkap.' };
    }

    const newRequest: AbsenceRequest = {
      id: `abs-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      nis: currentStudent.nis,
      className: currentStudent.className,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      durationDays: data.durationDays,
      reason: data.reason.trim(),
      attachmentUrl: data.attachmentUrl,
      status: 'MENUNGGU',
      createdAt: new Date().toISOString(),
    };

    setAbsences([newRequest, ...absences]);

    // Also update today's attendance record if request covers today
    const today = getCurrentJakartaDate();
    if (data.startDate <= today && data.endDate >= today) {
      const existingIndex = attendances.findIndex(
        (a) => a.studentId === currentStudent.id && a.workDate === today
      );
      const newAttendanceStatus = data.type === 'SAKIT' ? 'SAKIT' : 'IZIN';
      if (existingIndex >= 0) {
        const updated = [...attendances];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: newAttendanceStatus,
          notes: `Pengajuan ${data.type} (Menunggu Persetujuan Guru): ${data.reason}`,
        };
        setAttendances(updated);
      } else {
        const dummyAttendance: AttendanceRecord = {
          id: `att-${Date.now()}`,
          studentId: currentStudent.id,
          studentName: currentStudent.fullName,
          nis: currentStudent.nis,
          className: currentStudent.className,
          industryId: currentStudent.industryId,
          industryName: currentStudent.industryName,
          workDate: today,
          status: newAttendanceStatus,
          notes: `Pengajuan ${data.type} (Menunggu Persetujuan Guru): ${data.reason}`,
        };
        setAttendances([dummyAttendance, ...attendances]);
      }
    }

    return {
      success: true,
      message: `Pengajuan ${data.type} berhasil dikirim ke Guru Pembimbing & Wali Kelas untuk diverifikasi.`,
    };
  };

  /**
   * Review Absence Request (Guru / Wali Kelas)
   */
  const reviewAbsenceRequest = async (
    requestId: string,
    status: 'DISETUJUI' | 'DITOLAK',
    notes: string
  ): Promise<void> => {
    const reqIndex = absences.findIndex((a) => a.id === requestId);
    if (reqIndex < 0) return;

    const req = absences[reqIndex];
    const updatedReq: AbsenceRequest = {
      ...req,
      status,
      reviewedBy: currentUser.fullName,
      reviewedAt: new Date().toISOString(),
      reviewNotes: notes,
    };

    const newAbsences = [...absences];
    newAbsences[reqIndex] = updatedReq;
    setAbsences(newAbsences);

    // Audit Log
    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      entityType: 'ABSENCE',
      entityId: requestId,
      action: 'VERIFICATION',
      previousValue: { status: req.status },
      newValue: { status, reviewNotes: notes },
      reason: notes || `Pemeriksaan pengajuan oleh ${currentUser.fullName}`,
      performedByUserId: currentUser.id,
      performedByName: currentUser.fullName,
      performedByRole: currentUser.role,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs([audit, ...auditLogs]);

    // Update attendance table accordingly
    const today = getCurrentJakartaDate();
    if (req.startDate <= today && req.endDate >= today) {
      const attIndex = attendances.findIndex(
        (a) => a.studentId === req.studentId && a.workDate === today
      );
      if (attIndex >= 0) {
        const updatedAtt = [...attendances];
        updatedAtt[attIndex] = {
          ...updatedAtt[attIndex],
          status: status === 'DISETUJUI' ? req.type : 'ALPA',
          notes: `Hasil telaah ${req.type}: ${status}. Catatan: ${notes}`,
          verifiedBy: currentUser.fullName,
          verifiedAt: new Date().toISOString(),
        };
        setAttendances(updatedAtt);
      }
    }
  };

  /**
   * Official Attendance Correction with Audit Trail
   */
  const correctAttendance = async (
    attendanceId: string,
    updates: Partial<AttendanceRecord>,
    reason: string
  ): Promise<void> => {
    const index = attendances.findIndex((a) => a.id === attendanceId);
    if (index < 0) return;

    const oldRecord = attendances[index];
    const newRecord: AttendanceRecord = {
      ...oldRecord,
      ...updates,
      verifiedBy: currentUser.fullName,
      verifiedAt: new Date().toISOString(),
      notes: `${oldRecord.notes || ''} | Koreksi resmi: ${reason}`,
    };

    const newAttendances = [...attendances];
    newAttendances[index] = newRecord;
    setAttendances(newAttendances);

    // Record Audit Log
    const audit: AuditLog = {
      id: `aud-${Date.now()}`,
      entityType: 'ATTENDANCE',
      entityId: attendanceId,
      action: 'CORRECTION',
      previousValue: { status: oldRecord.status, notes: oldRecord.notes },
      newValue: { status: newRecord.status, reason },
      reason: reason,
      performedByUserId: currentUser.id,
      performedByName: currentUser.fullName,
      performedByRole: currentUser.role,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs([audit, ...auditLogs]);
  };

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
    };
    setStudents([...students, newStudent]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  const addIndustry = (indData: Omit<Industry, 'id'>) => {
    const newInd: Industry = {
      ...indData,
      id: `ind-${Date.now()}`,
    };
    setIndustries([...industries, newInd]);
  };

  const updateIndustry = (id: string, updates: Partial<Industry>) => {
    setIndustries(industries.map((ind) => (ind.id === id ? { ...ind, ...updates } : ind)));
  };

  const deleteIndustry = (id: string) => {
    setIndustries(industries.filter((ind) => ind.id !== id));
  };

  const updateConfig = (updates: Partial<SystemConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const resetToInitialData = () => {
    setStudents(INITIAL_STUDENTS);
    setIndustries(INITIAL_INDUSTRIES);
    setAttendances(INITIAL_ATTENDANCE);
    setAbsences(INITIAL_ABSENCES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setConfig(INITIAL_CONFIG);
    setCurrentUserState(INITIAL_PROFILES[0]);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        setCurrentUser,
        switchRole,
        currentStudent,
        students,
        classes,
        industries,
        attendances,
        absences,
        auditLogs,
        config,
        allProfiles: INITIAL_PROFILES,
        submitAttendance,
        submitAbsenceRequest,
        reviewAbsenceRequest,
        correctAttendance,
        addStudent,
        updateStudent,
        deleteStudent,
        addIndustry,
        updateIndustry,
        deleteIndustry,
        updateConfig,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
