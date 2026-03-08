import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Trash2, Edit2, Calendar, MapPin } from 'lucide-react';
import { Incident, Officer } from '../types';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface IncidentsProps {
  incidents: Incident[];
  officers: Officer[];
  lang: Language;
  initialEditId?: string | null;
  onAdd: (incident: Omit<Incident, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Incident>) => void;
  onDelete: (id: string) => void;
}

export function Incidents({ incidents, officers, lang, initialEditId, onAdd, onUpdate, onDelete }: IncidentsProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

  React.useEffect(() => {
    if (initialEditId) {
      const incident = incidents.find(i => i.id === initialEditId);
      if (incident) {
        setEditingIncident(incident);
        setNewIncident({
          title: incident.title,
          status: incident.status,
          date: incident.date,
          location: incident.location,
          officerId: incident.officerId,
          filingStation: incident.filingStation,
          recordingOfficerName: incident.recordingOfficerName,
          recordingOfficerRank: incident.recordingOfficerRank,
          type: incident.type,
          category: incident.category,
          description: incident.description
        });
        setIsModalOpen(true);
      }
    }
  }, [initialEditId, incidents]);
  const [newIncident, setNewIncident] = useState<Omit<Incident, 'id'>>({
    title: '',
    status: 'Open',
    date: new Date().toISOString().split('T')[0],
    location: '',
    officerId: officers[0]?.id || '',
    filingStation: '',
    recordingOfficerName: '',
    recordingOfficerRank: 'constable',
    type: 'Crime',
    category: 'other',
    description: ''
  });

  const filteredIncidents = incidents.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.recordingOfficerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIncident) {
      onUpdate(editingIncident.id, newIncident);
      setEditingIncident(null);
    } else {
      onAdd(newIncident);
    }
    setIsModalOpen(false);
    setNewIncident({ 
      title: '', 
      status: 'Open', 
      date: new Date().toISOString().split('T')[0], 
      location: '', 
      officerId: officers[0]?.id || '',
      filingStation: '',
      recordingOfficerName: '',
      recordingOfficerRank: 'constable',
      type: 'Crime',
      category: 'other',
      description: ''
    });
  };

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setNewIncident({
      title: incident.title,
      status: incident.status,
      date: incident.date,
      location: incident.location,
      officerId: incident.officerId,
      filingStation: incident.filingStation || '',
      recordingOfficerName: incident.recordingOfficerName || '',
      recordingOfficerRank: incident.recordingOfficerRank || 'constable',
      type: incident.type,
      category: incident.category,
      description: incident.description || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIncident(null);
    setNewIncident({ 
      title: '', 
      status: 'Open', 
      date: new Date().toISOString().split('T')[0], 
      location: '', 
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
          <h1 className="text-3xl font-bold tracking-tight">{t.crime}</h1>
          <p className="text-brand-text-secondary">Official record of reported incidents in the zone.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          {t.newReport}
        </button>
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
                <th className="px-6 py-4 font-semibold">{t.incidentType}</th>
                <th className="px-6 py-4 font-semibold">{t.incidentLocation}</th>
                <th className="px-6 py-4 font-semibold">{t.recordingOfficer}</th>
                <th className="px-6 py-4 font-semibold">{t.type}</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-brand-bg/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-bg rounded-lg border border-brand-border">
                        <AlertTriangle size={16} className={incident.type === 'Crime' ? 'text-rose-400' : 'text-brand-accent'} />
                      </div>
                      <div>
                        <p className="font-bold">{incident.title}</p>
                        <p className="text-xs text-brand-text-secondary">
                          {incident.type === 'Crime' 
                            ? (t.categories.crime as any)[incident.category] 
                            : (t.categories.traffic as any)[incident.category]}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-brand-text-secondary">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{incident.location}</span>
                      </div>
                      <p className="text-[10px] opacity-70 italic">{incident.filingStation}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{incident.recordingOfficerName}</span>
                      <span className="text-[10px] text-brand-text-secondary uppercase">
                        {(t.ranks as any)[incident.recordingOfficerRank]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${incident.status === 'Open' ? 'bg-rose-400/10 text-rose-400' : 
                        incident.status === 'In Progress' ? 'bg-brand-accent/10 text-brand-accent' : 
                        'bg-emerald-500/10 text-emerald-400'}
                    `}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(incident)}
                        className="p-2 text-brand-text-secondary hover:text-brand-accent transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(incident.id)}
                        className="p-2 text-brand-text-secondary hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={18} />
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
            <h2 className="text-2xl font-bold mb-6">{editingIncident ? t.editReport : t.newReport}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.incidentType}</label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.type}</label>
                  <select 
                    className="input-field"
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({...newIncident, type: e.target.value as any, category: 'other'})}
                  >
                    <option value="Crime">{t.crime}</option>
                    <option value="Traffic">{t.traffic}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.selectCategory}</label>
                  <select 
                    className="input-field"
                    value={newIncident.category}
                    onChange={(e) => setNewIncident({...newIncident, category: e.target.value})}
                  >
                    {newIncident.type === 'Crime' ? (
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
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.incidentLocation}</label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    value={newIncident.location}
                    onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.filingStation}</label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    placeholder={t.stationPlaceholder}
                    value={newIncident.filingStation}
                    onChange={(e) => setNewIncident({...newIncident, filingStation: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.date}</label>
                  <input 
                    required
                    type="date" 
                    className="input-field" 
                    value={newIncident.date}
                    onChange={(e) => setNewIncident({...newIncident, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.officerName}</label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    value={newIncident.recordingOfficerName}
                    onChange={(e) => setNewIncident({...newIncident, recordingOfficerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.officerRank}</label>
                  <select 
                    className="input-field"
                    value={newIncident.recordingOfficerRank}
                    onChange={(e) => setNewIncident({...newIncident, recordingOfficerRank: e.target.value})}
                  >
                    {Object.entries(t.ranks).map(([key, label]) => (
                      <option key={key} value={key}>{label as string}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">Status</label>
                  <select 
                    className="input-field"
                    value={newIncident.status}
                    onChange={(e) => setNewIncident({...newIncident, status: e.target.value as any})}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.detailedDescription}</label>
                <textarea 
                  className="input-field min-h-[100px]"
                  placeholder={t.descriptionPlaceholder}
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingIncident ? t.saveProfile : t.submitReport}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
