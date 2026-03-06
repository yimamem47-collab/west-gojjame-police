import * as React from 'react';
import { useState, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Home as HomeIcon, 
  Phone, 
  LayoutDashboard, 
  ShieldAlert, 
  Car, 
  Info,
  ChevronRight,
  AlertCircle,
  Plus,
  History,
  MapPin,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  Search,
  Filter,
  X,
  Eye,
  Target,
  ShieldCheck,
  FileText,
  Download,
  Facebook,
  Youtube,
  Send,
  QrCode,
  Camera,
  HelpCircle,
  User,
  Mic,
  Square,
  Play,
  Trash,
  Wifi,
  WifiOff,
  RefreshCw,
  Menu as MenuIcon,
  Palette,
  Moon,
  Sun,
  Lock,
  Shield,
  Newspaper
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { cn } from './lib/utils';
import { storage, EMERGENCY_CONTACTS, type CrimeReport, type UserProfile } from './lib/storage';
import { format } from 'date-fns';
import { translations, type Language } from './lib/translations';
import { 
  db, 
  auth, 
  ensureAnonymousAuth, 
  handleFirestoreError, 
  OperationType, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  signInWithGoogle,
  logout,
  Timestamp,
  setDoc,
  doc
} from './firebase';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<any, any> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Application Error</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-vibrant-blue text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

// --- Constants ---
const POLICE_LOGO_URL = "https://files.oaiusercontent.com/file-67c70697771c4997973700";

const PoliceLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    {/* Outer Glow */}
    <div className="absolute inset-0 bg-vibrant-blue/20 blur-xl rounded-full" />
    
    {/* Main Emblem Circle */}
    <div className="relative w-full h-full bg-gradient-to-br from-vibrant-blue to-slate-900 rounded-full border-2 border-eth-yellow/50 shadow-2xl flex items-center justify-center overflow-hidden">
      {/* Radiating Lines Background */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute top-1/2 left-1/2 w-full h-[1px] bg-eth-yellow origin-left"
            style={{ transform: `rotate(${i * 30}deg) translate(-50%, -50%)` }}
          />
        ))}
      </div>

      {/* Center Star */}
      <div className="relative z-10 text-eth-yellow drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
        <ShieldCheck size={32} strokeWidth={1.5} />
      </div>

      {/* WGP Text with Flag Colors */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5 scale-[0.6]">
        <span className="w-2 h-2 rounded-full bg-eth-green" />
        <span className="w-2 h-2 rounded-full bg-eth-yellow" />
        <span className="w-2 h-2 rounded-full bg-eth-red" />
      </div>
      
      {/* Bottom Laurel Wreath (Simplified) */}
      <div className="absolute bottom-1 text-eth-yellow/40">
        <div className="flex gap-4">
          <div className="rotate-45">)</div>
          <div className="-rotate-45">(</div>
        </div>
      </div>
    </div>
  </div>
);

// --- Mock Data ---
const MOCK_NEWS = [
  { id: '1', type: 'alert', title: 'Road Closure Alert', titleAm: 'የመንገድ መዘጋት ማንቂያ', content: 'Main road to Finote Selam is closed for maintenance.', contentAm: 'ወደ ፍኖተ ሰላም የሚወስደው ዋና መንገድ ለጥገና ተዘግቷል።', date: '2026-03-05', image: 'https://picsum.photos/seed/road/800/400' },
  { id: '2', type: 'missing', title: 'Missing Person: Abebe Bikila', titleAm: 'የጠፋ ሰው፡ አበበ ቢቂላ', content: 'Last seen near the central market on Monday.', contentAm: 'ሰኞ እለት በማዕከላዊ ገበያ አካባቢ ታይቶ ነበር።', date: '2026-03-04', image: 'https://picsum.photos/seed/person/800/400' },
  { id: '3', type: 'news', title: 'New Police Station Opened', titleAm: 'አዲስ የፖሊስ ጣቢያ ተከፈተ', content: 'A new community police station has been inaugurated in Bure.', contentAm: 'በቡሬ አዲስ የማህበረሰብ ፖሊስ ጣቢያ ተመርቋል።', date: '2026-03-02', image: 'https://picsum.photos/seed/station/800/400' },
];

const MOCK_STATIONS = [
  { id: '1', name: 'Finote Selam Central Station', nameAm: 'ፍኖተ ሰላም ማዕከላዊ ጣቢያ', distance: '1.2 km', phone: '0582230001', location: 'Finote Selam, Zone 1' },
  { id: '2', name: 'Bure District Police', nameAm: 'ቡሬ ወረዳ ፖሊስ', distance: '15.5 km', phone: '0582230002', location: 'Bure Town' },
  { id: '3', name: 'Jiga Police Post', nameAm: 'ጂጋ ፖሊስ ኬላ', distance: '22.1 km', phone: '0582230003', location: 'Jiga' },
];

// --- Context ---
type Theme = 'light' | 'dark' | 'police';

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'police',
  setTheme: () => {},
});

const useTheme = () => React.useContext(ThemeContext);

const LanguageContext = React.createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
}>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

const useTranslation = () => React.useContext(LanguageContext);

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// --- Components ---

const Header = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const { lang, setLang, t } = useTranslation();
  const isOnline = useOnlineStatus();
  
  return (
    <header className="bg-vibrant-blue text-white p-6 pt-12 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-eth-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-eth-green/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
      
      <div className="absolute top-4 right-6 flex items-center gap-3 z-50">
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold transition-all",
          isOnline ? "bg-eth-green/20 text-eth-green border border-eth-green/30" : "bg-eth-red/20 text-eth-red border border-eth-red/30"
        )}>
          {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
          {isOnline ? t.online : t.offline}
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => setLang('en')}
            className={cn(
              "text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all duration-300",
              lang === 'en' ? "bg-eth-yellow text-slate-900 border-eth-yellow shadow-lg" : "text-white/60 border-white/20 hover:bg-white/10"
            )}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('am')}
            className={cn(
              "text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all duration-300",
              lang === 'am' ? "bg-eth-yellow text-slate-900 border-eth-yellow shadow-lg" : "text-white/60 border-white/20 hover:bg-white/10"
            )}
          >
            አማ
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-5 relative z-10">
        <PoliceLogo className="w-16 h-16" />
        <div>
          <h1 className="text-xl font-black tracking-tight leading-tight">{title}</h1>
          <p className="text-eth-yellow text-sm font-bold mt-0.5">{subtitle}</p>
          <p className="text-white/70 text-[10px] font-medium mt-1 italic border-l-2 border-eth-yellow/50 pl-2">
            {useTranslation().t.motto}
          </p>
        </div>
      </div>
    </header>
  );
};

