import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Search,
  Filter,
  Users,
  MapPin,
  Building,
  Phone,
  Mail,
  Calendar,
  Clock,
  BookOpen,
  QrCode,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Grid,
  List
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const LecturerDirectory = ({ onSelectLecturer, onBookAppointment, onOpenQR, onOpenMap }) => {
  const [lecturers, setLecturers] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    academicYears: [],
    studyYears: [],
    semesters: [],
    courses: [],
    units: []
  });

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [department, setDepartment] = useState('all');
  const [course, setCourse] = useState('all');
  const [academicYear, setAcademicYear] = useState('all');
  const [studyYear, setStudyYear] = useState('all');
  const [semester, setSemester] = useState('all');
  const [unit, setUnit] = useState('all');
  const [availability, setAvailability] = useState('all');

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch filter metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.getFilterOptions();
        setFilterOptions(res);
      } catch (e) {
        console.error('Filter options error:', e);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch filtered lecturers
  const fetchLecturers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (department !== 'all') params.department = department;
      if (course !== 'all') params.course = course;
      if (academicYear !== 'all') params.academicYear = academicYear;
      if (studyYear !== 'all') params.studyYear = studyYear;
      if (semester !== 'all') params.semester = semester;
      if (unit !== 'all') params.unit = unit;
      if (availability !== 'all') params.availability = availability;

      const res = await api.searchLecturers(params);
      if (res.success) {
        setLecturers(res.lecturers || []);
      }
    } catch (err) {
      console.error('Fetch lecturers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLecturers();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, department, course, academicYear, studyYear, semester, unit, availability]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDepartment('all');
    setCourse('all');
    setAcademicYear('all');
    setStudyYear('all');
    setSemester('all');
    setUnit('all');
    setAvailability('all');
  };

  const hasActiveFilters =
    searchTerm ||
    department !== 'all' ||
    course !== 'all' ||
    academicYear !== 'all' ||
    studyYear !== 'all' ||
    semester !== 'all' ||
    unit !== 'all' ||
    availability !== 'all';

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Lecturer Directory &amp; Office Locator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search academic staff, inspect teaching records, and book consultation sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMap}
            className="px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 transition flex items-center gap-2 shadow-xs"
          >
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Interactive Campus Map</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Smart Search & Filter Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Main Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by lecturer name (Dr. Kamau), unit code (BIT220), unit name (Database Systems), or course..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAdvanced(prev => !prev)}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                showAdvanced
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 border-blue-300 dark:border-blue-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-600" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
            {/* Department */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Departments</option>
                {filterOptions.departments?.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Courses</option>
                {filterOptions.courses?.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Unit Code / Name
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Units</option>
                {filterOptions.units?.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Academic Years</option>
                {filterOptions.academicYears?.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Study Year */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Study Year
              </label>
              <select
                value={studyYear}
                onChange={(e) => setStudyYear(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="all">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            {/* Availability Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Availability Status
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
              >
                <option value="all">Any Status</option>
                <option value="available">Available (🟢)</option>
                <option value="busy">Busy (🔴)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{lecturers.length}</strong> academic faculty member{lecturers.length === 1 ? '' : 's'}
        </span>
        {hasActiveFilters && (
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            Active filters applied
          </span>
        )}
      </div>

      {/* Results Rendering */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 animate-spin text-blue-500" />
          <span>Querying university registry...</span>
        </div>
      ) : lecturers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200">
            No lecturers found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to see more results.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {lecturers.map((lec) => {
            const isAvailable = lec.availabilityStatus === 'available';

            return (
              <div
                key={lec._id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600/60 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar: Status & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={lec.name} size="lg" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {lec.availabilityStatus}
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {lec.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {lec.title}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenQR(lec)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                      title="Generate vCard QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Office Location Badge */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                        <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{lec.office?.building}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px]">
                        {lec.office?.roomNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lec.office?.floor || 'Main Campus'} • {lec.department}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{lec.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{lec.email}</span>
                    </div>
                  </div>

                  {/* Teaching History Pills */}
                  {lec.teachingHistory && lec.teachingHistory.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Assigned Units &amp; History
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {lec.teachingHistory.slice(0, 3).map((th, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-slate-700"
                            title={`${th.unitName} (${th.academicYear}, Sem ${th.semester})`}
                          >
                            {th.unitCode} ({th.academicYear})
                          </span>
                        ))}
                        {lec.teachingHistory.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{lec.teachingHistory.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Bottom */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => onSelectLecturer(lec.lecturerId)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <button
                    onClick={() => onBookAppointment(lec)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Slot</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Lecturer</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Office Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Teaching Units</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {lecturers.map((lec) => {
                  const isAvailable = lec.availabilityStatus === 'available';
                  return (
                    <tr key={lec._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={lec.name} size="sm" />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {lec.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{lec.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{lec.department}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {lec.office?.building}
                        </span>{' '}
                        • {lec.office?.roomNumber}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[11px]">
                          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className={isAvailable ? 'text-emerald-600' : 'text-rose-600'}>
                            {lec.availabilityStatus}
                          </span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {lec.teachingHistory?.slice(0, 2).map((th, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">
                              {th.unitCode}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onSelectLecturer(lec.lecturerId)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-semibold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onBookAppointment(lec)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Book
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
