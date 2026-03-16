import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';
import { Language } from '../lib/translations';
import { Officer } from '../types';

interface PoliceIDScannerProps {
  lang: Language;
  onClose: () => void;
  officers: Officer[];
}

export function PoliceIDScanner({ lang, onClose, officers }: PoliceIDScannerProps) {
  const [resultText, setResultText] = useState<string>('የQR ኮድ ይጠበቃል...');
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        
        await html5QrCode.start(
          { facingMode: "environment" }, // Force back camera on mobile
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          (decodedText) => {
            if (!isScanning) return;
            
            setResultText("ውጤት: " + decodedText);
            if (navigator.vibrate) navigator.vibrate(200);
            
            const foundOfficer = officers.find(o => 
              o.id === decodedText || 
              o.badgeNumber === decodedText || 
              decodedText.includes(o.badgeNumber) ||
              decodedText.includes(o.id)
            );

            if (foundOfficer) {
              alert(`የተገኘ መረጃ: ${decodedText}\n\nስም: ${foundOfficer.name}\nማዕረግ: ${foundOfficer.rank}\nሁኔታ: ${foundOfficer.status}`);
            } else {
              alert("የተገኘ መረጃ: " + decodedText);
            }

            // Pause scanning temporarily
            setIsScanning(false);
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.pause();
              setTimeout(() => {
                if (html5QrCode && html5QrCode.isScanning) {
                  html5QrCode.resume();
                  setIsScanning(true);
                  setResultText('የQR ኮድ ይጠበቃል...');
                }
              }, 3000);
            }
          },
          (errorMessage) => {
            // Silently handle scan errors
          }
        );
      } catch (err) {
        console.error("Camera access error:", err);
        setResultText('ካሜራ አልተገኘም / Camera not found. እባክዎ የካሜራ ፍቃድ ይስጡ።');
      }
    };

    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [officers, isScanning]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#001f3f] text-white text-center font-sans overflow-y-auto">
      <div className="bg-[#002d62] p-5 border-b-[3px] border-[#ffcc00] relative">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={24} color="white" />
        </button>
        <h2 className="text-2xl font-bold m-0 mb-2">ምዕራብ ጎጃም ፖሊስ</h2>
        <p className="m-0 text-lg">የመታወቂያ ስካነር</p>
      </div>
      
      <div className="w-[90%] max-w-md mx-auto my-5">
        <div id="reader" className="w-full rounded-[10px] overflow-hidden bg-black/20 border-2 border-[#ffcc00]/30"></div>
      </div>
      
      <div id="result" className="p-5 text-[1.2em] text-[#ffcc00] font-medium break-all">
        {resultText}
      </div>
    </div>
  );
}
