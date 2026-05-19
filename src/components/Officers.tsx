import React, { useState } from 'react';
import { Users, Plus, Search, Trash2, Edit2, Mail, Shield, BadgeCheck, MapPin, Phone } from 'lucide-react';
import { Officer } from '../types';
import { motion } from 'framer-motion'; // Reverted to standard framer-motion import
import { Language, translations } from '../lib/translations';
import { dialPhone } from '../lib/utils';

interface OfficersProps {
  officers: Officer[];
  lang: Language;
  onAdd: (officer: Omit<Officer, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Officer>) => void;
  onDelete: (id: string) => void;
}

const INITIAL_OFFICER_STATE: Omit<Officer, 'id'> = {
  name: '',
  rank: 'Officer',
  badgeNumber: '',
  station: '',
  phone: '',
  email: '',
  status: 'Active',
  photo: ''
};

export function Officers({ officers, lang, onAdd, onUpdate, onDelete }: OfficersProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [newOfficer, setNewOfficer] = useState<Omit<Officer, 'id'>>(INITIAL_OFFICER_STATE);

  const filteredOfficers = officers.filter(o => 
    (o.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.badgeNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.rank || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetFormState = () => {
    setIsModalOpen(false);
    setEditingOfficer(null);
    setNewOfficer(INITIAL_OFFICER_STATE);
  };

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
    } else {
      onAdd(newOfficer);
    }
    resetFormState();
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
      status: officer.status,
      photo: officer.photo || ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.officers}</h1>
          <p className="text-brand-text-secondary">{t.directoryDesc}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          {t.addOfficer}
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
        ={filteredOfficers.map((officer) => (
          <motion.div 
            layout
            key={officer.id} 
            className="glass-card p-6 group border-t-4 border-brand-accent"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center overflow-hidden">
                  {officer.photo ? (
                    <img src={officer.photo} alt={officer.name} className="w-full h-full object-cover" />
                  ) : (
                    <Shield size={32} className="text-brand-accent" />
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-brand-card ${
                  officer.status === 'Active' ? 'bg-emerald-500' : 
                  officer.status === 'On Leave' ? 'bg-amber-500' : 
                  'bg-rose-500'
                }`} title={officer.status} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEdit(officer)}
                    className="p-2 text-brand-text-secondary hover:text-brand-accent transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(officer.id)}
                    className="p-2 text-brand-text
