import React, { useState } from 'react';
import { Users, Plus, Search, Trash2, Edit2, Mail, Shield, BadgeCheck, MapPin, Phone } from 'lucide-react';
import { Officer } from '../types';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface OfficersProps {
  officers: Officer[];
  lang: Language;
  onAdd: (officer: Omit<Officer, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Officer>) => void;
  onDelete: (id: string) => void;
}

export function Officers({ officers, lang, onAdd, onUpdate, onDelete }: OfficersProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [newOfficer, setNewOfficer] = useState<Omit<Officer, 'id'>>({
    name: '',
    rank: 'Officer',
    badgeNumber: '',
    station: '',
    phone: '',
    email: '',
    status: 'Active'
  });

  const filteredOfficers = officers.filter(o => 
    (o.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.badgeNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.rank || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newOfficer.name.trim() || newOfficer.name.length < 3) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ስም ያስገቡ (ቢያንስ 3 ፊደላት)' : 'Please enter a valid name (min 3 characters)');
      return;
    }
    if (!newOfficer.badgeNumber.trim()) {
      alert(lang === 'am' ? 'እባክዎ የባጅ ቁጥር ያስገቡ' : 'Please enter a badge number');
      return;
    }
    if (!newOfficer.station.trim()) {
      alert(lang === 'am' ? 'እባክዎ ጣቢያ ያስገቡ' : 'Please enter a station');
      return;
    }
    if (newOfficer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newOfficer.email)) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ' : 'Please enter a valid email address');
      return;
    }
    if (newOfficer.phone && !/^\+?[\d\s-]{9,}$/.test(newOfficer.phone)) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number');
      return;
    }

    if (editingOfficer) {
      onUpdate(editingOfficer.id, newOfficer);
      setEditingOfficer(null);
    } else {
      onAdd(newOfficer);
    }
    setIsModalOpen(false);
    setNewOfficer({ name: '', rank: 'Officer', badgeNumber: '', station: '', phone: '', email: '', status: 'Active' });
  };

  const handleEdit = (officer: Officer) => {
    setEditingOfficer(officer);
    setNewOfficer({
      name: officer.name,
      rank: officer.rank,
      badgeNumber: officer.badgeNumber,
      station: officer.station,
      phone: officer.phone,
      email: officer.email,
      status: officer.status
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOfficer(null);
    setNewOfficer({ name: '', rank: 'Officer', badgeNumber: '', station: '', phone: '', email: '', status: 'Active' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.officers || 'Officers'}</h1>
          <p className="text-brand-text-secondary">Personnel directory for the West Gojjam Zone Police.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          {t.addOfficer || 'Add Officer'}
        </button>
      </div>

      <div className="glass-card p-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOfficers.map((officer) => (
          <motion.div 
            layout
            key={officer.id} 
            className="glass-card p-6 group border-t-4 border-brand-accent"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center">
                <Shield size={24} className="text-brand-accent" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(officer)}
                  className="p-2 text-brand-text-secondary hover:text-brand-accent transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(officer.id)}
                  className="p-2 text-brand-text-secondary hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">{officer.name}</h3>
            <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-3">
              {(t.ranks as any)[officer.rank] || officer.rank}
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-brand-text-secondary text-sm">
                <BadgeCheck size={14} className="text-brand-accent" />
                <span>Badge: {officer.badgeNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-text-secondary text-sm">
                <MapPin size={14} className="text-brand-accent" />
                <span>Station: {officer.station}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-text-secondary text-sm">
                <Phone size={14} className="text-brand-accent" />
                <span>{officer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-text-secondary text-sm">
                <Mail size={14} className="text-brand-accent" />
                <span>{officer.email}</span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 text-sm font-bold text-brand-accent border border-brand-accent/20 rounded-xl hover:bg-brand-accent/5 transition-all">
              {t.assignments || 'Assignments'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">{editingOfficer ? t.editProfile : (t.addOfficer || 'Add Officer')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.officerName}</label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    value={newOfficer.name}
                    onChange={(e) => setNewOfficer({...newOfficer, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.rank || 'Rank'}</label>
                  <select 
                    className="input-field"
                    value={newOfficer.rank}
                    onChange={(e) => setNewOfficer({...newOfficer, rank: e.target.value})}
                  >
                    {Object.entries(t.ranks).map(([key, label]) => (
                      <option key={key} value={key}>{label as string}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">Badge #</label>
                  <input 
                    required
                    type="text" 
                    className="input-field" 
                    value={newOfficer.badgeNumber}
                    onChange={(e) => setNewOfficer({...newOfficer, badgeNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">Station</label>
                <select 
                  required
                  className="input-field"
                  value={newOfficer.station}
                  onChange={(e) => setNewOfficer({...newOfficer, station: e.target.value})}
                >
                  <option value="">Select Station</option>
                  {Object.entries(t.stations).map(([key, label]) => (
                    <option key={key} value={label as string}>{label as string}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">Phone</label>
                <input 
                  required
                  type="tel" 
                  className="input-field" 
                  value={newOfficer.phone}
                  onChange={(e) => setNewOfficer({...newOfficer, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">Email</label>
                <input 
                  required
                  type="email" 
                  className="input-field" 
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({...newOfficer, email: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                  {t.cancel}
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingOfficer ? t.saveProfile : (t.addOfficer || 'Add Officer')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
