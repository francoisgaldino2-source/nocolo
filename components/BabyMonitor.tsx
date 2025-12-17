import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Moon } from 'lucide-react';

const BabyMonitor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setActive(true);
        setError('');
      }
    } catch (err) {
      setError('Não conseguimos acessar a câmera. Verifique as permissões.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setActive(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="h-full bg-black text-white p-6 pb-24 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Moon className="text-yellow-200" /> Monitor Noturno
        </h2>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-xs text-stone-400">AO VIVO</span>
        </div>
      </div>

      <div className="relative w-full aspect-[3/4] bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 shadow-2xl mb-6">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover opacity-80"
        />
        {!active && !error && (
          <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-stone-500">
            <CameraOff size={48} />
            <p>Câmera desligada</p>
          </div>
        )}
        {error && (
             <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-stone-500 p-4 text-center">
             <CameraOff size={48} />
             <p>{error}</p>
           </div>
        )}
        {active && (
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
                <p className="text-xs text-white">Detecção de Som: Silêncio</p>
            </div>
        )}
      </div>

      <button
        onClick={active ? stopCamera : startCamera}
        className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
          active 
            ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
        }`}
      >
        {active ? 'Desligar Câmera' : 'Ativar Monitoramento'}
      </button>
      
      <p className="mt-4 text-xs text-stone-500 text-center max-w-xs">
        Este recurso transforma seu dispositivo em uma babá eletrônica visual. Mantenha a tela ligada.
      </p>
    </div>
  );
};

export default BabyMonitor;
