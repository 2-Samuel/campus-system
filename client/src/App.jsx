import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LiveSearchModal } from './components/LiveSearchModal';
import { CampusMapModal } from './components/CampusMapModal';
import { QRCodeModal } from './components/QRCodeModal';
import { BookAppointmentModal } from './components/BookAppointmentModal';
import { ChatDrawer } from './components/ChatDrawer';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { LecturerDashboard } from './pages/LecturerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LecturerDirectory } from './pages/LecturerDirectory';
import { LecturerProfileView } from './pages/LecturerProfileView';
import { MyAppointments } from './pages/MyAppointments';
import { CoursesAndUnits } from './pages/CoursesAndUnits';
import { ProfileSettings } from './pages/ProfileSettings';

import { api } from './services/api';
import { Sparkles } from 'lucide-react';

const MainLayout = () => {
  const { user, role, isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Selected entities for deep view
  const [selectedLecturerId, setSelectedLecturerId] = useState(null);
  const [bookingLecturer, setBookingLecturer] = useState(null);
  const [qrLecturer, setQrLecturer] = useState(null);
  const [chatPartnerId, setChatPartnerId] = useState(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // List of lecturers for the map
  const [mapLecturers, setMapLecturers] = useState([]);

  useEffect(() => {
    const fetchLecs = async () => {
      try {
        const res = await api.getLecturers();
        if (res.success) setMapLecturers(res.lecturers || []);
      } catch (e) {
        // silent
      }
    };
    if (isAuthenticated) fetchLecs();
  }, [isAuthenticated]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 animate-spin text-blue-600" />
          <span className="font-heading font-semibold text-sm tracking-wider uppercase">
            Initializing University Portal...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated: Show Login / Register
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('register')} />;
  }

  // Handlers for cross-component triggers
  const handleSelectLecturer = (id) => {
    setSelectedLecturerId(id);
    setActiveTab('lecturer-profile');
  };

  const handleBookAppointment = (lecturer) => {
    setBookingLecturer(lecturer);
  };

  const handleOpenQR = (lecturer) => {
    setQrLecturer(lecturer);
  };

  const handleOpenChat = (partnerId = null) => {
    if (partnerId) setChatPartnerId(partnerId);
    setIsChatOpen(true);
  };

  // Render active content tab
  const renderContent = () => {
    // Lecturer Profile View (opened from search/cards)
    if (activeTab === 'lecturer-profile') {
      return (
        <LecturerProfileView
          lecturerId={selectedLecturerId || 'LEC001'}
          onBack={() => setActiveTab('lecturers')}
          onBookAppointment={handleBookAppointment}
          onOpenQR={handleOpenQR}
          onOpenChat={handleOpenChat}
          onOpenMap={() => setIsMapOpen(true)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        if (role === 'lecturer') return <LecturerDashboard />;
        if (role === 'admin') return <AdminDashboard />;
        return (
          <StudentDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectLecturer={handleSelectLecturer}
            onBookAppointment={handleBookAppointment}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );

      case 'search':
      case 'lecturers':
        return (
          <LecturerDirectory
            onSelectLecturer={handleSelectLecturer}
            onBookAppointment={handleBookAppointment}
            onOpenQR={handleOpenQR}
            onOpenMap={() => setIsMapOpen(true)}
          />
        );

      case 'my-units':
        return (
          <CoursesAndUnits
            mode="units"
            onSelectLecturer={handleSelectLecturer}
            onBookAppointment={handleBookAppointment}
          />
        );

      case 'courses':
        return (
          <CoursesAndUnits
            mode="courses"
            onSelectLecturer={handleSelectLecturer}
            onBookAppointment={handleBookAppointment}
          />
        );

      case 'appointments':
        return (
          <MyAppointments
            onOpenChat={handleOpenChat}
            onSelectLecturer={handleSelectLecturer}
          />
        );

      case 'availability':
      case 'teaching-history':
        return <LecturerDashboard />;

      case 'admin-lecturers':
      case 'admin-students':
      case 'admin-academic':
      case 'admin-reports':
        return <AdminDashboard />;

      case 'profile':
        return <ProfileSettings />;

      default:
        return (
          <StudentDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectLecturer={handleSelectLecturer}
            onBookAppointment={handleBookAppointment}
            onOpenMap={() => setIsMapOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenChat={() => handleOpenChat()}
        onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
          onOpenMap={() => setIsMapOpen(true)}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <LiveSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLecturer={(id) => {
          handleSelectLecturer(id);
          setIsSearchOpen(false);
        }}
        onSelectUnit={() => {
          setActiveTab('my-units');
          setIsSearchOpen(false);
        }}
      />

      <CampusMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        lecturers={mapLecturers}
        onSelectLecturer={handleSelectLecturer}
        onBookAppointment={handleBookAppointment}
      />

      <QRCodeModal
        isOpen={!!qrLecturer}
        onClose={() => setQrLecturer(null)}
        lecturer={qrLecturer}
      />

      <BookAppointmentModal
        isOpen={!!bookingLecturer}
        onClose={() => setBookingLecturer(null)}
        lecturer={bookingLecturer}
        onAppointmentBooked={() => {
          setActiveTab('appointments');
        }}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        defaultPartnerId={chatPartnerId}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
