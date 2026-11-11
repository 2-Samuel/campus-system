import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { dbStore } from './config/dataStore.js';
import { seedDatabase } from './seed/seedData.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import lecturerRoutes from './routes/lecturerRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Seed if data is empty
const ensureSeedData = async () => {
  const users = dbStore.get('users');
  if (!users || users.length === 0) {
    await seedDatabase();
  }
};

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    system: 'University Lecturer Locator & Appointment Management API'
  });
});

// Seed endpoint for manual reset
app.post('/api/admin/reset-seed', async (req, res) => {
  await seedDatabase();
  res.json({ success: true, message: 'Database refreshed with standard university seed dataset!' });
});

// Start Server
const startServer = async () => {
  await connectDB();
  await ensureSeedData();

  app.listen(PORT, () => {
    console.log(`\n============================================================`);
    console.log(`🎓 University Lecturer Locator & Appointment Server`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints ready at: http://localhost:${PORT}/api`);
    console.log(`============================================================\n`);
  });
};

startServer();
