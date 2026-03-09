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
import { QRScanner } from './components/QRScanner';
import { Home } from './components/Home';
import { Auth } from './components/Auth';
import { EmergencyContacts } from './components/EmergencyContacts';
import { CitizenReport } from './components/CitizenReport';
import { Language, translations } from './lib/translations';
import { Phone, Loader2, CheckCircle } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { sendTelegramMessage } from './services/telegramService';
import { motion } from 'motion/react';

type View = 'home' | 'login' | 'signup' | 'dashboard' | 'incidents' | 'officers' | 'assignments' | 'reports' | 'settings' | 'contacts';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [initialEditId, setInitialEditId] = useState<string | null>(null);
  const [citizenReportType, setCitizenReportType] = useState<'Crime' | 'Traffic' | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('wg_lang');
    return (saved as Language) || 'en';
  });
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  
  const {
    officers, incidents, assignments, reports, user,
    addOfficer, updateOfficer, deleteOfficer,
    addIncident, updateIncident, deleteIncident,
    addAssignment, updateAssignment, deleteAssignment,
    addReport, updateReport, deleteReport,
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
            
            // Send Telegram notification for new auto-registered user (Google Sign-in)
            await sendTelegramMessage(`👤 <b>New User Registered (Google)</b>\n---------------------------\n<b>Name:</b> ${firebaseUser.displayName || 'Officer'}\n<b>Email:</b> ${firebaseUser.email}\n<b>Role:</b> ${role}`);
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
        setActiveTab('dashboard');
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
    } catch (error) {
      console.error('Logout error:', error);
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
      case 'contacts':
        return <EmergencyContacts lang={lang} onBack={() => setView('home')} />;
      default:
        return null;
    }
  };

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
    <div className="relative">
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        userName={user?.name || 'User'}
        lang={lang}
        setLang={setLang}
      >
        {renderDashboardContent()}
      </Layout>

      {isQRScannerOpen && (
        <QRScanner 
          lang={lang} 
          onClose={() => setIsQRScannerOpen(false)} 
          onScan={(text) => {
            setScanResult(text);
            setIsQRScannerOpen(false);
          }} 
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
  );
}
