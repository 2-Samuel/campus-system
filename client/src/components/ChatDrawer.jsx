import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  MessageSquare,
  Send,
  X,
  User,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Avatar } from './Avatar';

export const ChatDrawer = ({ isOpen, onClose, defaultPartnerId = null }) => {
  const { user, role } = useAuth();
  const [partnerId, setPartnerId] = useState(defaultPartnerId || (role === 'student' ? 'LEC001' : 'STU202401'));
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (defaultPartnerId) {
      setPartnerId(defaultPartnerId);
    }
  }, [defaultPartnerId]);

  // Load partners list
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        if (role === 'student') {
          const res = await api.getLecturers();
          if (res.success) {
            setPartners(res.lecturers.map(l => ({ id: l.lecturerId, name: l.name, sub: l.department })));
          }
        } else if (role === 'lecturer') {
          // Lecturer can chat with students they have appointments with
          const apts = await api.getAppointments();
          if (apts.success) {
            const stuMap = new Map();
            apts.appointments.forEach(a => {
              if (a.studentId && !stuMap.has(a.studentId)) {
                stuMap.set(a.studentId, {
                  id: a.studentId,
                  name: a.studentName || a.studentId,
                  sub: a.studentCourse || 'Student'
                });
              }
            });
            if (stuMap.size === 0) {
              stuMap.set('STU202401', { id: 'STU202401', name: 'Alex Kibet', sub: 'Bachelor of IT' });
            }
            setPartners(Array.from(stuMap.values()));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (isOpen) fetchPartners();
  }, [isOpen, role]);

  // Load messages for current partner
  const fetchMessages = async () => {
    if (!partnerId) return;
    try {
      const res = await api.getConversation(partnerId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && partnerId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const text = inputContent.trim();
    setInputContent('');

    try {
      const res = await api.sendMessage(partnerId, text);
      if (res.success) {
        setMessages(prev => [...prev, res.message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!isOpen) return null;

  const currentPartner = partners.find(p => p.id === partnerId) || {
    id: partnerId,
    name: partnerId === 'LEC001' ? 'Dr. John Kamau' : 'Alex Kibet',
    sub: 'Active Consultation'
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Consultation Chat
            </h3>
            <p className="text-[11px] text-slate-400">
              Direct student-to-lecturer messaging
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Partner Switcher Dropdown */}
      <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Chatting with:</span>
        <select
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages Thread Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="text-center py-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            Academic consultation thread with {currentPartner.name}
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No previous messages in this conversation. Say hello!
          </div>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.senderId === user?.profileId;
            return (
              <div
                key={m._id || idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-slate-500">
                    {isMe ? 'You' : m.senderName}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input
          type="text"
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder={`Message ${currentPartner.name.split(' ')[1] || 'here'}...`}
          className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!inputContent.trim()}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-40"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
