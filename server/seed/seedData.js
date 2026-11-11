import bcrypt from 'bcryptjs';
import { dbStore } from '../config/dataStore.js';

export const seedDatabase = async () => {
  console.log('[Seed] Seeding realistic University Lecturer Locator data...');
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('password123', salt);

  // Users
  const users = [
    {
      _id: 'usr_admin_1',
      email: 'admin@university.ac.ke',
      password: defaultPasswordHash,
      role: 'admin',
      name: 'System Administrator',
      profileId: 'admin_1'
    },
    {
      _id: 'usr_lec_kamau',
      email: 'john.kamau@university.ac.ke',
      password: defaultPasswordHash,
      role: 'lecturer',
      name: 'Dr. John Kamau',
      profileId: 'LEC001'
    },
    {
      _id: 'usr_lec_sarah',
      email: 'sarah.mwangi@university.ac.ke',
      password: defaultPasswordHash,
      role: 'lecturer',
      name: 'Prof. Sarah Mwangi',
      profileId: 'LEC002'
    },
    {
      _id: 'usr_lec_otieno',
      email: 'david.otieno@university.ac.ke',
      password: defaultPasswordHash,
      role: 'lecturer',
      name: 'Dr. David Otieno',
      profileId: 'LEC003'
    },
    {
      _id: 'usr_lec_chebet',
      email: 'faith.chebet@university.ac.ke',
      password: defaultPasswordHash,
      role: 'lecturer',
      name: 'Dr. Faith Chebet',
      profileId: 'LEC004'
    },
    {
      _id: 'usr_lec_wanjiku',
      email: 'mary.wanjiku@university.ac.ke',
      password: defaultPasswordHash,
      role: 'lecturer',
      name: 'Eng. Mary Wanjiku',
      profileId: 'LEC005'
    },
    {
      _id: 'usr_student_alex',
      email: 'student@university.ac.ke',
      password: defaultPasswordHash,
      role: 'student',
      name: 'Alex Kibet',
      profileId: 'STU202401'
    }
  ];

  // Students
  const students = [
    {
      _id: 'stu_1',
      studentId: 'STU202401',
      name: 'Alex Kibet',
      email: 'student@university.ac.ke',
      password: defaultPasswordHash,
      course: 'Bachelor of Information Technology',
      year: 2,
      semester: 1,
      department: 'School of Computing & Informatics',
      phone: '0700112233',
      avatar: 'student_alex'
    },
    {
      _id: 'stu_2',
      studentId: 'STU202402',
      name: 'Brenda Achieng',
      email: 'brenda.achieng@student.university.ac.ke',
      password: defaultPasswordHash,
      course: 'Bachelor of Science in Computer Science',
      year: 3,
      semester: 2,
      department: 'School of Computing & Informatics',
      phone: '0711223344',
      avatar: 'student_brenda'
    }
  ];

  // Lecturers
  const lecturers = [
    {
      _id: 'lec_1',
      lecturerId: 'LEC001',
      name: 'Dr. John Kamau',
      title: 'Senior Lecturer',
      email: 'john.kamau@university.ac.ke',
      phone: '0712345678',
      department: 'School of Computing & Informatics',
      office: {
        building: 'ICT Block',
        roomNumber: 'Room 204',
        floor: '2nd Floor, Wing A',
        coordinates: { x: 38, y: 32 }
      },
      photo: 'kamau',
      bio: 'Ph.D. in Computer Science. Research interests include Distributed Database Architectures, Cloud Platforms, and Scalable Backend Systems.',
      availabilityStatus: 'available',
      officeHoursNotes: 'Available for consultations during office hours. Knock or book ahead.'
    },
    {
      _id: 'lec_2',
      lecturerId: 'LEC002',
      name: 'Prof. Sarah Mwangi',
      title: 'Professor & Dean',
      email: 'sarah.mwangi@university.ac.ke',
      phone: '0722998877',
      department: 'School of Computing & Informatics',
      office: {
        building: 'ICT Block',
        roomNumber: 'Room 310',
        floor: '3rd Floor, Executive Suite',
        coordinates: { x: 42, y: 30 }
      },
      photo: 'mwangi',
      bio: 'Leading researcher in Artificial Intelligence, Machine Learning, and Ethical AI Systems in African Higher Education.',
      availabilityStatus: 'busy',
      officeHoursNotes: 'Appointment required. Priority given to final year project supervisees.'
    },
    {
      _id: 'lec_3',
      lecturerId: 'LEC003',
      name: 'Dr. David Otieno',
      title: 'Lecturer',
      email: 'david.otieno@university.ac.ke',
      phone: '0733445566',
      department: 'School of Computing & Informatics',
      office: {
        building: 'Science Complex',
        roomNumber: 'Room 105',
        floor: 'Ground Floor, North Wing',
        coordinates: { x: 65, y: 48 }
      },
      photo: 'otieno',
      bio: 'Cybersecurity specialist, Certified Ethical Hacker (CEH), lecturing in Network Security and Applied Cryptography.',
      availabilityStatus: 'available',
      officeHoursNotes: 'Drop-ins welcome during office hours.'
    },
    {
      _id: 'lec_4',
      lecturerId: 'LEC004',
      name: 'Dr. Faith Chebet',
      title: 'Senior Lecturer',
      email: 'faith.chebet@university.ac.ke',
      phone: '0744556677',
      department: 'School of Business & Economics',
      office: {
        building: 'Business Towers',
        roomNumber: 'Room 402',
        floor: '4th Floor, East Wing',
        coordinates: { x: 22, y: 65 }
      },
      photo: 'chebet',
      bio: 'Expert in Quantitative Finance, Business Analytics, and Financial Information Systems.',
      availabilityStatus: 'available',
      officeHoursNotes: 'Consultations on Tuesday and Thursday afternoons.'
    },
    {
      _id: 'lec_5',
      lecturerId: 'LEC005',
      name: 'Eng. Mary Wanjiku',
      title: 'Lecturer',
      email: 'mary.wanjiku@university.ac.ke',
      phone: '0755667788',
      department: 'School of Engineering',
      office: {
        building: 'Engineering Wing',
        roomNumber: 'Room 118',
        floor: '1st Floor, Mechatronics Lab',
        coordinates: { x: 78, y: 62 }
      },
      photo: 'wanjiku',
      bio: 'Embedded Systems and Internet of Things (IoT) design engineer with 12+ years in hardware-software codesign.',
      availabilityStatus: 'busy',
      officeHoursNotes: 'Please book at least 24 hours in advance.'
    }
  ];

  // Courses
  const courses = [
    {
      _id: 'crs_1',
      courseId: 'BIT',
      courseName: 'Bachelor of Information Technology',
      department: 'School of Computing & Informatics',
      durationYears: 4
    },
    {
      _id: 'crs_2',
      courseId: 'BCS',
      courseName: 'Bachelor of Science in Computer Science',
      department: 'School of Computing & Informatics',
      durationYears: 4
    },
    {
      _id: 'crs_3',
      courseId: 'BSE',
      courseName: 'Bachelor of Science in Software Engineering',
      department: 'School of Computing & Informatics',
      durationYears: 4
    },
    {
      _id: 'crs_4',
      courseId: 'BBIT',
      courseName: 'Bachelor of Business Information Technology',
      department: 'School of Business & Economics',
      durationYears: 4
    },
    {
      _id: 'crs_5',
      courseId: 'BEE',
      courseName: 'Bachelor of Science in Electrical and Electronic Engineering',
      department: 'School of Engineering',
      durationYears: 5
    }
  ];

  // Units
  const units = [
    {
      _id: 'unt_1',
      unitCode: 'BIT220',
      unitName: 'Database Systems',
      course: 'Bachelor of Information Technology',
      semester: 1,
      year: 2,
      credits: 3,
      description: 'Relational database design, SQL querying, normalization, indexing, transaction management, and NoSQL principles.'
    },
    {
      _id: 'unt_2',
      unitCode: 'BIT225',
      unitName: 'Web Development',
      course: 'Bachelor of Information Technology',
      semester: 2,
      year: 2,
      credits: 3,
      description: 'Modern full-stack web applications, RESTful APIs, modern frontend architectures, and deployment workflows.'
    },
    {
      _id: 'unt_3',
      unitCode: 'BCS310',
      unitName: 'Artificial Intelligence',
      course: 'Bachelor of Science in Computer Science',
      semester: 1,
      year: 3,
      credits: 4,
      description: 'Knowledge representation, heuristic search, neural networks, natural language processing, and probabilistic inference.'
    },
    {
      _id: 'unt_4',
      unitCode: 'BCS214',
      unitName: 'Computer Networks & Security',
      course: 'Bachelor of Science in Computer Science',
      semester: 1,
      year: 2,
      credits: 3,
      description: 'OSI and TCP/IP protocol suites, routing algorithms, cryptographic fundamentals, firewalls, and network vulnerability defense.'
    },
    {
      _id: 'unt_5',
      unitCode: 'BBIT204',
      unitName: 'Business Analytics & Decision Science',
      course: 'Bachelor of Business Information Technology',
      semester: 2,
      year: 2,
      credits: 3,
      description: 'Data-driven business modeling, predictive analytics, spreadsheets, dashboards, and reporting pipelines.'
    },
    {
      _id: 'unt_6',
      unitCode: 'BEE305',
      unitName: 'Microprocessor & Embedded Systems',
      course: 'Bachelor of Science in Electrical and Electronic Engineering',
      semester: 1,
      year: 3,
      credits: 4,
      description: 'Microcontroller architecture, assembly and C programming for embedded firmware, real-time operating systems, and sensor interfacing.'
    }
  ];

  // Teaching History
  const teachingHistory = [
    {
      _id: 'th_1',
      lecturerId: 'LEC001',
      unitCode: 'BIT220',
      academicYear: '2025/2026',
      semester: 1,
      studyYear: 2
    },
    {
      _id: 'th_2',
      lecturerId: 'LEC001',
      unitCode: 'BIT225',
      academicYear: '2024/2025',
      semester: 2,
      studyYear: 2
    },
    {
      _id: 'th_3',
      lecturerId: 'LEC001',
      unitCode: 'BIT220',
      academicYear: '2024/2025',
      semester: 1,
      studyYear: 2
    },
    {
      _id: 'th_4',
      lecturerId: 'LEC002',
      unitCode: 'BCS310',
      academicYear: '2025/2026',
      semester: 1,
      studyYear: 3
    },
    {
      _id: 'th_5',
      lecturerId: 'LEC002',
      unitCode: 'BCS310',
      academicYear: '2024/2025',
      semester: 1,
      studyYear: 3
    },
    {
      _id: 'th_6',
      lecturerId: 'LEC003',
      unitCode: 'BCS214',
      academicYear: '2025/2026',
      semester: 1,
      studyYear: 2
    },
    {
      _id: 'th_7',
      lecturerId: 'LEC004',
      unitCode: 'BBIT204',
      academicYear: '2025/2026',
      semester: 2,
      studyYear: 2
    },
    {
      _id: 'th_8',
      lecturerId: 'LEC005',
      unitCode: 'BEE305',
      academicYear: '2025/2026',
      semester: 1,
      studyYear: 3
    }
  ];

  // Lecturer Availability
  const availability = [
    {
      _id: 'av_1',
      lecturerId: 'LEC001',
      day: 'Monday',
      startTime: '08:00 AM',
      endTime: '12:00 PM',
      slotDuration: 30,
      isActive: true
    },
    {
      _id: 'av_2',
      lecturerId: 'LEC001',
      day: 'Tuesday',
      startTime: '02:00 PM',
      endTime: '05:00 PM',
      slotDuration: 30,
      isActive: true
    },
    {
      _id: 'av_3',
      lecturerId: 'LEC001',
      day: 'Wednesday',
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      slotDuration: 30,
      isActive: true
    },
    {
      _id: 'av_4',
      lecturerId: 'LEC002',
      day: 'Monday',
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      slotDuration: 45,
      isActive: true
    },
    {
      _id: 'av_5',
      lecturerId: 'LEC002',
      day: 'Thursday',
      startTime: '02:00 PM',
      endTime: '04:30 PM',
      slotDuration: 45,
      isActive: true
    },
    {
      _id: 'av_6',
      lecturerId: 'LEC003',
      day: 'Wednesday',
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      slotDuration: 30,
      isActive: true
    },
    {
      _id: 'av_7',
      lecturerId: 'LEC003',
      day: 'Friday',
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      slotDuration: 30,
      isActive: true
    },
    {
      _id: 'av_8',
      lecturerId: 'LEC004',
      day: 'Tuesday',
      startTime: '01:00 PM',
      endTime: '04:00 PM',
      slotDuration: 30,
      isActive: true
    },
    {
      _id: 'av_9',
      lecturerId: 'LEC005',
      day: 'Thursday',
      startTime: '09:00 AM',
      endTime: '12:00 PM',
      slotDuration: 30,
      isActive: true
    }
  ];

  // Initial Appointments
  const appointments = [
    {
      _id: 'apt_1',
      studentId: 'STU202401',
      lecturerId: 'LEC001',
      date: '2026-09-29',
      time: '03:00 PM',
      reason: 'Discuss assignment 2 database indexing optimization and query plan analysis',
      status: 'confirmed',
      notes: 'Approved. Please bring your laptop with pgAdmin installed.',
      createdAt: '2026-09-24T10:00:00.000Z'
    },
    {
      _id: 'apt_2',
      studentId: 'STU202401',
      lecturerId: 'LEC002',
      date: '2026-10-01',
      time: '02:30 PM',
      reason: 'Guidance on Final Year Project proposal in AI & Natural Language Processing',
      status: 'pending',
      notes: '',
      createdAt: '2026-09-25T08:30:00.000Z'
    },
    {
      _id: 'apt_3',
      studentId: 'STU202402',
      lecturerId: 'LEC001',
      date: '2026-09-30',
      time: '10:30 AM',
      reason: 'Course unit prerequisite clearance review',
      status: 'confirmed',
      notes: 'Confirmed in ICT Block 204.',
      createdAt: '2026-09-24T14:15:00.000Z'
    }
  ];

  // In-app Notifications
  const notifications = [
    {
      _id: 'notif_1',
      userId: 'STU202401',
      role: 'student',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. John Kamau on 29 Sep 2026 at 03:00 PM has been confirmed.',
      type: 'appointment_confirmed',
      read: false,
      createdAt: '2026-09-24T11:00:00.000Z'
    },
    {
      _id: 'notif_2',
      userId: 'LEC001',
      role: 'lecturer',
      title: 'New Appointment Booking',
      message: 'Alex Kibet booked an appointment for 29 Sep 2026 at 03:00 PM.',
      type: 'system',
      read: true,
      createdAt: '2026-09-24T10:00:00.000Z'
    },
    {
      _id: 'notif_3',
      userId: 'STU202401',
      role: 'student',
      title: 'Appointment Reminder',
      message: 'Reminder: Consultation tomorrow with Dr. John Kamau at ICT Block, Room 204.',
      type: 'appointment_reminder',
      read: false,
      createdAt: '2026-09-25T07:00:00.000Z'
    }
  ];

  // Seed Messages
  const messages = [
    {
      _id: 'msg_1',
      senderId: 'STU202401',
      senderName: 'Alex Kibet',
      senderRole: 'student',
      receiverId: 'LEC001',
      content: 'Good morning Dr. Kamau, could I bring my code snippet regarding B-Tree index benchmarks to the session?',
      read: true,
      createdAt: '2026-09-24T10:05:00.000Z'
    },
    {
      _id: 'msg_2',
      senderId: 'LEC001',
      senderName: 'Dr. John Kamau',
      senderRole: 'lecturer',
      receiverId: 'STU202401',
      content: 'Good morning Alex. Absolutely, please have your query plan outputs ready on your terminal.',
      read: true,
      createdAt: '2026-09-24T10:30:00.000Z'
    }
  ];

  dbStore.data = {
    users,
    students,
    lecturers,
    courses,
    units,
    teachingHistory,
    availability,
    appointments,
    notifications,
    messages
  };
  dbStore.save();
  console.log('[Seed] Database successfully populated with university records!');
};
