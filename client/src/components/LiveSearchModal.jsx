import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  Search,
  BookOpen,
  User,
  GraduationCap,
  ArrowRight,
  X,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Avatar } from './Avatar';

export const LiveSearchModal = ({ isOpen, onClose, onSelectLecturer, onSelectUnit }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ units: [], lecturers: [], courses: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ units: [], lecturers: [], courses: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ units: [], lecturers: [], courses: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.getSuggestions(query.trim());
        setResults(res);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else if (inputRef.current) inputRef.current.focus();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalResults = results.units.length + results.lecturers.length + results.courses.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type 'database', 'Kamau', 'BIT220', or 'Information Technology'..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Suggestion Results Body */}
        <div className="p-4 overflow-y-auto space-y-5">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-blue-500" />
              <span>Searching campus registry...</span>
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No direct matches found for "<span className="font-semibold">{query}</span>".
            </div>
          )}

          {!query && (
            <div className="py-6 px-2 text-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">
                Suggested Quick Queries
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Database Systems', 'BIT220', 'Dr. Kamau', 'Artificial Intelligence', 'BCS310', 'ICT Block'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Units Category */}
          {results.units.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Units</span>
              </div>
              <div className="space-y-1">
                {results.units.map((u) => (
                  <button
                    key={u.code}
                    onClick={() => {
                      if (onSelectUnit) onSelectUnit(u.code);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition text-left group"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded font-mono font-bold">
                          {u.code}
                        </span>
                        <span>{u.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {u.course}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lecturers Category */}
          {results.lecturers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>Lecturers</span>
              </div>
              <div className="space-y-1">
                {results.lecturers.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      if (onSelectLecturer) onSelectLecturer(l.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={l.name} size="sm" />
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{l.name}</span>
                          <span className="text-xs text-slate-400 font-normal">
                            ({l.title})
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {l.office}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>{l.department}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          l.status === 'available' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        title={l.status === 'available' ? 'Available' : 'Busy'}
                      />
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Courses Category */}
          {results.courses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                <span>Courses</span>
              </div>
              <div className="space-y-1">
                {results.courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {c.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Code: {c.id} • {c.department}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
