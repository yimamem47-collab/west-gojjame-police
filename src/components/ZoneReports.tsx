import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  FileText, 
  MapPin, 
  User, 
  Calendar, 
  Image as ImageIcon, 
  File as FileIcon, 
  Send,
  X,
  Search,
  Filter,
  FileSpreadsheet,
  FileCode,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ZoneReport, Officer } from '../types';
import { translations } from '../lib/translations';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ZoneReportsProps {
  reports: ZoneReport[];
  officers: Officer[];
  onAddReport: (report: Omit<ZoneReport, 'id' | 'timestamp'>) => Promise<void>;
  language: 'en' | 'am';
  currentUser: any;
}

export default function ZoneReports({ reports, officers, onAddReport, language, currentUser }: ZoneReportsProps) {
  const t = translations[language];
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWereda, setFilterWereda] = useState('all');
  const [filterType, setFilterType] = useState('all');
  
  const [newReport, setNewReport] = useState({
    officer_name: '',
    officer_id: currentUser?.id || '',
    deputy_dept: '',
    main_dept: '',
    wereda: '',
    report_type: 'Monthly' as const,
    photo_url: '',
    document_url: '',
  });

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setNewReport(prev => ({
        ...prev,
        officer_name: currentUser.name,
        officer_id: currentUser.id
      }));
    }
  }, [currentUser]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newReport.officer_name?.trim() || newReport.officer_name.length < 3) {
      alert(language === 'am' ? 'እባክዎ ትክክለኛ የመኮንን ስም ያስገቡ (ቢያንስ 3 ፊደላት)' : 'Please enter a valid officer name (min 3 characters)');
      return;
    }
    if (!newReport.deputy_dept) {
      alert(language === 'am' ? 'እባክዎ ምክትል መምሪያ ይምረጡ' : 'Please select a deputy department');
      return;
    }
    if (!newReport.main_dept) {
      alert(language === 'am' ? 'እባክዎ ዋና ክፍል ይምረጡ' : 'Please select a main department');
      return;
    }
    if (!newReport.wereda) {
      alert(language === 'am' ? 'እባክዎ ወረዳ/ጣቢያ ይምረጡ' : 'Please select a wereda/station');
      return;
    }
    if (!newReport.report_type) {
      alert(language === 'am' ? 'እባክዎ የሪፖርት አይነት ይምረጡ' : 'Please select a report type');
      return;
    }

    setIsUploading(true);
    try {
      let photo_url = '';
      let document_url = '';

      if (selectedPhoto) {
        const photoRef = ref(storage, `documents_and_photos/${Date.now()}_${selectedPhoto.name}`);
        const snapshot = await uploadBytes(photoRef, selectedPhoto);
        photo_url = await getDownloadURL(snapshot.ref);
      }

      if (selectedDoc) {
        const docRef = ref(storage, `documents_and_photos/${Date.now()}_${selectedDoc.name}`);
        const snapshot = await uploadBytes(docRef, selectedDoc);
        document_url = await getDownloadURL(snapshot.ref);
      }

      await onAddReport({
        ...newReport,
        photo_url,
        document_url,
      } as any);
      
      setIsAdding(false);
      setNewReport({
        officer_name: currentUser?.name || '',
        officer_id: currentUser?.id || '',
        deputy_dept: '',
        main_dept: '',
        wereda: '',
        report_type: 'Monthly',
        photo_url: '',
        document_url: '',
      });
      setSelectedPhoto(null);
      setSelectedDoc(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert(language === 'am' ? 'ሪፖርቱን መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to send report. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.officer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.wereda.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWereda = filterWereda === 'all' || report.wereda === filterWereda;
    const matchesType = filterType === 'all' || report.report_type === filterType;
    return matchesSearch && matchesWereda && matchesType;
  });

  const deputyOptions = Object.keys(t.zoneReports.deputyDepts);
  const mainDeptOptions = Object.keys(t.zoneReports.mainDepts);
  const weredaOptions = Object.keys(t.zoneReports.detailedWeredas);
  const reportTypes = ['Monthly', 'Quarterly', '6-Month', '9-Month', 'Annual'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          {t.zoneReports.title}
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t.zoneReports.newReport}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterWereda}
            onChange={(e) => setFilterWereda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="all">All Weredas</option>
            {weredaOptions.map(w => (
              <option key={w} value={w}>{t.zoneReports.detailedWeredas[w as keyof typeof t.zoneReports.detailedWeredas]}</option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="all">All Types</option>
            {reportTypes.map(type => (
              <option key={type} value={type}>{(t.zoneReports as any)[type]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.officer_name}</h3>
                      <p className="text-xs text-gray-500 font-medium uppercase text-blue-600">
                        {t.zoneReports.deputyDepts[report.deputy_dept as keyof typeof t.zoneReports.deputyDepts]} / {t.zoneReports.mainDepts[report.main_dept as keyof typeof t.zoneReports.mainDepts]}
                      </p>
                      <p className="text-sm text-gray-500">{t.zoneReports.detailedWeredas[report.wereda as keyof typeof t.zoneReports.detailedWeredas]}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded uppercase">
                    {(t.zoneReports as any)[report.report_type]}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(report.timestamp).toLocaleString()}
                </div>

                <div className="flex gap-2 pt-2">
                  {report.photo_url && (
                    <a
                      href={report.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Photo
                    </a>
                  )}
                  {report.document_url && (
                    <a
                      href={report.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                    >
                      <FileIcon className="w-4 h-4" />
                      Document
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-8"
          >
            <div className="p-6 bg-[#1A237E] relative">
              <button onClick={() => setIsAdding(false)} className="absolute right-6 top-6 p-1 hover:bg-white/20 rounded-full transition-colors text-white">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-bold text-white leading-tight">
                  {language === 'am' ? 'የምዕራብ ጎጃም ዞን ፖሊስ መምሪያ' : 'West Gojjam Zone Police Department'}
                </h3>
                <p className="text-lg text-[#FFD700] font-medium">
                  {language === 'am' ? 'አዲስ ዝርዝር ሪፖርት' : 'New Detailed Report'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
                  <label className="block text-white text-sm mb-[5px] font-medium">{t.zoneReports.officerName}</label>
                  <input
                    type="text"
                    required
                    placeholder={(t.zoneReports as any).officerNameHint}
                    value={newReport.officer_name}
                    onChange={(e) => setNewReport({ ...newReport, officer_name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
                  <label className="block text-white text-sm mb-[5px] font-medium">{t.zoneReports.deputyDept}</label>
                  <select
                    required
                    value={newReport.deputy_dept}
                    onChange={(e) => setNewReport({ ...newReport, deputy_dept: e.target.value })}
                    className="input-field appearance-none"
                  >
                    <option value="">{language === 'am' ? 'ምክትል መምሪያ ይምረጡ' : 'Select Deputy Department'}</option>
                    {deputyOptions.map(d => (
                      <option key={d} value={d}>{(t.zoneReports.deputyDepts as any)[d]}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
                  <label className="block text-white text-sm mb-[5px] font-medium">{t.zoneReports.mainDept}</label>
                  <select
                    required
                    value={newReport.main_dept}
                    onChange={(e) => setNewReport({ ...newReport, main_dept: e.target.value })}
                    className="input-field appearance-none"
                  >
                    <option value="">{language === 'am' ? 'ዋና ክፍል ይምረጡ' : 'Select Main Department'}</option>
                    {mainDeptOptions.map(m => (
                      <option key={m} value={m}>{(t.zoneReports.mainDepts as any)[m]}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
                  <label className="block text-white text-sm mb-[5px] font-medium">{t.zoneReports.wereda}</label>
                  <select
                    required
                    value={newReport.wereda}
                    onChange={(e) => setNewReport({ ...newReport, wereda: e.target.value })}
                    className="input-field appearance-none"
                  >
                    <option value="">{language === 'am' ? 'ወረዳ/ጣቢያ ይምረጡ' : 'Select Wereda/Station'}</option>
                    {weredaOptions.map(w => (
                      <option key={w} value={w}>{(t.zoneReports.detailedWeredas as any)[w]}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
                  <label className="block text-white text-sm mb-[5px] font-medium">{t.zoneReports.reportType}</label>
                  <select
                    required
                    value={newReport.report_type}
                    onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value as any })}
                    className="input-field appearance-none"
                  >
                    {reportTypes.map(type => (
                      <option key={type} value={type}>{(t.zoneReports as any)[type]}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-sm">
                  <label className="block text-white text-sm mb-[5px] font-medium">{(t.zoneReports as any).attachLabel}</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file?.type.startsWith('image/')) {
                        setSelectedPhoto(file);
                        setSelectedDoc(null);
                      } else {
                        setSelectedDoc(file);
                        setSelectedPhoto(null);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full h-[50px] bg-white/10 text-white rounded-lg cursor-pointer hover:bg-white/20 transition-colors font-bold border border-white/20 mb-[10px]"
                  >
                    {t.zoneReports.attachFile}
                  </label>
                  <div className="flex flex-col items-center justify-center w-full">
                    {selectedPhoto || selectedDoc ? (
                      <div className="flex items-center gap-2 text-[#FFD700]">
                        {selectedPhoto ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : selectedDoc?.name.endsWith('.pdf') ? (
                          <FileIcon className="w-4 h-4" />
                        ) : selectedDoc?.name.match(/\.(doc|docx)$/) ? (
                          <FileText className="w-4 h-4" />
                        ) : selectedDoc?.name.match(/\.(xls|xlsx)$/) ? (
                          <FileSpreadsheet className="w-4 h-4" />
                        ) : (
                          <FileCode className="w-4 h-4" />
                        )}
                        <span className="text-[12px] font-medium truncate max-w-[200px]">
                          {selectedPhoto?.name || selectedDoc?.name} ({formatFileSize((selectedPhoto || selectedDoc)?.size || 0)})
                        </span>
                      </div>
                    ) : (
                      <p className="text-[12px] text-[#FFD700] text-center">
                        {t.zoneReports.noFile}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full h-[60px] bg-[#FFD700] text-[#1A237E] text-lg font-bold rounded-sm hover:bg-[#FFC107] transition-colors mt-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#1A237E]/30 border-t-[#1A237E] rounded-full animate-spin" />
                      {language === 'am' ? 'በመላክ ላይ...' : 'Sending...'}
                    </>
                  ) : (
                    t.zoneReports.sendReport
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
