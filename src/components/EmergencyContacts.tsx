import React from 'react';
import { Phone, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { EMERGENCY_CONTACTS } from '../constants';

interface EmergencyContactsProps {
  lang: Language;
}

export function EmergencyContacts({ lang }: EmergencyContactsProps) {
  const t = translations[lang];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.emergencyContacts.title}</h1>
        <p className="text-brand-text-secondary">Direct access to zone-wide police stations and emergency services.</p>
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

      <div className="glass-card p-8 bg-rose-600/10 border-rose-600/20">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-600/40">
            <Phone size={40} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-rose-400 mb-2">Universal Emergency Number: 991</h2>
            <p className="text-brand-text-secondary">
              For immediate life-threatening emergencies, always dial 991. This number is free of charge and accessible from any network.
            </p>
          </div>
          <a
            href="tel:991"
            className="btn-primary bg-rose-600 hover:bg-rose-700 border-rose-600 px-8 py-4 text-lg"
          >
            {t.call} 991
          </a>
        </div>
      </div>
    </div>
  );
}
