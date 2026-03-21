import React from 'react';
import { 
  LayoutDashboard, 
  Shield, 
  Users, 
  ClipboardList, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  AlertTriangle,
  Globe,
  Phone,
  HelpCircle,
  Bot,
  ArrowLeft,
  Facebook,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { APP_LOGO } from '../constants';

interface SidebarItemProps {
  key?: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SidebarItem({ icon: Icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' 
          : 'text-brand-text-secondary hover:bg-brand-border hover:text-brand-text-primary'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBack: () => void;
  onLogout: () => void;
  userName: string;
  lang: Language;
  setLang: (lang: Language) => void;
}

export function Layout({ children, activeTab, setActiveTab, onBack, onLogout, userName, lang, setLang }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const t = translations[lang];

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'incidents', label: t.crime, icon: AlertTriangle },
    { id: 'officers', label: t.officers || 'Officers', icon: Users },
    { id: 'assignments', label: t.assignments || 'Assignments', icon: ClipboardList },
    { id: 'reports', label: t.reports || 'Reports', icon: FileText },
    { id: 'zone-reports', label: t.zoneReports.title || 'Zone Reports', icon: ClipboardList },
    { id: 'community-reports', label: lang === 'am' ? 'የማህበረሰብ ሪፖርቶች' : 'Community Reports', icon: Users },
    { id: 'contacts', label: t.contacts || 'Contacts', icon: Phone },
    { id: 'info', label: t.info || 'Info', icon: Shield },
    { id: 'ai-assistant', label: t.aiAssistant || 'AI Assistant', icon: Bot },
    { id: 'help', label: t.help || 'Help', icon: HelpCircle },
    { id: 'settings', label: t.settings || 'Settings', icon: Settings },
  ];

  return (
    <div className="h-[100dvh] flex bg-brand-bg text-brand-text-primary overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50 flex gap-2">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-brand-card border border-brand-border rounded-lg text-brand-text-primary shadow-lg"
        >
          <Menu size={24} />
        </button>
        {activeTab !== 'dashboard' && (
          <button 
            onClick={onBack}
            className="p-2 bg-brand-card border border-brand-border rounded-lg text-brand-text-primary shadow-lg flex items-center gap-2"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-brand-card border-r border-brand-border z-50 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-accent">
                <img 
                  src={APP_LOGO} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-bold tracking-tight">West Gojjam Police</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-brand-text-secondary">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="pt-6 border-t border-brand-border mt-auto space-y-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-bg rounded-xl border border-brand-border">
              <Globe size={16} className="text-brand-accent" />
              <div className="flex gap-2">
                <button 
                  onClick={() => setLang('en')}
                  className={`text-xs font-bold px-2 py-1 rounded ${lang === 'en' ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLang('am')}
                  className={`text-xs font-bold px-2 py-1 rounded ${lang === 'am' ? 'bg-brand-accent text-brand-bg' : 'text-brand-text-secondary'}`}
                >
                  አማ
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center border border-brand-accent/30">
                <span className="text-brand-accent font-bold">{userName.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{userName}</p>
                <p className="text-xs text-brand-text-secondary truncate">{t.officerAccount}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">{t.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col pt-20 lg:pt-8">
        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab !== 'dashboard' && (
            <button 
              onClick={onBack}
              className="hidden lg:flex items-center gap-2 text-brand-text-secondary hover:text-brand-text-primary mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>{lang === 'am' ? 'ተመለስ' : 'Back'}</span>
            </button>
          )}
          {children}
        </div>
        
        {/* Footer */}
        <footer className="w-full text-center py-8 px-4 bg-brand-bg border-t border-brand-border mt-auto">
          <div className="max-w-4xl mx-auto">
            <p className="text-xl font-bold text-brand-text-primary mb-4">
              {lang === 'am' ? 'የምዕራብ ጎጃም ዞን ፖሊስ መምሪያ' : 'West Gojjam Zone Police Department'}
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <a 
                href="https://www.facebook.com/share/1CCxnhaNmX/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#1877F2] hover:text-[#166fe5] transition-colors font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
              >
                <Facebook size={20} />
                <span>Facebook</span>
              </a>
              <a 
                href="https://t.me/westgojjamepolice" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#229ED9] hover:text-[#2094cc] transition-colors font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
              >
                <Send size={20} />
                <span>Telegram</span>
              </a>
            </div>
            <hr className="border-brand-border mb-6" />
            <p className="text-brand-text-secondary italic font-medium">
              Developed by: Chief Sergeant Mengesha Yimam Abera
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
