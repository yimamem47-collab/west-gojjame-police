import React, { useState } from 'react';
import { Shield, Mail, Lock, User, ArrowRight, ShieldCheck, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup
} from 'firebase/auth';

interface AuthProps {
  type: 'login' | 'signup';
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onSuccess: (user: { name: string; email: string }) => void;
  onSwitch: () => void;
}

export function Auth({ type, lang, onLanguageChange, onSuccess, onSwitch }: AuthProps) {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    badgeNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (type === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });
        onSuccess({
          name: formData.name,
          email: formData.email
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onSuccess({
          name: userCredential.user.displayName || 'Officer',
          email: userCredential.user.email || ''
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = 'An error occurred. Please try again.';
      if (err.code === 'auth/email-already-in-use') message = 'This email is already registered.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') message = 'Invalid email or password.';
      if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      onSuccess({
        name: result.user.displayName || 'Officer',
        email: result.user.email || ''
      });
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex bg-brand-bg/80 backdrop-blur-md p-1 rounded-xl border border-brand-border">
            <button 
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-brand-text-secondary hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => onLanguageChange('am')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${lang === 'am' ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' : 'text-brand-text-secondary hover:text-white'}`}
            >
              AM
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent rounded-2xl mb-4 shadow-lg shadow-brand-accent/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {type === 'login' ? t.loginTitle : t.signupTitle}
          </h1>
          <p className="text-brand-text-secondary">
            {type === 'login' 
              ? 'Access the West Gojjam Zone Police system.' 
              : 'Register your officer account for the department.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {type === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                    <input
                      required
                      type="text"
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">Badge Number</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                    <input
                      required
                      type="text"
                      className="input-field pl-10"
                      placeholder="WG-XXXX"
                      value={formData.badgeNumber}
                      onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-2">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                <input
                  required
                  type="email"
                  className="input-field pl-10"
                  placeholder="name@wgpolice.gov.et"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
                <input
                  required
                  type="password"
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3 text-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {type === 'login' ? t.loginButton : t.signupButton}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-brand-bg px-2 text-brand-text-secondary">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-brand-border bg-white/5 hover:bg-white/10 transition-all font-medium disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <div className="mt-8 pt-6 border-t border-brand-border text-center">
            <p className="text-brand-text-secondary text-sm">
              {type === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={onSwitch}
                className="ml-2 text-brand-accent font-bold hover:underline"
              >
                {type === 'login' ? 'Register here' : 'Sign in here'}
              </button>
            </p>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-xs text-brand-text-secondary">
          Authorized personnel only. All access is monitored and logged.
        </p>
      </div>
    </div>
  );
}
