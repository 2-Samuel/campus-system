import express from 'express';
import { db } from '../services/dbService.js';
import { verifyAuth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// List all lecturers with summary
router.get('/', async (req, res) => {
  try {
    const lecturers = await db.find('lecturers', {});
    const teachingHistory = await db.find('teachingHistory', {});
    const units = await db.find('units', {});
    const availability = await db.find('availability', {});

    const enriched = lecturers.map(l => {
      const history = teachingHistory.filter(th => th.lecturerId === l.lecturerId);
      const unitsList = history.map(h => {
        const u = units.find(unit => unit.unitCode === h.unitCode);
        return {
          unitCode: h.unitCode,
          unitName: u ? u.unitName : h.unitCode,
          academicYear: h.academicYear,
          semester: h.semester,
          studyYear: h.studyYear
        };
      });

      const schedules = availability.filter(a => a.lecturerId === l.lecturerId && a.isActive);

      return {
        ...l,
        teachingHistory: unitsList,
        availability: schedules
      };
    });

    res.json({ success: true, count: enriched.length, lecturers: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch lecturers' });
  }
});

// Single lecturer profile details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lecturer = (await db.findOne('lecturers', { lecturerId: id })) || (await db.findById('lecturers', id));

    if (!lecturer) {
      return res.status(404).json({ success: false, message: 'Lecturer not found' });
    }

    const history = await db.find('teachingHistory', { lecturerId: lecturer.lecturerId });
    const allUnits = await db.find('units', {});
    const schedules = await db.find('availability', { lecturerId: lecturer.lecturerId, isActive: true });

    const enrichedHistory = history.map(h => {
      const unit = allUnits.find(u => u.unitCode === h.unitCode);
      return {
        ...h,
        unitName: unit ? unit.unitName : h.unitCode,
        course: unit ? unit.course : ''
      };
    });

    res.json({
      success: true,
      lecturer: {
        ...lecturer,
        teachingHistory: enrichedHistory,
        availability: schedules
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving lecturer profile' });
  }
});

// Update profile (Lecturer themselves or Admin)
router.put('/:id', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, office, availabilityStatus, bio, officeHoursNotes, name, title, department } = req.body;

    const lecturer = (await db.findOne('lecturers', { lecturerId: id })) || (await db.findById('lecturers', id));
    if (!lecturer) {
      return res.status(404).json({ success: false, message: 'Lecturer not found' });
    }

    // Authorization check
    if (req.user.role === 'lecturer' && req.user.profileId !== lecturer.lecturerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit another lecturer profile' });
    }

    const updates = {};
    if (phone) updates.phone = phone;
    if (availabilityStatus) updates.availabilityStatus = availabilityStatus;
    if (bio !== undefined) updates.bio = bio;
    if (officeHoursNotes !== undefined) updates.officeHoursNotes = officeHoursNotes;
    if (office) updates.office = { ...lecturer.office, ...office };
    if (req.user.role === 'admin') {
      if (name) updates.name = name;
      if (title) updates.title = title;
      if (department) updates.department = department;
    }

    const updated = await db.findByIdAndUpdate('lecturers', lecturer._id, updates);

    res.json({
      success: true,
      message: 'Lecturer profile updated successfully',
      lecturer: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Manage Availability Slots (Lecturer or Admin)
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const lecturer = (await db.findOne('lecturers', { lecturerId: id })) || (await db.findById('lecturers', id));
    if (!lecturer) return res.status(404).json({ success: false, message: 'Lecturer not found' });

    const slots = await db.find('availability', { lecturerId: lecturer.lecturerId });
    res.json({ success: true, availability: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get availability' });
  }
});

router.post('/:id/availability', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { day, startTime, endTime, slotDuration, isActive } = req.body;

    const lecturer = (await db.findOne('lecturers', { lecturerId: id })) || (await db.findById('lecturers', id));
    if (!lecturer) return res.status(404).json({ success: false, message: 'Lecturer not found' });

    if (req.user.role === 'lecturer' && req.user.profileId !== lecturer.lecturerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const newSlot = await db.insert('availability', {
      lecturerId: lecturer.lecturerId,
      day: day || 'Monday',
      startTime: startTime || '09:00 AM',
      endTime: endTime || '12:00 PM',
      slotDuration: slotDuration ? Number(slotDuration) : 30,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, slot: newSlot, message: 'Availability slot added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add availability' });
  }
});

router.delete('/:id/availability/:slotId', verifyAuth, async (req, res) => {
  try {
    const { slotId } = req.params;
    await db.findByIdAndDelete('availability', slotId);
    res.json({ success: true, message: 'Availability slot removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete availability slot' });
  }
});

export default router;