const EmergencyButton = () => (
  <a 
    href="tel:991"
    className="fixed bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-eth-red text-white rounded-full flex flex-col items-center justify-center shadow-2xl z-50 active:scale-95 transition-transform border-2 border-white overflow-hidden"
  >
    <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
      <PoliceLogo className="w-full h-full scale-150" />
    </div>
    <Phone size={18} fill="currentColor" className="relative z-10" />
    <span className="text-[7px] font-bold uppercase mt-0.5 relative z-10">991</span>
  </a>
);

const MenuPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const menuSections = [
    {
      title: t.ourServices,
      items: [
        { id: 'news', icon: Newspaper, label: t.newsAlerts, color: 'text-vibrant-blue', bg: 'bg-vibrant-blue/5' },
        { id: 'station-locator', icon: MapPin, label: t.stationLocator, color: 'text-eth-green', bg: 'bg-eth-green/5' },
        { id: 'services', icon: Info, label: t.info, color: 'text-amber-600', bg: 'bg-amber-50' },
        { id: 'contacts', icon: Phone, label: t.contacts, color: 'text-blue-600', bg: 'bg-blue-50' },
      ]
    },
    {
      title: t.appGuide,
      items: [
        { id: 'help', icon: HelpCircle, label: t.help, color: 'text-slate-600', bg: 'bg-slate-50' },
        { id: 'privacy', icon: Lock, label: t.privacySecurity, color: 'text-vibrant-blue', bg: 'bg-vibrant-blue/5' },
        { id: 'about', icon: Info, label: t.aboutUs, color: 'text-vibrant-blue', bg: 'bg-vibrant-blue/5' },
      ]
    }
  ];

  const themes: { id: Theme; icon: any; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'police', icon: ShieldCheck, label: 'Police' },
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <MenuIcon size={24} className="text-vibrant-blue" />
          {t.menu || 'Menu'}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Explore all features and customize your experience.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Palette size={18} className="text-vibrant-blue" />
          {t.theme || 'Display Theme'}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                theme === t.id 
                  ? "bg-vibrant-blue text-white border-vibrant-blue shadow-lg scale-105" 
                  : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
            >
              <t.icon size={20} />
              <span className="text-[10px] font-bold uppercase">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {menuSections.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {section.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl transition-colors", item.bg, item.color, "dark:bg-slate-900")}>
                    <item.icon size={20} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-vibrant-blue transition-colors" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-vibrant-blue/5 dark:bg-vibrant-blue/10 p-6 rounded-[2.5rem] border border-vibrant-blue/10 dark:border-vibrant-blue/20 text-center space-y-2">
        <p className="text-[10px] font-bold text-vibrant-blue/40 dark:text-vibrant-blue/30 uppercase tracking-widest">Version 2.1.0</p>
        <p className="text-xs font-medium text-vibrant-blue/60 dark:text-vibrant-blue/40 italic">
          "{t.motto}"
        </p>
      </div>
    </div>
  );
};

// --- Pages ---

const AboutPage = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800 dark:text-white">{t.aboutUs}</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        
        <div className="flex justify-center mb-4">
          <PoliceLogo className="w-24 h-24" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-vibrant-blue flex items-center gap-2">
              <History size={20} className="text-eth-yellow" />
              {t.history}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
              {t.historyText}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-vibrant-blue flex items-center gap-2">
              <Target size={20} className="text-eth-yellow" />
              {t.mission}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-justify">
              {t.missionText}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-vibrant-blue text-white p-8 rounded-[2.5rem] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-xl" />
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Edit2 size={20} className="text-eth-yellow" />
          {t.developerInfo}
        </h3>
        <div className="space-y-2">
          <p className="text-sm font-bold text-eth-yellow">{t.developerName}</p>
          <p className="text-xs text-white/70">{t.creationDate}</p>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { t, lang } = useTranslation();
  const user = auth.currentUser;
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: ''
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedProfile = storage.getProfile();
    if (savedProfile) {
      setProfile(savedProfile);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">{t.userProfile}</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        
        <div className="flex justify-center mb-4">
          <PoliceLogo className="w-20 h-20" />
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.fullName}</label>
            <input 
              type="text"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all dark:text-white"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="e.g. Abebe Bikila"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.phoneNumber}</label>
            <input 
              type="tel"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all dark:text-white"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              placeholder="e.g. 0911223344"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.email}</label>
            <input 
              type="email"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all dark:text-white"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="e.g. abebe@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.address}</label>
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue transition-all dark:text-white resize-none"
              rows={3}
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="e.g. Finote Selam, Kebele 01"
            />
          </div>

          <div className="pt-2 space-y-4">
            {user?.isAnonymous === false ? (
              <button 
                type="button"
                onClick={() => logout()}
                className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Lock size={20} />
                {t.logout}
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => signInWithGoogle()}
                className="w-full bg-white border-2 border-vibrant-blue text-vibrant-blue font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <User size={20} />
                {t.signInWithGoogle}
              </button>
            )}

            <div className="bg-vibrant-blue/5 dark:bg-vibrant-blue/10 p-4 rounded-2xl flex items-center gap-3 border border-vibrant-blue/10">
              <ShieldCheck size={20} className="text-eth-green" />
              <p className="text-[10px] font-bold text-vibrant-blue uppercase tracking-wider">
                {lang === 'am' ? 'የእርስዎ መረጃ በምስጠራ የተጠበቀ ነው' : 'Your data is protected with end-to-end encryption'}
              </p>
            </div>
            <button 
              type="submit"
              className="w-full bg-vibrant-blue text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all hover:bg-slate-800 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              {t.saveProfile}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {isSaved && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-green-600 text-xs font-bold mt-4"
            >
              {t.profileSaved}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-[10px] text-slate-400 text-center mt-4 leading-relaxed italic">
          {t.optionalInfo}
        </p>
      </div>
    </div>
  );
};

