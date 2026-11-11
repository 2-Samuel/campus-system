import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BookOpen,
  BookMarked,
  Search,
  Building,
  User,
  GraduationCap,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const CoursesAndUnits = ({ mode = 'units', onSelectLecturer, onBookAppointment }) => {
  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, uRes] = await Promise.all([
          api.getCourses(),
          api.getUnits()
        ]);
        if (cRes.success) setCourses(cRes.courses || []);
        if (uRes.success) setUnits(uRes.units || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUnits = units.filter(u => {
    const matchSearch =
      u.unitCode.toLowerCase().includes(search.toLowerCase()) ||
      u.unitName.toLowerCase().includes(search.toLowerCase());
    const matchCourse = selectedCourse === 'all' || u.course.toLowerCase().includes(selectedCourse.toLowerCase());
    return matchSearch && matchCourse;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
          {mode === 'units' ? 'Academic Curriculum & Enrolled Units' : 'University Degree Courses'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore course structures, academic syllabi, and assigned faculty teaching staff.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search unit by code (BIT220) or title (Database Systems)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full sm:w-64 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium"
        >
          <option value="all">All Degree Courses</option>
          {courses.map(c => (
            <option key={c.courseId} value={c.courseName}>{c.courseName}</option>
          ))}
        </select>
      </div>

      {/* Units List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 animate-spin text-blue-500" />
          <span>Loading curriculum catalog...</span>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 text-xs">No matching units found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredUnits.map((u) => (
            <div
              key={u._id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 shadow-xs flex flex-col justify-between space-y-4 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-lg">
                    {u.unitCode}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Year {u.year} • Semester {u.semester}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {u.unitName}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {u.course}
                </p>

                {u.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                    {u.description}
                  </p>
                )}
              </div>

              {/* Assigned Lecturers */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Assigned Lecturers
                </span>
                {u.assignedLecturers && u.assignedLecturers.length > 0 ? (
                  <div className="space-y-1.5">
                    {u.assignedLecturers.map((lec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={lec.name} size="sm" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {lec.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {lec.academicYear} (Sem {lec.semester})
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectLecturer(lec.lecturerId)}
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 text-blue-600"
                        >
                          Profile
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Faculty allocation in progress.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
