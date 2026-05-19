import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Plus, Search, Trash2, Edit2, Shield, Mic, Square, 
  ChevronLeft, ChevronRight, Send, CheckCircle, Info, X, Volume2, 
  Camera, File as FileIcon, FileCheck, Image as ImageIcon, AlertCircle 
} from 'lucide-react';
import { Report, Officer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { Capacitor } from '@capacitor/core';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

interface ReportsProps {
  reports: Report[];
  officers: Officer[];
  lang: Language;
  initialEditId?: string | null;
  onAdd: (report: Omit<Report, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Report>) => void;
  onDelete: (id: string) => void;
}

export function Reports({ reports, officers, lang, initialEditId, onAdd, onUpdate, onDelete }: ReportsProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<{ blob: Blob, name: string }[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const defaultTrafficDetails = {
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
    accidentCause: 'Other',
    reporterName: '',
    reporterAddress: '',
    reporterPhone: '',
    reporterOther: ''
  };

  const [newReport, setNewReport] = useState<Omit<Report, 'id'>>({
    title: '',
    status: 'Pending Review',
    date: new Date().toISOString().split('T')[0],
    officerId: '',
    filingStation: '',
    recordingOfficerName: '',
    recordingOfficerRank: 'constable',
    type: 'Crime',
    category: 'other',
    description: '',
    photos: [],
    documents: [],
    voice_url: '',
    trafficDetails: defaultTrafficDetails
  });

  useEffect(() => {
    if (initialEditId) {
      const report = reports.find(r => r.id === initialEditId);
      if (report) {
        setEditingReport(report);
        setNewReport({
          title: report.title,
          status: report.status,
          date: report.date,
          location: report.location || '',
          officerId: report.officerId,
          filingStation: report.filingStation,
          recordingOfficerName: report.recordingOfficerName,
          recordingOfficerRank: report.recordingOfficerRank,
          type: report.type,
          category: report.category,
          description: report.description,
          photos: report.photos || [],
          documents: report.documents || [],
          document_url: report.document_url || '',
          voice_url: report.voice_url || '',
          trafficDetails: report.trafficDetails || defaultTrafficDetails
        });
        setCurrentStep(1);
        setIsModalOpen(true);
      }
    }
  }, [initialEditId, reports]);

  useEffect(() => {
    if (officers.length > 0 && !newReport.officerId) {
      setNewReport(prev => ({
        ...prev,
        officerId: officers[0].id,
        recordingOfficerName: officers[0].name,
        recordingOfficerRank: officers[0].rank
      }));
    }
  }, [officers]);

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

  const handlePhotoUpload = async () => {
    try {
      const { Camera: CapCamera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      if (image.dataUrl) {
        setNewReport(prev => ({
          ...prev,
          photos: [...(prev.photos || []), image.dataUrl!].slice(0, 10)
        }));
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const removePhoto = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      photos: (prev.photos || []).filter((_, i) => i !== index)
    }));
  };

  const handleDocUpload = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await FilePicker.pickFiles({
          types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        });
        
        if (result.files.length > 0) {
          const newDocs: { blob: Blob, name: string }[] = [];
          for (const file of result.files) {
            if (file.path) {
              const response = await fetch(Capacitor.convertFileSrc(file.path));
              const blob = await response.blob();
              newDocs.push({ blob, name: file.name || `doc_${Date.now()}` });
            }
          }
          setSelectedDocs(prev => [...prev, ...newDocs]);
