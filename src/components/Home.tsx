import React, { useState } from 'react';
import { Shield, ShieldAlert, Users, ArrowRight, CheckCircle, Globe, Phone, Camera, Send, MessageSquare, Facebook, LayoutDashboard, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { sendTelegramMessage, escapeHtml } from '../services/telegramService';
import { Language, translations } from '../lib/translations';
import { openUrl } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { AIAssistant } from './AIAssistant';

interface HomeProps {
  onLogin: () => void;
  onSignup: () => void;
  onReport: (type: 'Crime' | 'Traffic') => void;
  onViewContacts: () => void;
  onOpenQR: () => void;
  onCommunityReport: () => void;
  onCorruptionReport: () => void;
  onGoToDashboard: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  isLoggedIn: boolean;
}

export function Home({ onLogin, onSignup, onReport, onViewContacts, onOpenQR, onCommunityReport, onCorruptionReport, onGoToDashboard, lang, setLang, isLoggedIn }: HomeProps) {
  const t = translations[lang];

  // Consolidating fallback labels to prevent rendering runtime crashes
  const officerRegisterLabel = t.officerRegister || (lang === 'am' ? 'የኦፊሰር ምዝገባ' : 'Officer Registration');

  const [quickTip, setQuickTip] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleQuickTipSubmit = async () => {
    if (!quickTip.trim()) {
      alert(t.writeTipFirst || 'Please write your tip first!');
      return;
    }

    setSending(true);
    const message = `🚨 አዲስ የፖሊስ ጥቆማ፦\n\n${escapeHtml(quickTip)}`;
    
    try {
      // Send to Telegram and Firebase in parallel
      const [telegramSuccess] = await Promise.all([
        sendTelegramMessage(message),
        addDoc(collection(db, 'quick_tips'), {
          tip: quickTip,
          timestamp: serverTimestamp()
        }).catch(e => console.error("Error saving to Firebase:", e))
      ]);
      
      if (telegramSuccess) {
        // Send to Google Sheets (using the same URL, but with different fields)
        const sheetURL = "https://script.google.com/macros/s/AKfycbw2Bkjrv9SbObSFs0xOlcONYKJKpsa_lqSu2to4PfIKlHoP8U5KVMj0DQYrkvkS_jYS/exec";
        const reportData = {
          name: 'Anonymous Tip',
          phone: '',
          email: '',
          message: quickTip,
          location: '',
          date: new Date().toISOString().split('T')[0],
          status: 'New Tip'
        };
        
        console.log("Sending quick tip to Google Sheets:", reportData);
        
        // Send to Google Sheets in the background without blocking
        fetch(sheetURL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData)
        }).then(() => console.log("Quick tip successfully sent to Google Sheets"))
          .catch(e => console.error("Error sending tip to Google Sheets:", e));

        setSent(true);
        setQuickTip('');
        setTimeout(() => setSent(false), 3000);
      } else {
        alert(t.sendTipError || 'An error occurred! Please try again later.');
      }
    } catch (error) {
      console.error("Error submitting quick tip:", error);
      alert(t.sendTipError || 'An error occurred! Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-brand-bg text-brand-text-primary overflow-x-hidden custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Production-Ready Navbar */}
      <nav className="fixed top-0 w-full z-[100] bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none text-brand-text-primary">West Gojjam Police</span>
              <span className="text-[8px] font-bold text-brand-accent uppercase tracking-widest mt-0.5 opacity-80 font-mono italic">
                Official Management System
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4 border-r border-brand-border pr-4">
              <Globe size={16} className="text-brand-text-secondary" />
              <button 
                onClick={() => setLang('en')}
                className={`text-xs font-bold px-2 py-1 rounded ${lang === 'en' ? 'bg-brand-accent text-white' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('am')}
                className={`text-xs font-bold px-2 py-1 rounded ${lang === 'am' ? 'bg-brand-accent text-white' : 'text-brand-text-secondary hover:text-brand-text-primary'}`}
              >
                AM
              </button>
            </div>
            {isLoggedIn ? (
              <button onClick={onGoToDashboard} className="btn-primary py-2 px-6 text-sm flex items-center gap-2">
                <LayoutDashboard size={16} />
                {t.goToDashboard}
              </button>
            ) : (
              <>
                <button onClick={onLogin} className="text-sm font-medium text-brand-text-secondary hover:text-brand-text-primary transition-colors">
                  {t.login}
                </button>
                <button onClick={onSignup} className="btn-primary py-2 px-4 text-sm">
                  {t.register}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-brand-text-primary hover:bg-white/5 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-card border-b border-brand-border overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-2 bg-brand-bg/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-brand-text-secondary" />
                    <span className="text-sm font-medium">{t.language}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setLang('en'); setIsMenuOpen(false); }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-brand-accent text-white' : 'bg-white/5 text-brand-text-secondary'}`}
                    >
                      EN
                    </button>
                    <button 
                      onClick={() => { setLang('am'); setIsMenuOpen(false); }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'am' ? 'bg-brand-accent text-white' : 'bg-white/5 text-brand-text-secondary'}`}
                    >
                      AM
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {isLoggedIn ? (
                    <button 
                      onClick={() => { onGoToDashboard(); setIsMenuOpen(false); }}
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard size={18} />
                      {t.goToDashboard}
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => { onLogin(); setIsMenuOpen(false); }}
                        className="w-full py-3 rounded-xl border border-brand-border font-bold hover:bg-white/5 transition-all"
                      >
                        {t.login}
                      </button>
                      <button 
                        onClick={() => { onSignup(); setIsMenuOpen(false); }}
                        className="w-full btn-primary py-3"
                      >
                        {t.register}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 md:pt-20 pb-6 md:pb-8 px-4 relative overflow-hidden border-b border-brand-border">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-40 h-40 bg-brand-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-brand-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <span className="inline-block px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-3 border border-brand-accent/20">
                {t.officialManagementSystem}
              </span>
              <h1 className="text-xl md:text-3xl lg:text-5xl font-bold tracking-tight mb-2 md:mb-3 leading-tight">
                {t.heroTitle}
              </h1>
              <p className="text-sm md:text-lg font-bold text-brand-accent mb-2 md:mb-3 italic">
                "{t.motto}"
              </p>
              <p className="text-xs md:text-base text-brand-text-secondary max-w-xl mx-auto lg:mx-0 mb-4 md:mb-6 leading-relaxed">
                {t.heroDesc}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {isLoggedIn ? (
                  <button onClick={onGoToDashboard} className="w-full sm:w-auto btn-primary text-sm px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90">
                    <LayoutDashboard size={16} />
                    {t.goToDashboard}
                  </button>
                ) : (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="bg-brand-card/50 p-6 rounded-2xl
