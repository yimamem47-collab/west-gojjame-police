import React from 'react';
import { 
  Shield, 
  Users, 
  ClipboardList, 
  FileText, 
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Camera,
  Facebook,
  Send
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { Incident, Officer, Assignment, Report } from '../types';
import { Language, translations } from '../lib/translations';
import { APP_LOGO } from '../constants';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}

function StatCard({ label, value, icon: Icon, color = "text-brand-accent" }: StatCardProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-brand-bg rounded-xl border border-brand-border">
          <Icon size={24} className={color} />
        </div>
      </div>
      <p className="text-brand-text-secondary text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>
  );
}

interface DashboardProps {
  incidents: Incident[];
  officers: Officer[];
  assignments: Assignment[];
  reports: Report[];
  lang: Language;
  onQuickAction: (action: string) => void;
  onUpdateIncident: (id: string, updates: Partial<Incident>) => void;
  onDeleteIncident: (id: string) => void;
  onUpdateReport: (id: string, updates: Partial<Report>) => void;
  onDeleteReport: (id: string) => void;
}

export function Dashboard({ 
  incidents, 
  officers, 
  assignments, 
  reports, 
  lang, 
  onQuickAction,
  onUpdateIncident,
  onDeleteIncident,
  onUpdateReport,
  onDeleteReport
}: DashboardProps) {
  const t = translations[lang];
  
  const chartData = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 19 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 22 },
    { name: 'Fri', value: 30 },
    { name: 'Sat', value: 25 },
    { name: 'Sun', value: 18 },
  ];
  
  const [dashboardSearch, setDashboardSearch] = React.useState('');
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; type: string } | null>(null);

  const recentActivities = [
    ...incidents.map(i => ({ 
      id: i.id,
      type: t.crime, 
      rawType: 'incident',
      title: i.title, 
      time: i.date, 
      status: i.status,
      station: i.filingStation,
      officer: `${(t.ranks as any)[i.recordingOfficerRank]} ${i.recordingOfficerName}`,
      officerId: i.officerId
    })),
    ...reports.map(r => ({ 
      id: r.id,
      type: t.reports || 'Report', 
      rawType: 'report',
      title: r.title, 
      time: r.date, 
      status: r.status,
      station: r.filingStation,
      officer: `${(t.ranks as any)[r.recordingOfficerRank]} ${r.recordingOfficerName}`,
      officerId: r.officerId
    })),
  ]