const HelpPage = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  const helpItems = [
    { title: t.installGuide, desc: t.installText, icon: Download },
    { title: t.appGuide, desc: 'Learn how to report crimes and access police services.', icon: FileText },
    { title: t.faq, desc: 'Common questions about West Gojjam Zone Police services.', icon: Info },
    { title: t.contactSupport, desc: 'Need more help? Contact our technical team.', icon: Phone },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800 dark:text-white">{t.helpCenter}</h2>
      </div>

      <div className="space-y-4">
        {helpItems.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm flex gap-4 group active:scale-[0.98] transition-transform"
          >
            <div className="bg-vibrant-blue/5 dark:bg-vibrant-blue/10 p-4 rounded-2xl text-vibrant-blue h-fit group-hover:bg-vibrant-blue group-hover:text-white transition-colors">
              <item.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-eth-yellow/10 p-6 rounded-[2rem] border border-eth-yellow/20 text-center space-y-2">
        <HelpCircle size={32} className="mx-auto text-eth-yellow" />
        <h3 className="font-bold text-vibrant-blue">{t.help}</h3>
        <p className="text-[10px] text-vibrant-blue/70 font-medium">
          West Gojjam Zone Police is here to serve you 24/7.
        </p>
      </div>
    </div>
  );
};

const PrivacySecurityPage = ({ onBack }: { onBack: () => void }) => {
  const { t, lang } = useTranslation();
  
  const tips = lang === 'am' ? [
    "ሁልጊዜ ለስልክዎ ጠንካራ የይለፍ ቃል ይጠቀሙ።",
    "የመግቢያ መረጃዎን ለማንም አያጋሩ።",
    "ማንኛውንም አጠራጣሪ ነገር ወዲያውኑ ያሳውቁ።",
    "አፑን ሁልጊዜ ወደ አዲሱ ስሪት ያዘምኑ።"
  ] : [
    "Always use a strong password for your device.",
    "Do not share your login credentials with anyone.",
    "Report any suspicious activity immediately.",
    "Keep the app updated to the latest version."
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full active:scale-90 transition-transform">
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">{t.privacySecurity}</h2>
      </div>

      <div className="space-y-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3 text-vibrant-blue">
            <Shield size={24} />
            <h3 className="text-lg font-bold">{t.privacyPolicy}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.privacyText}
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-3 text-eth-green">
            <Lock size={24} />
            <h3 className="text-lg font-bold">{t.dataSecurity}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.securityText}
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-eth-yellow/10 p-6 rounded-[2.5rem] border border-eth-yellow/20 space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <AlertCircle size={18} className="text-eth-red" />
            {t.securityTips}
          </h3>
          <ul className="space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-eth-green mt-1.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

const QRScannerPage = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner only if it doesn't exist
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          setScanResult(decodedText);
          // Don't clear here, let the UI handle it or cleanup handle it
        },
        (error) => {
          // Silent failure for frame-by-frame errors
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.warn("Failed to clear scanner on unmount", error);
        });
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <style>{`
        #reader __dashboard_section_csr { display: none !important; }
        #reader img { display: none !important; }
        #reader button { 
          background-color: #002855 !important; 
          color: white !important; 
          border: none !important; 
          padding: 10px 20px !important; 
          border-radius: 12px !important;
          font-weight: bold !important;
          margin-top: 10px !important;
          cursor: pointer !important;
        }
        #reader select {
          padding: 8px !important;
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
          margin: 5px !important;
        }
        #reader { border: none !important; }
      `}</style>

      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800 dark:text-white">{t.qrScanner}</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className={cn("w-full rounded-2xl overflow-hidden", scanResult && "hidden")}>
          <div id="reader" className="w-full" />
        </div>

        {scanResult && (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">{t.scanResult}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 break-all mt-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700 italic">
                {scanResult}
              </p>
            </div>
            <button 
              onClick={() => setScanResult(null)}
              className="w-full bg-vibrant-blue text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform"
            >
              {t.scanQr}
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex gap-4">
        <div className="bg-blue-600/10 dark:bg-blue-600/20 p-3 rounded-xl text-blue-600 dark:text-blue-400 h-fit">
          <Info size={20} />
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
          Point your camera at a West Gojjam Zone Police official QR code to verify information or access services.
        </p>
      </div>
    </div>
  );
};

