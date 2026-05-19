import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, Plus, Search, Trash2, Edit2, Calendar, MapPin, Camera, 
  Image as ImageIcon, Map, List, Volume2, Mic, Square, Info, X, 
  CheckCircle, ChevronLeft, ChevronRight, Send, RefreshCw, FileText, 
  File as FileIcon, FileCheck 
} from 'lucide-react';
import { Incident, Officer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { IncidentMap } from './IncidentMap';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Capacitor } from '@capacitor/core';

interface IncidentsProps {
  incidents: Incident[];
  officers: Officer[];
  lang: Language;
  initialEditId?: string | null;
  onAdd: (incident: Omit<Incident, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Incident>) => void;
  onDelete: (id: string) => void;
}

const initialFormState = () => ({
  title: '',
  status: 'Open' as const,
  date: new Date().toISOString().split('T')[0],
  location: '',
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  officerId: '',
  filingStation: '',
  recordingOfficerName: '',
  recordingOfficerRank: 'constable',
  type: 'Crime' as const,
  category: 'other',
  description: '',
  photos: [] as string[],
  document_url: '',
  documents: [] as { name: string; url: string }[],
  voice_url: '',
  trafficDetails: {
    accidentType: 'pedestrianCollision',
    accidentImpact: 'death',
    numDeaths: 0,
    numHeavyInjuries: 0,
    numLightInjuries: 0,
    propertyDamageEstimate: '',
    driverExperience: 'exp1to5',
    vehicleType: 'vPrivate',
    plateNumber: '',
    licenseGrade: 'lAutomobile',
    reporterName: '',
    reporterAddress: '',
    reporterPhone: '',
    reporterOther: ''
  }
});

export function Incidents({ incidents, officers, lang, initialEditId, onAdd, onUpdate, onDelete }: IncidentsProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<{ blob: Blob, name: string }[]>([]);
  const [newIncident, setNewIncident] = useState<Omit<Incident, 'id'>>(initialFormState());
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);

  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Handle Edit triggering from parent components
  useEffect(() => {
    if (initialEditId) {
      const incident = incidents.find(i => i.id === initialEditId);
      if (incident) {
        handleEdit(incident);
      }
    }
  }, [initialEditId, incidents]);

  // Update default officer when officers list is loaded
  useEffect(() => {
    if (officers.length > 0 && !newIncident.officerId) {
      setNewIncident(prev => ({ 
        ...prev, 
        officerId: officers[0].id,
        recordingOfficerName: officers[0].name,
        recordingOfficerRank: officers[0].rank
      }));
    }
  }, [officers, newIncident.officerId]);

  // Voice recording timer handling
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIncident(null);
    setNewIncident(initialFormState());
    setSelectedDocs([]);
    setAudioBlob(null);
    setAudioUrl(null);
    setCurrentStep(1);
  };

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setNewIncident({
      title: incident.title,
      status: incident.status,
      date: incident.date,
      location: incident.location,
      lat: incident.lat,
      lng: incident.lng,
      officerId: incident.officerId,
      filingStation: incident.filingStation,
      recordingOfficerName: incident.recordingOfficerName,
      recordingOfficerRank: incident.recordingOfficerRank,
      type: incident.type,
      category: incident.category,
      description: incident.description,
      photos: incident.photos || [],
      documents: incident.documents || [],
      voice_url: incident.voice_url || '',
      document_url: incident.document_url || '',
      trafficDetails: incident.trafficDetails || initialFormState().trafficDetails
    });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async () => {
    try {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      if (image.dataUrl) {
        setNewIncident(prev => ({
          ...prev,
          photos: [...(prev.photos || []), image.dataUrl!].slice(0, 10)
        }));
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const removePhoto = (index: number) => {
    setNewIncident(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleDocUpload = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await FilePicker.pickFiles({
          types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        });
        
        if (result.files.length > 0) {
          const newDocs: { blob: Blob, name: string }[] = [];
          for (const file of result.files) {
            if (file.path) {
              const response = await fetch(Capacitor.convertFileSrc(file.path));
              const blob = await response.blob();
              newDocs.push({ 
                blob, 
                name: file.name || `doc_${Date.now()}` 
              });
            }
          }
          setSelectedDocs(prev => [...prev, ...newDocs]);
        }
      } catch (err) {
        console.error("File picker error:", err);
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
      input.multiple = true;
      input.onchange = async (e: any) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length > 0) {
          const newDocs = files.map(file => ({ blob: file, name: file.name }));
          setSelectedDocs(prev => [...prev, ...newDocs]);
        }
      };
      input.click();
    }
  };

  const removeDoc = (index: number) => {
    setSelectedDocs(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingDoc = (index: number) => {
    setNewIncident(prev => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index)
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4') 
          ? 'audio/mp4' 
          : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingDuration(0);
      mediaRecorder.ondataavailable = (e) => e.data.size > 0 && audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert(lang === 'am' ? 'ማይክሮፎን ማግኘት አልተቻለም' : 'Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIncident.title.trim() || newIncident.title.length < 3) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ርዕስ ያስገቡ (ቢያንስ 3 ፊደላት)' : 'Please enter a valid title (min 3 characters)');
      return;
    }
    if (!newIncident.location.trim()) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ቦታ ያስገቡ' : 'Please enter a valid location');
      return;
    }
    if (!newIncident.officerId) {
      alert(lang === 'am' ? 'እባክዎ መኮንን ይምረጡ' : 'Please select an officer');
      return;
    }
    if (!newIncident.date) {
      alert(lang === 'am' ? 'እባክዎ ቀን ይምረጡ' : 'Please select a date');
      return;
    }
    if (new Date(newIncident.date) > new Date()) {
      alert(lang === 'am' ? 'ቀን ከዛሬ ሊበልጥ አይችልም' : 'Date cannot be in the future');
      return;
    }
    if (!newIncident.description?.trim() || newIncident.description.length < 10) {
      alert(lang === 'am' ? 'እባክዎ ዝርዝር መግለጫ ያስገቡ (ቢያንስ 10 ፊደላት)' : 'Please enter a detailed description (min 10 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalVoiceUrl = newIncident.voice_url;
      let finalDocuments = [...(newIncident.documents || [])];
      let finalPhotos = [...(newIncident.photos || [])];

      if (!navigator.onLine && (audioBlob || selectedDocs.length > 0)) {
        const confirmSave = window.confirm(lang === 'am' 
          ? 'ኔትወርክ የለም። ክስተቱ ይቀመጣል ነገር ግን ፋይሎች ሊጫኑ አይችሉም። መቀጠል ይፈልጋሉ?' 
          : 'You are offline. The incident will be saved, but files cannot be uploaded. Do you want to continue?');
        if (!confirmSave) {
          setIsSubmitting(false);
          return;
        }
      }

      if (navigator.onLine) {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../firebase');

        if (audioBlob) {
          const extension = audioBlob.type.includes('mp4') ? 'mp4' : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
          const voiceRef = ref(storage, `incidents/${Date.now()}_voice.${extension}`);
          const snapshot = await uploadBytes(voiceRef, audioBlob, { contentType: audioBlob.type });
          finalVoiceUrl = await getDownloadURL(snapshot.ref);
