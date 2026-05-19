import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, ChevronRight, ChevronLeft, Paperclip, X as XIcon, Image as ImageIcon, FileText as FileIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { sendTelegramMessage, escapeHtml } from '../services/telegramService';

interface CommunityReportFormProps {
  lang: Language;
  onBack: () => void;
}

interface AttachedFile {
  name: string;
  type: string;
  data: string;
}

export function CommunityReportForm({ lang, onBack }: CommunityReportFormProps) {
  const t = translations[lang];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);
  
  const [report, setReport] = useState({
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    details: '',
    files: [] as AttachedFile[]
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      
      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReport(prev => {
            // Check boundaries safely within an atomic callback to prevent loop race conditions
            if (prev.files.length >= 3) return prev;
            return {
              ...prev,
              files: [
                ...prev.files, 
                { 
                  name: file.name, 
                  type: file.type, 
                  data: reader.result as string 
                }
              ].slice(0, 3)
            };
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setReport(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

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
      if (report.reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(report.reporterEmail)) {
        alert(lang === 'am' ? 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ ወይም ባዶ ይተውት' : 'Please enter a valid email or leave it empty');
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
      const uploadedFileUrls: string[] = [];

      // Only attempt Cloud Storage execution loops if explicitly online
      if (report.files.length > 0 && navigator.onLine) {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('../firebase');
        
        for (const file of report.files) {
          const fileRef = ref(storage, `community_reports/${Date.now()}_${file.name}`);
          const response = await fetch(file.data);
          const blob = await response.blob();
          const snapshot = await uploadBytes(fileRef, blob);
          const url = await getDownloadURL(snapshot.ref);
          uploadedFileUrls.push(url);
        }
      }

      // Safe metadata architecture assembly for structured Firestore submission
      const reportData = {
        reporterName: report.reporterName,
        reporterPhone: report.reporterPhone,
        reporterEmail: report.reporterEmail || "",
        location: report.location,
        date: report.date,
        details: report.details,
        files: uploadedFileUrls,
        status: 'New',
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'community_reports'), reportData);
      
      // Construct conditional message payload based on storage success variables
      let filesString = "";
      if (uploadedFileUrls.length > 0) {
        filesString = `\n<b>Attachments (${uploadedFileUrls.length}):</b>\n${uploadedFileUrls.map((url, i) => `<a href="${url}">File ${i+1}</a>`).join(', ')}`;
      } else if (report.files.length > 0) {
        filesString = `\n<b>Attachments (${report.files.length}):</b>\n[Pending Sync/Offline Upload]`;
      }
        
      const message = `🚨 <b>አዲስ የማህበረሰብ ሪፖርት / New Community Report</b>\n---------------------------\n<b>Name:</b> ${escapeHtml(report.reporterName)}\n<b>Phone:</b> ${escapeHtml(report.reporterPhone)}\n<b>Location:</b> ${escapeHtml(report.location)}\n<b>Date:</b> ${escapeHtml(report.date)}\n---------------------------\n<b>Details:</b>\n${escapeHtml(report.details)}${filesString}`;
      
      try {
        await sendTelegramMessage(message);
      } catch
