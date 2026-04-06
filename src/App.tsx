import React, { useState, useEffect } from 'react';
import { useAppData } from './hooks/useAppData';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Incidents } from './components/Incidents';
import { Officers } from './components/Officers';
import { Assignments } from './components/Assignments';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { PoliceServices } from './components/PoliceServices';
import { AppManual } from './components/AppManual';
import { QRScanner } from './components/QRScanner';
import { Scanner } from './components/Scanner';
import { PoliceIDScanner } from './components/PoliceIDScanner';
import { Home } from './components/Home';
import { Auth } from './components/Auth';
import { EmergencyContacts } from './components/EmergencyContacts';
import { CitizenReport } from './components/CitizenReport';
import { CommunityReports } from './components/CommunityReports';
import { CommunityReportForm } from './components/CommunityReportForm';
import ZoneReports from './components/ZoneReports';
import { AIAssistant } from './components/AIAssistant';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Language, translations } from './lib/translations';
import { Phone, Loader2, CheckCircle } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { sendTelegramMessage, escapeHtml } from './services/telegramService';
import { motion, AnimatePresence } from 'motion/react';
import { APP_LOGO } from './constants';

type View = 'home' | 'login' | 'signup' | 'dashboard' | 'incidents' | 'officers' | 'assignments' | 'reports' | 'settings' | 'contacts' | 'ai-assistant' | 'community-report';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tabHistory, setTabHistory] = useState<string[]>([]);
  const [initialEditId, setInitialEditId] = useState<string | null>(null);
  const [citizenReportType, setCitizenReportType] = useState<'Crime' | 'Traffic' | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('wg_lang');
    return (saved as Language) || 'en';
  });
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isIDScannerOpen, setIsIDScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  const {
    officers, incidents, assignments, reports, zoneReports, user,
    addOfficer, updateOfficer, deleteOfficer,
    addIncident, updateIncident, deleteIncident,
    addAssignment, updateAssignment, deleteAssignment,
    addReport, updateReport, deleteReport,
    addZoneReport,
    login, logout, setUser
  } = useAppData();

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('wg_lang', lang);
  }, [lang]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Check if user exists in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          let role: 'Admin' | 'Officer' = 'Officer';
          if (userSnap.exists()) {
            role = userSnap.data().role;
          } else {
            // Create user in Firestore if not exists
            // Default admin for the specified email
            if (firebaseUser.email === "Yimamem47@gmail.com") {
              role = 'Admin';
            }
            await setDoc(userRef, {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Officer',
              email: firebaseUser.email || '',
              role: role,
              avatar: firebaseUser.photoURL || ''
            });

            // Also add to officers collection so they appear in dropdowns
            const officerRef = doc(db, 'officers', firebaseUser.uid);
            await setDoc(officerRef, {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Officer',
              email: firebaseUser.email || '',
              rank: 'constable',
              badgeNumber: 'PENDING',
              station: 'Pending Assignment',
              phone: '',
              status: 'Active'
            });
            
            // Send Telegram notification for new auto-registered user (Google Sign-in)
            await sendTelegramMessage(`👤 <b>New User Registered (Google)</b>\n---------------------------\n<b>Name:</b> ${escapeHtml(firebaseUser.displayName || 'Officer')}\n<b>Email:</b> ${escapeHtml(firebaseUser.email)}\n<b>Role:</b> ${escapeHtml(role)}`);
          }

          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Officer',
            email: firebaseUser.email || '',
            role: role
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth sync error:', error);
        // Even if Firestore fails, we should let the user in if they are authed in Firebase
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Officer',
            email: firebaseUser.email || '',
            role: firebaseUser.email === "Yimamem47@gmail.com" ? 'Admin' : 'Officer'
          });
        } else {
          setUser(null);
        }
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  // Redirect to dashboard if logged in and on landing/auth pages
  useEffect(() => {
    if (!authLoading) {
      if (user && (view === 'home' || view === 'login' || view === 'signup')) {
        setView('dashboard');
        setActiveTab('reports');
      } else if (!user && view !== 'home' && view !== 'login' && view !== 'signup' && view !== 'contacts') {
        setView('home');
      }
    }
  }, [user, view, authLoading]);

  const handleAuthSuccess = () => {
    // State is handled by onAuthStateChanged
    setView('dashboard');
    setActiveTab('reports'); // Redirect to reports as requested
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      setView('home');
      // Force a reload after a short delay to ensure clean state on mobile
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSetActiveTab = (tab: string) => {
    if (tab !== activeTab) {
      setTabHistory(prev => [...prev, activeTab]);
      setActiveTab(tab);
    }
  };

  const handleBack = () => {
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory(prev => prev.slice(0, -1));
      setActiveTab(prevTab);
    } else {
      setActiveTab('dashboard');
    }
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            incidents={incidents} 
            officers={officers} 
            assignments={assignments} 
            reports={reports}
            lang={lang}
            onQuickAction={(action) => {
              if (action === 'add-incident') {
                setInitialEditId(null);
                setActiveTab('incidents');
              }
              if (action === 'add-assignment') setActiveTab('assignments');
              if (action === 'open-qr') setIsQRScannerOpen(true);
              if (action === 'open-id-scanner') setIsIDScannerOpen(true);
              if (action === 'view-officers') setActiveTab('officers');
              if (action.startsWith('edit-incident-')) {
                const id = action.replace('edit-incident-', '');
                setInitialEditId(id);
                setActiveTab('incidents');
              }
              if (action.startsWith('edit-report-')) {
                const id = action.replace('edit-report-', '');
                setInitialEditId(id);
                setActiveTab('reports');
              }
            }}
            onUpdateIncident={updateIncident}
            onDeleteIncident={deleteIncident}
            onUpdateReport={updateReport}
            onDeleteReport={deleteReport}
          />
        );
      case 'incidents':
        return (
          <Incidents 
            incidents={incidents} 
            officers={officers} 
            lang={lang}
            initialEditId={initialEditId}
            onAdd={addIncident} 
            onUpdate={updateIncident} 
            onDelete={deleteIncident} 
          />
        );
      case 'officers':
        return (
          <Officers 
            officers={officers} 
            lang={lang}
            onAdd={addOfficer} 
            onUpdate={updateOfficer} 
            onDelete={deleteOfficer} 
          />
        );
      case 'assignments':
        return (
          <Assignments 
            assignments={assignments} 
            incidents={incidents} 
            officers={officers}
            lang={lang}
            onAdd={addAssignment} 
            onUpdate={updateAssignment} 
            onDelete={deleteAssignment} 
          />
        );
      case 'reports':
        return (
          <Reports 
            reports={reports} 
            officers={officers} 
            lang={lang}
            initialEditId={initialEditId}
            onAdd={addReport} 
            onUpdate={updateReport} 
            onDelete={deleteReport} 
          />
        );
      case 'zone-reports':
        return (
          <ZoneReports
            reports={zoneReports}
            officers={officers}
            onAddReport={addZoneReport}
            language={lang}
            currentUser={user}
          />
        );
      case 'community-reports':
        return <CommunityReports lang={lang} />;
      case 'settings':
        return (
          <Settings 
            user={user} 
            lang={lang}
            onUpdate={async (updates) => {
              if (user) {
                const userRef = doc(db, 'users', user.id);
                try {
                  await updateDoc(userRef, updates);
                  setUser({ ...user, ...updates });
                } catch (error) {
                  console.error('Error updating user profile:', error);
                }
              }
            }} 
          />
        );
      case 'info':
        return <PoliceServices lang={lang} />;
      case 'help':
        return <AppManual lang={lang} />;
      case 'ai-assistant':
        return <AIAssistant lang={lang} />;
      case 'contacts':
        return <EmergencyContacts lang={lang} onBack={() => setView('home')} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // Play welcome voice
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("በጀግንነት መጠበቅ፣ በሰብዓዊነት ማገልገል");
      utterance.lang = 'am-ET';
      utterance.rate = 0.85; // Slightly slower for a majestic feel
      
      // Try to speak (may be blocked by browser autoplay policies until user interaction)
      window.speechSynthesis.speak(utterance);
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#002B5B] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center p-4 backdrop-blur-xl border border-white/20 shadow-2xl">
            <img 
              src={APP_LOGO} 
              alt="Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-dashed border-[#FFD700]/30 rounded-full"
          />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-2">የምዕራብ ጎጃም ዞን ፖሊስ</h1>
          <p className="text-[#FFD700] font-medium tracking-widest uppercase text-xs">West Gojjam Zone Police</p>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-[#FFD700] rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="text-brand-accent animate-spin" size={48} />
      </div>
    );
  }

  if (view === 'home') {
    return (
      <>
        <Home 
          onLogin={() => setView('login')} 
          onSignup={() => setView('signup')} 
          onReport={(type) => setCitizenReportType(type)}
          onViewContacts={() => {
            setView('contacts');
            setActiveTab('contacts');
          }}
          onOpenQR={() => setIsQRScannerOpen(true)}
          onCommunityReport={() => setView('community-report')}
          lang={lang} 
          setLang={setLang} 
        />
        {citizenReportType && (
          <CitizenReport 
            type={citizenReportType} 
            lang={lang} 
            onClose={() => setCitizenReportType(null)}
            onSubmit={(report) => {
              addIncident(report);
            }}
          />
        )}
      </>
    );
  }

  if (view === 'community-report') {
    return <CommunityReportForm lang={lang} onBack={() => setView('home')} />;
  }

  if (view === 'contacts' && !user) {
    return (
      <div className="min-h-screen bg-brand-bg p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <EmergencyContacts 
            lang={lang} 
            onBack={() => setView('home')} 
          />
        </div>
      </div>
    );
  }

  if (view === 'login' || view === 'signup') {
    return (
      <Auth 
        type={view} 
        lang={lang}
        onLanguageChange={setLang}
        onSuccess={handleAuthSuccess} 
        onSwitch={() => setView(view === 'login' ? 'signup' : 'login')} 
      />
    );
  }

  return (
    <ErrorBoundary lang={lang}>
      <div className="relative">
        <Layout 
          activeTab={activeTab} 
          setActiveTab={handleSetActiveTab} 
          onBack={handleBack}
          onLogout={handleLogout}
          userName={user?.name || 'User'}
          lang={lang}
          setLang={setLang}
        >
          {renderDashboardContent()}
        </Layout>

        {isQRScannerOpen && (
          <Scanner 
            lang={lang} 
            onClose={() => setIsQRScannerOpen(false)} 
          />
        )}

        {isIDScannerOpen && (
          <PoliceIDScanner
            lang={lang}
            onClose={() => setIsIDScannerOpen(false)}
            officers={officers}
          />
        )}

        {scanResult && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card w-full max-w-md p-8 text-center"
            >
              <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-accent/20">
                <CheckCircle size={32} className="text-brand-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t.scanResult || 'Scan Result'}</h3>
              <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border mb-8 break-all font-mono text-sm">
                {scanResult}
              </div>
              <button 
                onClick={() => setScanResult(null)}
                className="w-full btn-primary"
              >
                {t.close || 'Close'}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
VitePWA({
  registerType: 'autoUpdate', // አዲስ ኮድ ሲኖር በራሱ እንዲቀይር
  workbox: {
    cleanupOutdatedCaches: true, // የድሮውን ካሽ (v2) እንዲያጠፋ
    globPatterns: ['**/*.{js,css,html,png,svg}']
  },
  // ... ሌሎች የቀደሙት ሴቲንጎች ይቀጥሉ
})
