import React, { useState } from 'react';
import {
  MapPin,
  Building,
  Navigation,
  Compass,
  Phone,
  Mail,
  Calendar,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { Avatar } from './Avatar';

const buildings = [
  { id: 'ict', name: 'ICT Block', color: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40', x: '18%', y: '25%', w: '26%', h: '32%', desc: 'Computing & Software Labs' },
  { id: 'science', name: 'Science Complex', color: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40', x: '58%', y: '22%', w: '30%', h: '30%', desc: 'Cybersecurity & Physics Labs' },
  { id: 'business', name: 'Business Towers', color: 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40', x: '15%', y: '65%', w: '32%', h: '28%', desc: 'Economics & Quantitative Labs' },
  { id: 'engineering', name: 'Engineering Wing', color: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40', x: '55%', y: '60%', w: '34%', h: '32%', desc: 'Hardware & IoT Workshops' }
];

export const CampusMapModal = ({ isOpen, onClose, lecturers = [], onSelectLecturer, onBookAppointment }) => {
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [activeFloor, setActiveFloor] = useState('All Floors');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                University Campus Office Locator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive spatial floorplan & lecturer office locations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Available</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 ml-2" />
              <span>Busy</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Map + Sidebar Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
          {/* Map Canvas */}
          <div className="lg:col-span-2 relative bg-slate-100 dark:bg-slate-950 p-6 min-h-[380px] lg:min-h-[500px] flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            {/* Campus Layout Vector Representation */}
            <div className="relative w-full h-full max-w-2xl aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-4">
              {/* Central Quad / Lawn */}
              <div className="absolute inset-[38%_36%] rounded-2xl bg-emerald-100/60 dark:bg-emerald-950/30 border border-emerald-300/40 dark:border-emerald-800/40 flex flex-col items-center justify-center text-center p-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Central Campus Quad
                </span>
                <span className="text-[9px] text-emerald-600/80">Fountain & Walkways</span>
              </div>

              {/* Campus Buildings */}
              {buildings.map((b) => (
                <div
                  key={b.id}
                  style={{ left: b.x, top: b.y, width: b.w, height: b.h }}
                  className={`absolute rounded-xl border-2 p-2.5 transition-all shadow-xs flex flex-col justify-between ${b.color}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {b.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {b.desc}
                      </p>
                    </div>
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}

              {/* Lecturer Office Pins */}
              {lecturers.map((lec) => {
                const isSelected = selectedLecturer?._id === lec._id;
                const coords = lec.office?.coordinates || { x: 50, y: 50 };
                const isAvailable = lec.availabilityStatus === 'available';

                return (
                  <button
                    key={lec._id}
                    onClick={() => setSelectedLecturer(lec)}
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-transform ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                    }`}
                  >
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`p-1.5 rounded-full shadow-lg border-2 flex items-center justify-center ${
                          isAvailable
                            ? 'bg-emerald-600 border-white text-white'
                            : 'bg-rose-600 border-white text-white'
                        } ${isSelected ? 'ring-4 ring-blue-500/50' : ''}`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </div>

                      {/* Tooltip Badge */}
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition shadow-md pointer-events-none">
                        {lec.name} ({lec.office?.roomNumber})
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lecturer Quick Inspector Panel */}
          <div className="p-6 flex flex-col justify-between overflow-y-auto bg-white dark:bg-slate-900">
            {selectedLecturer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedLecturer.name} size="lg" />
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider mb-1 ${
                        selectedLecturer.availabilityStatus === 'available'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedLecturer.availabilityStatus === 'available'
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      {selectedLecturer.availabilityStatus}
                    </span>
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                      {selectedLecturer.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedLecturer.title} • {selectedLecturer.department}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
                    <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Office Details</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    Building: <strong className="text-slate-900 dark:text-white">{selectedLecturer.office?.building}</strong>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    Room: <strong className="text-slate-900 dark:text-white">{selectedLecturer.office?.roomNumber}</strong> ({selectedLecturer.office?.floor || 'Main'})
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedLecturer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{selectedLecturer.email}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onBookAppointment) onBookAppointment(selectedLecturer);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Appointment with {selectedLecturer.name.split(' ')[1] || 'Lecturer'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
                <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
                <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Select a Lecturer Pin
                </p>
                <p className="max-w-[200px]">
                  Click on any pin on the campus map to see office floor, contact details, and schedule.
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center">
              Campus Navigator v2.6 • Real-time GPS &amp; Room Sync
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
