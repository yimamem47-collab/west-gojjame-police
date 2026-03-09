import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Language, translations } from '../lib/translations';

interface QRScannerProps {
  lang: Language;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function QRScanner({ lang, onClose, onScan }: QRScannerProps) {
  const t = translations[lang];
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
      (errorMessage) => {
        // Silently handle scan errors (common during scanning)
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [onScan]);

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
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden border border-brand-border bg-black/20"></div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-text-secondary mb-4">
              {t.scanning || 'Position the QR code within the frame to scan.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} />
              {t.stopScanning || 'Reset Scanner'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
