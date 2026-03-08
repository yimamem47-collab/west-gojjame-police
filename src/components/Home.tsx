import React from 'react';
import { Shield, ShieldAlert, Users, ClipboardList, FileText, ArrowRight, Lock, CheckCircle, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface HomeProps {
  onLogin: () => void;
  onSignup: () => void;
  onReport: (type: 'Crime' | 'Traffic') => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

export function Home({ onLogin, onSignup, onReport, lang, setLang }: HomeProps) {
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text-primary">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-accent shadow-sm">
              <img 
                src="https://lh3.googleusercontent.com/u/0/d/1Cs0lYh3PD1lR_cQH4lET3GRUYRF11Z6i" 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">WG Police</span>
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-brand-card/30">
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
      <section className="py-20 px-4">
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
      <footer className="py-12 px-4 border-t border-brand-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-brand-text-secondary">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-brand-accent" />
            <span className="text-lg font-bold text-brand-text-primary">WG Police</span>
          </div>
          <p className="text-sm">© 2024 West Gojjam Zone Police Department. All rights reserved. ዲቨሎፕ ባይ ዋና ሳጅን መንገሻ ይማም አበራ / Developed by Chief Sergeant Mengesha Yimam Abera</p>
          <div className="flex gap-6 text-sm">
            <a href="https://www.facebook.com/share/1CCxnhaNmX/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-text-primary">Facebook</a>
            <a href="https://t.me/westgojjamepolice" target="_blank" rel="noopener noreferrer" className="hover:text-brand-text-primary">Telegram</a>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs font-bold text-brand-accent">ዲቨሎፕ ባይ ዋና ሳጅን መንገሻ ይማም አበራ / Developed by Chief Sergeant Mengesha Yimam Abera</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
