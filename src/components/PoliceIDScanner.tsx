import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, RefreshCw, ExternalLink, AlertCircle, ShieldAlert, CheckCircle, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';
import { Officer } from '../types';

interface PoliceIDScannerProps {
  lang: Language;
  onClose: () => void;
  officers: Officer[];
}

export function PoliceIDScanner({ lang, onClose, officers }: PoliceIDScannerProps) {
  const t = translations[lang];
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scannedOfficer, setScannedOfficer] = useState<Officer | null>(null);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'found' | 'not_found'>('scanning');

  useEffect(() => {
    const startScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        scannerRef.current = new Html5QrcodeScanner(
          "id-scanner",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scannerRef.current.render(
          (decodedText) => {
            handleScan(decodedText);
            if (scannerRef.current) {
              scannerRef.current.pause();
            }
          },
          (errorMessage) => {
            // Silently handle scan errors
          }
        );
      } catch (err) {
        console.error("Camera access error:", err);
        setPermissionDenied(true);
        setError(lang === 'am' ? 'ካሜራውን ለመጠቀም አልተፈቀደም። እባክዎ በስልክዎ ሴቲንግ ውስጥ ይፍቀዱ ወይም አፑን በአዲስ ታብ ይክፈቱት።' : 'Camera permission denied. Please allow camera access in settings or open the app in a new tab.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [lang]);

  const handleScan = (decodedText: string) => {
    // Search for the officer in the database (officers array passed as prop)
    // The decoded text could be the officer's ID, badge number, or a JSON string.
    // We'll try to match it against ID or Badge Number.
    const foundOfficer = officers.find(o => 
      o.id === decodedText || 
      o.badgeNumber === decodedText || 
      decodedText.includes(o.badgeNumber) ||
      decodedText.includes(o.id)
    );

    if (foundOfficer) {
      setScannedOfficer(foundOfficer);
      setScanStatus('found');
    } else {
      setScanStatus('not_found');
    }
  };

  const resetScanner = () => {
    setScannedOfficer(null);
    setScanStatus('scanning');
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#1A237E]/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0D1540] border border-blue-500/30 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl"
      >
        <div className="p-6 border-b border-blue-500/20 flex items-center justify-between bg-[#1A237E]/50">
          <div className="flex items-center gap-2 text-white">
            <Search className="text-blue-400" size={20} />
            <h2 className="text-xl font-bold">{lang === 'am' ? 'የፖሊስ መታወቂያ ስካነር' : 'Police ID Scanner'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 text-white">
          {permissionDenied ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center">
              <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-bold mb-2">
                {lang === 'am' ? 'የካሜራ ፈቃድ አልተገኘም' : 'Camera Permission Required'}
              </h3>
              <p className="text-sm text-blue-200 mb-6">
                {error}
              </p>
              <button 
                onClick={openInNewTab}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                {lang === 'am' ? 'በአዲስ ታብ ክፈት' : 'Open in New Tab'}
              </button>
            </div>
          ) : (
            <>
              {scanStatus === 'scanning' && (
                <>
                  <div id="id-scanner" className="w-full rounded-xl overflow-hidden border-2 border-blue-500/50 bg-black/40"></div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-blue-200 mb-4">
                      {lang === 'am' ? 'የፖሊስ መታወቂያውን ባርኮድ ወይም ኪውአር ኮድ እዚህ ያሳዩ።' : 'Position the Police ID Barcode/QR code within the frame.'}
                    </p>
                  </div>
                </>
              )}

              {scanStatus === 'found' && scannedOfficer && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  {scannedOfficer.status === 'Lost' ? (
                    <div className="bg-rose-500/20 border-2 border-rose-500 rounded-xl p-6 mb-6">
                      <ShieldAlert className="text-rose-500 mx-auto mb-4" size={64} />
                      <h3 className="text-2xl font-black text-rose-500 uppercase tracking-widest mb-2">
                        {lang === 'am' ? 'የጠፋ መታወቂያ' : 'Lost ID Alert'}
                      </h3>
                      <p className="text-rose-200 font-medium">
                        {lang === 'am' ? 'ይህ መታወቂያ እንደጠፋ ሪፖርት ተደርጓል!' : 'This ID has been reported as LOST!'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/20 border-2 border-emerald-500 rounded-xl p-6 mb-6">
                      <CheckCircle className="text-emerald-400 mx-auto mb-4" size={64} />
                      <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-widest mb-2">
                        {lang === 'am' ? 'ትክክለኛ መታወቂያ' : 'Valid ID'}
                      </h3>
                    </div>
                  )}

                  <div className="bg-[#1A237E]/50 border border-blue-500/30 rounded-xl p-6 text-left space-y-4">
                    <div>
                      <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">{lang === 'am' ? 'ሙሉ ስም' : 'Officer Name'}</p>
                      <p className="text-xl font-bold">{scannedOfficer.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">{lang === 'am' ? 'ማዕረግ' : 'Rank'}</p>
                        <p className="font-medium">{(t.ranks as any)[scannedOfficer.rank] || scannedOfficer.rank}</p>
                      </div>
                      <div>
                        <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">{lang === 'am' ? 'የመለያ ቁጥር' : 'Badge Number'}</p>
                        <p className="font-mono font-medium">{scannedOfficer.badgeNumber}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">{lang === 'am' ? 'ሁኔታ' : 'Status'}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        scannedOfficer.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        scannedOfficer.status === 'Lost' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {scannedOfficer.status}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={resetScanner}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    {lang === 'am' ? 'እንደገና ስካን አድርግ' : 'Scan Another ID'}
                  </button>
                </motion.div>
              )}

              {scanStatus === 'not_found' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <AlertCircle className="text-amber-500 mx-auto mb-4" size={64} />
                  <h3 className="text-xl font-bold text-amber-500 mb-2">
                    {lang === 'am' ? 'መታወቂያው አልተገኘም' : 'ID Not Found'}
                  </h3>
                  <p className="text-blue-200 mb-8">
                    {lang === 'am' ? 'ይህ መታወቂያ በመረጃ ቋት ውስጥ የለም።' : 'This ID could not be found in the database.'}
                  </p>
                  <button 
                    onClick={resetScanner}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    {lang === 'am' ? 'እንደገና ሞክር' : 'Try Again'}
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
        
        <div className="p-4 bg-[#0A0F2C] text-center border-t border-blue-500/20">
          <p className="text-blue-400/60 text-xs italic font-medium">
            Developed by: Chief Sergeant Mengesha Yimam Abera
          </p>
        </div>
      </motion.div>
    </div>
  );
}