.filter(activity => {
    const officer = officers.find(o => o.id === activity.officerId);
    const searchLower = dashboardSearch.toLowerCase();
    return (
      activity.title.toLowerCase().includes(searchLower) ||
      activity.officer.toLowerCase().includes(searchLower) ||
      (officer && officer.badgeNumber.toLowerCase().includes(searchLower))
    );
  }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  return (
    <div className="space-y-8 relative">
      {/* 1. Background Watermark Logo */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none z-0">
        <img src={APP_LOGO} alt="" className="w-[600px] h-[600px] object-contain grayscale" referrerPolicy="no-referrer" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          {/* 2. Header Logo */}
          <div className="w-16 h-16 bg-white/5 rounded-2xl p-2 border border-white/10 flex items-center justify-center shadow-xl">
            <img src={APP_LOGO} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.dashboard}</h1>
            <p className="text-brand-text-secondary">{t.dashboardOverview}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onQuickAction('add-incident')} className="btn-primary">
            <Plus size={18} />
            {t.newReport}
          </button>
          <button onClick={() => onQuickAction('add-assignment')} className="btn-secondary">
            <ClipboardList size={18} />
            {t.assignments || 'Assignments'}
          </button>
          <button onClick={() => onQuickAction('open-qr')} className="btn-secondary bg-brand-accent/10 border-brand-accent/20 text-brand-accent hover:bg-brand-accent hover:text-white">
            <Camera size={18} />
            {lang === 'am' ? 'ሰካን ማድረጊያ' : 'Scan QR'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t.total + ' ' + t.crime} value={incidents.length} icon={AlertTriangle} color="text-rose-400" />
        <StatCard label={t.total + ' ' + (t.officers || 'Officers')} value={officers.length} icon={Users} color="text-brand-accent" />
        <StatCard label={t.total + ' ' + (t.assignments || 'Assignments')} value={assignments.filter(a => a.status === 'Pending').length} icon={ClipboardList} color="text-amber-400" />
        <StatCard label={t.total + ' ' + (t.reports || 'Reports')} value={reports.length} icon={FileText} color="text-emerald-400" />
      </div>

      {/* Emergency Phone Numbers - Requested in Green */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: lang === 'am' ? 'የዞን ፖሊስ' : 'Zone Police', phone: '0587750972' },
          { label: lang === 'am' ? 'የትራፊክ ፖሊስ' : 'Traffic Police', phone: '0587751002' },
          { label: lang === 'am' ? 'ሚዲያና ኮምንኬሽን' : 'Media & Comm', phone: '0587750327' }
        ].map((contact, i) => (
          <div key={i} className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center justify-center group hover:bg-emerald-500/20 transition-all">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">{contact.label}</span>
            <a href={`tel:${contact.phone}`} className="text-3xl font-black text-emerald-400 tracking-tighter">
              {contact.phone}
            </a>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">{t.incidentTrends}</h3>
            <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
              <div className="w-3 h-3 bg-brand-accent rounded-full" />
              <span>{t.reportedIncidents}</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94A3B8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94A3B8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0F172A', 
                    border: '1px solid #1E293B',
                    borderRadius: '12px',
                    color: '#F8FAFC'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#22D3EE" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 relative overflow-hidden">
          {/* 3. Card Logo Accent */}
          <div className="absolute -top-4 -right-4 opacity-10 rotate-12">
            <img src={APP_LOGO} alt="" className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
          </div>
          <div className="flex flex-col gap-4 mb-6 relative z-10">
            <h3 className="text-lg font-bold">{t.savedReports}</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={14} />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                className="input-field pl-9 text-xs py-2"
                value={dashboardSearch}
                onChange={(e) => setDashboardSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-6">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-brand-bg rounded-lg border border-brand-border">
                    <Clock size={16} className="text-brand-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold truncate">{activity.title}</p>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => onQuickAction(`edit-${activity.rawType}-${activity.id}`)}
                          className="p-1 text-brand-text-secondary hover:text-brand-accent transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ id: activity.id, type: activity.rawType })}
                          className="p-1 text-brand-text-secondary hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] text-brand-text-secondary">{activity.type} • {activity.time}</p>
                      {activity.station && <p className="text-[10px] text-brand-accent italic">{activity.station}</p>}
                      {activity.officer && <p className="text-[10px] text-brand-text-secondary">{t.recordingOfficer}: {activity.officer}</p>}
                    </div>
                  </div>
                  <span className={`
                    text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                    ${['Open', 'Pending', 'Pending Review'].includes(activity.status as string) 
                      ? 'bg-brand-accent/10 text-brand-accent' 
                      : 'bg-emerald-500/10 text-emerald-400'}
                  `}>
                    {activity.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-brand-text-secondary">{t.noReports}</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-bold text-brand-accent hover:bg-brand-accent/5 rounded-xl transition-all">
            {t.viewDashboard}
          </button>
        </div>
      </div>

      {/* Recording Officer List Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-accent/10 rounded-lg border border-brand-accent/20">
              <Users size={20} className="text-brand-accent" />
            </div>
            <h3 className="text-lg font-bold">{lang === 'am' ? 'የመዝጋቢ ኦፊሰሮች ዝርዝር' : 'Recording Officer List'}</h3>
          </div>
          <button onClick={() => onQuickAction('view-officers')} className="text-sm font-bold text-brand-accent hover:underline">
            {t.viewDetails}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {officers.map((officer) => (
            <div key={officer.id} className="bg-brand-bg/50 border border-brand-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
                <Shield size={18} className="text-brand-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{officer.name}</p>
                <p className="text-[10px] text-brand-text-secondary uppercase tracking-wider">{(t.ranks as any)[officer.rank] || officer.rank}</p>
              </div>
            </div>
          ))}
          {officers.length === 0 && (
            <div className="col-span-full text-center py-4 text-brand-text-secondary text-sm italic">
              No officers registered yet.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-8 text-center"
          >
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <AlertCircle size={32} className="text-rose-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.deleteConfirm || 'Are you sure?'}</h3>
            <p className="text-brand-text-secondary mb-8">
              {t.deleteWarning || 'This action is permanent and cannot be undone. All data associated with this report will be lost.'}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button 
                onClick={() => {
                  if (deleteConfirm.type === 'incident') onDeleteIncident(deleteConfirm.id);
                  else onDeleteReport(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                {t.delete || 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Social Media Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <a 
          href="https://www.facebook.com/share/1CCxnhaNmX/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-4 p-6 bg-[#1877F2] text-white rounded-2xl shadow-xl hover:bg-[#166fe5] transition-all group"
        >
          <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
            <Facebook size={32} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Official Page</p>
            <h4 className="text-2xl font-black">Facebook</h4>
          </div>
        </a>
        <a 
          href="https://t.me/westgojjamepolice" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-4 p-6 bg-[#229ED9] text-white rounded-2xl shadow-xl hover:bg-[#2094cc] transition-all group"
        >
          <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
            <Send size={32} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Official Channel</p>
            <h4 className="text-2xl font-black">Telegram</h4>
          </div>
        </a>
      </div>

      {/* Developer Credit */}
      <div className="mt-12 pb-6 text-center">
        <p className="text-white italic opacity-80">
          Developed by: Chief Sergeant Mengesha Yimam Abera
        </p>
      </div>
    </div>
  );
}
