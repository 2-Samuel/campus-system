import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Building,
  Phone,
  Mail,
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  QrCode,
  MessageSquare,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const LecturerProfileView = ({ lecturerId, onBack, onBookAppointment, onOpenQR, onOpenChat, onOpenMap }) => {
  const [lecturer, setLecturer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.getLecturerById(lecturerId);
        if (res.success) {
          setLecturer(res.lecturer);
        }
      } catch (err) {
        console.error('Error fetching lecturer profile:', err);
      } finally {
        setLoading(false);
      }
    };
    if (lecturerId) fetchProfile();
  }, [lecturerId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading lecturer profile details...</span>
      </div>
    );
  }

  if (!lecturer) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 mb-4">Lecturer profile not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const isAvailable = lecturer.availabilityStatus === 'available';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lecturer Directory</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar name={lecturer.name} size="2xl" />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                  <span>{lecturer.availabilityStatus}</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {lecturer.lecturerId}</span>
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
                {lecturer.name}
              </h1>

              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {lecturer.title} • {lecturer.department}
              </p>

              {lecturer.bio && (
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed pt-1">
                  {lecturer.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-col gap-2.5 justify-end">
            <button
              onClick={() => onBookAppointment(lecturer)}
              className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => onOpenChat(lecturer.lecturerId)}
              className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Message Lecturer</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => onOpenQR(lecturer)}
                className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
                title="vCard QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR vCard</span>
              </button>

              <button
                onClick={onOpenMap}
                className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition"
                title="Locate Office"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>Campus Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Office Details & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Office Location & Contact Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Office Location &amp; Contact Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official physical and virtual coordinates
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Building &amp; Wing
                </span>
                <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  {lecturer.office?.building}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lecturer.office?.floor || 'Main Campus'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Room
                </span>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-blue-200">
                  {lecturer.office?.roomNumber}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Phone Number</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {lecturer.phone}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-500" />
                <span>University Email</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                {lecturer.email}
              </span>
            </div>

            {lecturer.officeHoursNotes && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                Note: {lecturer.officeHoursNotes}
              </p>
            )}
          </div>
        </div>

        {/* Office Hours & Availability Schedule */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Weekly Office Hours
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dedicated student consultation availability
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {lecturer.availability && lecturer.availability.length > 0 ? (
              lecturer.availability.map((slot) => (
                <div
                  key={slot._id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-heading font-bold text-slate-900 dark:text-white">
                      {slot.day}
                    </span>
                  </div>
                  <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {slot.startTime} - {slot.endTime}
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-white dark:bg-slate-900 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
                    {slot.slotDuration || 30} mins
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                No fixed weekly office hours configured. Consultations by appointment only.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Teaching History Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Teaching History &amp; Academic Units
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Course units lectured across past and current academic years
              </p>
            </div>
          </div>
        </div>

        {lecturer.teachingHistory && lecturer.teachingHistory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lecturer.teachingHistory.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:border-blue-400 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded">
                    {item.unitCode}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {item.academicYear}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {item.unitName || item.unitCode}
                </h4>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                  <span>Year {item.studyYear}</span>
                  <span>•</span>
                  <span>Semester {item.semester}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">
            No teaching history records cataloged.
          </p>
        )}
      </div>
    </div>
  );
};
