import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  Building,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Bell,
  Printer,
  FileDown,
  MessageSquare,
  Sparkles,
  Filter
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { RescheduleModal } from '../components/RescheduleModal';

export const MyAppointments = ({ onOpenChat, onSelectLecturer }) => {
  const { user, role } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeRescheduleApt, setActiveRescheduleApt] = useState(null);
  const [alertFeedback, setAlertFeedback] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.getAppointments();
      if (res.success) {
        setAppointments(res.appointments || []);
      }
    } catch (e) {
      console.error('Fetch appointments error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.updateAppointmentStatus(id, newStatus);
      if (res.success) {
        setAlertFeedback(`Appointment marked as ${newStatus}`);
        fetchAppointments();
        setTimeout(() => setAlertFeedback(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReminder = async (id) => {
    try {
      const res = await api.sendAppointmentReminder(id);
      if (res.success) {
        setAlertFeedback('Reminder simulation dispatched via SMS and University Email!');
        setTimeout(() => setAlertFeedback(''), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
      case 'cancelled':
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            <span className="capitalize">{status}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!activeRescheduleApt}
        onClose={() => setActiveRescheduleApt(null)}
        appointment={activeRescheduleApt}
        onRescheduled={() => fetchAppointments()}
      />

      {/* Header & Print Report Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Consultation Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your academic consultation slots, confirmations, and reschedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Docket / PDF</span>
          </button>
        </div>
      </div>

      {alertFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{alertFeedback}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Appointments' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'pending', label: 'Pending' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 animate-spin text-blue-500" />
          <span>Loading consultation records...</span>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-slate-800 dark:text-slate-200">
            No {statusFilter !== 'all' ? statusFilter : ''} appointments found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Book an appointment with any faculty lecturer through the Lecturer Directory.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const isConfirmed = apt.status === 'confirmed';
            const isPending = apt.status === 'pending';
            const partnerName = role === 'student' ? apt.lecturerName : apt.studentName;
            const partnerRole = role === 'student' ? 'Lecturer' : 'Student';

            return (
              <div
                key={apt._id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-slate-300 transition"
              >
                {/* Left Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(apt.status)}
                    <span className="text-xs font-mono text-slate-400">
                      Ref: #{apt._id.slice(-6)}
                    </span>
                    {apt.rescheduledFrom && (
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-medium border border-amber-200">
                        Rescheduled from {apt.rescheduledFrom}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar name={partnerName || 'User'} size="md" />
                    <div>
                      <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                        {partnerName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {partnerRole} • {role === 'student' ? apt.lecturerOffice : apt.studentCourse}
                      </p>
                    </div>
                  </div>

                  {/* Date, Time & Venue */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <strong>{apt.date}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <strong>{apt.time}</strong>
                    </span>
                    {apt.lecturerOffice && (
                      <span className="flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-purple-500" />
                        <span>{apt.lecturerOffice}</span>
                      </span>
                    )}
                  </div>

                  {/* Consultation Reason */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                      Consultation Purpose
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      "{apt.reason}"
                    </p>
                    {apt.notes && (
                      <p className="text-slate-500 dark:text-slate-400 mt-1 italic">
                        Notes: {apt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap lg:flex-col gap-2 justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Student / Lecturer specific actions */}
                  {role === 'lecturer' && isPending && (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                      >
                        Accept Slot
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'declined')}
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {role === 'lecturer' && isConfirmed && (
                    <button
                      onClick={() => handleUpdateStatus(apt._id, 'completed')}
                      className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                    >
                      Mark Completed
                    </button>
                  )}

                  {/* Student Reschedule button */}
                  {(isPending || isConfirmed) && (
                    <button
                      onClick={() => setActiveRescheduleApt(apt)}
                      className="py-2 px-3 rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs font-semibold hover:bg-amber-100 transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reschedule</span>
                    </button>
                  )}

                  {/* Reminder Dispatch (SMS/Email simulation) */}
                  {isConfirmed && (
                    <button
                      onClick={() => handleSendReminder(apt._id)}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1.5"
                      title="Dispatch SMS / Email reminder"
                    >
                      <Bell className="w-3.5 h-3.5 text-blue-500" />
                      <span>Send Reminder</span>
                    </button>
                  )}

                  {/* Cancel button */}
                  {(isPending || isConfirmed) && (
                    <button
                      onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                      className="py-2 px-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-100 transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Session</span>
                    </button>
                  )}

                  {/* Direct chat button */}
                  <button
                    onClick={() => onOpenChat(role === 'student' ? apt.lecturerId : apt.studentId)}
                    className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
