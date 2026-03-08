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
import { Home } from './components/Home';
import { Auth } from './components/Auth';
import { EmergencyContacts } from './components/EmergencyContacts';
import { CitizenReport } from './components/CitizenReport';
import { Language, translations } from './lib/translations';
import { Phone, Loader2 } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

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
      } else if (!user && view !== 'home' && view !== 'login' && view !== 'signup') {
        setView('home');
      }
    }
  }, [user, view, authLoading]);

  const handleAuthSuccess = () => {
    // State is handled by onAuthStateChanged
    setView('dashboard');
    setActiveTab('dashboard');
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
        return <EmergencyContacts lang={lang} />;
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

      {/* Emergency Button */}
      <a
        href="tel:991"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-rose-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all font-bold"
      >
        <Phone size={24} />
        <span className="hidden sm:inline">{t.emergencyCall} (991)</span>
      </a>
    </div>
  );
}
