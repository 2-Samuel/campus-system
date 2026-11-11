import express from 'express';
import { db } from '../services/dbService.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to simulate Email & SMS
const dispatchUniversityAlert = ({ toEmail, toPhone, subject, text, type }) => {
  console.log(`\n================== [AUTOMATED UNIVERSITY ALERT] ==================`);
  console.log(`[EMAIL DISPATCH] To: ${toEmail} | Subject: ${subject}`);
  console.log(`[EMAIL BODY] ${text}`);
  if (toPhone) {
    console.log(`[SMS DISPATCH] To: ${toPhone} | Message: ${text.slice(0, 140)}`);
  }
  console.log(`==================================================================\n`);
};

// Get Appointments (Role-aware)
router.get('/', verifyAuth, async (req, res) => {
  try {
    const { role, profileId } = req.user;
    let appointments = [];

    if (role === 'admin') {
      appointments = await db.find('appointments', {});
    } else if (role === 'lecturer') {
      appointments = await db.find('appointments', { lecturerId: profileId });
    } else {
      appointments = await db.find('appointments', { studentId: profileId });
    }

    // Enrich appointments with Student & Lecturer names and details
    const students = await db.find('students', {});
    const lecturers = await db.find('lecturers', {});

    const enriched = appointments.map(apt => {
      const student = students.find(s => s.studentId === apt.studentId);
      const lecturer = lecturers.find(l => l.lecturerId === apt.lecturerId);

      return {
        ...apt,
        studentName: student ? student.name : apt.studentId,
        studentEmail: student ? student.email : '',
        studentCourse: student ? student.course : '',
        studentPhone: student ? student.phone : '',
        lecturerName: lecturer ? lecturer.name : apt.lecturerId,
        lecturerTitle: lecturer ? lecturer.title : '',
        lecturerEmail: lecturer ? lecturer.email : '',
        lecturerOffice: lecturer?.office ? `${lecturer.office.building} - ${lecturer.office.roomNumber}` : ''
      };
    });

    // Sort descending by date
    enriched.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    res.json({ success: true, count: enriched.length, appointments: enriched });
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

// Book Appointment with Double-Booking Prevention
router.post('/', verifyAuth, async (req, res) => {
  try {
    const { lecturerId, date, time, reason } = req.body;
    const studentId = req.user.role === 'student' ? req.user.profileId : req.body.studentId;

    if (!lecturerId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Lecturer, Date, Time, Reason) are required to book an appointment.'
      });
    }

    // Check Double-Booking for Lecturer at exact Date and Time
    const existingApt = await db.findOne('appointments', {
      lecturerId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingApt) {
      return res.status(409).json({
        success: false,
        message: `Conflict: This lecturer already has an active appointment on ${date} at ${time}. Please choose another time slot.`
      });
    }

    // Check if the student already has an overlapping appointment at this time
    const studentConflict = await db.findOne('appointments', {
      studentId,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (studentConflict) {
      return res.status(409).json({
        success: false,
        message: `Schedule Conflict: You already have another appointment scheduled on ${date} at ${time}.`
      });
    }

    const newApt = await db.insert('appointments', {
      studentId,
      lecturerId,
      date,
      time,
      reason,
      status: 'pending',
      notes: ''
    });

    const student = await db.findOne('students', { studentId });
    const lecturer = await db.findOne('lecturers', { lecturerId });

    // In-App Notification to Lecturer
    await db.insert('notifications', {
      userId: lecturerId,
      role: 'lecturer',
      title: 'New Consultation Request',
      message: `${student?.name || 'A student'} booked an appointment for ${date} at ${time} regarding "${reason}".`,
      type: 'system',
      read: false
    });

    // In-App Notification to Student
    await db.insert('notifications', {
      userId: studentId,
      role: 'student',
      title: 'Appointment Request Submitted',
      message: `Your appointment request with ${lecturer?.name || 'Lecturer'} on ${date} at ${time} is pending confirmation.`,
      type: 'system',
      read: false
    });

    // Dispatch Alerts
    if (lecturer?.email) {
      dispatchUniversityAlert({
        toEmail: lecturer.email,
        toPhone: lecturer.phone,
        subject: `New Appointment Request from ${student?.name || studentId}`,
        text: `Hello ${lecturer.name},\n${student?.name} (${student?.course || 'Student'}) has requested an appointment on ${date} at ${time}.\nReason: ${reason}\nPlease log in to accept or decline.`,
        type: 'email'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully! Awaiting lecturer confirmation.',
      appointment: newApt
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to book appointment' });
  }
});

// Update Status (Accept / Decline / Cancel / Complete)
router.put('/:id/status', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowed = ['pending', 'confirmed', 'declined', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status' });
    }

    const apt = await db.findById('appointments', id);
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const updates = { status };
    if (notes !== undefined) updates.notes = notes;

    const updated = await db.findByIdAndUpdate('appointments', id, updates);

    const student = await db.findOne('students', { studentId: apt.studentId });
    const lecturer = await db.findOne('lecturers', { lecturerId: apt.lecturerId });

    // In-App Notification to Student
    let notifType = 'system';
    let notifTitle = `Appointment ${status.toUpperCase()}`;
    if (status === 'confirmed') notifType = 'appointment_confirmed';
    if (status === 'declined' || status === 'cancelled') notifType = 'appointment_cancelled';

    await db.insert('notifications', {
      userId: apt.studentId,
      role: 'student',
      title: notifTitle,
      message: `Your appointment on ${apt.date} at ${apt.time} with ${lecturer?.name || 'Lecturer'} is now ${status}. ${notes ? `Note: ${notes}` : ''}`,
      type: notifType,
      read: false
    });

    // Alert dispatch
    if (student?.email) {
      dispatchUniversityAlert({
        toEmail: student.email,
        toPhone: student.phone,
        subject: `Appointment ${status.toUpperCase()} - ${lecturer?.name}`,
        text: `Dear ${student.name},\nYour appointment on ${apt.date} at ${apt.time} with ${lecturer?.name} has been ${status}.\nLocation: ${lecturer?.office?.building || 'Main Campus'}, ${lecturer?.office?.roomNumber || ''}\n${notes ? `Remarks: ${notes}` : ''}`,
        type: 'email'
      });
    }

    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Reschedule Appointment
router.put('/:id/reschedule', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime, reason } = req.body;

    if (!newDate || !newTime) {
      return res.status(400).json({ success: false, message: 'New date and new time are required.' });
    }

    const apt = await db.findById('appointments', id);
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Check double-booking for the lecturer on new slot
    const conflict = await db.findOne('appointments', {
      lecturerId: apt.lecturerId,
      date: newDate,
      time: newTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict && conflict._id !== id) {
      return res.status(409).json({
        success: false,
        message: 'The selected new time slot is already booked for this lecturer.'
      });
    }

    const oldDate = apt.date;
    const oldTime = apt.time;

    const updated = await db.findByIdAndUpdate('appointments', id, {
      date: newDate,
      time: newTime,
      rescheduledFrom: `${oldDate} at ${oldTime}`,
      status: 'pending',
      notes: reason ? `Rescheduled: ${reason}` : 'Rescheduled by user'
    });

    const student = await db.findOne('students', { studentId: apt.studentId });
    const lecturer = await db.findOne('lecturers', { lecturerId: apt.lecturerId });

    // In-App Notification to both parties
    await db.insert('notifications', {
      userId: apt.lecturerId,
      role: 'lecturer',
      title: 'Appointment Rescheduled',
      message: `${student?.name || 'Student'} rescheduled their appointment from ${oldDate} ${oldTime} to ${newDate} at ${newTime}.`,
      type: 'appointment_rescheduled',
      read: false
    });

    await db.insert('notifications', {
      userId: apt.studentId,
      role: 'student',
      title: 'Appointment Reschedule Submitted',
      message: `Your appointment with ${lecturer?.name} has been rescheduled to ${newDate} at ${newTime}. Awaiting re-confirmation.`,
      type: 'system',
      read: false
    });

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully!',
      appointment: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reschedule appointment' });
  }
});

// Trigger Reminder Simulation
router.post('/:id/remind', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const apt = await db.findById('appointments', id);
    if (!apt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    const student = await db.findOne('students', { studentId: apt.studentId });
    const lecturer = await db.findOne('lecturers', { lecturerId: apt.lecturerId });

    await db.insert('notifications', {
      userId: apt.studentId,
      role: 'student',
      title: 'Appointment Reminder',
      message: `Friendly reminder: Consultation with ${lecturer?.name} is on ${apt.date} at ${apt.time} in ${lecturer?.office?.building}, ${lecturer?.office?.roomNumber}.`,
      type: 'appointment_reminder',
      read: false
    });

    dispatchUniversityAlert({
      toEmail: student?.email || '',
      toPhone: student?.phone || '',
      subject: `Upcoming Appointment Reminder: ${lecturer?.name}`,
      text: `Hello ${student?.name},\nThis is a reminder for your upcoming university consultation with ${lecturer?.name} on ${apt.date} at ${apt.time}.\nVenue: ${lecturer?.office?.building}, ${lecturer?.office?.roomNumber}.`,
      type: 'sms'
    });

    res.json({ success: true, message: 'Appointment reminder alert dispatched via SMS and Email simulation.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send reminder' });
  }
});

export default router;
