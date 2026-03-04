import React, { useState, useEffect } from 'react';
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
  Trash
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { cn } from './lib/utils';
import { storage, EMERGENCY_CONTACTS, type CrimeReport, type UserProfile } from './lib/storage';
import { format } from 'date-fns';
import { translations, type Language } from './lib/translations';

// --- Constants ---
const POLICE_LOGO_URL = "https://files.oaiusercontent.com/file-67c70697771c4997973700"; // Updated with the provided logo

// --- Context ---
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

// --- Components ---

const Header = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const { lang, setLang } = useTranslation();
  
  return (
    <header className="glass-blue text-white p-6 pt-12 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-police-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-police-gold/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
      
      <div className="absolute top-4 right-6 flex gap-2 z-50">
        <button 
          onClick={() => setLang('en')}
          className={cn(
            "text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all duration-300",
            lang === 'en' ? "bg-police-gold text-police-navy border-police-gold shadow-lg" : "text-white/60 border-white/20 hover:bg-white/10"
          )}
        >
          EN
        </button>
        <button 
          onClick={() => setLang('am')}
          className={cn(
            "text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all duration-300",
            lang === 'am' ? "bg-police-gold text-police-navy border-police-gold shadow-lg" : "text-white/60 border-white/20 hover:bg-white/10"
          )}
        >
          አማ
        </button>
      </div>
      
      <div className="flex items-center gap-5 relative z-10">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl p-1 border-2 border-police-gold/30">
          <img 
            src={POLICE_LOGO_URL} 
            alt="Amhara Police Logo" 
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://picsum.photos/seed/police-logo/200/200";
            }}
          />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight leading-tight">{title}</h1>
          <p className="text-police-gold text-sm font-bold mt-0.5">{subtitle}</p>
          <p className="text-white/70 text-[10px] font-medium mt-1 italic border-l-2 border-police-gold/50 pl-2">
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
    className="fixed bottom-24 right-6 w-16 h-16 bg-red-600 text-white rounded-full flex flex-col items-center justify-center shadow-2xl z-50 active:scale-95 transition-transform border-4 border-white overflow-hidden"
  >
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <img src={POLICE_LOGO_URL} alt="" className="w-full h-full object-contain scale-150" />
    </div>
    <Phone size={24} fill="currentColor" className="relative z-10" />
    <span className="text-[8px] font-bold uppercase mt-1 relative z-10">991</span>
  </a>
);

// --- Pages ---

const AboutPage = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800">{t.aboutUs}</h2>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-police-navy/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl p-1 border-2 border-police-gold/30">
            <img 
              src={POLICE_LOGO_URL} 
              alt="Police Logo" 
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/police-logo/200/200";
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-police-navy flex items-center gap-2">
              <History size={20} className="text-police-gold" />
              {t.history}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify">
              {t.historyText}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-police-navy flex items-center gap-2">
              <Target size={20} className="text-police-gold" />
              {t.mission}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify">
              {t.missionText}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-police-navy text-white p-8 rounded-[2.5rem] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-xl" />
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Edit2 size={20} className="text-police-gold" />
          {t.developerInfo}
        </h3>
        <div className="space-y-2">
          <p className="text-sm font-bold text-police-gold">{t.developerName}</p>
          <p className="text-xs text-white/70">{t.creationDate}</p>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { t } = useTranslation();
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
        <h2 className="text-xl font-black text-slate-800">{t.userProfile}</h2>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-police-navy/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-police-navy/5 rounded-full flex items-center justify-center text-police-navy">
            <User size={40} />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.fullName}</label>
            <input 
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy transition-all"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="e.g. Abebe Bikila"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.phoneNumber}</label>
            <input 
              type="tel"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy transition-all"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              placeholder="e.g. 0911223344"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.email}</label>
            <input 
              type="email"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy transition-all"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="e.g. abebe@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.address}</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy transition-all resize-none"
              rows={3}
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="e.g. Finote Selam, Kebele 01"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-police-navy text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all hover:bg-slate-800 flex items-center justify-center gap-2"
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
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800">{t.helpCenter}</h2>
      </div>

      <div className="space-y-4">
        {helpItems.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4 group active:scale-[0.98] transition-transform"
          >
            <div className="bg-police-navy/5 p-4 rounded-2xl text-police-navy h-fit group-hover:bg-police-navy group-hover:text-white transition-colors">
              <item.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-police-gold/10 p-6 rounded-[2rem] border border-police-gold/20 text-center space-y-2">
        <HelpCircle size={32} className="mx-auto text-police-gold" />
        <h3 className="font-bold text-police-navy">{t.help}</h3>
        <p className="text-[10px] text-police-navy/70 font-medium">
          West Gojjam Zone Police is here to serve you 24/7.
        </p>
      </div>
    </div>
  );
};

