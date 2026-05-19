import React, { useState, useRef, useEffect } from 'react';
import { Shield, MapPin, Calendar, Clock, FileText, Send, X, CheckCircle, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { auth } from '../firebase';

interface CitizenReportProps {
  type: 'Crime' | 'Traffic';
  lang: Language;
  onClose: () => void;
  onSubmit: (report: any) => void;
}

export function CitizenReport({ type, lang, onClose, onSubmit }: CitizenReportProps) {
  const t = translations[lang];
  const [step, setStep] = useState<'form' | 'success'>('form');
  const scrollRef = useRef<HTMLDivElement>(null);

  const ts = (t as any)?.trafficSafetyModule;
  const accidentOptions = ts?.options?.accidentTypes || [];
  const vehicleOptions = ts?.options?.vehicleTypes || [];

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    description: '',
    category: 'other',
    filingStation: '',
    photos: [] as string[],
    plateNumber: '',
    accidentType: accidentOptions[0] || '',
    vehicleType: vehicleOptions[0] || ''
  });

  // Handle runtime option defaults sync if language switches dynamically
  useEffect(() => {
    if (type === 'Traffic') {
      setFormData(prev => ({
        ...prev,
        accidentType: prev.accidentType || accidentOptions[0] || '',
        vehicleType: prev.vehicleType || vehicleOptions[0] || ''
      }));
    }
  }, [lang, type, accidentOptions, vehicleOptions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [step]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      fileList.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => {
              // Check bounds inside atomic update to prevent async overflow beyond 3 photos
              if (prev.photos.length >= 3) return prev;
              return {
                ...prev,
                photos: [...prev.photos, reader.result as string].slice(0, 3)
              };
            });
          };
          reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
          setFormData(prev => ({
            ...prev,
            description: prev.description + `\n[Attached PDF: ${file.name}]`
          }));
          alert(lang === 'am' ? `ፒዲኤፍ ተያይዟል: ${file.name}` : `PDF attached: ${file.name}`);
        }
      });
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const categories = (type === 'Crime' ? t.categories?.crime : t.categories?.traffic) || {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicitly destructure data out to scrub local layout variants from database payload
    const { plateNumber, accidentType, vehicleType, ...rootData } = formData;
    
    const finalReport: any = {
      ...rootData,
      type,
      status: 'Open',
      officerId: auth.currentUser?.uid || 'citizen',
      recordingOfficerName: auth.currentUser?.displayName || 'Citizen',
      recordingOfficerRank: 'citizen'
    };

    if (type === 'Traffic') {
      finalReport.trafficDetails = {
        plateNumber: plateNumber,
        accidentType: accidentType,
        vehicleType: vehicleType
      };
    }

    onSubmit(finalReport);
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        ref={scrollRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 rounded-xl bg-brand-bg/95"
      >
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-accent/10 rounded-lg">
                    <Shield className="text-brand-accent" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">
                      {type === 'Crime' ? t.crime : t.traffic} {t.newReport}
                    </h2>
                    <p className="text-xs md:text-sm text-brand-text-secondary">Official Citizen Reporting Portal</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-brand-accent/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:grid-cols-2 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.incidentTitle}</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                      <input 
                        required
                        type="text" 
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all text-sm" 
                        placeholder={type === 'Traffic' ? (ts?.accidentReport || 'Accident Report') : 'Brief title of the incident'}
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">{t.selectCategory}</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all text-sm [&>option]:bg-brand-bg [&>option]:text-white"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {Object.entries(categories).map(([key, label]) => (
                        <option key={key} value={key}>{label as string}</option>
                      ))}
                    </select>
                  </div>

                  {type === 'Traffic' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">{ts?.fields?.plateNumber || 'Plate Number'}</label>
                        <input 
                          type="text" 
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all text-sm" 
                          placeholder="e.g. AA 12345"
                          value={formData.plateNumber}
                          onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-
