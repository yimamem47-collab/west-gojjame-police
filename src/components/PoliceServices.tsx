import React from 'react';
import { Shield, Target, Heart, Award, FileText, Download, ChevronRight, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface PoliceServicesProps {
  lang: Language;
}

export function PoliceServices({ lang }: PoliceServicesProps) {
  const t = translations[lang];

  const values = [
    { icon: Award, title: t.valueProfessionalism },
    { icon: Shield, title: t.valueIntegrity },
    { icon: Heart, title: t.valueReadiness },
    { icon: Target, title: t.valueHumanRights },
  ];

  const complaintSteps = [
    t.complaintStep1,
    t.complaintStep2,
    t.complaintStep3,
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-accent p-8 lg:p-12 text-brand-bg">
        <div className="relative z-10 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
          >
            {t.ourServices}
          </motion.h1>
          <p className="text-lg opacity-90 font-medium italic">
            "{t.motto}"
          </p>
        </div>
        <Shield size={200} className="absolute -right-10 -bottom-10 text-brand-bg/10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vision & Mission */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center border border-brand-accent/20">
                <Target className="text-brand-accent" size={24} />
              </div>
              <h2 className="text-2xl font-bold">{t.vision}</h2>
            </div>
            <p className="text-brand-text-secondary leading-relaxed text-lg">
              {t.visionText}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center border border-brand-accent/20">
                <Shield className="text-brand-accent" size={24} />
              </div>
              <h2 className="text-2xl font-bold">{t.mission}</h2>
            </div>
            <p className="text-brand-text-secondary leading-relaxed text-lg">
              {t.missionText}
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-bold mb-8">{t.values}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-bg border border-brand-border">
                <div className="w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                  <value.icon className="text-brand-accent" size={20} />
                </div>
                <span className="font-bold text-sm">{value.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Service Standards & PDF */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center border border-brand-accent/20">
                <FileText className="text-brand-accent" size={24} />
              </div>
              <h2 className="text-2xl font-bold">{t.serviceStandards}</h2>
            </div>
          </div>
          
          <div className="bg-brand-bg rounded-2xl p-6 border border-brand-border mb-8">
            <p className="text-brand-text-secondary mb-6 italic">
              {lang === 'am' 
                ? 'የዜጎች አገልግሎት አሰጣጥ ስታንዳርድ ዝርዝር መረጃ ከታች ያለውን ፋይል በማውረድ ማግኘት ይችላሉ።'
                : 'Detailed information about citizen service delivery standards can be found by downloading the file below.'}
            </p>
            <a 
              href="/የዜጎች_አገልግሎት_አሰጣጥ_ስታንዳርድ.pdf" 
              download
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-8"
            >
              <Download size={20} />
              {t.downloadPdf}
            </a>
          </div>
        </motion.div>

        {/* Complaint Process */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
              <MessageSquare className="text-rose-500" size={24} />
            </div>
            <h2 className="text-xl font-bold">{t.complaintProcess}</h2>
          </div>
          
          <div className="space-y-6">
            {complaintSteps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-sm text-brand-text-secondary leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
