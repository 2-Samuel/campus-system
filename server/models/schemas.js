import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'lecturer', 'admin'], required: true },
  name: { type: String, required: true },
  profileId: { type: String }, // Links to studentId or lecturerId
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: Number, required: true }, // e.g. 2
  semester: { type: Number, default: 1 },
  department: { type: String, default: 'Computer Science & IT' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' }
}, { timestamps: true });

const LecturerSchema = new mongoose.Schema({
  lecturerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String, default: 'Lecturer' }, // Senior Lecturer, Professor, etc.
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  department: { type: String, required: true },
  office: {
    building: { type: String, required: true },
    roomNumber: { type: String, required: true },
    floor: { type: String, default: '2nd Floor' },
    coordinates: {
      x: { type: Number, default: 45 }, // percentage on interactive map
      y: { type: Number, default: 50 }
    }
  },
  photo: { type: String, default: '' },
  bio: { type: String, default: '' },
  availabilityStatus: { type: String, enum: ['available', 'busy', 'away'], default: 'available' },
  officeHoursNotes: { type: String, default: 'Open for student consultations during scheduled slots.' }
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  courseName: { type: String, required: true },
  department: { type: String, required: true },
  durationYears: { type: Number, default: 4 }
}, { timestamps: true });

const UnitSchema = new mongoose.Schema({
  unitCode: { type: String, required: true, unique: true },
  unitName: { type: String, required: true },
  course: { type: String, required: true },
  semester: { type: Number, required: true },
  year: { type: Number, required: true },
  description: { type: String, default: '' },
  credits: { type: Number, default: 3 }
}, { timestamps: true });

const TeachingHistorySchema = new mongoose.Schema({
  lecturerId: { type: String, required: true },
  unitCode: { type: String, required: true },
  academicYear: { type: String, required: true }, // e.g. 2025/2026
  semester: { type: Number, required: true },     // e.g. 1
  studyYear: { type: Number, required: true }      // e.g. 2
}, { timestamps: true });

const AvailabilitySchema = new mongoose.Schema({
  lecturerId: { type: String, required: true },
  day: { type: String, required: true }, // Monday, Tuesday, etc.
  startTime: { type: String, required: true }, // e.g. '08:00 AM'
  endTime: { type: String, required: true },   // e.g. '12:00 PM'
  slotDuration: { type: Number, default: 30 }, // in minutes
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const AppointmentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  lecturerId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // e.g. '03:00 PM'
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined', 'cancelled', 'completed'],
    default: 'pending'
  },
  rescheduledFrom: { type: String, default: null },
  notes: { type: String, default: '' }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['appointment_confirmed', 'appointment_declined', 'appointment_cancelled', 'appointment_rescheduled', 'appointment_reminder', 'new_message', 'system'],
    default: 'system'
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const Lecturer = mongoose.models.Lecturer || mongoose.model('Lecturer', LecturerSchema);
export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export const Unit = mongoose.models.Unit || mongoose.model('Unit', UnitSchema);
export const TeachingHistory = mongoose.models.TeachingHistory || mongoose.model('TeachingHistory', TeachingHistorySchema);
export const Availability = mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