const QRScannerPage = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-full text-slate-600 active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-800">{t.qrScanner}</h2>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {!scanResult ? (
          <div id="reader" className="w-full rounded-2xl overflow-hidden" />
        ) : (
          <div className="p-6 space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{t.scanResult}</h3>
              <p className="text-sm text-slate-600 break-all mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                {scanResult}
              </p>
            </div>
            <button 
              onClick={() => setScanResult(null)}
              className="w-full bg-police-navy text-white font-bold py-4 rounded-2xl active:scale-95 transition-transform"
            >
              {t.scanQr}
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4">
        <div className="bg-blue-600/10 p-3 rounded-xl text-blue-600 h-fit">
          <Info size={20} />
        </div>
        <p className="text-xs text-blue-700 leading-relaxed font-medium">
          Point your camera at a West Gojjam Zone Police official QR code to verify information or access services.
        </p>
      </div>
    </div>
  );
};

const HomePage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { t } = useTranslation();
  const menuItems = [
    { id: 'contacts', icon: Phone, label: t.contacts, labelAm: 'ድንገተኛ ስልክ ቁጥሮች', color: 'bg-blue-50 text-blue-600', gradient: 'from-blue-500/10 to-blue-600/5' },
    { id: 'crime', icon: ShieldAlert, label: t.crime, labelAm: 'የወንጅል ቁጥጥር', color: 'bg-red-50 text-red-600', gradient: 'from-red-500/10 to-red-600/5' },
    { id: 'traffic', icon: Car, label: t.traffic, labelAm: 'የትራፊክ ደህንነት', color: 'bg-green-50 text-green-600', gradient: 'from-green-500/10 to-green-600/5' },
    { id: 'services', icon: Info, label: t.info, labelAm: 'የፖሊስ አገልግሎት', color: 'bg-amber-50 text-amber-600', gradient: 'from-amber-500/10 to-amber-600/5' },
    { id: 'qr', icon: QrCode, label: t.scanQr, labelAm: 'QR ኮድ ይቃኙ', color: 'bg-indigo-50 text-indigo-600', gradient: 'from-indigo-500/10 to-indigo-600/5' },
    { id: 'help', icon: HelpCircle, label: t.help, labelAm: 'እርዳታ', color: 'bg-slate-50 text-slate-600', gradient: 'from-slate-500/10 to-slate-600/5' },
    { id: 'about', icon: Info, label: t.aboutUs, labelAm: 'ስለ እኛ', color: 'bg-police-navy/5 text-police-navy', gradient: 'from-police-navy/10 to-police-navy/5' },
  ];

  return (
    <div className="p-6 space-y-8">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-red-600 to-red-700 p-5 rounded-[2rem] flex items-center gap-5 shadow-xl shadow-red-200 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl group-hover:scale-110 transition-transform duration-500" />
        <div className="bg-white/20 p-4 rounded-2xl text-white backdrop-blur-sm">
          <AlertCircle size={32} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-white text-lg leading-tight">{t.emergencyCall}</h3>
          <p className="text-white/80 text-xs font-bold mt-1 tracking-wide">ድንገተኛ ጥሪ - 991</p>
        </div>
        <a href="tel:991" className="bg-police-gold text-police-navy px-6 py-3 rounded-2xl text-sm font-black shadow-lg active:scale-90 transition-all uppercase tracking-wider">{t.call}</a>
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
              "flex flex-col items-start p-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 text-left group relative overflow-hidden border border-white",
              "bg-white"
            )}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", item.gradient)} />
            
            {/* Card Watermark Logo */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 opacity-[0.03] -rotate-12 pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500">
              <img src={POLICE_LOGO_URL} alt="" className="w-full h-full object-contain" />
            </div>

            <div className={cn("p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10", item.color)}>
              <item.icon size={28} />
            </div>
            <span className="font-black text-slate-800 text-sm relative z-10 leading-tight">{item.label}</span>
            <span className="text-slate-400 text-[10px] mt-1 font-bold relative z-10 tracking-wide">{item.labelAm}</span>
          </motion.button>
        ))}
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-police-navy/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <h3 className="font-black text-police-navy mb-3 flex items-center gap-2">
          <ShieldCheck size={20} className="text-police-gold" />
          {t.safetyTip}
        </h3>
        <p className="text-sm text-slate-600 italic leading-relaxed font-medium">"Always lock your doors and be aware of your surroundings when walking at night."</p>
      </motion.div>
    </div>
  );
};

