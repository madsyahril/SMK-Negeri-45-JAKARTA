import React, { useState } from 'react';
import {
  Users,
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Phone,
  Shield,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student, Industry } from '../types';
import { formatCoordinates } from '../utils/geo';

export const ManagementView: React.FC = () => {
  const {
    students,
    classes,
    industries,
    addStudent,
    updateStudent,
    deleteStudent,
    addIndustry,
    updateIndustry,
    deleteIndustry,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'INDUSTRIES'>('STUDENTS');
  const [searchQuery, setSearchQuery] = useState('');

  // Student Form Modal State
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    nis: '',
    nisn: '',
    fullName: '',
    gender: 'L' as 'L' | 'P',
    classId: classes[0]?.id || '',
    industryId: industries[0]?.id || '',
    advisorId: 'user-advisor',
    advisorName: 'Sri Wahyuni, S.Pd',
    parentPhone: '',
    studentPhone: '',
  });

  // Industry Form Modal State
  const [industryModalOpen, setIndustryModalOpen] = useState(false);
  const [editingIndustryId, setEditingIndustryId] = useState<string | null>(null);
  const [industryForm, setIndustryForm] = useState({
    name: '',
    sector: '',
    address: '',
    contactPerson: '',
    phone: '',
    latitude: -7.567382,
    longitude: 110.824219,
    radiusMeters: 100,
    checkInStart: '07:00',
    checkInEnd: '08:00',
    checkOutStart: '16:00',
    checkOutEnd: '18:00',
  });

  // Open Student Modal for Edit
  const handleEditStudent = (s: Student) => {
    setEditingStudentId(s.id);
    setStudentForm({
      nis: s.nis,
      nisn: s.nisn,
      fullName: s.fullName,
      gender: s.gender,
      classId: s.classId,
      industryId: s.industryId,
      advisorId: s.advisorId,
      advisorName: s.advisorName,
      parentPhone: s.parentPhone,
      studentPhone: s.studentPhone,
    });
    setStudentModalOpen(true);
  };

  const handleOpenAddStudent = () => {
    setEditingStudentId(null);
    setStudentForm({
      nis: `2024${Math.floor(1000 + Math.random() * 9000)}`,
      nisn: `006${Math.floor(1000000 + Math.random() * 9000000)}`,
      fullName: '',
      gender: 'L',
      classId: classes[0]?.id || '',
      industryId: industries[0]?.id || '',
      advisorId: 'user-advisor',
      advisorName: 'Sri Wahyuni, S.Pd',
      parentPhone: '',
      studentPhone: '',
    });
    setStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const selClass = classes.find((c) => c.id === studentForm.classId);
    const selInd = industries.find((i) => i.id === studentForm.industryId);

    if (editingStudentId) {
      updateStudent(editingStudentId, {
        ...studentForm,
        className: selClass?.name || '',
        industryName: selInd?.name || '',
      });
    } else {
      addStudent({
        ...studentForm,
        userId: `user-${Date.now()}`,
        className: selClass?.name || '',
        industryName: selInd?.name || '',
      });
    }
    setStudentModalOpen(false);
  };

  // Open Industry Modal for Edit
  const handleEditIndustry = (ind: Industry) => {
    setEditingIndustryId(ind.id);
    setIndustryForm({
      name: ind.name,
      sector: ind.sector,
      address: ind.address,
      contactPerson: ind.contactPerson,
      phone: ind.phone,
      latitude: ind.latitude,
      longitude: ind.longitude,
      radiusMeters: ind.radiusMeters,
      checkInStart: ind.checkInStart,
      checkInEnd: ind.checkInEnd,
      checkOutStart: ind.checkOutStart,
      checkOutEnd: ind.checkOutEnd,
    });
    setIndustryModalOpen(true);
  };

  const handleOpenAddIndustry = () => {
    setEditingIndustryId(null);
    setIndustryForm({
      name: '',
      sector: '',
      address: '',
      contactPerson: '',
      phone: '',
      latitude: -7.558000,
      longitude: 110.820000,
      radiusMeters: 100,
      checkInStart: '07:30',
      checkInEnd: '08:30',
      checkOutStart: '16:30',
      checkOutEnd: '18:00',
    });
    setIndustryModalOpen(true);
  };

  const handleSaveIndustry = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndustryId) {
      updateIndustry(editingIndustryId, industryForm);
    } else {
      addIndustry(industryForm);
    }
    setIndustryModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header and Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Data Master PKL</h1>
          <p className="text-xs text-slate-500">
            Kelola data siswa, penempatan magang, koordinat GPS geofence DUDI, dan jadwal jam kerja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('STUDENTS')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'STUDENTS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Data Siswa ({students.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('INDUSTRIES')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'INDUSTRIES'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Tempat PKL / DUDI ({industries.length})</span>
            </button>
          </div>

          <button
            onClick={activeTab === 'STUDENTS' ? handleOpenAddStudent : handleOpenAddIndustry}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'STUDENTS' ? 'Tambah Siswa' : 'Tambah DUDI'}</span>
          </button>
        </div>
      </div>

      {/* STUDENTS TAB */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">NIS / NISN</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Tempat PKL (DUDI)</th>
                    <th className="py-3 px-4">Guru Pembimbing</th>
                    <th className="py-3 px-4">Kontak Siswa / Ortu</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {students.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {std.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono whitespace-nowrap text-slate-600 text-[11px]">
                        {std.nis} / {std.nisn}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{std.className}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{std.industryName}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{std.advisorName}</td>
                      <td className="py-3 px-4 text-[11px] whitespace-nowrap">
                        <span className="block text-slate-800 font-mono">{std.studentPhone}</span>
                        <span className="text-slate-400">{std.parentPhone}</span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEditStudent(std)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus data siswa ${std.fullName}?`)) {
                                deleteStudent(std.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INDUSTRIES TAB */}
      {activeTab === 'INDUSTRIES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {industries.map((ind) => (
            <div
              key={ind.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{ind.name}</h3>
                    <span className="text-xs text-teal-700 font-semibold">{ind.sector}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditIndustry(ind)}
                      className="p-1.5 text-slate-500 hover:text-teal-700 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus tempat PKL ${ind.name}?`)) {
                          deleteIndustry(ind.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-slate-700">{ind.address}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Koordinat GPS:</span>
                      <span className="text-slate-800">{formatCoordinates(ind.latitude, ind.longitude)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Radius Geofence:</span>
                      <span className="font-bold text-teal-700">{ind.radiusMeters} Meter</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">
                      Datang: {ind.checkInStart} - {ind.checkInEnd} WIB · Pulang: {ind.checkOutStart} - {ind.checkOutEnd} WIB
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px]">
                      PIC: {ind.contactPerson} ({ind.phone})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Form Modal */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              {editingStudentId ? 'Edit Data Siswa' : 'Tambah Siswa PKL Baru'}
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIS</label>
                  <input
                    type="text"
                    required
                    value={studentForm.nis}
                    onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NISN</label>
                  <input
                    type="text"
                    required
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kelas</label>
                  <select
                    value={studentForm.classId}
                    onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) =>
                      setStudentForm({ ...studentForm, gender: e.target.value as 'L' | 'P' })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tempat PKL (DUDI)</label>
                <select
                  value={studentForm.industryId}
                  onChange={(e) => setStudentForm({ ...studentForm, industryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. HP Siswa</label>
                  <input
                    type="text"
                    value={studentForm.studentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, studentPhone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. HP Orang Tua</label>
                  <input
                    type="text"
                    value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    placeholder="0813-xxxx-xxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Industry Form Modal */}
      {industryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">
              {editingIndustryId ? 'Edit Tempat PKL (DUDI)' : 'Tambah Tempat PKL (DUDI) Baru'}
            </h3>

            <form onSubmit={handleSaveIndustry} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Perusahaan / Industri</label>
                <input
                  type="text"
                  required
                  value={industryForm.name}
                  onChange={(e) => setIndustryForm({ ...industryForm, name: e.target.value })}
                  placeholder="Contoh: PT Telkom Indonesia (Witel Surakarta)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bidang / Sektor Industri</label>
                <input
                  type="text"
                  required
                  value={industryForm.sector}
                  onChange={(e) => setIndustryForm({ ...industryForm, sector: e.target.value })}
                  placeholder="Contoh: Telekomunikasi & Jaringan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  required
                  value={industryForm.address}
                  onChange={(e) => setIndustryForm({ ...industryForm, address: e.target.value })}
                  placeholder="Alamat kantor / bengkel / cabang PKL"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={industryForm.latitude}
                    onChange={(e) =>
                      setIndustryForm({ ...industryForm, latitude: parseFloat(e.target.value) })
                    }
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={industryForm.longitude}
                    onChange={(e) =>
                      setIndustryForm({ ...industryForm, longitude: parseFloat(e.target.value) })
                    }
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Radius (m)</label>
                  <input
                    type="number"
                    required
                    value={industryForm.radiusMeters}
                    onChange={(e) =>
                      setIndustryForm({ ...industryForm, radiusMeters: parseInt(e.target.value) })
                    }
                    className="w-full px-2 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jam Datang (Mulai - Akhir)</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="time"
                      value={industryForm.checkInStart}
                      onChange={(e) => setIndustryForm({ ...industryForm, checkInStart: e.target.value })}
                      className="w-1/2 px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={industryForm.checkInEnd}
                      onChange={(e) => setIndustryForm({ ...industryForm, checkInEnd: e.target.value })}
                      className="w-1/2 px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jam Pulang (Mulai - Akhir)</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="time"
                      value={industryForm.checkOutStart}
                      onChange={(e) => setIndustryForm({ ...industryForm, checkOutStart: e.target.value })}
                      className="w-1/2 px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={industryForm.checkOutEnd}
                      onChange={(e) => setIndustryForm({ ...industryForm, checkOutEnd: e.target.value })}
                      className="w-1/2 px-2 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">PIC / Pembimbing DUDI</label>
                  <input
                    type="text"
                    value={industryForm.contactPerson}
                    onChange={(e) => setIndustryForm({ ...industryForm, contactPerson: e.target.value })}
                    placeholder="Nama supervisor"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. Telp Perusahaan</label>
                  <input
                    type="text"
                    value={industryForm.phone}
                    onChange={(e) => setIndustryForm({ ...industryForm, phone: e.target.value })}
                    placeholder="0271-xxxxxx"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIndustryModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan Tempat PKL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
