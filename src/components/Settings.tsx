import React, { useState } from 'react';
import { User, Mail, Shield, Bell, Palette, Send, CheckCircle2, XCircle, Loader2, Activity, RefreshCw, Copy, ExternalLink, Info } from 'lucide-react';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { onFirestoreStatusChange, clearFirestoreCache } from '../firebase';
import { testFirebaseConnection, testTelegramConnection, testGoogleSheetsConnection, DiagnosticResult } from '../services/diagnosticService';
import { APP_VERSION } from '../constants';
import { testFirebaseConnection, testTelegramConnection, testGoogleSheetsConnection, DiagnosticResult } from '../services/diagnostics';

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
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);
  
  // Diagnostic State
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [showDiagnosticReport, setShowDiagnosticReport] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairComplete, setRepairComplete] = useState(false);

  // GitHub Sync State
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);
  const [githubSyncResults, setGithubSyncResults] = useState<any[]>([]);
  const [showGithubDetails, setShowGithubDetails] = useState(false);

  React.useEffect(() => {
    const unsubscribe = onFirestoreStatusChange((connected) => {
      setIsFirestoreConnected(connected);
    });
    return () => unsubscribe();
  }, []);

  const handleGitHubSync = async () => {
    if (!window.confirm('This will sync the latest dashboard code directly to your GitHub repository (yimamem47-collab/west-gojjame-police). Continue?')) return;
    
    setIsSyncingGitHub(true);
    setGithubSyncResults([]);
    setShowGithubDetails(true);
    
    try {
      const filesToSync = ['src/App.tsx', 'src/components/Settings.tsx'];
      const data = await syncToGitHub(filesToSync);
      
      setGithubSyncResults(data.results || []);
      
      const successCount = data.results ? data.results.filter((r: any) => r.status === 'success').length : 0;
      if (data.results && successCount === data.results.length) {
        alert('All files synced successfully to GitHub! You can now pull the latest code in Android Studio.');
      } else {
        alert(`Sync completed. Check details below.`);
      }
    } catch (e: any) {
      console.error('GitHub Sync Error:', e);
      alert(`Sync failed: ${e.message}`);
    } finally {
      setIsSyncingGitHub(false);
    }
  };

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

  const runAllDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setDiagnostics([]);
    
    const results: DiagnosticResult[] = [];
    
    // 1. Firebase
    const firebaseResult = await testFirebaseConnection();
    results.push(firebaseResult);
    setDiagnostics([...results]);
    
    // 2. Telegram
    const telegramResult = await testTelegramConnection();
    results.push(telegramResult);
    setDiagnostics([...results]);
    
    // 3. Google Sheets
    const sheetsResult = await testGoogleSheetsConnection();
    results.push(sheetsResult);
    setDiagnostics([...results]);
    
    setIsRunningDiagnostics(false);
  };

  const copyDiagnosticReport = () => {
    const report = diagnostics.map(d => 
      `[${d.service}] Status: ${d.status.toUpperCase()}\nMessage: ${d.message}${d.details ? `\nDetails: ${d.details}` : ''}`
    ).join('\n\n');
    
    const fullReport = `SYSTEM CONNECTIVITY DIAGNOSTIC REPORT\nDate: ${new Date().toLocaleString()}\n-----------------------------------\n${report}`;
    
    navigator.clipboard.writeText(fullReport);
    alert('Diagnostic report copied to clipboard!');
  };

  const handleRepair = async () => {
    if (!window.confirm(t.repairDescription)) return;
    
    setIsRepairing(true);
    try {
      const success = await clearFirestoreCache();
      if (success) {
        setRepairComplete(true);
        setTimeout(() => setRepairComplete(false), 5000);
      }
    } catch (error) {
      console.error('Repair failed:', error);
    } finally {
      setIsRepairing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.settings || 'Settings'}</h1>
          <p className="text-brand-text-secondary">Manage your account preferences and profile.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-card border border-brand-border rounded-xl">
          <div className={`w-2 h-2 rounded-full ${isFirestoreConnected ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isFirestoreConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Diagnostic Tool */}
          <div className="glass-card p-8 border-brand-accent/30 bg-brand-accent/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity size={20} className="text-brand-accent" />
                System Connectivity Diagnostic
              </h3>
              <button 
                onClick={runAllDiagnostics}
                disabled={isRunningDiagnostics}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-accent hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {isRunningDiagnostics ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {isRunningDiagnostics ? 'Running...' : 'Run Full Check'}
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-brand-text-secondary mb-4">
                Verify that all external services (Firebase, Telegram, and Google Sheets) are correctly connected and responding.
              </p>
              
              {/* Repair Button */}
              <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-brand-accent flex items-center gap-2">
                    <RefreshCw size={16} className={isRepairing ? "animate-spin" : ""} />
                    {t.repairSync || 'Repair Sync'}
                  </h4>
                  <p className="text-xs text-brand-text-secondary mt-1">
                    {t.repairDescription || 'Clear local cache and force resync.'}
                  </p>
                </div>
                <button 
                  onClick={handleRepair}
                  disabled={isRepairing}
                  className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                    repairComplete 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-brand-accent text-brand-bg hover:opacity-90'
                  } disabled:opacity-50`}
                >
                  {isRepairing ? (t.repairing || 'Repairing...') : repairComplete ? (t.repairSuccess || 'Success') : (t.repairSync || 'Repair')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Firebase', 'Telegram', 'GoogleSheets'].map((service) => {
                  const result = diagnostics.find(d => d.service === service);
                  return (
                    <div key={service} className="p-4 bg-brand-bg/40 border border-brand-border rounded-xl flex flex-col items-center justify-center text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary mb-2">{service}</p>
                      {result ? (
                        <div className="flex flex-col items-center">
                          {result.status === 'success' ? (
                            <CheckCircle2 className="text-emerald-500 mb-2" size={24} />
                          ) : (
                            <XCircle className="text-rose-500 mb-2" size={24} />
                          )}
                          <p className={`text-xs font-medium ${result.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {result.message}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center opacity-30">
                          <Activity className="text-brand-text-secondary mb-2" size={24} />
                          <p className="text-xs font-medium text-brand-text-secondary">Not Tested</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {diagnostics.length > 0 && (
                <div className="pt-4 flex items-center gap-4">
                  <button 
                    onClick={() => setShowDiagnosticReport(!showDiagnosticReport)}
                    className="text-xs font-bold text-brand-text-secondary hover:text-white flex items-center gap-1"
                  >
                    {showDiagnosticReport ? 'Hide Details' : 'Show Detailed Report'}
                  </button>
                  <button 
                    onClick={copyDiagnosticReport}
                    className="text-xs font-bold text-brand-accent hover:opacity-80 flex items-center gap-1"
                  >
                    <Copy size={12} />
                    Copy Report
                  </button>
                </div>
              )}

              <AnimatePresence>
                {showDiagnosticReport && diagnostics.length > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-black/40 border border-brand-border rounded-xl font-mono text-[10px] leading-relaxed text-brand-text-secondary">
                      <p className="text-brand-accent mb-2 uppercase tracking-widest">Diagnostic Details:</p>
                      {diagnostics.map((d, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                          <p className="text-white">[{d.service}] {d.status.toUpperCase()}</p>
                          <p>Message: {d.message}</p>
                          {d.details && <p className="text-rose-400/70">Error: {d.details}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* GitHub Sync Tool */}
          <div className="glass-card p-8 border-brand-accent/30 bg-brand-accent/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Send size={20} className="text-brand-accent" />
                GitHub Repository Sync
              </h3>
              <button 
                onClick={handleGitHubSync}
                disabled={isSyncingGitHub}
                className="btn-primary flex items-center gap-2 text-xs py-2 px-4"
              >
                {isSyncingGitHub ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {isSyncingGitHub ? 'Syncing...' : 'Sync Dashboard to GitHub'}
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-brand-text-secondary">
                Pushes the current AI Studio application state (code, rules, config) to your connected GitHub repository: 
                <span className="text-brand-accent ml-1 font-mono">yimamem47-collab/west-gojjame-police</span>
              </p>

              {githubSyncResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setShowGithubDetails(!showGithubDetails)}
                      className="text-xs font-bold text-brand-text-secondary hover:text-white flex items-center gap-1"
                    >
                      {showGithubDetails ? 'Hide Status' : 'Show Status'}
                    </button>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                      {githubSyncResults.filter(r => r.status === 'success').length} of {githubSyncResults.length} Files Synced
                    </p>
                  </div>

                  <AnimatePresence>
                    {showGithubDetails && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-black/40 border border-brand-border rounded-xl p-3 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {githubSyncResults.map((result, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-brand-text-secondary truncate mr-2">{result.file}</span>
                              <span className={result.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}>
                                {result.status.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
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

          {/* Security */}
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

        {/* Right Sidebar */}
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

          <div className="p-6 border border-brand-border/10 rounded-2xl bg-brand-bg/20 flex flex-col items-center">
            <div className="flex items-center gap-2 text-brand-text-secondary/50 mb-2">
              <Info size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Application Build Info</span>
            </div>
            <p className="text-xs font-mono text-brand-text-secondary/80">Version: {APP_VERSION}</p>
            <p className="text-[9px] font-mono text-brand-text-secondary/40 mt-1 uppercase tracking-tighter">Production Channel • Optimized Build</p>
          </div>
        </div>
      </div>
    </div>
  );
}
