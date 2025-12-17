import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Wind, CloudRain, Music, Heart } from 'lucide-react';

const Relaxation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [breathState, setBreathState] = useState<'in' | 'out'>('in');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sincroniza o texto com a animação CSS de 8 segundos (4s inspira, 4s expira)
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathState(prev => prev === 'in' ? 'out' : 'in');
    }, 4000); // Troca a cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  const stopSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing audio context:", e));
      }
      audioContextRef.current = null;
    }
    setIsPlaying(null);
  };

  // Simple White Noise Generator using Web Audio API
  const toggleWhiteNoise = () => {
    if (isPlaying === 'noise') {
      stopSound();
      return;
    }
    stopSound(); // stop others
    
    setIsPlaying('noise');
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    audioContextRef.current = ctx;
    
    // Create noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    // Filter to make it softer (Pink/Brown noise approximation)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = ctx.createGain();
    gain.gain.value = 0.05; // Low volume

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
    oscillatorRef.current = noise as any; // Store for stopping
    gainNodeRef.current = gain;
  };

  // Mock player for other sounds (visual only since no assets)
  const toggleMockSound = (id: string) => {
    if (isPlaying === id) {
      setIsPlaying(null);
      // If we were playing noise before, stopSound handles cleanup. 
      // If we were playing a mock sound, we just update state.
      if (id === 'noise') stopSound(); 
    } else {
      stopSound(); // stop white noise if playing
      setIsPlaying(id);
    }
  };

  useEffect(() => {
    return () => stopSound();
  }, []);

  return (
    <div className="pb-24 animate-fade-in p-6 bg-gradient-to-b from-sage-50 to-nude-50 min-h-screen">
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Relaxamento</h2>
      <p className="text-stone-500 mb-8">Sons para acalmar o bebê e a mamãe.</p>

      {/* Breathing Exercise */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-sm border border-white flex flex-col items-center justify-center relative overflow-hidden transition-all duration-1000">
        <h3 className="text-stone-700 font-bold mb-8 z-10 uppercase tracking-widest text-xs">Respiração Guiada</h3>
        
        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
          {/* Círculos animados sincronizados com o texto */}
          <div className="absolute w-full h-full bg-sage-200 rounded-full animate-breathe mix-blend-multiply opacity-50"></div>
          <div className="absolute w-3/4 h-3/4 bg-sage-300 rounded-full animate-breathe animation-delay-1000 mix-blend-multiply opacity-50" style={{animationDelay: '0.5s'}}></div>
          
          <div className="z-10 text-center transition-all duration-1000 ease-in-out">
            <span className={`block font-bold text-lg text-stone-700 transition-opacity duration-1000 ${breathState === 'in' ? 'opacity-100' : 'opacity-0 absolute'}`}>
              Inspire...
            </span>
            <span className={`block font-bold text-lg text-stone-700 transition-opacity duration-1000 ${breathState === 'out' ? 'opacity-100' : 'opacity-0 absolute'}`}>
              Expire...
            </span>
          </div>
        </div>
        
        <p className="text-stone-500 text-xs z-10 max-w-[200px] text-center leading-relaxed">
          Siga o ritmo do círculo. Isso ajuda a reduzir a ansiedade e acalmar o coração.
        </p>
      </div>

      <h3 className="text-lg font-bold text-stone-700 mb-4">Sons Calmantes</h3>
      <div className="grid grid-cols-2 gap-4">
        
        <button 
          onClick={toggleWhiteNoise}
          className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all ${isPlaying === 'noise' ? 'bg-stone-800 text-white shadow-lg' : 'bg-white text-stone-600 shadow-sm'}`}
        >
          <Wind size={32} />
          <span className="font-semibold text-sm">Ruído Branco</span>
          {isPlaying === 'noise' ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button 
          onClick={() => toggleMockSound('rain')}
          className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all ${isPlaying === 'rain' ? 'bg-blue-400 text-white shadow-lg' : 'bg-white text-stone-600 shadow-sm'}`}
        >
          <CloudRain size={32} />
          <span className="font-semibold text-sm">Chuva Leve</span>
           {isPlaying === 'rain' ? <div className="text-xs animate-pulse">Tocando...</div> : <Play size={20} />}
        </button>

        <button 
          onClick={() => toggleMockSound('uterus')}
          className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all ${isPlaying === 'uterus' ? 'bg-rose-400 text-white shadow-lg' : 'bg-white text-stone-600 shadow-sm'}`}
        >
          <Heart size={32} />
          <span className="font-semibold text-sm">Útero</span>
          {isPlaying === 'uterus' ? <div className="text-xs animate-pulse">Tocando...</div> : <Play size={20} />}
        </button>

        <button 
          onClick={() => toggleMockSound('lullaby')}
          className={`p-4 rounded-2xl flex flex-col items-center gap-3 transition-all ${isPlaying === 'lullaby' ? 'bg-purple-400 text-white shadow-lg' : 'bg-white text-stone-600 shadow-sm'}`}
        >
          <Music size={32} />
          <span className="font-semibold text-sm">Ninar</span>
          {isPlaying === 'lullaby' ? <div className="text-xs animate-pulse">Tocando...</div> : <Play size={20} />}
        </button>
      </div>
    </div>
  );
};

export default Relaxation;