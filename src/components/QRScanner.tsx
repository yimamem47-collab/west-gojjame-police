import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface QRScannerProps {
  lang: Language;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function QRScanner({ lang, onClose, onScan }: QRScannerProps) {
  const t = translations[lang];
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    
    const startScanner = async () => {
      try {
        // Explicitly check for camera permission first to provide better feedback
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        // 'environment' ማለት የኋላ ካሜራ ማለት ነው
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config,
          (decodedText) => {
            onScan(decodedText);
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
            }
          },
          (errorMessage) => {
            // Silently handle scan errors (common during scanning)
          }
        );
      } catch (err) {
        console.error("ካሜራ ስህተት:", err);
        setPermissionDenied(true);
        setError(lang === 'am' ? 'ካሜራውን መክፈት አልተቻለም። እባክዎ የካሜራ ፈቃድ መኖሩን ያረጋግጡ!' : 'Failed to open camera. Please ensure camera permission is granted!');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on unmount", err));
      }
    };
  }, [onScan, lang]);

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md overflow-hidden relative"
      >
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="text-brand-accent" size={20} />
            <h2 className="text-xl font-bold">{t.qrScanner || 'QR Scanner'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-accent/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {permissionDenied ? (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 text-center">
              <AlertCircle className="text-rose-500 mx-auto mb-4" size={48} />
              <h3 className="text-lg font-bold mb-2">
                {lang === 'am' ? 'የካሜራ ፈቃድ አልተገኘም' : 'Camera Permission Required'}
              </h3>
              <p className="text-sm text-brand-text-secondary mb-6">
                {error}
              </p>
              <button 
                onClick={openInNewTab}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                {lang === 'am' ? 'በአዲስ ታብ ክፈት' : 'Open in New Tab'}
              </button>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="w-full rounded-xl overflow-hidden border border-brand-border bg-black/20"></div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-brand-text-secondary mb-4">
                  {t.scanning || 'Position the QR code within the frame to scan.'}
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw size={14} />
                    {t.stopScanning || 'Reset Scanner'}
                  </button>
                  <p className="text-[10px] text-brand-text-secondary italic">
                    {lang === 'am' ? 'ካሜራው ካልሰራ አፑን በአዲስ ታብ ይክፈቱት።' : 'If camera doesn\'t start, try opening in a new tab.'}
                  </p>
                  <button 
                    onClick={openInNewTab}
                    className="text-brand-accent text-xs font-bold flex items-center justify-center gap-1 hover:underline"
                  >
                    <ExternalLink size={12} />
                    {lang === 'am' ? 'በአዲስ ታብ ክፈት' : 'Open in New Tab'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
