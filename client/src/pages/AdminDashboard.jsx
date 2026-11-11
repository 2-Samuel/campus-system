import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Printer,
  Sparkles,
  Link2
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('lecturers'); // 'lecturers' | 'students' | 'academic' | 'reports'
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // New Lecturer Form
  const [lecName, setLecName] = useState('');
  const [lecTitle, setLecTitle] = useState('Lecturer');
  const [lecEmail, setLecEmail] = useState('');
  const [lecPhone, setLecPhone] = useState('0712000000');
  const [lecDept, setLecDept] = useState('School of Computing & Informatics');
  const [lecBuilding, setLecBuilding] = useState('ICT Block');
  const [lecRoom, setLecRoom] = useState('Room 215');

  // New Course Form
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDept, setCourseDept] = useState('School of Computing & Informatics');

  // New Unit Form
  const [unitCode, setUnitCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitCourse, setUnitCourse] = useState('');
  const [unitSem, setUnitSem] = useState('1');
  const [unitYr, setUnitYr] = useState('2');

  // Assign Lecturer Form
  const [assignLecId, setAssignLecId] = useState('');
  const [assignUnitCode, setAssignUnitCode] = useState('');
  const [assignYear, setAssignYear] = useState('2025/2026');
  const [assignSem, setAssignSem] = useState('1');
  const [assignStudyYr, setAssignStudyYr] = useState('2');

  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [lRes, sRes, cRes, uRes, rRes] = await Promise.all([
        api.getLecturers(),
        api.getStudents(),
        api.getCourses(),
        api.getUnits(),
        api.getReports()
      ]);

      if (lRes.success) setLecturers(lRes.lecturers || []);
      if (sRes.success) setStudents(sRes.students || []);
      if (cRes.success) setCourses(cRes.courses || []);
      if (uRes.success) {
        setUnits(uRes.units || []);
        if (uRes.units.length > 0 && !unitCourse) {
          setUnitCourse(uRes.units[0].course);
        }
      }
      if (rRes.success) setReports(rRes);
    } catch (e) {
      console.error('Admin load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateLecturer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createLecturer({
        name: lecName,
        title: lecTitle,
        email: lecEmail,
        phone: lecPhone,
        department: lecDept,
        office: { building: lecBuilding, roomNumber: lecRoom, floor: '2nd Floor' }
      });
      if (res.success) {
        setFeedback('Lecturer profile and login created successfully!');
        setShowAddLecturer(false);
        setLecName('');
        setLecEmail('');
        loadAll();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create lecturer');
    }
  };

  const handleDeleteLecturer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecturer and all associated data?')) return;
    try {
      await api.deleteLecturer(id);
      setFeedback('Lecturer removed from system');
      loadAll();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addCourse({
        courseId: courseCode,
        courseName,
        department: courseDept
      });
      if (res.success) {
        setFeedback('Course program registered successfully!');
        setShowAddCourse(false);
        setCourseCode('');
        setCourseName('');
        loadAll();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add course');
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addUnit({
        unitCode,
        unitName,
        course: unitCourse,
        semester: Number(unitSem),
        year: Number(unitYr)
      });
      if (res.success) {
        setFeedback('Academic unit added to curriculum!');
        setShowAddUnit(false);
        setUnitCode('');
        setUnitName('');
        loadAll();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add unit');
    }
  };

  const handleAssignLecturer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.assignLecturerToUnit({
        lecturerId: assignLecId || lecturers[0]?.lecturerId,
        unitCode: assignUnitCode || units[0]?.unitCode,
        academicYear: assignYear,
        semester: Number(assignSem),
        studyYear: Number(assignStudyYr)
      });
      if (res.success) {
        setFeedback('Lecturer assigned to academic unit successfully!');
        setShowAssignModal(false);
        loadAll();
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to assign lecturer');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Delete student account?')) return;
    try {
      await api.deleteStudent(id);
      loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 animate-spin text-purple-600" />
        <span>Loading University Administrative Suite...</span>
      </div>
    );
  }

  const summary = reports?.summary || {};

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Faculty registry, course units, teaching assignments, and campus consultation analytics.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/25 flex items-center gap-2 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Export Official Report</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Lecturers</span>
          <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">{summary.totalLecturers || 0}</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">{summary.activeAvailabilityRatio || 80}% Available</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Students</span>
          <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">{summary.totalStudents || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Enrolled portal users</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Courses</span>
          <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">{summary.totalCourses || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Degree programs</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Academic Units</span>
          <span className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">{summary.totalUnits || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Curriculum modules</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Consultations</span>
          <span className="font-heading font-extrabold text-2xl text-blue-600">{summary.totalAppointments || 0}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">{summary.confirmedApts || 0} Confirmed</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'lecturers', label: 'Manage Lecturers', icon: Users },
          { id: 'academic', label: 'Courses & Units', icon: BookOpen },
          { id: 'students', label: 'Manage Students', icon: GraduationCap },
          { id: 'reports', label: 'Analytics Reports', icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSection(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeSection === t.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: MANAGE LECTURERS */}
      {activeSection === 'lecturers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Faculty Lecturers ({lecturers.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3.5 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 text-xs font-semibold flex items-center gap-1.5"
              >
                <Link2 className="w-4 h-4" />
                <span>Assign to Unit</span>
              </button>
              <button
                onClick={() => setShowAddLecturer(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lecturer</span>
              </button>
            </div>
          </div>

          {/* Add Lecturer Modal */}
          {showAddLecturer && (
            <form onSubmit={handleCreateLecturer} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs shadow-lg animate-in fade-in">
              <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                Register New Faculty Lecturer
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Doe"
                    value={lecName}
                    onChange={(e) => setLecName(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Academic Title</label>
                  <select
                    value={lecTitle}
                    onChange={(e) => setLecTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Eng. Lecturer">Eng. Lecturer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">University Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jane.doe@university.ac.ke"
                    value={lecEmail}
                    onChange={(e) => setLecEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Department</label>
                  <input
                    type="text"
                    value={lecDept}
                    onChange={(e) => setLecDept(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Building</label>
                  <input
                    type="text"
                    value={lecBuilding}
                    onChange={(e) => setLecBuilding(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={lecRoom}
                    onChange={(e) => setLecRoom(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLecturer(false)}
                  className="px-3 py-1.5 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold"
                >
                  Create Lecturer Account
                </button>
              </div>
            </form>
          )}

          {/* Assign Modal */}
          {showAssignModal && (
            <form onSubmit={handleAssignLecturer} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs shadow-lg animate-in fade-in">
              <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                Assign Lecturer to Academic Unit
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Select Lecturer</label>
                  <select
                    value={assignLecId}
                    onChange={(e) => setAssignLecId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {lecturers.map((l) => (
                      <option key={l.lecturerId} value={l.lecturerId}>
                        {l.name} ({l.department})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Select Unit</label>
                  <select
                    value={assignUnitCode}
                    onChange={(e) => setAssignUnitCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {units.map((u) => (
                      <option key={u.unitCode} value={u.unitCode}>
                        {u.unitCode} - {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={assignYear}
                    onChange={(e) => setAssignYear(e.target.value)}
                    placeholder="2025/2026"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Semester</label>
                  <select
                    value={assignSem}
                    onChange={(e) => setAssignSem(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Study Year</label>
                  <select
                    value={assignStudyYr}
                    onChange={(e) => setAssignStudyYr(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          )}

          {/* Lecturers Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Lecturer</th>
                  <th className="p-4">ID</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Office</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {lecturers.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={l.name} size="sm" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{l.name}</span>
                          <span className="text-[11px] text-slate-400">{l.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold">{l.lecturerId}</td>
                    <td className="p-4">{l.department}</td>
                    <td className="p-4 font-medium">{l.office?.building}, {l.office?.roomNumber}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        l.availabilityStatus === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {l.availabilityStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteLecturer(l.lecturerId)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: COURSES & UNITS */}
      {activeSection === 'academic' && (
        <div className="space-y-6">
          {/* Courses sub-block */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Degree Courses ({courses.length})
              </h3>
              <button
                onClick={() => setShowAddCourse(prev => !prev)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Course</span>
              </button>
            </div>

            {showAddCourse && (
              <form onSubmit={handleCreateCourse} className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Course Code</label>
                    <input
                      type="text"
                      placeholder="BIT"
                      required
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Course Name</label>
                    <input
                      type="text"
                      placeholder="Bachelor of Information Technology"
                      required
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Department</label>
                    <input
                      type="text"
                      value={courseDept}
                      onChange={(e) => setCourseDept(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddCourse(false)} className="px-3 py-1 text-slate-500">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold">Save Course</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courses.map((c) => (
                <div key={c._id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    {c.courseId}
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {c.courseName}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {c.department}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Units sub-block */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Academic Units ({units.length})
              </h3>
              <button
                onClick={() => setShowAddUnit(prev => !prev)}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Unit</span>
              </button>
            </div>

            {showAddUnit && (
              <form onSubmit={handleCreateUnit} className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1">Unit Code</label>
                    <input
                      type="text"
                      placeholder="BIT220"
                      required
                      value={unitCode}
                      onChange={(e) => setUnitCode(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Unit Name</label>
                    <input
                      type="text"
                      placeholder="Database Systems"
                      required
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Associated Course</label>
                    <input
                      type="text"
                      placeholder="Bachelor of Information Technology"
                      value={unitCourse}
                      onChange={(e) => setUnitCourse(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddUnit(false)} className="px-3 py-1 text-slate-500">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">Save Unit</button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {units.map((u) => (
                <div key={u._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                      {u.unitCode}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Year {u.year} • Sem {u.semester}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {u.unitName}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">{u.course}</p>
                  {u.assignedLecturers && u.assignedLecturers.length > 0 && (
                    <div className="pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500">
                      Assigned to: <strong className="text-slate-700 dark:text-slate-300">{u.assignedLecturers.map(a => a.name).join(', ')}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MANAGE STUDENTS */}
      {activeSection === 'students' && (
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
            Registered University Students ({students.length})
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">ID</th>
                  <th className="p-4">Degree Course</th>
                  <th className="p-4">Year</th>
                  <th className="p-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{s.name}</span>
                          <span className="text-[11px] text-slate-400">{s.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold">{s.studentId}</td>
                    <td className="p-4">{s.course}</td>
                    <td className="p-4">Year {s.year}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteStudent(s.studentId)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: REPORTS & ANALYTICS */}
      {activeSection === 'reports' && reports && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Consultation Workload &amp; Top Faculty
            </h3>
            <div className="space-y-3">
              {reports.topLecturers?.map((item, idx) => (
                <div key={item.lecturerId} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                      <span className="text-[11px] text-slate-400">{item.department}</span>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-blue-600">
                    {item.appointmentCount} consultations
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
