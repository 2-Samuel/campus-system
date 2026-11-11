import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../services/dbService.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Middleware: all routes require Admin role
router.use(verifyAuth, authorizeRoles('admin'));

// ==================== LECTURERS MANAGEMENT ====================
// Add Lecturer
router.post('/lecturers', async (req, res) => {
  try {
    const { name, title, email, phone, department, office, photo, bio, initialPassword } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ success: false, message: 'Name, email, and department are required' });
    }

    const existing = await db.findOne('users', { email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const lecturerId = 'LEC' + Math.floor(100 + Math.random() * 900);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(initialPassword || 'password123', salt);

    // Create user login
    await db.insert('users', {
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'lecturer',
      name,
      profileId: lecturerId
    });

    // Create lecturer record
    const newLecturer = await db.insert('lecturers', {
      lecturerId,
      name,
      title: title || 'Lecturer',
      email: email.toLowerCase(),
      phone: phone || '0700000000',
      department,
      office: office || {
        building: 'ICT Block',
        roomNumber: 'Room 101',
        floor: '1st Floor',
        coordinates: { x: 50, y: 50 }
      },
      photo: photo || '',
      bio: bio || '',
      availabilityStatus: 'available',
      officeHoursNotes: 'Standard office hours'
    });

    res.status(201).json({ success: true, message: 'Lecturer created successfully', lecturer: newLecturer });
  } catch (error) {
    console.error('Create lecturer error:', error);
    res.status(500).json({ success: false, message: 'Failed to create lecturer' });
  }
});

// Edit Lecturer
router.put('/lecturers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lecturer = (await db.findOne('lecturers', { lecturerId: id })) || (await db.findById('lecturers', id));
    if (!lecturer) return res.status(404).json({ success: false, message: 'Lecturer not found' });

    const updated = await db.findByIdAndUpdate('lecturers', lecturer._id, updates);
    if (updates.name || updates.email) {
      const userUpdates = {};
      if (updates.name) userUpdates.name = updates.name;
      if (updates.email) userUpdates.email = updates.email.toLowerCase();
      await db.update('users', { profileId: lecturer.lecturerId }, userUpdates);
    }

    res.json({ success: true, message: 'Lecturer updated successfully', lecturer: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update lecturer' });
  }
});

// Delete Lecturer
router.delete('/lecturers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lecturer = (await db.findOne('lecturers', { lecturerId: id })) || (await db.findById('lecturers', id));
    if (!lecturer) return res.status(404).json({ success: false, message: 'Lecturer not found' });

    await db.findByIdAndDelete('lecturers', lecturer._id);
    await db.delete('users', { profileId: lecturer.lecturerId });
    await db.delete('teachingHistory', { lecturerId: lecturer.lecturerId });
    await db.delete('availability', { lecturerId: lecturer.lecturerId });

    res.json({ success: true, message: 'Lecturer and associated records removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete lecturer' });
  }
});

// ==================== ASSIGN LECTURER TO UNIT ====================
router.post('/assign-lecturer', async (req, res) => {
  try {
    const { lecturerId, unitCode, academicYear, semester, studyYear } = req.body;

    if (!lecturerId || !unitCode || !academicYear) {
      return res.status(400).json({ success: false, message: 'Lecturer, Unit code, and Academic Year are required' });
    }

    const assignment = await db.insert('teachingHistory', {
      lecturerId,
      unitCode,
      academicYear,
      semester: Number(semester) || 1,
      studyYear: Number(studyYear) || 2
    });

    res.status(201).json({ success: true, message: 'Lecturer assigned to unit successfully', assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign lecturer' });
  }
});

// ==================== STUDENTS MANAGEMENT ====================
router.get('/students', async (req, res) => {
  try {
    const students = await db.find('students', {});
    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { studentId, name, email, course, year, department, initialPassword } = req.body;
    if (!studentId || !name || !email || !course) {
      return res.status(400).json({ success: false, message: 'Missing required student details' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(initialPassword || 'password123', salt);

    await db.insert('users', {
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      name,
      profileId: studentId
    });

    const newStudent = await db.insert('students', {
      studentId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      course,
      year: Number(year) || 1,
      semester: 1,
      department: department || 'School of Computing & Informatics'
    });

    res.status(201).json({ success: true, message: 'Student created successfully', student: newStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create student' });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = (await db.findOne('students', { studentId: id })) || (await db.findById('students', id));
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await db.findByIdAndDelete('students', student._id);
    await db.delete('users', { profileId: student.studentId });
    await db.delete('appointments', { studentId: student.studentId });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete student' });
  }
});

// ==================== UNIVERSITY ANALYTICS & REPORTS ====================
router.get('/reports', async (req, res) => {
  try {
    const lecturers = await db.find('lecturers', {});
    const students = await db.find('students', {});
    const courses = await db.find('courses', {});
    const units = await db.find('units', {});
    const appointments = await db.find('appointments', {});
    const history = await db.find('teachingHistory', {});

    // Metrics
    const totalLecturers = lecturers.length;
    const totalStudents = students.length;
    const totalCourses = courses.length;
    const totalUnits = units.length;
    const totalAppointments = appointments.length;

    const confirmedApts = appointments.filter(a => a.status === 'confirmed').length;
    const pendingApts = appointments.filter(a => a.status === 'pending').length;
    const cancelledApts = appointments.filter(a => a.status === 'cancelled' || a.status === 'declined').length;
    const completedApts = appointments.filter(a => a.status === 'completed').length;

    // Department Breakdown
    const deptBreakdown = {};
    lecturers.forEach(l => {
      deptBreakdown[l.department] = (deptBreakdown[l.department] || 0) + 1;
    });

    // Top Consulted Lecturers
    const lecturerWorkload = {};
    appointments.forEach(a => {
      lecturerWorkload[a.lecturerId] = (lecturerWorkload[a.lecturerId] || 0) + 1;
    });

    const topLecturers = lecturers.map(l => ({
      lecturerId: l.lecturerId,
      name: l.name,
      department: l.department,
      appointmentCount: lecturerWorkload[l.lecturerId] || 0
    })).sort((a, b) => b.appointmentCount - a.appointmentCount);

    res.json({
      success: true,
      summary: {
        totalLecturers,
        totalStudents,
        totalCourses,
        totalUnits,
        totalAppointments,
        confirmedApts,
        pendingApts,
        cancelledApts,
        completedApts,
        activeAvailabilityRatio: Math.round((lecturers.filter(l => l.availabilityStatus === 'available').length / (totalLecturers || 1)) * 100)
      },
      deptBreakdown,
      topLecturers,
      recentAppointments: appointments.slice(-8).reverse()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

export default router;
