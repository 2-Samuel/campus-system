import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../services/dbService.js';
import { generateToken, verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Register Student
router.post('/register', async (req, res) => {
  try {
    const { studentId, name, email, password, course, year } = req.body;

    if (!studentId || !name || !email || !password || !course || !year) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingUser = await db.findOne('users', { email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const existingStudent = await db.findOne('students', { studentId });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Student ID already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create student record
    const newStudent = await db.insert('students', {
      studentId,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      course,
      year: Number(year),
      semester: 1,
      department: 'School of Computing & Informatics'
    });

    // Create user record
    const newUser = await db.insert('users', {
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      name,
      profileId: studentId
    });

    const token = generateToken({ email: newUser.email, role: newUser.role, id: newUser._id });

    // Send welcome notification
    await db.insert('notifications', {
      userId: studentId,
      role: 'student',
      title: 'Welcome to Campus Locator',
      message: `Welcome, ${name}! You can now search for lecturers and book consultation appointments.`,
      type: 'system',
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        profileId: studentId,
        student: newStudent
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// Login (Student, Lecturer, Admin)
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await db.findOne('users', { email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role check if user selected a role tab
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Account found, but it is not registered as a '${role}'. Please switch to the ${user.role.toUpperCase()} tab.`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ email: user.email, role: user.role, id: user._id }, rememberMe);

    // Fetch profile details
    let profile = null;
    if (user.role === 'student') {
      profile = await db.findOne('students', { studentId: user.profileId }) || await db.findOne('students', { email: user.email });
    } else if (user.role === 'lecturer') {
      profile = await db.findOne('lecturers', { lecturerId: user.profileId }) || await db.findOne('lecturers', { email: user.email });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileId: user.profileId,
        profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// Current User Profile
router.get('/me', verifyAuth, async (req, res) => {
  try {
    const user = await db.findOne('users', { email: req.user.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await db.findOne('students', { studentId: user.profileId }) || await db.findOne('students', { email: user.email });
    } else if (user.role === 'lecturer') {
      profile = await db.findOne('lecturers', { lecturerId: user.profileId }) || await db.findOne('lecturers', { email: user.email });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileId: user.profileId,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
});

// Forgot Password mock
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email address is required.' });
  
  const user = await db.findOne('users', { email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered account found with that email.' });
  }

  // Simulation
  res.json({
    success: true,
    message: `Password reset instructions have been sent to ${email}. Check your inbox or use 'password123' for demonstration.`
  });
});

export default router;
