import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, AlertCircle, Clock, CheckCircle2, ShieldAlert, MapPin, Calendar, User, Phone, Eye, Trash2, Mic, Square } from 'lucide-react';
import { Incident } from '../types';
import { motion } from 'framer-motion';
import { Language, translations } from '../lib/translations';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface IncidentsProps {
  incidents: Incident[];
  lang: Language;
  onAdd: (incident: Omit<Incident, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const INITIAL_INCIDENT_STATE = {
  title: '',
  description: '',
  category: 'Theft',
  location: '',
  reporterName: '',
  reporterPhone: '',
};

export function Incidents({ incidents, lang, onAdd, onDelete }: IncidentsProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  // Form state
  const [formData, setFormData] = useState(INITIAL_INCIDENT_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const filteredIncidents = incidents.filter(i =>
    (i.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.reporterName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Start Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert(lang === 'am' ? 'ማይክሮፎን ማግኘት አልተቻለም' : 'Could not access microphone');
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      // Stop all tracks to release microphone
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_INCIDENT_STATE);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // Form Submission with Audio Upload
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      alert(lang === 'am' ? 'እባክዎ ሁሉንም አስፈላጊ መረጃዎች ያሟሉ' : 'Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    let finalVoiceUrl = '';

    try {
      // 1. If audio report exists, upload it to Firebase Storage
      if (audioBlob) {
        const voiceRef = ref(storage, `police_voice_reports/${Date.now()}_report.webm`);
        const snapshot = await uploadBytes(voiceRef, audioBlob, { contentType: audioBlob.type });
        finalVoiceUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Add Incident report to backend
      await onAdd({
        ...formData,
        voiceUrl: finalVoiceUrl,
      });

      handleCloseModal();
    } catch (error) {
      console.error('Submission error:', error);
      alert(lang === 'am' ? 'ሪፖርቱን መላክ አልተቻለም፣ እባክዎ እንደገና ይሞክሩ' : 'Failed to submit report, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.incidents || 'Crime Reports'}</h1>
          <p className="text-brand-text-secondary">{lang === 'am' ? 'የቀረቡ የወንጀልና የአደጋ ጥቆማዎችን ማስተዳደሪያ ገጽ' : 'Manage and monitor reported crime incidents'}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          {lang === 'am' ? 'ጥቆማ መዝግብ' : 'File Report'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Incidents Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIncidents.map((incident) => (
          <motion.div 
            layout
            key={incident.id} 
            className="glass-card p-6 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  incident.status === 'Active' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {incident.status === 'Active' 
                    ? (lang === 'am' ? 'በሂደት ላይ' : 'Active') 
                    : (lang === 'am' ? 'የተዘጋ' : 'Resolved')}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setSelectedIncident(incident)}
                    className="p-1.5 text-brand-text-secondary hover:text-brand-accent transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(incident.id)}
                    className="p-1.5 text-brand-text-secondary hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2 line-clamp-1">{incident.title}</h3>
              <p className="text-sm text-brand-text-secondary line-clamp-3 mb-4">{incident.description}</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-brand-border text-xs text-brand-text-secondary">
              <div className="flex items-center gap-2">
                <ShieldAlert size={14} className="text-brand-accent" />
                <span>{incident.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-brand-accent" />
                <span className="line-clamp-1">{incident.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal: Add Incident */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items
