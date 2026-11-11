import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  MapPin,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Search,
  MessageSquare
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const StudentDashboard = ({ onNavigateTab, onSelectLecturer, onBookAppointment, onOpenMap, onOpenSearch }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [units, setUnits] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [aptsRes, unitsRes, lecsRes] = await Promise.all([
          api.getAppointments(),
          api.getUnits(),
          api.getLecturers()
        ]);
        if (aptsRes.success) setAppointments(aptsRes.appointments || []);
        if (unitsRes.success) setUnits(unitsRes.units || []);
        if (lecsRes.success) setLecturers(lecsRes.lecturers || []);
      } catch (e) {
        console.error('Student dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingApt = appointments.find(a => a.status === 'confirmed' || a.status === 'pending');
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0A192F] via-[#1E3A8A] to-blue-700 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-200 backdrop-blur-xs uppercase tracking-wider inline-block">
            Student Academic Portal
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Quickly locate lecturers, verify office availability, review teaching history, and schedule one-on-one academic consultation sessions.
          </p>

          <div className="pt-3 flex flex-wrap gap-3">
            <button
              onClick={onOpenSearch}
              className="px-4 py-2.5 bg-white text-[#0A192F] hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Search Lecturers &amp; Units</span>
            </button>

            <button
              onClick={onOpenMap}
              className="px-4 py-2.5 bg-blue-900/60 hover:bg-blue-900 border border-blue-400/40 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-blue-300" />
              <span>Campus Map Locator</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 pointer-events-none blur-2xl" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Confirmed Sessions
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {confirmedCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ready for consultation</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Requests
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {pendingCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting lecturer review</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Lecturers
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {lecturers.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Registered academic faculty</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Curriculum Units
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
            {units.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active departmental units</p>
        </div>
      </div>

      {/* Next Appointment Alert (if any) */}
      {upcomingApt && (
        <div className="p-5 rounded-3xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30 flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                Next Scheduled Consultation
              </span>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-0.5">
                {upcomingApt.lecturerName} • {upcomingApt.date} at {upcomingApt.time}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Venue: <strong>{upcomingApt.lecturerOffice || 'Main Campus Office'}</strong> • Reason: "{upcomingApt.reason}"
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('appointments')}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold self-start sm:self-center transition"
          >
            Manage Session
          </button>
        </div>
      )}

      {/* Two Column Section: Quick Lecturers & Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended / Department Lecturers */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Faculty Lecturers
            </h3>
            <button
              onClick={() => onNavigateTab('lecturers')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {lecturers.slice(0, 4).map((lec) => {
              const isAvailable = lec.availabilityStatus === 'available';
              return (
                <div
                  key={lec._id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-blue-400 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={lec.name} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                          {lec.name}
                        </h4>
                        <span
                          className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lec.office?.building}, {lec.office?.roomNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectLecturer(lec.lecturerId)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => onBookAppointment(lec)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Enrolled Course Units */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Course Units &amp; Assigned Staff
            </h3>
            <button
              onClick={() => onNavigateTab('my-units')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {units.slice(0, 4).map((u) => (
              <div
                key={u._id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                    {u.unitCode}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Year {u.year} • Sem {u.semester}
                  </span>
                </div>
                <h4 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                  {u.unitName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {u.course}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
