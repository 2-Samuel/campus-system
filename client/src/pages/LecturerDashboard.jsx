import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  Building,
  User,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Sparkles,
  BookOpen,
  Phone,
  Mail,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Avatar } from '../components/Avatar';

export const LecturerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [teachingHistory, setTeachingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit fields
  const [phone, setPhone] = useState('');
  const [building, setBuilding] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bio, setBio] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [officeHoursNotes, setOfficeHoursNotes] = useState('');

  // Add Availability Slot state
  const [newDay, setNewDay] = useState('Monday');
  const [newStart, setNewStart] = useState('08:00 AM');
  const [newEnd, setNewEnd] = useState('12:00 PM');
  const [newDuration, setNewDuration] = useState('30');
  const [showAddSlot, setShowAddSlot] = useState(false);

  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [lecRes, aptsRes] = await Promise.all([
        api.getLecturerById(user?.profileId || 'LEC001'),
        api.getAppointments()
      ]);

      if (lecRes.success && lecRes.lecturer) {
        const l = lecRes.lecturer;
        setProfile(l);
        setPhone(l.phone || '');
        setBuilding(l.office?.building || 'ICT Block');
        setRoomNumber(l.office?.roomNumber || 'Room 204');
        setBio(l.bio || '');
        setAvailabilityStatus(l.availabilityStatus || 'available');
        setOfficeHoursNotes(l.officeHoursNotes || '');
        setAvailability(l.availability || []);
        setTeachingHistory(l.teachingHistory || []);
      }

      if (aptsRes.success) {
        setAppointments(aptsRes.appointments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback('');

    try {
      const res = await api.updateLecturerProfile(profile.lecturerId, {
        phone,
        availabilityStatus,
        bio,
        officeHoursNotes,
        office: {
          ...profile.office,
          building,
          roomNumber
        }
      });

      if (res.success) {
        setFeedback('Lecturer profile & office coordinates updated successfully!');
        setProfile(res.lecturer);
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  // Toggle quick status
  const handleToggleStatus = async () => {
    const nextStatus = availabilityStatus === 'available' ? 'busy' : 'available';
    setAvailabilityStatus(nextStatus);
    try {
      await api.updateLecturerProfile(profile.lecturerId, { availabilityStatus: nextStatus });
    } catch (e) {
      console.error(e);
    }
  };

  // Add office availability slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addAvailabilitySlot(profile.lecturerId, {
        day: newDay,
        startTime: newStart,
        endTime: newEnd,
        slotDuration: Number(newDuration)
      });
      if (res.success) {
        setAvailability(prev => [...prev, res.slot]);
        setShowAddSlot(false);
        setFeedback('Office availability slot added!');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      setError('Failed to add slot');
    }
  };

  // Delete slot
  const handleDeleteSlot = async (slotId) => {
    try {
      await api.deleteAvailabilitySlot(profile.lecturerId, slotId);
      setAvailability(prev => prev.filter(s => s._id !== slotId));
    } catch (err) {
      console.error(err);
    }
  };

  // Accept / Decline Appointment
  const handleAppointmentStatus = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      setAppointments(prev =>
        prev.map(a => (a._id === id ? { ...a, status } : a))
      );
      setFeedback(`Appointment ${status} successfully!`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 animate-spin text-blue-500" />
        <span>Loading Lecturer Faculty Workspace...</span>
      </div>
    );
  }

  const isAvailable = availabilityStatus === 'available';
  const pendingApts = appointments.filter(a => a.status === 'pending');
  const confirmedApts = appointments.filter(a => a.status === 'confirmed');

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Status Switch */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.name || user?.name} size="xl" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {profile?.lecturerId}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                {profile?.department}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">
              {profile?.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile?.title} • {building}, {roomNumber}
            </p>
          </div>
        </div>

        {/* Live Availability Toggle Button */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between sm:justify-start gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Office Status
            </span>
            <span className={`text-sm font-bold flex items-center gap-1.5 ${
              isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="capitalize">{availabilityStatus}</span>
            </span>
          </div>

          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition ${
              isAvailable
                ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            Switch to {isAvailable ? 'Busy (🔴)' : 'Available (🟢)'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Grid: Consultation Requests & Office Hours Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Student Consultation Requests */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Pending Consultation Requests
              </h3>
            </div>
            {pendingApts.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                {pendingApts.length} pending
              </span>
            )}
          </div>

          <div className="space-y-3">
            {pendingApts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No pending requests. All consultation bookings are up to date!
              </p>
            ) : (
              pendingApts.map((apt) => (
                <div
                  key={apt._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {apt.studentName}
                    </span>
                    <span className="font-mono text-slate-500 font-semibold">
                      {apt.date} at {apt.time}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{apt.reason}"
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleAppointmentStatus(apt._id, 'declined')}
                      className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 text-xs font-semibold"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAppointmentStatus(apt._id, 'confirmed')}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                    >
                      Accept Consultation
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Office Availability Hours Manager */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Office Availability Schedule
              </h3>
            </div>
            <button
              onClick={() => setShowAddSlot(prev => !prev)}
              className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Hours</span>
            </button>
          </div>

          {/* Add Slot Sub-form */}
          {showAddSlot && (
            <form onSubmit={handleAddSlot} className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3 text-xs animate-in fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Slot Duration
                  </label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    placeholder="12:00 PM"
                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddSlot(false)}
                  className="px-3 py-1 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Save Office Slot
                </button>
              </div>
            </form>
          )}

          {/* Availability Slots List */}
          <div className="space-y-2">
            {availability.map((slot) => (
              <div
                key={slot._id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {slot.day}
                  </span>
                </div>
                <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">
                  {slot.startTime} - {slot.endTime}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    ({slot.slotDuration} min)
                  </span>
                  <button
                    onClick={() => handleDeleteSlot(slot._id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Profile Editor & Teaching History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Office & Profile Edit Form */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              Update Office Location &amp; Contact Info
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Building Name
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. ICT Block"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 204"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Office Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Lecturer Bio &amp; Research Focus
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Office Hours Note for Students
              </label>
              <input
                type="text"
                value={officeHoursNotes}
                onChange={(e) => setOfficeHoursNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Office &amp; Profile Details</span>
              </button>
            </div>
          </form>
        </div>

        {/* Teaching History Cards */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
              My Teaching History
            </h3>
          </div>

          <div className="space-y-2.5">
            {teachingHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {item.unitCode}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {item.academicYear}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {item.unitName || item.unitCode}
                </p>
                <span className="text-[10px] text-slate-400">
                  Year {item.studyYear} • Semester {item.semester}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
