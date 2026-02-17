
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Zap, Loader2 } from 'lucide-react';

interface ScannerModalProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setLoading(false);
        }
      } catch (err) {
        setError("تعذر الوصول للكاميرا. يرجى التأكد من منح الصلاحيات.");
        setLoading(false);
      }
    };

    startCamera();

    // محاكاة المسح (لأغراض العرض التعليمي في المتصفح)
    // في بيئة حقيقية سنستخدم مكتبة مثل quagga2 أو zxing-js
    const timer = setTimeout(() => {
       // مثال: إذا وجدنا باركود في الصورة
    }, 3000);

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      clearTimeout(timer);
    };
  }, []);

  const handleManualEntry = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onScan((e.target as HTMLInputElement).value);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl border-4 border-white animate-in zoom-in duration-300">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Camera size={20} />
             </div>
             <h3 className="font-black">ماسح الباركود الذكي</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all"><X /></button>
        </div>

        <div className="relative aspect-square bg-black overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <p className="font-bold">جاري تشغيل الكاميرا...</p>
            </div>
          )}
          
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-10 text-center gap-4">
              <Zap size={48} />
              <p className="font-black">{error}</p>
              <button onClick={onClose} className="mt-4 px-8 py-2 bg-slate-900 text-white rounded-xl">إغلاق</button>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover grayscale contrast-125"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-64 h-40 border-2 border-blue-500 rounded-3xl relative shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -translate-x-1 -translate-y-1 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 translate-x-1 -translate-y-1 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -translate-x-1 translate-y-1 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 translate-x-1 translate-y-1 rounded-br-xl"></div>
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></div>
                 </div>
              </div>
            </>
          )}
        </div>

        <div className="p-8 space-y-4">
           <p className="text-center text-xs font-bold text-slate-400">وجه الكاميرا نحو باركود الصنف ليتم التعرف عليه تلقائياً</p>
           <div className="relative group">
              <input 
                type="text" 
                placeholder="أو أدخل الباركود يدوياً هنا..." 
                onKeyDown={handleManualEntry}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-center outline-none focus:border-blue-500 transition-all"
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerModal;
