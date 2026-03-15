import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface CommunityReportFormProps {
  lang: Language;
  onBack: () => void;
}

export function CommunityReportForm({ lang, onBack }: CommunityReportFormProps) {
  const t = translations[lang];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [report, setReport] = useState({
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    details: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!report.reporterName.trim() || report.reporterName.length < 3) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ስም ያስገቡ (ቢያንስ 3 ፊደላት)' : 'Please enter a valid name (min 3 characters)');
      return;
    }
    if (!report.reporterPhone.trim() || !/^\+?[\d\s-]{9,}$/.test(report.reporterPhone)) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number');
      return;
    }
    if (!report.location.trim()) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ቦታ ያስገቡ' : 'Please enter a valid location');
      return;
    }
    if (!report.date) {
      alert(lang === 'am' ? 'እባክዎ ቀን ይምረጡ' : 'Please select a date');
      return;
    }
    if (!report.details.trim() || report.details.length < 10) {
      alert(lang === 'am' ? 'እባክዎ ዝርዝር መግለጫ ያስገቡ (ቢያንስ 10 ፊደላት)' : 'Please enter detailed information (min 10 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'community_reports'), {
        ...report,
        status: 'New',
        timestamp: serverTimestamp()
      });
      setIsSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'community_reports');
      alert(lang === 'am' ? 'ሪፖርቱን መላክ አልተቻለም' : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full p-8 text-center"
        >
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {lang === 'am' ? 'ሪፖርትዎ በተሳካ ሁኔታ ተልኳል' : 'Report Submitted Successfully'}
          </h2>
          <p className="text-brand-text-secondary mb-8">
            {lang === 'am' ? 'ስለ ትብብርዎ እናመሰግናለን። ፖሊስ ሪፖርትዎን በቅርቡ ይመለከተዋል።' : 'Thank you for your cooperation. The police will review your report shortly.'}
          </p>
          <button onClick={onBack} className="btn-primary w-full">
            {lang === 'am' ? 'ወደ ዋናው ገጽ ተመለስ' : 'Return to Home'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text-primary mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{lang === 'am' ? 'ተመለስ' : 'Back'}</span>
        </button>

        <div className="glass-card p-8 border-t-4 border-blue-500">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
              {lang === 'am' ? 'የማህበረሰብ ሪፖርት ማቅረቢያ' : 'Community Report Submission'}
            </h1>
            <p className="text-brand-text-secondary">
              {lang === 'am' ? 'እባክዎ የሚከተለውን ቅጽ በመሙላት ሪፖርትዎን ያቅርቡ።' : 'Please fill out the form below to submit your report.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'ሙሉ ስም' : 'Full Name'}</label>
                <input 
                  required
                  type="text" 
                  className="input-field" 
                  value={report.reporterName}
                  onChange={(e) => setReport({...report, reporterName: e.target.value})}
                />
              </div>
              <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'}</label>
                <input 
                  required
                  type="tel" 
                  className="input-field" 
                  value={report.reporterPhone}
                  onChange={(e) => setReport({...report, reporterPhone: e.target.value})}
                />
              </div>
              <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'ኢሜይል (አማራጭ)' : 'Email (Optional)'}</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={report.reporterEmail}
                  onChange={(e) => setReport({...report, reporterEmail: e.target.value})}
                />
              </div>
              <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'ቀን' : 'Date'}</label>
                <input 
                  required
                  type="date" 
                  className="input-field" 
                  value={report.date}
                  onChange={(e) => setReport({...report, date: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
              <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'ቦታ / አድራሻ' : 'Location / Address'}</label>
              <input 
                required
                type="text" 
                className="input-field" 
                value={report.location}
                onChange={(e) => setReport({...report, location: e.target.value})}
              />
            </div>

            <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
              <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'የሪፖርቱ ዝርዝር' : 'Report Details'}</label>
              <textarea 
                required
                className="input-field min-h-[150px]"
                value={report.details}
                onChange={(e) => setReport({...report, details: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              <Send size={20} />
              {isSubmitting ? (lang === 'am' ? 'በመላክ ላይ...' : 'Submitting...') : (lang === 'am' ? 'ሪፖርቱን ላክ' : 'Submit Report')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
