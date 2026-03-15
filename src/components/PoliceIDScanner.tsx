import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { Language } from '../lib/translations';
import { Officer } from '../types';

interface PoliceIDScannerProps {
  lang: Language;
  onClose: () => void;
  officers: Officer[];
}

export function PoliceIDScanner({ lang, onClose, officers }: PoliceIDScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [resultText, setResultText] = useState<string>('የQR ኮድ ይጠበቃል...');

  useEffect(() => {
    const startScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { fps: 15, qrbox: 250 },
          /* verbose= */ false
        );

        scannerRef.current.render(
          (text) => {
            setResultText("ውጤት: " + text);
            if (navigator.vibrate) navigator.vibrate(200);
            
            // Optional: Check against officers database if needed
            const foundOfficer = officers.find(o => 
              o.id === text || 
              o.badgeNumber === text || 
              text.includes(o.badgeNumber) ||
              text.includes(o.id)
            );

            if (foundOfficer) {
              alert(`የተገኘ መረጃ: ${text}\n\nስም: ${foundOfficer.name}\nማዕረግ: ${foundOfficer.rank}\nሁኔታ: ${foundOfficer.status}`);
            } else {
              alert("የተገኘ መረጃ: " + text);
            }

            if (scannerRef.current) {
              scannerRef.current.pause();
              setTimeout(() => {
                if (scannerRef.current) scannerRef.current.resume();
              }, 3000);
            }
          },
          (errorMessage) => {
            // Silently handle scan errors
          }
        );
      } catch (err) {
        console.error("Camera access error:", err);
        setResultText('ካሜራ አልተገኘም / Camera not found');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [officers]);

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
      
      <div id="reader" className="w-[90%] max-w-md mx-auto my-5 rounded-[10px] overflow-hidden bg-black/20"></div>
      
      <div id="result" className="p-5 text-[1.2em] text-[#ffcc00] font-medium break-all">
        {resultText}
      </div>
    </div>
  );
}
