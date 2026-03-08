import React, { useState } from 'react';
import { User, Mail, Shield, Bell, Palette } from 'lucide-react';
import { User as UserType } from '../types';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface SettingsProps {
  user: UserType | null;
  lang: Language;
  onUpdate: (updates: Partial<UserType>) => Promise<void>;
}

export function Settings({ user, lang, onUpdate }: SettingsProps) {
  const t = translations[lang];
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.settings || 'Settings'}</h1>
        <p className="text-brand-text-secondary">Manage your account preferences and profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User size={20} className="text-brand-accent" />
              {t.profile || 'Profile Information'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">Display Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex items-center gap-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {t.saveProfile || 'Save Changes'}
                </button>
                {success && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-emerald-400 text-sm font-medium"
                  >
                    Profile updated successfully!
                  </motion.span>
                )}
              </div>
            </form>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Shield size={20} className="text-brand-accent" />
              Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-brand-bg/30 border border-brand-border rounded-xl">
                <div>
                  <p className="font-bold">Two-Factor Authentication</p>
                  <p className="text-sm text-brand-text-secondary">Add an extra layer of security to your account.</p>
                </div>
                <button className="text-brand-accent font-bold text-sm">Enable</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-brand-bg/30 border border-brand-border rounded-xl">
                <div>
                  <p className="font-bold">Change Password</p>
                  <p className="text-sm text-brand-text-secondary">Update your password regularly to stay secure.</p>
                </div>
                <button className="text-brand-accent font-bold text-sm">Update</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Bell size={20} className="text-brand-accent" />
              Notifications
            </h3>
            <div className="space-y-4">
              {['Email Notifications', 'Project Updates', 'Task Reminders', 'Invoice Alerts'].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item}</span>
                  <div className="w-10 h-5 bg-brand-accent/20 rounded-full relative cursor-pointer border border-brand-accent/30">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-brand-accent rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Palette size={20} className="text-brand-accent" />
              Appearance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-brand-bg border-2 border-brand-accent rounded-xl text-center">
                <p className="text-xs font-bold">Dark</p>
              </button>
              <button className="p-4 bg-slate-100 border-2 border-transparent rounded-xl text-center opacity-50 cursor-not-allowed">
                <p className="text-xs font-bold text-slate-900">Light</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
