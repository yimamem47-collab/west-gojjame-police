import React, { useState } from 'react';
import { FileText, Plus, Search, Trash2, Download, Edit2, Shield } from 'lucide-react';
import { Report, Officer } from '../types';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface ReportsProps {
  reports: Report[];
  officers: Officer[];
  lang: Language;
  initialEditId?: string | null;
  onAdd: (report: Omit<Report, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Report>) => void;
  onDelete: (id: string) => void;
}

export function Reports({ reports, officers, lang, initialEditId, onAdd, onUpdate, onDelete }: ReportsProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  React.useEffect(() => {
    if (initialEditId) {
      const report = reports.find(r => r.id === initialEditId);
      if (report) {
        setEditingReport(report);
        setNewReport({
          title: report.title,
          status: report.status,
          date: report.date,
          location: report.location,
          officerId: report.officerId,
          filingStation: report.filingStation,
          recordingOfficerName: report.recordingOfficerName,
          recordingOfficerRank: report.recordingOfficerRank,
          type: report.type,
          category: report.category,
          description: report.description
        });
        setIsModalOpen(true);
      }
    }
  }, [initialEditId, reports]);
  const [newReport, setNewReport] = useState<Omit<Report, 'id'>>({
    title: '',
    status: 'Pending Review',
    date: new Date().toISOString().split('T')[0],
    officerId: officers[0]?.id || '',
    filingStation: '',
    recordingOfficerName: '',
    recordingOfficerRank: 'constable',
    type: 'Crime',
    category: 'other',
    description: ''
  });

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.recordingOfficerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReport) {
      onUpdate(editingReport.id, newReport);
      setEditingReport(null);
    } else {
      onAdd(newReport);
    }
    setIsModalOpen(false);
    setNewReport({ 
      title: '', 
      status: 'Pending Review', 
      date: new Date().toISOString().split('T')[0], 
      officerId: officers[0]?.id || '',
      filingStation: '',
      recordingOfficerName: '',
      recordingOfficerRank: 'constable',
      type: 'Crime',
      category: 'other',
      description: ''
    });
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setNewReport({
      title: report.title,
      status: report.status,
      date: report.date,
      officerId: report.officerId,
      filingStation: report.filingStation || '',
      recordingOfficerName: report.recordingOfficerName || '',
      recordingOfficerRank: report.recordingOfficerRank || 'constable',
      type: report.type,
      category: report.category,
      description: report.description || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
    setNewReport({ 
      title: '', 
      status: 'Pending Review', 
      date: new Date().toISOString().split('T')[0], 
      officerId: officers[0]?.id || '',
      filingStation: '',
      recordingOfficerName: '',
      recordingOfficerRank: 'constable',
      type: 'Crime',
      category: 'other',
      description: ''
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.reports || 'Reports'}</h1>
          <p className="text-brand-text-secondary">Official documentation and case reports.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          {t.newReport}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-l-4 border-brand-accent">
          <p className="text-brand-text-secondary text-sm font-medium mb-1">Total Reports</p>
          <h3 className="text-2xl font-bold">{reports.length}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-emerald-500">
          <p className="text-brand-text-secondary text-sm font-medium mb-1">Submitted</p>
          <h3 className="text-2xl font-bold">{reports.filter(r => r.status === 'Submitted').length}</h3>
        </div>
        <div className="glass-card p-6 border-l-4 border-amber-500">
          <p className="text-brand-text-secondary text-sm font-medium mb-1">Pending Review</p>
          <h3 className="text-2xl font-bold">{reports.filter(r => r.status === 'Pending Review').length}</h3>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-brand-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg/50 text-brand-text-secondary text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Report Title</th>
                <th className="px-6 py-4 font-semibold">Filing Station</th>
                <th className="px-6 py-4 font-semibold">Recording Officer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-brand-bg/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                        <FileText size={16} className="text-brand-accent" />
                      </div>
                      <div>
                        <p className="font-bold">{report.title}</p>
                        <p className="text-xs text-brand-text-secondary">
                          {report.type === 'Crime' 
                            ? (t.categories.crime as any)[report.category] 
                            : (t.categories.traffic as any)[report.category]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-brand-text-secondary">
                    {report.filingStation}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{report.recordingOfficerName}</span>
                      <span className="text-[10px] text-brand-text-secondary uppercase">
                        {(t.ranks as any)[report.recordingOfficerRank]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${report.status === 'Submitted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}
                    `}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(report)}
                        className="p-2 text-brand-text-secondary hover:text-brand-accent transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(report.id)}
                        className="p-2 text-brand-text-secondary hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-brand-text-secondary hover:text-brand-accent transition-colors">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">{editingReport ? t.editReport : t.newReport}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">Report Title</label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Incident 001 Final Report"
                    value={newReport.title}
                    onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.type}</label>
                  <select 
                    className="input-field"
                    value={newReport.type}
                    onChange={(e) => setNewReport({...newReport, type: e.target.value as any, category: 'other'})}
                  >
                    <option value="Crime">{t.crime}</option>
                    <option value="Traffic">{t.traffic}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.selectCategory}</label>
                  <select 
                    className="input-field"
                    value={newReport.category}
                    onChange={(e) => setNewReport({...newReport, category: e.target.value})}
                  >
                    {newReport.type === 'Crime' ? (
                      Object.entries(t.categories.crime).map(([key, label]) => (
                        <option key={key} value={key}>{label as string}</option>
                      ))
                    ) : (
                      Object.entries(t.categories.traffic).map(([key, label]) => (
                        <option key={key} value={key}>{label as string}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.filingStation}</label>
                  <select 
                    required
                    className="input-field"
                    value={newReport.filingStation}
                    onChange={(e) => setNewReport({...newReport, filingStation: e.target.value})}
                  >
                    <option value="">{t.stationPlaceholder}</option>
                    {Object.entries(t.stations).map(([key, label]) => (
                      <option key={key} value={label as string}>{label as string}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">Status</label>
                  <select 
                    className="input-field"
                    value={newReport.status}
                    onChange={(e) => setNewReport({...newReport, status: e.target.value as any})}
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.date}</label>
                  <input 
                    required
                    type="date" 
                    className="input-field" 
                    value={newReport.date}
                    onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.recordingOfficer}</label>
                  <select 
                    required
                    className="input-field"
                    value={newReport.officerId}
                    onChange={(e) => {
                      const selectedOfficer = officers.find(o => o.id === e.target.value);
                      if (selectedOfficer) {
                        setNewReport({
                          ...newReport, 
                          officerId: selectedOfficer.id,
                          recordingOfficerName: selectedOfficer.name,
                          recordingOfficerRank: selectedOfficer.rank
                        });
                      }
                    }}
                  >
                    <option value="">Select Officer</option>
                    {officers.map((officer) => (
                      <option key={officer.id} value={officer.id}>
                        {officer.name} ({(t.ranks as any)[officer.rank] || officer.rank})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.detailedDescription}</label>
                <textarea 
                  className="input-field min-h-[100px]"
                  placeholder={t.descriptionPlaceholder}
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingReport ? t.saveProfile : t.submitReport}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
