import React from 'react';
import { Phone, ExternalLink, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { EMERGENCY_CONTACTS } from '../constants';
import { auth } from '../firebase';

interface EmergencyContactsProps {
  lang: Language;
  onBack?: () => void;
}

export function EmergencyContacts({ lang, onBack }: EmergencyContactsProps) {
  const t = translations[lang];
  const isLoggedIn = !!auth.currentUser;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.emergencyContacts.title}</h1>
          <p className="text-brand-text-secondary">Direct access to zone-wide police stations and emergency services.</p>
        </div>
        {!isLoggedIn && onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-brand-accent font-bold hover:underline"
          >
            <ArrowLeft size={20} />
            {t.backToHome}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EMERGENCY_CONTACTS.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6 flex flex-col justify-between hover:border-brand-accent/30 transition-all group"
          >
            <div>
              <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center mb-4 border border-brand-accent/20 group-hover:bg-brand-accent group-hover:text-brand-bg transition-all">
                <Phone size={24} />
              </div>
              <h3 className="text-lg font-bold mb-1">
                {(t.emergencyContacts as any)[contact.nameKey]}
              </h3>
              <p className="text-brand-accent font-mono text-xl mb-6">{contact.phone}</p>
            </div>
            
            <a
              href={`tel:${contact.phone}`}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              {t.call}
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
