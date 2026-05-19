import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
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
  const [loading, setLoading] = useState(true);
  const [isNative, setIsNative] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let mounted = true;
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    const startScanner = async () => {
      if (native) {
        try {
          // 1. Check and request native permission
          const status = await BarcodeScanner.checkPermissions();
          if (status.camera !== 'granted') {
            const requestStatus = await BarcodeScanner.requestPermissions();
            if (requestStatus.camera !== 'granted') {
              throw new Error('Native camera permission denied');
            }
          }

          if (!mounted) return;
          setLoading(false);

          // 2. Prepare UI for Native (Make webview transparent)
          // Hide elements or add class to body if using native background scanning
          // Note: ML Kit scan() opens a temporary native interface over the webview on some setups, 
          // but if it uses the webview layer, background transparency is required.
          
          const { barcodes } = await BarcodeScanner.scan();
          
          if (mounted && barcodes.length > 0 && barcodes[0].displayValue) {
            onScan(barcodes[0].displayValue);
            onClose(); 
          }
        } catch (err: any) {
          console.error("Native Scanner Error:", err);
          if (err.message?.includes('cancelled')) {
            onClose();
          } else {
            // Fallback safely to web view if native fails unexpectedly
            startWebScanner();
          }
        }
        return;
      }

      startWebScanner();
    };

    const startWebScanner = async () => {
      try {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          throw new Error('Camera requires HTTPS');
        }

        // Standard Web API check
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Stop track immediately just to free the hardware before html5-qrcode claims it
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.warn("Direct permission check rejected, trying scanner wrapper...", e);
        }

        if (!mounted) return;

        // Clean up existing scanner instance before making a new one
        if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
              await scannerRef.current.stop();
            }
          } catch (e) {
            console.error("Cleanup error", e);
          }
        }

        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            onScan(decodedText);
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().then(() => onClose()).catch(() => onClose());
            } else {
              onClose();
            }
          },
          () => {} // Framework verbose logs can be safely ignored
        );

        if (mounted) setLoading(false);

      } catch (err: any) {
        console.error("Web Camera Error:", err);
        if (mounted) {
          setPermissionDenied(true);
          setLoading(false);
          setError(
            lang === 'am'
              ? 'ካሜራ አልተፈቀደም ወይም ማገናኛዎ ደህንነቱ የተጠበቀ (HTTPS) አይደለም!'
              : 'Camera blocked or secure connection (HTTPS) required!'
          );
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch((e) => console.log("Stop clean failed", e));
        }
      }
    };
  }, [lang, onClose, onScan]);

  const resetScanner = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().then(() => window.location.reload()).catch(() => window.location.reload());
    } else {
      window.location.reload();
    }
  };

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  // If native scanner is running, we might want to hide the background overlay entirely 
  // so the native camera stream shining from underneath the webview remains visible.
  if (isNative && !loading && !permissionDenied) {
    return (
      <div className="fixed inset-4 z-[150] flex flex-col justify-between pointer-events-none">
        <div className="flex justify-end pointer-events-auto">
          <button onClick={onClose} className="p-3 bg-black/60 text-white rounded-full mt-4 mr-4">
            <X size={24} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md overflow-hidden bg-neutral-900 text-white border border-neutral-800 rounded-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="text-emerald-400" size={20} />
            <h2 className="text-xl font-bold">{t.qrScanner || 'QR Scanner'}</h2>
          </div>
          <button onClick={onClose} className="hover:text-neutral-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* ❌ Permission Error */}
          {permissionDenied ? (
            <div className="text-center">
              <AlertCircle className="text-rose-500 mx-auto mb-4" size={40} />
              <p className="mb-4 text-sm text-neutral-300">{error}</p>
              {!isNative && (
                <button onClick={openInNewTab} className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium transition-colors">
                  <ExternalLink size={16} />
                  {lang === 'am' ? 'በአዲስ ታብ ክፈት' : 'Open in New Tab'}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ✅ Loading */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                  <p className="text-sm text-neutral-400">
                    {lang === 'am' ? 'ካሜራ በመክፈት ላይ...' : 'Starting camera...'}
                  </p>
                </div>
              )}

              {/* ✅ Scanner container (only rendered/used when not native or during loading setup) */}
              <div id="qr-reader" className="rounded-xl overflow-hidden bg-black max-h-[300px]"></div>

              {/* Controls */}
              {!loading && (
                <div className="mt-6 text-center space-y-3">
                  <button onClick={resetScanner} className="inline-flex items-center gap-2 text-sm py-2 px-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors">
                    <RefreshCw size={14} />
                    {lang === 'am' ? 'እንደገና ጀምር' : 'Reset'}
                  </button>

                  {!isNative && (
                    <div>
                      <button 
                        onClick={openInNewTab}
                        className="text-xs text-emerald-400 underline decoration-emerald-400/40 hover:text-emerald-300"
                      >
                        {lang === 'am' ? 'በአዲስ ታብ ክፈት' : 'Open in new tab'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
