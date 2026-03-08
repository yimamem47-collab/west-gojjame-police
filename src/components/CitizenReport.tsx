import React, { useState } from 'react';
import { Shield, MapPin, Calendar, Clock, FileText, Send, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface CitizenReportProps {
  type: 'Crime' | 'Traffic';
  lang: Language;
  onClose: () => void;
  onSubmit: (report: any) => void;
}

export function CitizenReport({ type, lang, onClose, onSubmit }: CitizenReportProps) {
  const t = translations[lang];
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    description: '',
    category: 'other'
  });

  const categories = type === 'Crime' ? t.categories.crime : t.categories.traffic;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      type,
      status: 'Open',
      officerId: 'citizen', // Mark as citizen report
      recordingOfficerName: 'Citizen',
      recordingOfficerRank: 'citizen',
      filingStation: 'Online Portal'
    });
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-accent/10 rounded-lg">
                    <Shield className="text-brand-accent" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{type === 'Crime' ? t.crime : t.traffic} {t.newReport}</h2>
                    <p className="text-sm text-brand-text-secondary">Official Citizen Reporting Portal</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-brand-accent/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">Incident Title</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                      <input 
                        required
                        type="text" 
                        className="input-field pl-10" 
                        placeholder="Brief title of the incident"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.selectCategory}</label>
                    <select 
                      className="input-field"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {Object.entries(categories).map(([key, label]) => (
                        <option key={key} value={key}>{label as string}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.incidentLocation}</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                      <input 
                        required
                        type="text" 
                        className="input-field pl-10" 
                        placeholder={t.locationPlaceholder}
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-text-secondary mb-2">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                        <input 
                          required
                          type="date" 
                          className="input-field pl-10" 
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-text-secondary mb-2">Time</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                        <input 
                          required
                          type="time" 
                          className="input-field pl-10" 
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.detailedDescription}</label>
                  <textarea 
                    required
                    rows={4}
                    className="input-field resize-none" 
                    placeholder={t.descriptionPlaceholder}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="bg-brand-accent/5 p-4 rounded-xl border border-brand-accent/10">
                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    {t.accuracyConfirm}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                    {t.cancel || 'Cancel'}
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    <Send size={18} />
                    {t.submitReport}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">{t.successTitle}</h2>
              <p className="text-brand-text-secondary mb-8">
                {t.successDesc}
              </p>
              <div className="flex items-center justify-center gap-2 text-brand-accent font-medium">
                <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                <span>{t.redirecting}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
