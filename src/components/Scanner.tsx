import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Language, translations } from '../lib/translations';
import { motion } from 'motion/react';

interface ScannerProps {
  lang: Language;
  onClose: () => void;
}

const TELEGRAM_BOT_TOKEN = "7611590740:AAEx9u-P07Y3o4mG5_E_nK4T-q8Pz5mE8Yk";
const TELEGRAM_CHAT_ID = "1452664718";

export function Scanner({ lang, onClose }: ScannerProps) {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const t = translations[lang];

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        setStatus('scanning');
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            // Stop scanner on success
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                setScannedData(decodedText);
                sendToTelegram(decodedText);
              }).catch(err => console.error("Failed to stop scanner", err));
            }
          },
          (errorMessage) => {
            // Ignore normal scanning errors
          }
        );
      } catch (err) {
        console.error("Scanner error:", err);
        setStatus('error');
        setErrorMessage(lang === 'am' ? 'ካሜራ አልተገኘም! እባክዎ ለብራውዘርዎ የካሜራ ፍቃድ ይስጡ።' : 'Camera not found! Please grant camera permissions.');
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Failed to stop scanner on unmount", err));
      }
    };
  }, [lang]);

  const sendToTelegram = async (text: string) => {
    setStatus('sending');
    
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }

    const message = `🚨 አዲስ የስካን መረጃ 🚨\n\n📌 መረጃ: ${text}\n👤 መርማሪ: ዋና ሳጅን መንገሻ ይማም አበራ`;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(lang === 'am' ? 'ወደ ቴሌግራም መላክ አልተቻለም ❌' : 'Failed to send to Telegram ❌');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(lang === 'am' ? 'የኢንተርኔት ግንኙነት ችግር አጋጥሟል ❌' : 'Internet connection error ❌');
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setStatus('idle');
    setErrorMessage('');
    // The useEffect will not re-run, so we need to reload the component or manage state better.
    // For simplicity, we can just close and let the user reopen, or we can force a re-render.
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="bg-brand-primary text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera size={20} />
            <h2 className="font-bold text-lg">{lang === 'am' ? 'ባርኮድ ስካነር' : 'Barcode Scanner'}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center flex-grow">
          {status === 'scanning' && (
            <div className="w-full mb-4">
              <div id="reader" className="w-full rounded-xl overflow-hidden border-2 border-brand-primary bg-black"></div>
              <p className="text-center text-sm text-gray-500 mt-4">
                {lang === 'am' ? 'ባርኮዱን ወይም QR ኮዱን ወደ ካሜራው ያቅርቡ' : 'Point the camera at the barcode or QR code'}
              </p>
            </div>
          )}

          {status === 'sending' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mb-4"></div>
              <p className="text-lg font-medium text-brand-primary">
                {lang === 'am' ? 'ወደ ቴሌግራም በመላክ ላይ... ⏳' : 'Sending to Telegram... ⏳'}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                {lang === 'am' ? 'በተሳካ ሁኔታ ተልኳል! ✅' : 'Sent Successfully! ✅'}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg w-full mt-4 border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{lang === 'am' ? 'የተገኘ መረጃ፡' : 'Scanned Data:'}</p>
                <p className="font-mono font-medium break-all">{scannedData}</p>
              </div>
              <button onClick={resetScanner} className="mt-6 btn-primary w-full">
                {lang === 'am' ? 'ዝጋ' : 'Close'}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-600 mb-2">
                {lang === 'am' ? 'ስህተት አጋጥሟል' : 'Error Occurred'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{errorMessage}</p>
              <button onClick={resetScanner} className="btn-secondary w-full">
                {lang === 'am' ? 'እንደገና ሞክር' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
