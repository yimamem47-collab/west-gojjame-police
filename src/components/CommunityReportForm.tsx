import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { sendTelegramMessage, escapeHtml } from '../services/telegramService';

interface CommunityReportFormProps {
  lang: Language;
  onBack: () => void;
}

export function CommunityReportForm({ lang, onBack }: CommunityReportFormProps) {
  const t = translations[lang];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  
  const [report, setReport] = useState({
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    details: ''
  });

  const handleNext = () => {
    if (step === 1) {
      if (!report.reporterName.trim() || report.reporterName.length < 3) {
        alert(lang === 'am' ? 'እባክዎ ትክክለኛ ስም ያስገቡ (ቢያንስ 3 ፊደላት)' : 'Please enter a valid name (min 3 characters)');
        return;
      }
      if (!report.reporterPhone.trim() || !/^\+?[\d\s-]{9,}$/.test(report.reporterPhone)) {
        alert(lang === 'am' ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number');
        return;
      }
    } else if (step === 2) {
      if (!report.details.trim() || report.details.length < 10) {
        alert(lang === 'am' ? 'እባክዎ ዝርዝር መግለጫ ያስገቡ (ቢያንስ 10 ፊደላት)' : 'Please enter detailed information (min 10 characters)');
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
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'community_reports'), {
        ...report,
        status: 'New',
        timestamp: serverTimestamp()
      });
      
      // Send Telegram notification
      const message = `🚨 <b>አዲስ የማህበረሰብ ሪፖርት / New Community Report</b>\n---------------------------\n<b>Name:</b> ${escapeHtml(report.reporterName)}\n<b>Phone:</b> ${escapeHtml(report.reporterPhone)}\n<b>Location:</b> ${escapeHtml(report.location)}\n<b>Date:</b> ${escapeHtml(report.date)}\n---------------------------\n<b>Details:</b>\n${escapeHtml(report.details)}`;
      await sendTelegramMessage(message);

      // Send to Google Sheets
      const reportData = {
        name: report.reporterName,
        phone: report.reporterPhone,
        email: report.reporterEmail || "",
        message: report.details,
        location: report.location,
        date: report.date,
        status: 'New'
      };
      
      const sheetURL = "https://script.google.com/macros/s/AKfycbyVIUjh-SpryVoB-vvRJ6PmrqU-SvnrQamV_04MWcELHkP5DkOF-G821KUNNtjGki87/exec";
      
      try {
        await fetch(sheetURL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData)
        });
        console.log("መረጃው ወደ ጎግል ሺት ተልኳል!");
      } catch (error) {
        console.error("በሺቱ መላኪያ ላይ ስህተት አለ:", error);
      }
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Failed to submit report:', error);
      try {
        handleFirestoreError(error, OperationType.CREATE, 'community_reports');
      } catch (e) {
        // Ignore the thrown error from handleFirestoreError as we want to show an alert instead
      }
      alert(lang === 'am' ? 'ሪፖርቱን መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to submit report. Please try again.');
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

          {/* Progress Bar */}
          <div className="flex justify-between mb-8 gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-2.5 flex-1 rounded-full transition-colors duration-300 ${s <= step ? 'bg-brand-accent' : 'bg-brand-border'}`}
              />
            ))}
          </div>

          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold mb-4">{lang === 'am' ? 'ደረጃ 1: መሰረታዊ መረጃ' : 'Step 1: Basic Information'}</h3>
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'ሙሉ ስም' : 'Full Name'}</label>
                    <input 
                      required
                      type="text" 
                      className="input-field" 
                      placeholder={lang === 'am' ? 'ሙሉ ስም' : 'Full Name'}
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
                      placeholder={lang === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'}
                      value={report.reporterPhone}
                      onChange={(e) => setReport({...report, reporterPhone: e.target.value})}
                    />
                  </div>
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'ኢሜይል (አማራጭ)' : 'Email (Optional)'}</label>
                    <input 
                      type="email" 
                      className="input-field" 
                      placeholder={lang === 'am' ? 'ኢሜይል' : 'Email'}
                      value={report.reporterEmail}
                      onChange={(e) => setReport({...report, reporterEmail: e.target.value})}
                    />
                  </div>
                  <button onClick={handleNext} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                    {lang === 'am' ? 'ቀጣይ' : 'Next'} <ChevronRight size={18} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold mb-4">{lang === 'am' ? 'ደረጃ 2: የጥቆማ ዝርዝር' : 'Step 2: Report Details'}</h3>
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'የሪፖርቱ ዝርዝር' : 'Report Details'}</label>
                    <textarea 
                      required
                      className="input-field min-h-[120px]"
                      placeholder={lang === 'am' ? 'የጥቆማውን ዝርዝር እዚህ ይጻፉ...' : 'Write the details here...'}
                      value={report.details}
                      onChange={(e) => setReport({...report, details: e.target.value})}
                    />
                  </div>
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">{lang === 'am' ? 'ቦታ / አድራሻ' : 'Location / Address'}</label>
                    <input 
                      required
                      type="text" 
                      className="input-field" 
                      placeholder={lang === 'am' ? 'ቦታ (ለምሳሌ፡ ፍኖተ ሰላም)' : 'Location (e.g., Finote Selam)'}
                      value={report.location}
                      onChange={(e) => setReport({...report, location: e.target.value})}
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
                  <div className="flex gap-4">
                    <button onClick={handlePrev} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2">
                      <ChevronLeft size={18} /> {lang === 'am' ? 'ወደ ኋላ' : 'Back'}
                    </button>
                    <button onClick={handleNext} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                      {lang === 'am' ? 'ቀጣይ' : 'Next'} <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold mb-4">{lang === 'am' ? 'ደረጃ 3: ማረጋገጫ' : 'Step 3: Confirmation'}</h3>
                  <p className="text-brand-text-secondary mb-4">
                    {lang === 'am' ? 'መረጃው በትክክል መሞላቱን ያረጋግጡ።' : 'Please review the information before submitting.'}
                  </p>
                  
                  <div className="bg-brand-bg/50 p-6 rounded-xl border border-brand-border shadow-sm space-y-4">
                    <div>
                      <span className="text-sm text-brand-text-secondary block">{lang === 'am' ? 'ሙሉ ስም' : 'Full Name'}</span>
                      <span className="font-medium">{report.reporterName}</span>
                    </div>
                    <div>
                      <span className="text-sm text-brand-text-secondary block">{lang === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'}</span>
                      <span className="font-medium">{report.reporterPhone}</span>
                    </div>
                    <div>
                      <span className="text-sm text-brand-text-secondary block">{lang === 'am' ? 'ቦታ' : 'Location'}</span>
                      <span className="font-medium">{report.location}</span>
                    </div>
                    <div>
                      <span className="text-sm text-brand-text-secondary block">{lang === 'am' ? 'የሪፖርቱ ዝርዝር' : 'Report Details'}</span>
                      <p className="font-medium whitespace-pre-wrap mt-1">{report.details}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button onClick={handlePrev} className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2" disabled={isSubmitting}>
                      <ChevronLeft size={18} /> {lang === 'am' ? 'ወደ ኋላ' : 'Back'}
                    </button>
                    <button onClick={handleSubmit} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2" disabled={isSubmitting}>
                      <Send size={18} /> {isSubmitting ? (lang === 'am' ? 'በመላክ ላይ...' : 'Submitting...') : (lang === 'am' ? 'ጥቆማውን ላክ' : 'Submit Report')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