const HomePage = ({ onNavigate, news }: { onNavigate: (page: string) => void, news: any[] }) => {
  const { t, lang } = useTranslation();
  const menuItems = [
    { id: 'news', icon: Newspaper, label: t.newsAlerts, labelAm: 'ዜና እና ማንቂያዎች', color: 'text-vibrant-blue', bg: 'bg-vibrant-blue/5', gradient: 'from-vibrant-blue/10 to-vibrant-blue/5' },
    { id: 'station-locator', icon: MapPin, label: t.stationLocator, labelAm: 'ጣቢያ መፈለጊያ', color: 'text-eth-green', bg: 'bg-eth-green/5', gradient: 'from-eth-green/10 to-eth-green/5' },
    { id: 'contacts', icon: Phone, label: t.contacts, labelAm: 'ድንገተኛ ስልክ ቁጥሮች', color: 'text-vibrant-blue', bg: 'bg-vibrant-blue/10', gradient: 'from-vibrant-blue/10 to-vibrant-blue/5' },
    { id: 'crime', icon: ShieldAlert, label: t.crime, labelAm: 'የወንጅል ቁጥጥር', color: 'text-eth-red', bg: 'bg-eth-red/10', gradient: 'from-eth-red/10 to-eth-red/5' },
    { id: 'traffic', icon: Car, label: t.traffic, labelAm: 'የትራፊክ ደህንነት', color: 'text-eth-green', bg: 'bg-eth-green/10', gradient: 'from-eth-green/10 to-eth-green/5' },
    { id: 'services', icon: Info, label: t.info, labelAm: 'የፖሊስ አገልግሎት', color: 'text-amber-600', bg: 'bg-eth-yellow/10', gradient: 'from-eth-yellow/10 to-eth-yellow/5' },
    { id: 'qr', icon: QrCode, label: t.scanQr, labelAm: 'QR ኮድ ይቃኙ', color: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500/10 to-indigo-600/5' },
    { id: 'about', icon: Info, label: t.aboutUs, labelAm: 'ስለ እኛ', color: 'text-vibrant-blue', bg: 'bg-vibrant-blue/5', gradient: 'from-vibrant-blue/10 to-vibrant-blue/5' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Latest News Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-xs">{t.latestNews}</h3>
          <button onClick={() => onNavigate('news')} className="text-vibrant-blue text-[10px] font-bold uppercase hover:underline">{t.viewDetails}</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {news.slice(0, 5).map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('news')}
              className="min-w-[280px] bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm text-left"
            >
              <div className="h-32 relative">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                    item.type === 'alert' ? "bg-eth-red text-white" : 
                    item.type === 'missing' ? "bg-eth-yellow text-slate-900" : 
                    "bg-vibrant-blue text-white"
                  )}>
                    {item.type}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{lang === 'am' ? item.titleAm : item.title}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{lang === 'am' ? item.contentAm : item.content}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-eth-red to-red-700 p-5 rounded-[2rem] flex items-center gap-5 shadow-xl shadow-red-200 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl group-hover:scale-110 transition-transform duration-500" />
        <div className="bg-white/20 p-4 rounded-2xl text-white backdrop-blur-sm">
          <AlertCircle size={32} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-white text-lg leading-tight">{t.emergencyCall}</h3>
          <p className="text-white/80 text-xs font-bold mt-1 tracking-wide">ድንገተኛ ጥሪ - 991</p>
        </div>
        <a href="tel:991" className="bg-eth-yellow text-slate-900 px-6 py-3 rounded-2xl text-sm font-black shadow-lg active:scale-90 transition-all uppercase tracking-wider">{t.call}</a>
      </motion.div>

      <div className="grid grid-cols-2 gap-5">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-start p-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 text-left group relative overflow-hidden border border-white dark:border-slate-800",
              "bg-white dark:bg-slate-800"
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", item.gradient)} />
            
            {/* Card Watermark Logo */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 opacity-[0.03] -rotate-12 pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500">
              <PoliceLogo className="w-full h-full" />
            </div>

            <div className={cn("p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10", item.color, "dark:bg-slate-900")}>
              <item.icon size={28} />
            </div>
            <span className="font-black text-slate-800 dark:text-white text-sm relative z-10 leading-tight">{item.label}</span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] mt-1 font-bold relative z-10 tracking-wide">{item.labelAm}</span>
          </motion.button>
        ))}
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <h3 className="font-black text-vibrant-blue mb-3 flex items-center gap-2">
          <ShieldCheck size={20} className="text-eth-yellow" />
          {t.safetyTip}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed font-medium">"Always lock your doors and be aware of your surroundings when walking at night."</p>
      </motion.div>
    </div>
  );
};

const NewsPage = ({ news }: { news: any[] }) => {
  const { t, lang } = useTranslation();
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">{t.newsAlerts}</h2>
        <p className="text-xs font-bold text-eth-yellow uppercase tracking-widest">{t.officialAnnouncements}</p>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm"
          >
            <div className="h-48 relative">
              <img src={item.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg",
                  item.type === 'alert' ? "bg-eth-red text-white" : 
                  item.type === 'missing' ? "bg-eth-yellow text-slate-900" : 
                  "bg-vibrant-blue text-white"
                )}>
                  {item.type}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-eth-green" />
                  <span className="w-1.5 h-1.5 rounded-full bg-eth-yellow" />
                  <span className="w-1.5 h-1.5 rounded-full bg-eth-red" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                {lang === 'am' ? item.titleAm : item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === 'am' ? item.contentAm : item.content}
              </p>
              <button className="text-vibrant-blue text-xs font-black uppercase tracking-wider flex items-center gap-2 pt-2">
                {t.viewDetails} <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StationLocatorPage = ({ stations }: { stations: any[] }) => {
  const { t, lang } = useTranslation();
  const [hasPermission, setHasPermission] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">{t.stationLocator}</h2>
        <p className="text-xs font-bold text-eth-green uppercase tracking-widest">{t.findNearestStation}</p>
      </div>

      {!hasPermission ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-eth-green/10 text-eth-green rounded-full flex items-center justify-center mx-auto">
            <MapPin size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 dark:text-white">{t.locationAccess}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.locationAccessText}
            </p>
          </div>
          <button 
            onClick={() => setHasPermission(true)}
            className="w-full bg-eth-green text-white font-black py-4 rounded-2xl shadow-lg shadow-green-100 active:scale-95 transition-transform"
          >
            {t.grantPermission}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mock Map View */}
          <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-vibrant-blue rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-eth-red rounded-full border-2 border-white shadow-lg" />
              <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-eth-red rounded-full border-2 border-white shadow-lg" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/20">
              <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Map View (Simulated)</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.stationsNearby}</h3>
            {stations.map((station) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-white">{lang === 'am' ? station.nameAm : station.name}</h4>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={10} className="text-eth-green" /> {station.distance}</span>
                    <span className="flex items-center gap-1"><Info size={10} /> {station.location}</span>
                  </div>
                </div>
                <a 
                  href={`tel:${station.phone}`}
                  className="p-3 bg-vibrant-blue/10 text-vibrant-blue rounded-xl active:scale-90 transition-transform"
                >
                  <Phone size={18} />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ContactsPage = () => {
  const { t } = useTranslation();
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{t.emergencyDirectory}</h2>
      {EMERGENCY_CONTACTS.map((contact, i) => (
        <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2 rounded-lg",
              contact.category === 'Police' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : 
              contact.category === 'Traffic' ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" : 
              "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {contact.category === 'Police' ? <ShieldAlert size={20} /> : 
               contact.category === 'Traffic' ? <Car size={20} /> : <Phone size={20} />}
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-white text-sm">{contact.name}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px]">{contact.nameAm}</p>
            </div>
          </div>
          <a 
            href={`tel:${contact.phone}`}
            className="bg-vibrant-blue text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Phone size={14} />
            {contact.phone}
          </a>
        </div>
      ))}
    </div>
  );
};

const DeleteModal = ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-6 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 w-full max-w-xs rounded-3xl p-6 space-y-4 shadow-2xl"
      >
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
          <Trash2 size={24} />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-800 dark:text-white">{t.deleteReportTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.deleteReportDesc}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm active:scale-95 transition-transform"
          >
            {t.cancel}
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-sm active:scale-95 transition-transform"
          >
            {t.delete}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DashboardPage = ({ onEdit }: { onEdit: (report: CrimeReport) => void }) => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const [stats, setStats] = useState(storage.getStats());
  const [reports, setReports] = useState(storage.getReports());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'crime' | 'traffic'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const unsyncedCount = reports.filter(r => !r.synced).length;

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    const updated = await storage.syncReports();
    setReports(updated);
    setIsSyncing(false);
  };

  const handleDelete = () => {
    if (deletingId) {
      storage.deleteReport(deletingId);
      setReports(storage.getReports());
      setStats(storage.getStats());
      setDeletingId(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.officerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesDate = !dateFilter || report.date === dateFilter;

    return matchesSearch && matchesType && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setDateFilter('');
  };

  return (
    <div className="p-6 space-y-6">
      <AnimatePresence>
        {deletingId && (
          <DeleteModal 
            onConfirm={handleDelete} 
            onCancel={() => setDeletingId(null)} 
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">{t.dashboard}</h2>
        {unsyncedCount > 0 && isOnline && (
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 bg-vibrant-blue text-white rounded-full text-xs font-bold shadow-lg active:scale-95 transition-all disabled:opacity-50",
              isSyncing && "animate-pulse"
            )}
          >
            <RefreshCw size={14} className={cn(isSyncing && "animate-spin")} />
            {isSyncing ? t.syncing : `${t.syncing.replace('...', '')} (${unsyncedCount})`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
          <p className="text-2xl font-bold text-vibrant-blue">{stats.total}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
          <p className="text-2xl font-bold text-eth-red">{stats.crime}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t.crime}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-center shadow-sm">
          <p className="text-2xl font-bold text-eth-green">{stats.traffic}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">{t.traffic}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <History size={18} className="text-vibrant-blue" />
            {t.savedReports}
          </h3>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold",
              showFilters ? "bg-vibrant-blue text-white" : "bg-slate-100 text-slate-600"
            )}
          >
            <Filter size={14} />
            {showFilters ? t.hideFilters : t.filters}
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.type}</label>
                    <select 
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-vibrant-blue/20"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as any)}
                    >
                      <option value="all">{t.allTypes}</option>
                      <option value="crime">{t.crimeOnly}</option>
                      <option value="traffic">{t.trafficOnly}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{t.date}</label>
                    <input 
                      type="date"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-vibrant-blue/20"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                    />
                  </div>
                </div>
                {(typeFilter !== 'all' || dateFilter || searchQuery) && (
                  <button 
                    onClick={clearFilters}
                    className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1 hover:underline"
                  >
                    <X size={10} /> {t.clearFilters}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {filteredReports.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-400 text-sm">{reports.length === 0 ? t.noReports : t.noMatchingReports}</p>
            {(searchQuery || typeFilter !== 'all' || dateFilter) && (
              <button 
                onClick={clearFilters}
                className="text-vibrant-blue text-xs font-bold mt-2 underline"
              >
                {t.clearFiltersToSeeAll}
              </button>
            )}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className={cn(
                    "w-fit px-2 py-1 rounded text-[10px] font-bold uppercase",
                    report.type === 'crime' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  )}>
                    {report.type === 'crime' ? t.crime : t.traffic} • {report.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{format(report.createdAt, 'MMM d, yyyy h:mm a')}</span>
                  {report.synced ? (
                    <span className="flex items-center gap-1 text-[8px] font-bold text-green-500 uppercase">
                      <ShieldCheck size={10} /> {t.synced}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[8px] font-bold text-amber-500 uppercase">
                      <Clock size={10} /> {t.offline}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {report.photos && report.photos.length > 0 && (
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <Camera size={14} />
                    </div>
                  )}
                  {report.audio && (
                    <button 
                      onClick={() => {
                        const audioObj = new Audio(report.audio);
                        audioObj.play();
                      }}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg active:scale-90 transition-transform"
                    >
                      <Play size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => onEdit(report)}
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg active:scale-90 transition-transform hover:text-vibrant-blue"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => setDeletingId(report.id)}
                    className="p-2 bg-red-50 text-red-400 rounded-lg active:scale-90 transition-transform hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-800 line-clamp-2">{report.description}</p>
              
              {report.photos && report.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {report.photos.map((photo, i) => (
                    <div key={i} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-100">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 font-medium text-vibrant-blue"><MapPin size={10} /> {report.location}</span>
                  <span className="flex items-center gap-1"><HomeIcon size={10} /> {report.station}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 italic">
                  <span>{t.recordedBy}: {report.officerRank} {report.officerName}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const reportSchema = z.object({
  location: z.string().min(3, 'Location must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  officerRank: z.string().min(1, 'Please select officer rank'),
  officerName: z.string().min(2, 'Officer name is required'),
  station: z.string().min(2, 'Station/Location is required'),
  date: z.string(),
  time: z.string(),
  photos: z.array(z.string()).optional(),
  audio: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

const OFFICER_RANKS = [
  { id: 'commander', label: 'Commander', labelAm: 'ኮማንደር' },
  { id: 'deputy_commander', label: 'Deputy Commander', labelAm: 'ምክትል ኮማንደር' },
  { id: 'chief_inspector', label: 'Chief Inspector', labelAm: 'ዋና ኢንስፔክተር' },
  { id: 'inspector', label: 'Inspector', labelAm: 'ኢንስፔክተር' },
  { id: 'deputy_inspector', label: 'Deputy Inspector', labelAm: 'ምክትል ኢንስፔክተር' },
  { id: 'chief_sergeant', label: 'Chief Sergeant', labelAm: 'ዋና ሳጅን' },
  { id: 'deputy_sergeant', label: 'Deputy Sergeant', labelAm: 'ምክትል ሳጅን' },
  { id: 'sergeant', label: 'Sergeant', labelAm: 'ሳጅን' },
  { id: 'constable', label: 'Constable', labelAm: 'ኮንስታብል' },
];

const CRIME_CATEGORIES = [
  { id: 'human_trafficking', label: 'Human Trafficking', labelAm: 'የሰወች ዝውውር' },
  { id: 'fraud', label: 'Fraud and Deception', labelAm: 'ማታለልና ማጭበርበር ወንጀል' },
  { id: 'rape', label: 'Rape', labelAm: 'አስገድዶ መድፈር ወንጀል' },
  { id: 'robbery', label: 'Robbery and Snatching', labelAm: 'ዘረፋና ንጥቂያ ወንጀል' },
  { id: 'day_burglary', label: 'Daytime Burglary', labelAm: 'በቀን ቤት ሰብሮ ወንጀል' },
  { id: 'night_burglary', label: 'Nighttime Burglary', labelAm: 'በሌሊት ቤት ሰብሮ ወንጀል' },
  { id: 'arms_trafficking', label: 'Illegal Arms Trafficking', labelAm: 'ህገወጥ የጦር መሳሪያ ዝውውር' },
  { id: 'extortion', label: 'Miscellaneous Extortion', labelAm: 'ልዩ ልዩ የቅሚያ ወንጀል' },
  { id: 'gov_property_damage', label: 'Damage to Gov Property', labelAm: 'በመንግስት ሀብት ላይ ጉዳት ማድረስ' },
  { id: 'corruption', label: 'Corruption', labelAm: 'የሙስና ወንጀሎች' },
  { id: 'abuse_of_power', label: 'Abuse of Power', labelAm: 'በስልጣን ያለአግባብ መጠቀም' },
  { id: 'terrorism', label: 'Terrorism', labelAm: 'ሽብር ወንጀል' },
  { id: 'theft', label: 'Theft', labelAm: 'የስርቆት ወንጀል' },
  { id: 'homicide', label: 'Homicide', labelAm: 'ነብስ ግድያ' },
  { id: 'other', label: 'Other', labelAm: 'ሌሎች' },
];

const TRAFFIC_CATEGORIES = [
  { id: 'vehicle_collision', label: 'Vehicle Collision', labelAm: 'የተሽከርካሪ ግጭት' },
  { id: 'pedestrian_collision', label: 'Pedestrian Collision', labelAm: 'የእግረኛ ግጭት' },
  { id: 'fatal_accident', label: 'Fatal Accident', labelAm: 'የሞት አደጋ' },
  { id: 'minor_injury', label: 'Minor Injury', labelAm: 'ቀላል አካል ጉዳት' },
  { id: 'serious_injury', label: 'Serious Injury', labelAm: 'ከባድ አካል ጉዳት' },
  { id: 'accident', label: 'Traffic Accident', labelAm: 'ትራፊክ አደጋ' },
  { id: 'other', label: 'Other', labelAm: 'ሌሎች' },
];

const ReportForm = ({ type, onBack, onGoHome, initialData }: { type: 'crime' | 'traffic', onBack: () => void, onGoHome: () => void, initialData?: CrimeReport }) => {
  const { t } = useTranslation();
  const [isSuccess, setIsSuccess] = useState(false);
  const categories = type === 'crime' ? CRIME_CATEGORIES : TRAFFIC_CATEGORIES;
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: initialData ? {
      location: initialData.location,
      description: initialData.description,
      category: initialData.category,
      officerRank: initialData.officerRank,
      officerName: initialData.officerName,
      station: initialData.station,
      date: initialData.date,
      time: initialData.time,
      photos: initialData.photos || [],
      audio: initialData.audio,
    } : {
      category: '',
      officerRank: '',
      officerName: '',
      station: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      photos: [],
    }
  });

  const photos = watch('photos') || [];
  const audio = watch('audio');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = [...photos];
    Array.from(files).forEach((file: File) => {
      if (newPhotos.length >= 3) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push(reader.result as string);
        setValue('photos', newPhotos);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setValue('photos', newPhotos);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setValue('audio', reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audio) {
      const audioObj = new Audio(audio);
      audioObj.play();
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      const u = await ensureAnonymousAuth();
      const reportId = initialData?.id || Math.random().toString(36).substring(7);
      const reportData = {
        ...data,
        id: reportId,
        type,
        status: initialData?.status || 'pending',
        timestamp: Timestamp.now(),
        authorUid: u.uid,
      };

      await setDoc(doc(db, 'crime_reports', reportId), reportData);
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onGoHome();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'crime_reports');
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <ShieldAlert size={40} />
          </motion.div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t.successTitle}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t.successDesc}</p>
        </div>
        
        <div className="w-full space-y-3 pt-4">
          <button 
            onClick={onBack}
            className="w-full bg-vibrant-blue text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={18} />
            {t.viewDashboard}
          </button>
          <button 
            onClick={onGoHome}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <HomeIcon size={18} />
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {!auth.currentUser && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex gap-3">
          <AlertCircle className="text-amber-500 shrink-0" size={20} />
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">Authentication Required</p>
            <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
              Anonymous reporting is currently unavailable. Please sign in with Google in the Profile section or contact support.
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 dark:text-slate-400 active:scale-90 transition-transform">
          <ChevronRight className="rotate-180" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">{initialData ? t.editReport : t.newReport} ({type === 'crime' ? t.crime : t.traffic})</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.incidentType}</label>
          <select 
            {...register('category')}
            className={cn(
              "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl py-3.5 px-4 text-sm outline-none transition-all appearance-none dark:text-white",
              errors.category ? "border-red-200 dark:border-red-900/50 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue"
            )}
          >
            <option value="">{t.selectCategory}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.labelAm} className="dark:bg-slate-900">{cat.labelAm} ({cat.label})</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.category.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.officerRank}</label>
            <select 
              {...register('officerRank')}
              className={cn(
                "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl py-3.5 px-4 text-sm outline-none transition-all appearance-none dark:text-white",
                errors.officerRank ? "border-red-200 dark:border-red-900/50 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue"
              )}
            >
              <option value="">{t.rank}</option>
              {OFFICER_RANKS.map(rank => (
                <option key={rank.id} value={rank.labelAm} className="dark:bg-slate-900">{rank.labelAm}</option>
              ))}
            </select>
            {errors.officerRank && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.officerRank.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.officerName}</label>
            <input 
              {...register('officerName')}
              className={cn(
                "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl py-3.5 px-4 text-sm outline-none transition-all dark:text-white",
                errors.officerName ? "border-red-200 dark:border-red-900/50 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue"
              )}
              placeholder={t.officerName}
            />
            {errors.officerName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.officerName.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.filingStation}</label>
          <div className="relative">
            <HomeIcon className={cn("absolute left-3 top-3.5 transition-colors", errors.station ? "text-red-400" : "text-slate-400 dark:text-slate-500")} size={18} />
            <input 
              {...register('station')}
              className={cn(
                "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none transition-all dark:text-white",
                errors.station ? "border-red-200 dark:border-red-900/50 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue"
              )}
              placeholder={t.stationPlaceholder}
            />
          </div>
          {errors.station && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.station.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.incidentLocation}</label>
          <div className="relative">
            <MapPin className={cn("absolute left-3 top-3.5 transition-colors", errors.location ? "text-red-400" : "text-slate-400 dark:text-slate-500")} size={18} />
            <input 
              {...register('location')}
              className={cn(
                "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none transition-all dark:text-white",
                errors.location ? "border-red-200 dark:border-red-900/50 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue"
              )}
              placeholder={t.locationPlaceholder}
            />
          </div>
          {errors.location && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.location.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.date}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="date"
                {...register('date')}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.time}</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="time"
                {...register('time')}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.detailedDescription}</label>
          <textarea 
            {...register('description')}
            rows={5}
            className={cn(
              "w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-4 text-sm outline-none transition-all resize-none dark:text-white",
              errors.description ? "border-red-200 dark:border-red-900/50 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/20" : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-vibrant-blue/20 focus:border-vibrant-blue"
            )}
            placeholder={t.descriptionPlaceholder}
          />
          {errors.description && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.description.message}</p>}
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.attachPhotos} ({photos.length}/3)</label>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-vibrant-blue hover:text-vibrant-blue transition-colors cursor-pointer">
                <Camera size={24} />
                <span className="text-[8px] font-bold mt-1 uppercase">{t.plus}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 italic">{t.maxPhotos}</p>
        </div>

        {/* Audio Recording Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 tracking-wider">{t.recordAudio}</label>
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button 
                type="button"
                onClick={startRecording}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Mic size={18} />
                {t.recordAudio}
              </button>
            ) : (
              <button 
                type="button"
                onClick={stopRecording}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 animate-pulse"
              >
                <Square size={18} />
                {t.stopRecording}
              </button>
            )}
            
            {audio && (
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={playAudio}
                  className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl active:scale-95 transition-transform"
                >
                  <Play size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => setValue('audio', undefined)}
                  className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl active:scale-95 transition-transform"
                >
                  <Trash size={18} />
                </button>
              </div>
            )}
          </div>
          {isRecording && <p className="text-[9px] text-red-500 font-bold animate-pulse">{t.recording}</p>}
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="w-full bg-vibrant-blue text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <ShieldAlert size={18} />
            {t.submitReport}
          </button>
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-4 px-6">
            {t.accuracyConfirm}
          </p>
        </div>
      </form>
    </div>
  );
};

const ServicesPage = () => {
  const { t } = useTranslation();
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-vibrant-blue">
            <Eye size={24} />
            <h3 className="text-lg font-bold dark:text-white">{t.vision}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.visionText}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-vibrant-blue">
            <Target size={24} />
            <h3 className="text-lg font-bold dark:text-white">{t.mission}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t.missionText}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-vibrant-blue">
            <ShieldCheck size={24} />
            <h3 className="text-lg font-bold dark:text-white">{t.values}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[t.valueProfessionalism, t.valueIntegrity, t.valueReadiness, t.valueHumanRights].map((val, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 text-center">
                {val}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileText size={20} className="text-vibrant-blue" />
          {t.serviceStandards}
        </h2>
        <div className="space-y-3">
          {[
            { title: 'Criminal Record Clearance', titleAm: 'የወንጀል ነፃ መረጃ', desc: 'Fingerprint and record verification.', icon: ShieldAlert },
            { title: 'Lost Document Certification', titleAm: 'የጠፉ ሰነዶች ማስረጃ', desc: 'Certification for lost IDs, licenses, etc.', icon: Info },
            { title: 'Traffic Accident Investigation', titleAm: 'የትራፊክ አደጋ ምርመራ', desc: 'Official accident reports and sketches.', icon: Car },
            { title: 'Forensic Services', titleAm: 'ፎረንሲክ አገልግሎት', desc: 'Scientific investigation and evidence.', icon: Search },
          ].map((service, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
              <div className="bg-vibrant-blue/5 p-3 rounded-xl text-vibrant-blue h-fit">
                <service.icon size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{service.titleAm}</h4>
                <p className="text-[10px] text-slate-400">{service.title}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-vibrant-blue text-white p-6 rounded-3xl shadow-lg space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertCircle size={20} className="text-eth-yellow" />
          {t.complaintProcess}
        </h3>
        <div className="space-y-3 text-sm text-white/80">
          <p>{t.complaintStep1}</p>
          <p>{t.complaintStep2}</p>
          <p>{t.complaintStep3}</p>
        </div>
      </div>

      <button className="w-full bg-white border-2 border-vibrant-blue text-vibrant-blue font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
        <Download size={20} />
        {t.downloadPdf}
      </button>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck size={20} className="text-vibrant-blue" />
          {t.followUs}
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Facebook, label: t.facebook, color: 'bg-[#1877F2]', link: 'https://www.facebook.com/share/1CCxnhaNmX/' },
            { icon: Send, label: t.telegram, color: 'bg-[#0088cc]', link: 'https://t.me/westgojjamepolice' },
            { icon: Youtube, label: t.youtube, color: 'bg-[#FF0000]', link: '#' },
            { icon: ShieldAlert, label: t.tiktok, color: 'bg-black', link: '#' },
          ].map((social, i) => (
            <a 
              key={i} 
              href={social.link}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-active:scale-90",
                social.color
              )}>
                <social.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">{social.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main App Shell ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('police-app-theme');
    return (saved as Theme) || 'police';
  });

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [news, setNews] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('police-app-theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.setProperty('--color-vibrant-blue', '#1e40af');
      root.style.setProperty('--color-eth-yellow', '#fbbf24');
    } else if (theme === 'light') {
      root.classList.remove('dark');
      root.style.setProperty('--color-vibrant-blue', '#3b82f6');
      root.style.setProperty('--color-eth-yellow', '#b45309');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--color-vibrant-blue', '#007FFF');
      root.style.setProperty('--color-eth-yellow', '#D4AF37');
    }
  }, [theme]);

  useEffect(() => {
    const initAuth = async () => {
      setIsAuthLoading(true);
      try {
        const u = await ensureAnonymousAuth();
        setUser(u);
        setAuthError(null);
      } catch (error: any) {
        console.error("Auth initialization failed:", error);
        if (error.code === 'auth/admin-restricted-operation') {
          setAuthError("Anonymous reporting is currently disabled in the backend. You can still browse public information or sign in with Google to report.");
        } else {
          setAuthError("Authentication failed. Some features may be limited.");
        }
      } finally {
        setIsAuthReady(true);
        setIsAuthLoading(false);
      }
    };
    initAuth();

    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const newsQuery = query(collection(db, 'news_alerts'), orderBy('timestamp', 'desc'));
    const unsubscribeNews = onSnapshot(newsQuery, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNews(newsData.length > 0 ? newsData : MOCK_NEWS);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news_alerts');
    });

    const stationsQuery = query(collection(db, 'police_stations'));
    const unsubscribeStations = onSnapshot(stationsQuery, (snapshot) => {
      const stationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStations(stationsData.length > 0 ? stationsData : MOCK_STATIONS);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'police_stations');
    });

    return () => {
      unsubscribeNews();
      unsubscribeStations();
    };
  }, [isAuthReady]);

  const [currentPage, setCurrentPage] = useState('home');
  const [editingReport, setEditingReport] = useState<CrimeReport | null>(null);
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={setCurrentPage} news={news} />;
      case 'news': return <NewsPage news={news} />;
      case 'station-locator': return <StationLocatorPage stations={stations} />;
      case 'contacts': return <ContactsPage />;
      case 'dashboard': return (
        <DashboardPage 
          onEdit={(report) => {
            setEditingReport(report);
            setCurrentPage('edit');
          }} 
        />
      );
      case 'crime': return <ReportForm type="crime" onBack={() => setCurrentPage('dashboard')} onGoHome={() => setCurrentPage('home')} />;
      case 'traffic': return <ReportForm type="traffic" onBack={() => setCurrentPage('dashboard')} onGoHome={() => setCurrentPage('home')} />;
      case 'edit': return editingReport ? (
        <ReportForm 
          type={editingReport.type} 
          initialData={editingReport} 
          onBack={() => {
            setEditingReport(null);
            setCurrentPage('dashboard');
          }} 
          onGoHome={() => {
            setEditingReport(null);
            setCurrentPage('home');
          }}
        />
      ) : null;
      case 'services': return <ServicesPage />;
      case 'qr': return <QRScannerPage onBack={() => setCurrentPage('home')} />;
      case 'help': return <HelpPage onBack={() => setCurrentPage('home')} />;
      case 'privacy': return <PrivacySecurityPage onBack={() => setCurrentPage('menu')} />;
      case 'about': return <AboutPage onBack={() => setCurrentPage('home')} />;
      case 'profile': return <ProfilePage />;
      case 'menu': return <MenuPage onNavigate={setCurrentPage} />;
      default: return <HomePage onNavigate={setCurrentPage} news={news} />;
    }
  };

  const tabs = [
    { id: 'home', icon: HomeIcon, label: t.home },
    { id: 'contacts', icon: Phone, label: t.contacts },
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'profile', icon: User, label: t.profile },
    { id: 'menu', icon: MenuIcon, label: t.menu || 'Menu' },
  ];

  useEffect(() => {
    if (['home', 'contacts', 'dashboard', 'menu', 'profile'].includes(currentPage)) {
      setActiveTab(currentPage);
    }
  }, [currentPage]);

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <LanguageContext.Provider value={{ lang, setLang, t }}>
          <div className={cn(
            "mobile-container pb-24",
            theme === 'dark' ? "bg-slate-950" : "bg-slate-50"
          )}>
            {authError && !user && (
              <div className="bg-amber-500 text-white p-4 text-[10px] font-bold text-center relative z-[100] shadow-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} />
                    <p>{authError}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={async () => {
                        try {
                          setIsAuthLoading(true);
                          const u = await signInWithGoogle();
                          setUser(u);
                          setAuthError(null);
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setIsAuthLoading(false);
                        }
                      }}
                      className="bg-white text-amber-600 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                    >
                      <PoliceLogo className="w-4 h-4" />
                      Sign in with Google
                    </button>
                    <button 
                      onClick={() => setAuthError(null)}
                      className="bg-amber-600 text-white px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-amber-700 transition-all active:scale-95"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-[8px] opacity-80 font-normal italic">
                    Administrators: Enable 'Anonymous' in Firebase Console &gt; Authentication &gt; Sign-in method
                  </p>
                </div>
              </div>
            )}
            {isAuthLoading && (
              <div className="fixed inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-[200] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-vibrant-blue border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-vibrant-blue uppercase tracking-widest animate-pulse">Authenticating...</p>
                </div>
              </div>
            )}
          {/* Floating Decorative Logos */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-1/4 -left-10 w-32 h-32 opacity-[0.02] rotate-12">
              <img src={POLICE_LOGO_URL} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="absolute bottom-1/4 -right-10 w-40 h-40 opacity-[0.02] -rotate-12">
              <img src={POLICE_LOGO_URL} alt="" className="w-full h-full object-contain" />
            </div>
          </div>

          <Header 
            title="West Gojjam Zone Police" 
            subtitle="ምዕራብ ጎጃም ዞን ፖሊስ" 
          />
          
          <nav className="sticky top-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-40 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(tab.id);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  activeTab === tab.id ? "text-vibrant-blue" : "text-slate-400 dark:text-slate-500"
                )}
              >
                <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="w-1 h-1 bg-eth-yellow rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>

            <footer className="mt-12 pb-8 px-6 text-center space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t.developedBy}
              </p>
              <p className="text-[9px] font-medium text-slate-300">
                {t.buildDate}
              </p>
            </footer>
          </main>

          <EmergencyButton />
        </div>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
}
