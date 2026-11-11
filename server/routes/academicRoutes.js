import express from 'express';
import { db } from '../services/dbService.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ==================== COURSES ====================
router.get('/courses', async (req, res) => {
  try {
    const courses = await db.find('courses', {});
    res.json({ success: true, count: courses.length, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses' });
  }
});

router.post('/courses', verifyAuth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { courseId, courseName, department, durationYears } = req.body;
    if (!courseId || !courseName || !department) {
      return res.status(400).json({ success: false, message: 'Course ID, Name and Department are required' });
    }

    const existing = await db.findOne('courses', { courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }

    const newCourse = await db.insert('courses', {
      courseId: courseId.toUpperCase(),
      courseName,
      department,
      durationYears: Number(durationYears) || 4
    });

    res.status(201).json({ success: true, message: 'Course created successfully', course: newCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add course' });
  }
});

router.delete('/courses/:id', verifyAuth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.findByIdAndDelete('courses', id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete course' });
  }
});

// ==================== UNITS ====================
router.get('/units', async (req, res) => {
  try {
    const units = await db.find('units', {});
    const teachingHistory = await db.find('teachingHistory', {});
    const lecturers = await db.find('lecturers', {});

    // Attach currently assigned lecturers
    const enriched = units.map(u => {
      const assignments = teachingHistory.filter(th => th.unitCode === u.unitCode);
      const assignedLecturers = assignments.map(a => {
        const lec = lecturers.find(l => l.lecturerId === a.lecturerId);
        return {
          lecturerId: a.lecturerId,
          name: lec ? lec.name : a.lecturerId,
          title: lec ? lec.title : '',
          academicYear: a.academicYear,
          semester: a.semester
        };
      });
      return {
        ...u,
        assignedLecturers
      };
    });

    res.json({ success: true, count: enriched.length, units: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch units' });
  }
});

router.post('/units', verifyAuth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { unitCode, unitName, course, semester, year, credits, description } = req.body;
    if (!unitCode || !unitName || !course) {
      return res.status(400).json({ success: false, message: 'Unit code, unit name and course are required' });
    }

    const existing = await db.findOne('units', { unitCode: unitCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Unit code already exists' });
    }

    const newUnit = await db.insert('units', {
      unitCode: unitCode.toUpperCase(),
      unitName,
      course,
      semester: Number(semester) || 1,
      year: Number(year) || 1,
      credits: Number(credits) || 3,
      description: description || ''
    });

    res.status(201).json({ success: true, message: 'Unit created successfully', unit: newUnit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create unit' });
  }
});

router.delete('/units/:id', verifyAuth, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.findByIdAndDelete('units', id);
    res.json({ success: true, message: 'Unit deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete unit' });
  }
});

export default router;
