import React from 'react';
import { Shield, ShieldAlert, Users, ClipboardList, FileText, ArrowRight, Lock, CheckCircle, Globe, Phone, Camera, Send, MessageSquare, Facebook, Bot } from 'lucide-react';
import { sendTelegramMessage, escapeHtml } from '../services/telegramService';
import { Language, translations } from '../lib/translations';
import { APP_LOGO } from '../constants';
import { motion } from 'motion/react';
import { useState } from 'react';
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
  lang: Language;
  setLang: (lang: Language) => void;
}

export function Home({ onLogin, onSignup, onReport, onViewContacts, onOpenQR, onCommunityReport, lang, setLang }: HomeProps) {
  const t = translations[lang];

  const [quickTip, setQuickTip] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleQuickTipSubmit = async () => {
    if (!quickTip.trim()) {
      alert(lang === 'am' ? 'እባክህ መጀመሪያ ጥቆማህን ጻፍ!' : 'Please write your tip first!');
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
        
        // Send to Google Sheets in the background without blocking
        fetch(sheetURL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData)
        }).catch(e => console.error("Error sending tip to Google Sheets:", e));

        setSent(true);
        setQuickTip('');
        setTimeout(() => setSent(false), 3000);
      } else {
        alert(lang === 'am' ? 'ስህተት ተከስቷል! እባክዎ ቆይተው ይሞክሩ።' : 'An error occurred! Please try again later.');
      }
    } catch (error) {
      console.error("Error submitting quick tip:", error);
      alert(lang === 'am' ? 'ስህተት ተከስቷል! እባክዎ ቆይተው ይሞክሩ።' : 'An error occurred! Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-accent shadow-sm">
              <img 
                src={APP_LOGO} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">West Gojjam Police</span>
          </div>
          <div className="flex items-center gap-4">
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
            <button onClick={onLogin} className="text-sm font-medium text-brand-text-secondary hover:text-brand-text-primary transition-colors">
              {t.login || 'Sign In'}
            </button>
            <button onClick={onSignup} className="btn-primary py-2 px-4 text-sm">
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest mb-6 border border-brand-accent/20">
              Official Management System
            </span>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
              West Gojjam Zone <br />
              <span className="text-brand-accent">Police Department</span>
            </h1>
            <p className="text-2xl font-bold text-brand-accent mb-6 italic">
              "በጀግንነት መጠበቅ በሰባዊነት ማገልገል"
            </p>
            <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto mb-10">
              A secure, unified platform for incident reporting, officer management, and zone-wide coordination.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => onReport('Crime')} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto bg-rose-600 hover:bg-rose-700 border-rose-500">
                <ShieldAlert size={20} />
                {lang === 'am' ? 'የወንጀል ቁጥጥር' : 'Crime Control'}
              </button>
              <button onClick={() => onReport('Traffic')} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto bg-amber-600 hover:bg-amber-700 border-amber-500">
                <Shield size={20} />
                {lang === 'am' ? 'የትራፊክ ደህንነት' : 'Traffic Safety'}
              </button>
              <button onClick={onViewContacts} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 border-emerald-500">
                <Phone size={20} />
                {lang === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'}
              </button>
              <button onClick={onCommunityReport} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 border-blue-500">
                <MessageSquare size={20} />
                {lang === 'am' ? 'የማህበረሰብ ሪፖርት' : 'Community Report'}
              </button>
              <button onClick={onOpenQR} className="btn-primary text-lg px-8 py-4 w-full sm:w-auto bg-brand-accent hover:bg-brand-accent/90 border-brand-accent">
                <Camera size={20} />
                {lang === 'am' ? 'ሰካን ማድረጊያ' : 'Scan QR'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Tip & AI Assistant Section */}
      <section className="py-20 px-4 bg-brand-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Tip */}
            <div className="glass-card p-8 md:p-12 border-brand-accent/20 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-accent/10 rounded-2xl">
                  <MessageSquare className="text-brand-accent" size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{lang === 'am' ? 'ፈጣን ጥቆማ' : 'Quick Tip'}</h2>
                  <p className="text-brand-text-secondary">{lang === 'am' ? 'ለፖሊስ ፈጣን መረጃ ይስጡ' : 'Provide quick information to the police'}</p>
                </div>
              </div>

              <div className="space-y-6 flex-1 flex flex-col">
                <textarea 
                  id="crimeReport"
                  className="input-field flex-1 min-h-[200px] text-lg resize-none"
                  placeholder={lang === 'am' ? 'ጥቆማዎን እዚህ ይጻፉ...' : 'Write your tip here...'}
                  value={quickTip}
                  onChange={(e) => setQuickTip(e.target.value)}
                />
                
                <button 
                  onClick={handleQuickTipSubmit}
                  disabled={sending || sent}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    sent ? 'bg-emerald-500 text-white' : 'btn-primary'
                  }`}
                >
                  {sending ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : sent ? (
                    <>
                      <CheckCircle size={24} />
                      {lang === 'am' ? 'ጥቆማው ተልኳል!' : 'Tip Sent!'}
                    </>
                  ) : (
                    <>
                      <Send size={24} />
                      {lang === 'am' ? 'ጥቆማ ላክ' : 'Send Tip'}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="glass-card p-8 md:p-12 border-brand-accent/20 flex flex-col h-full">
              <AIAssistant lang={lang} compact={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldAlert, title: 'Incident Tracking', desc: 'Real-time monitoring and logging of all reported incidents.' },
              { icon: Users, title: 'Officer Directory', desc: 'Comprehensive database of personnel and their assignments.' },
              { icon: ClipboardList, title: 'Duty Assignments', desc: 'Streamlined task allocation and progress monitoring.' },
              { icon: FileText, title: 'Case Reports', desc: 'Secure digital filing and review of official case documentation.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 hover:border-brand-accent/30 transition-all"
              >
                <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center mb-6 border border-brand-accent/20">
                  <feature.icon size={24} className="text-brand-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-brand-text-secondary leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 bg-brand-card/30">
        <div className="max-w-7xl mx-auto glass-card p-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">Enterprise-Grade Security</h2>
            <div className="space-y-4">
              {[
                'End-to-end encryption for all sensitive data',
                'Role-based access control for officers and admins',
                'Real-time audit logs for every system action',
                'Secure cloud infrastructure with 99.9% uptime'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-emerald-400" />
                  <span className="text-brand-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 bg-brand-accent/20 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <Lock size={120} className="text-brand-accent relative z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 px-4 bg-brand-bg border-t border-brand-border mt-auto">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl font-bold text-brand-text-primary mb-4">
            {lang === 'am' ? 'የምዕራብ ጎጃም ዞን ፖሊስ መምሪያ' : 'West Gojjam Zone Police Department'}
          </p>
          <div className="flex justify-center gap-6 mb-6">
            <a 
              href="https://www.facebook.com/share/1CCxnhaNmX/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#1877F2] hover:text-[#166fe5] transition-colors font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
            >
              <Facebook size={20} />
              <span>Facebook</span>
            </a>
            <a 
              href="https://t.me/westgojjamepolice" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#229ED9] hover:text-[#2094cc] transition-colors font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10"
            >
              <Send size={20} />
              <span>Telegram</span>
            </a>
          </div>
          <hr className="border-brand-border mb-6" />
          <p className="text-brand-text-secondary italic font-medium">
            Developed by: Chief Sergeant Mengesha Yimam Abera
          </p>
        </div>
      </footer>
    </div>
  );
}
