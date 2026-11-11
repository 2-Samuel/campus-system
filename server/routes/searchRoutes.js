import express from 'express';
import { db } from '../services/dbService.js';

const router = express.Router();

// Live Search Suggestions (Autocomplete dropdown)
router.get('/suggestions', async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q || q.length < 1) {
      return res.json({ units: [], lecturers: [], courses: [] });
    }

    const allUnits = await db.find('units', {});
    const allLecturers = await db.find('lecturers', {});
    const allCourses = await db.find('courses', {});

    const matchedUnits = allUnits.filter(u =>
      u.unitCode.toLowerCase().includes(q) ||
      u.unitName.toLowerCase().includes(q)
    ).slice(0, 5).map(u => ({
      type: 'unit',
      code: u.unitCode,
      name: u.unitName,
      course: u.course
    }));

    const matchedLecturers = allLecturers.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.department.toLowerCase().includes(q)
    ).slice(0, 5).map(l => ({
      type: 'lecturer',
      id: l.lecturerId,
      name: l.name,
      title: l.title,
      department: l.department,
      office: `${l.office?.building}, ${l.office?.roomNumber}`,
      status: l.availabilityStatus
    }));

    const matchedCourses = allCourses.filter(c =>
      c.courseName.toLowerCase().includes(q) ||
      c.courseId.toLowerCase().includes(q)
    ).slice(0, 5).map(c => ({
      type: 'course',
      id: c.courseId,
      name: c.courseName,
      department: c.department
    }));

    res.json({
      units: matchedUnits,
      lecturers: matchedLecturers,
      courses: matchedCourses
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to retrieve suggestions' });
  }
});

// Comprehensive Search with Advanced Filters
router.get('/', async (req, res) => {
  try {
    const {
      q,              // general search query
      course,         // Course filter
      academicYear,   // Academic Year (e.g. 2025/2026)
      studyYear,      // Study Year (1, 2, 3, 4)
      semester,       // Semester (1, 2)
      department,     // Department
      unit,           // Unit code or name
      availability    // available / busy
    } = req.query;

    const allLecturers = await db.find('lecturers', {});
    const allUnits = await db.find('units', {});
    const allTeachingHistory = await db.find('teachingHistory', {});
    const allCourses = await db.find('courses', {});
    const allAvailability = await db.find('availability', {});

    // Filter lecturers
    let results = allLecturers.map(lecturer => {
      // Find teaching history for this lecturer
      const history = allTeachingHistory.filter(th => th.lecturerId === lecturer.lecturerId);
      
      // Enrich with unit details
      const enrichedHistory = history.map(h => {
        const unitDetail = allUnits.find(u => u.unitCode === h.unitCode);
        return {
          ...h,
          unitName: unitDetail ? unitDetail.unitName : h.unitCode,
          course: unitDetail ? unitDetail.course : ''
        };
      });

      // Find availability slots
      const schedules = allAvailability.filter(a => a.lecturerId === lecturer.lecturerId && a.isActive);

      return {
        ...lecturer,
        teachingHistory: enrichedHistory,
        availability: schedules
      };
    });

    // Apply General Query (Lecturer Name, Unit Code, Unit Name, Course, Department, Academic Year)
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      results = results.filter(l => {
        const matchName = l.name.toLowerCase().includes(term);
        const matchDept = l.department.toLowerCase().includes(term);
        const matchBuilding = l.office?.building?.toLowerCase().includes(term);
        const matchRoom = l.office?.roomNumber?.toLowerCase().includes(term);
        const matchHistory = l.teachingHistory.some(th =>
          th.unitCode.toLowerCase().includes(term) ||
          th.unitName.toLowerCase().includes(term) ||
          th.academicYear.toLowerCase().includes(term) ||
          th.course.toLowerCase().includes(term)
        );
        return matchName || matchDept || matchBuilding || matchRoom || matchHistory;
      });
    }

    // Apply Department filter
    if (department && department !== 'all') {
      results = results.filter(l => l.department.toLowerCase() === department.toLowerCase());
    }

    // Apply Availability filter
    if (availability && availability !== 'all') {
      results = results.filter(l => l.availabilityStatus === availability);
    }

    // Apply Academic Year filter
    if (academicYear && academicYear !== 'all') {
      results = results.filter(l =>
        l.teachingHistory.some(th => th.academicYear === academicYear)
      );
    }

    // Apply Study Year filter
    if (studyYear && studyYear !== 'all') {
      const yrNum = Number(studyYear);
      results = results.filter(l =>
        l.teachingHistory.some(th => th.studyYear === yrNum)
      );
    }

    // Apply Semester filter
    if (semester && semester !== 'all') {
      const semNum = Number(semester);
      results = results.filter(l =>
        l.teachingHistory.some(th => th.semester === semNum)
      );
    }

    // Apply Course filter
    if (course && course !== 'all') {
      results = results.filter(l =>
        l.teachingHistory.some(th => th.course.toLowerCase().includes(course.toLowerCase()))
      );
    }

    // Apply Unit filter
    if (unit && unit !== 'all') {
      results = results.filter(l =>
        l.teachingHistory.some(th =>
          th.unitCode.toLowerCase() === unit.toLowerCase() ||
          th.unitName.toLowerCase().includes(unit.toLowerCase())
        )
      );
    }

    res.json({
      success: true,
      count: results.length,
      lecturers: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search execution error.' });
  }
});

// Distinct Filter Metadata
router.get('/filter-options', async (req, res) => {
  try {
    const courses = await db.find('courses', {});
    const units = await db.find('units', {});
    const history = await db.find('teachingHistory', {});
    const lecturers = await db.find('lecturers', {});

    const departments = [...new Set(lecturers.map(l => l.department))];
    const academicYears = [...new Set(history.map(h => h.academicYear))];
    const studyYears = [1, 2, 3, 4, 5];
    const semesters = [1, 2];

    res.json({
      departments,
      academicYears,
      studyYears,
      semesters,
      courses: courses.map(c => ({ id: c.courseId, name: c.courseName })),
      units: units.map(u => ({ code: u.unitCode, name: u.unitName }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve filter options' });
  }
});

export default router;
