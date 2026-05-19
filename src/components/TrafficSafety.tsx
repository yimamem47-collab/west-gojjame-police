import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  MapPin, 
  Camera, 
  FileText, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Info, 
  X, 
  AlertTriangle,
  BarChart3,
  Navigation
} from 'lucide-react';
import { Incident, Officer } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { STABLE_KEYS, Language, translations } from '../lib/translations';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Geolocation } from '@capacitor/geolocation';
import { Camera as CapCamera, CameraResultType } from '@capacitor/camera';

interface TrafficSafetyProps {
  incidents: Incident[];
  officers: Officer[];
  lang: Language;
  initialEditId?: string | null;
  onAdd: (incident: Omit<Incident, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Incident>) => void;
  onDelete: (id: string) => void;
}

export function TrafficSafety({ incidents, officers, lang, initialEditId, onAdd, onUpdate, onDelete }: TrafficSafetyProps) {
  const t = translations[lang];
  const ts = (t as any).trafficSafetyModule || { title: 'Traffic Safety', subtitle: 'Management', options: { accidentCauses: [] }, fields: {} };
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'stats'>('list');

  const [newIncident, setNewIncident] = useState<Omit<Incident, 'id'>>({
    title: '',
    status: 'Open',
    date: new Date().toISOString().split('T')[0],
    location: '',
    lat: undefined,
    lng: undefined,
    officerId: '',
    filingStation: '',
    recordingOfficerName: '',
    recordingOfficerRank: 'constable',
    type: 'Traffic',
    category: 'other',
    description: '',
    photos: [] as string[],
    document_url: '',
    trafficDetails: {
      accidentType: STABLE_KEYS.accidentTypes?.[0] || 'Rollover',
      accidentImpact: STABLE_KEYS.damageTypes?.[0] || 'Fatal',
      numDeaths: 0,
      numHeavyInjuries: 0,
      numLightInjuries: 0,
      propertyDamageEstimate: '',
      driverExperience: 'Unknown',
      vehicleType: STABLE_KEYS.vehicleTypes?.[0] || 'Automobile',
      plateNumber: '',
      licenseGrade: 'None/Illegal',
      accidentCause: 'Other',
      reporterName: '',
      reporterAddress: '',
      reporterPhone: '',
      reporterOther: ''
    }
  });

  useEffect(() => {
    if (initialEditId) {
      const incident = incidents.find(i => i.id === initialEditId);
      if (incident && incident.type === 'Traffic') {
        handleEdit(incident);
      }
    }
  }, [initialEditId, incidents]);

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

  const getLabel = (type: 'accidentTypes' | 'damageTypes' | 'vehicleTypes' | 'driverExp' | 'licenseGrades' | 'accidentCauses', value: string) => {
    const enOpts = (translations.en as any).trafficSafetyModule?.options?.[type] || [];
    const amOpts = (translations.am as any).trafficSafetyModule?.options?.[type] || [];
    const index = enOpts.indexOf(value);
    if (index === -1) {
      const amIndex = amOpts.indexOf(value);
      if (amIndex !== -1) {
        return lang === 'am' ? amOpts[amIndex] : enOpts[amIndex];
      }
      return value;
    }
    return lang === 'am' ? amOpts[index] : enOpts[index];
  };

  const trafficIncidents = incidents.filter(i => i.type === 'Traffic');
  const filteredIncidents = trafficIncidents.filter(i => 
    (i.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.trafficDetails?.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLabel('accidentTypes', i.trafficDetails?.accidentType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsData = (STABLE_KEYS.accidentTypes || []).slice(0, 5).map(type => ({
    name: getLabel('accidentTypes', type),
    count: trafficIncidents.filter(i => i.trafficDetails?.accidentType === type).length
  }));

  const totalDeaths = trafficIncidents.reduce((sum, i) => sum + (i.trafficDetails?.numDeaths || 0), 0);
  const totalHeavy = trafficIncidents.reduce((sum, i) => sum + (i.trafficDetails?.numHeavyInjuries || 0), 0);
  const totalLight = trafficIncidents.reduce((sum, i) => sum + (i.trafficDetails?.numLightInjuries || 0), 0);

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setNewIncident({
      ...incident,
      type: 'Traffic',
      trafficDetails: {
        accidentType: STABLE_KEYS.accidentTypes?.[0] || 'Rollover',
        accidentImpact: STABLE_KEYS.damageTypes?.[0] || 'Fatal',
        numDeaths: 0,
        numHeavyInjuries: 0,
        numLightInjuries: 0,
        propertyDamageEstimate: '',
        driverExperience: 'Unknown',
        vehicleType: STABLE_KEYS.vehicleTypes?.[0] || 'Automobile',
        plateNumber: '',
        licenseGrade: 'None/Illegal',
        accidentCause: 'Other',
        reporterName: '',
        reporterAddress: '',
        reporterPhone: '',
        reporterOther: '',
        ...incident.trafficDetails
      }
    });
    setIsModalOpen(true);
  };

  const handleGPSDetect = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      setNewIncident({
        ...newIncident,
        lat: coordinates.coords.latitude,
        lng: coordinates.coords.longitude
      });
    } catch (err) {
      console.error('GPS error:', err);
      alert(lang === 'am' ? 'GPS መረጃ ማግኘት አልተቻለም' : 'Could not detect GPS location');
    }
  };

  const handleCapture = async () => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64
      });
      if (image.base64String) {
        setNewIncident({
          ...newIncident,
          photos: [...(newIncident.photos || []), `data:image/jpeg;base64,${image.base64String}`].slice(0, 3)
        });
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const exportPDF = (incident: Incident) => {
    const doc = new jsPDF();
    const amChar = lang === 'am';
    
    doc.setFontSize(20);
    doc.text(amChar ? 'Traffic Accident Report' : 'Traffic Accident Report', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Location: ${incident.location}`, 10, 30);
    doc.text(`Date: ${incident.date}`, 10, 40);
    doc.text(`Plate Number: ${incident.trafficDetails?.plateNumber || 'N/A'}`, 10, 50);
    doc.text(`Accident Type: ${getLabel('accidentTypes', incident.trafficDetails?.accidentType || '')}`, 10, 60);

    const tableData = [
      ['Impact Type', 'Quantity/Estimate'],
      ['Deaths', incident.trafficDetails?.numDeaths?.toString() || '0'],
      ['Heavy Injuries', incident.trafficDetails?.numHeavyInjuries?.toString() || '0'],
      ['Light Injuries', incident.trafficDetails?.numLightInjuries?.toString() || '0'],
      ['Property Damage', incident.trafficDetails?.propertyDamageEstimate || '0 ETB'],
    ];

    autoTable(doc, {
      startY: 70,
      head: [tableData[0]],
      body: tableData.slice(1),
    });

    doc.text(`Description:`, 10, (doc as any).lastAutoTable.finalY + 10);
    doc.setFontSize(10);
    doc.text(incident.description || 'No description provided.', 10, (doc as any).lastAutoTable.finalY + 20, { maxWidth: 180 });

    doc.save(`Traffic_Report_${incident.id}.pdf`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIncident(null);
    setCurrentStep(1);
    setNewIncident({
      title: '',
      status: 'Open',
      date: new Date().toISOString().split('T')[0],
      location: '',
      lat: undefined,
      lng: undefined,
      officerId: officers[0]?.id || '',
      filingStation: '',
      recordingOfficerName: officers[0]?.name || '',
      recordingOfficerRank: officers[0]?.rank || 'constable',
      type: 'Traffic',
      category: 'other',
      description: '',
      photos: [],
      trafficDetails: {
        accidentType: STABLE_KEYS.accidentTypes?.[0] || 'Rollover',
        accidentImpact: STABLE_KEYS.damageTypes?.[0] || 'Fatal',
        numDeaths: 0,
        numHeavyInjuries: 0,
        numLightInjuries: 0,
        propertyDamageEstimate: '',
        driverExperience: 'Unknown',
        vehicleType: STABLE_KEYS.vehicleTypes?.[0] || 'Automobile',
        plateNumber: '',
        licenseGrade: 'None/Illegal',
        accidentCause: 'Other',
        reporterName: '',
        reporterAddress: '',
        reporterPhone: '',
        reporterOther: ''
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const finalTitle = newIncident.title || ts.newReport || 'Traffic Accident';
      const finalIncident = { ...newIncident, title: finalTitle };

      if (editingIncident) {
        await onUpdate(editingIncident.id, finalIncident);
      } else {
        await onAdd(finalIncident);
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        handleCloseModal();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border shadow-sm">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">{ts.fields?.accidentType || 'Accident Type'}</label>
                <select 
                  className="w-full bg-brand-