const ContactsPage = () => {
  const { t } = useTranslation();
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-800 mb-2">{t.emergencyDirectory}</h2>
      {EMERGENCY_CONTACTS.map((contact, i) => (
        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2 rounded-lg",
              contact.category === 'Police' ? "bg-blue-50 text-blue-600" : 
              contact.category === 'Traffic' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            )}>
              {contact.category === 'Police' ? <ShieldAlert size={20} /> : 
               contact.category === 'Traffic' ? <Car size={20} /> : <Phone size={20} />}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{contact.name}</p>
              <p className="text-slate-500 text-[10px]">{contact.nameAm}</p>
            </div>
          </div>
          <a 
            href={`tel:${contact.phone}`}
            className="bg-police-navy text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-xs rounded-3xl p-6 space-y-4 shadow-2xl"
      >
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Trash2 size={24} />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-slate-800">{t.deleteReportTitle}</h3>
          <p className="text-xs text-slate-500 mt-1">{t.deleteReportDesc}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm active:scale-95 transition-transform"
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
  const [stats, setStats] = useState(storage.getStats());
  const [reports, setReports] = useState(storage.getReports());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'crime' | 'traffic'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
          <p className="text-2xl font-bold text-police-navy">{stats.total}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.total}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-600">{stats.crime}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.crime}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-600">{stats.traffic}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.traffic}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <History size={18} className="text-police-navy" />
            {t.savedReports}
          </h3>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold",
              showFilters ? "bg-police-navy text-white" : "bg-slate-100 text-slate-600"
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
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy outline-none transition-all"
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
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-police-navy/20"
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
                      className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-police-navy/20"
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
                className="text-police-navy text-xs font-bold mt-2 underline"
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
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg active:scale-90 transition-transform hover:text-police-navy"
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
                  <span className="flex items-center gap-1 font-medium text-police-navy"><MapPin size={10} /> {report.location}</span>
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

  const onSubmit = (data: ReportFormData) => {
    if (initialData) {
      storage.updateReport(initialData.id, data);
    } else {
      storage.saveReport({ ...data, type });
    }
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
          >
            <ShieldAlert size={40} />
          </motion.div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">{t.successTitle}</h2>
          <p className="text-slate-500 text-sm">{t.successDesc}</p>
        </div>
        
        <div className="w-full space-y-3 pt-4">
          <button 
            onClick={onBack}
            className="w-full bg-police-navy text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={18} />
            {t.viewDashboard}
          </button>
          <button 
            onClick={onGoHome}
            className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 active:scale-90 transition-transform">
          <ChevronRight className="rotate-180" />
        </button>
        <h2 className="text-lg font-bold text-slate-800">{initialData ? t.editReport : t.newReport} ({type === 'crime' ? t.crime : t.traffic})</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.incidentType}</label>
          <select 
            {...register('category')}
            className={cn(
              "w-full bg-slate-50 border rounded-xl py-3.5 px-4 text-sm outline-none transition-all appearance-none",
              errors.category ? "border-red-200 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy"
            )}
          >
            <option value="">{t.selectCategory}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.labelAm}>{cat.labelAm} ({cat.label})</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.category.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.officerRank}</label>
            <select 
              {...register('officerRank')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl py-3.5 px-4 text-sm outline-none transition-all appearance-none",
                errors.officerRank ? "border-red-200 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy"
              )}
            >
              <option value="">{t.rank}</option>
              {OFFICER_RANKS.map(rank => (
                <option key={rank.id} value={rank.labelAm}>{rank.labelAm}</option>
              ))}
            </select>
            {errors.officerRank && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.officerRank.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.officerName}</label>
            <input 
              {...register('officerName')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl py-3.5 px-4 text-sm outline-none transition-all",
                errors.officerName ? "border-red-200 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy"
              )}
              placeholder={t.officerName}
            />
            {errors.officerName && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.officerName.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.filingStation}</label>
          <div className="relative">
            <HomeIcon className={cn("absolute left-3 top-3.5 transition-colors", errors.station ? "text-red-400" : "text-slate-400")} size={18} />
            <input 
              {...register('station')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none transition-all",
                errors.station ? "border-red-200 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy"
              )}
              placeholder={t.stationPlaceholder}
            />
          </div>
          {errors.station && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.station.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.incidentLocation}</label>
          <div className="relative">
            <MapPin className={cn("absolute left-3 top-3.5 transition-colors", errors.location ? "text-red-400" : "text-slate-400")} size={18} />
            <input 
              {...register('location')}
              className={cn(
                "w-full bg-slate-50 border rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none transition-all",
                errors.location ? "border-red-200 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy"
              )}
              placeholder={t.locationPlaceholder}
            />
          </div>
          {errors.location && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.location.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.date}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="date"
                {...register('date')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.time}</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input 
                type="time"
                {...register('time')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.detailedDescription}</label>
          <textarea 
            {...register('description')}
            rows={5}
            className={cn(
              "w-full bg-slate-50 border rounded-xl p-4 text-sm outline-none transition-all resize-none",
              errors.description ? "border-red-200 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:ring-2 focus:ring-police-navy/20 focus:border-police-navy"
            )}
            placeholder={t.descriptionPlaceholder}
          />
          {errors.description && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.description.message}</p>}
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.attachPhotos} ({photos.length}/3)</label>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
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
              <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-police-navy hover:text-police-navy transition-colors cursor-pointer">
                <Camera size={24} />
                <span className="text-[8px] font-bold mt-1 uppercase">{t.plus}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
          <p className="text-[9px] text-slate-400 italic">{t.maxPhotos}</p>
        </div>

        {/* Audio Recording Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-wider">{t.recordAudio}</label>
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <button 
                type="button"
                onClick={startRecording}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
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
                  className="p-3 bg-green-100 text-green-600 rounded-xl active:scale-95 transition-transform"
                >
                  <Play size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => setValue('audio', undefined)}
                  className="p-3 bg-red-100 text-red-600 rounded-xl active:scale-95 transition-transform"
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
            className="w-full bg-police-navy text-white font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            <ShieldAlert size={18} />
            {t.submitReport}
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-4 px-6">
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
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-police-navy">
            <Eye size={24} />
            <h3 className="text-lg font-bold">{t.vision}</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{t.visionText}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-police-navy">
            <Target size={24} />
            <h3 className="text-lg font-bold">{t.mission}</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{t.missionText}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-3 text-police-navy">
            <ShieldCheck size={24} />
            <h3 className="text-lg font-bold">{t.values}</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[t.valueProfessionalism, t.valueIntegrity, t.valueReadiness, t.valueHumanRights].map((val, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-xl text-[10px] font-bold text-slate-700 text-center">
                {val}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileText size={20} className="text-police-navy" />
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
              <div className="bg-police-navy/5 p-3 rounded-xl text-police-navy h-fit">
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

      <div className="bg-police-navy text-white p-6 rounded-3xl shadow-lg space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertCircle size={20} className="text-police-gold" />
          {t.complaintProcess}
        </h3>
        <div className="space-y-3 text-sm text-white/80">
          <p>{t.complaintStep1}</p>
          <p>{t.complaintStep2}</p>
          <p>{t.complaintStep3}</p>
        </div>
      </div>

      <button className="w-full bg-white border-2 border-police-navy text-police-navy font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
        <Download size={20} />
        {t.downloadPdf}
      </button>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck size={20} className="text-police-navy" />
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
  const [currentPage, setCurrentPage] = useState('home');
  const [editingReport, setEditingReport] = useState<CrimeReport | null>(null);
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={setCurrentPage} />;
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
      case 'about': return <AboutPage onBack={() => setCurrentPage('home')} />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  const tabs = [
    { id: 'home', icon: HomeIcon, label: t.home },
    { id: 'contacts', icon: Phone, label: t.contacts },
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'profile', icon: User, label: t.profile },
    { id: 'services', icon: Info, label: t.info },
  ];

  useEffect(() => {
    if (['home', 'contacts', 'dashboard', 'services', 'profile'].includes(currentPage)) {
      setActiveTab(currentPage);
    }
  }, [currentPage]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="mobile-container">
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
        
        <main className="flex-1 overflow-y-auto pb-32">
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

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center safe-area-bottom z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(tab.id);
              }}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeTab === tab.id ? "text-police-navy" : "text-slate-400"
              )}
            >
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="w-1 h-1 bg-police-gold rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </LanguageContext.Provider>
  );
}
