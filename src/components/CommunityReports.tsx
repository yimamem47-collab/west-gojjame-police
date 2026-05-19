import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, MapPin, Calendar, Phone, Mail, CheckCircle, Clock, Image as ImageIcon, FileText as FileIcon, X } from 'lucide-react';
import { CommunityReport } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { formatFirestoreTimestamp } from '../lib/utils';

interface CommunityReportsProps {
  lang: Language;
}

export function CommunityReports({ lang }: CommunityReportsProps) {
  const t = translations[lang];
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newReport, setNewReport] = useState<Omit<CommunityReport, 'id' | 'timestamp' | 'status'>>({
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    details: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'community_reports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const reportsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: formatFirestoreTimestamp(data.timestamp)
          };
        }) as CommunityReport[];
        setReports(reportsData);
      } catch (err) {
        console.error("Error parsing community reports:", err);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'community_reports');
    });

    return () => unsubscribe();
  }, []);

  const filteredReports = reports.filter(r => 
    (r.reporterName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newReport.reporterName.trim() || newReport.reporterName.length < 3) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ስም ያስገቡ (ቢያንስ 3 ፊደላት)' : 'Please enter a valid name (min 3 characters)');
      return;
    }
    if (!newReport.reporterPhone.trim() || !/^\+?[\d\s-]{9,}$/.test(newReport.reporterPhone)) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ' : 'Please enter a valid phone number');
      return;
    }
    if (!newReport.location.trim()) {
      alert(lang === 'am' ? 'እባክዎ ትክክለኛ ቦታ ያስገቡ' : 'Please enter a valid location');
      return;
    }
    if (!newReport.date) {
      alert(lang === 'am' ? 'እባክዎ ቀን ይምረጡ' : 'Please select a date');
      return;
    }
    if (!newReport.details.trim() || newReport.details.length < 10) {
      alert(lang === 'am' ? 'እባክዎ ዝርዝር መግለጫ ያስገቡ (ቢያንስ 10 ፊደላት)' : 'Please enter detailed information (min 10 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'community_reports'), {
        ...newReport,
        files: [], // Dashboard submissions start with empty arrays safely
        status: 'New',
        timestamp: serverTimestamp()
      });

      // Send to Google Sheets API
      const sheetURL = "https://script.google.com/macros/s/AKfycbw2Bkjrv9SbObSFs0xOlcONYKJKpsa_lqSu2to4PfIKlHoP8U5KVMj0DQYrkvkS_jYS/exec";
      
      const reportData = {
        name: newReport.reporterName,
        phone: newReport.reporterPhone,
        email: newReport.reporterEmail || "",
        message: newReport.details,
        location: newReport.location,
        date: newReport.date,
        status: 'New Community Report'
      };
      
      fetch(sheetURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      }).catch(error => console.error("Error sending to Google Sheets:", error));

      setIsModalOpen(false);
      setNewReport({
        reporterName: '',
        reporterPhone: '',
        reporterEmail: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        details: ''
      });
      alert(lang === 'am' ? 'ሪፖርትዎ በተሳካ ሁኔታ ተልኳል' : 'Your report has been submitted successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'community_reports');
      alert(lang === 'am' ? 'ሪፖርቱን መላክ አልተቻለም' : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: CommunityReport['status']) => {
    try {
      await updateDoc(doc(db, 'community_reports', id), {
        status: newStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `community_reports/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{lang === 'am' ? 'የማህበረሰብ ሪፖርቶች' : 'Community Reports'}</h1>
          <p className="text-brand-text-secondary text-sm">{lang === 'am' ? 'ከህብረተሰቡ የሚመጡ ጥቆማዎች እና ሪፖርቶች' : 'Tips and reports submitted by citizens.'}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary py-2.5 px-4 rounded-lg bg-brand-accent text-brand-bg font-semibold flex items-center gap-2 hover:bg-brand-accent/90 transition-all text-sm shadow-lg">
          <Plus size={18} />
          {lang === 'am' ? 'አዲስ ሪፖርት አቅርብ' : 'Submit New Report'}
        </button>
      </div>

      <div className="glass-card p-4 rounded-xl bg-white/5 border border-white/10 shadow-md">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder={lang === 'am' ? 'ፈልግ...' : 'Search reports...'} 
            className="w-full bg-brand-bg/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-brand-text-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredReports
