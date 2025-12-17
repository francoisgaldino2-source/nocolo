import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, Shirt, RefreshCw, X, AlertCircle, Lock } from 'lucide-react';
import { generateBabyFitting } from '../services/geminiService';

const MAX_DAILY_FITTINGS = 50; // Aumentado de 4 para 50 para evitar frustração
const STORAGE_KEY = 'ninho_fitting_daily_stats';

const VirtualFittingRoom: React.FC = () => {
  const [babyImage, setBabyImage] = useState<string | null>(null);
  const [clothImage, setClothImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Limite Diário
  const [dailyCount, setDailyCount] = useState(0);

  const babyInputRef = useRef<HTMLInputElement>(null);
  const clothInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Carregar/Resetar contagem diária
  useEffect(() => {
      const today = new Date().toLocaleDateString();
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored) {
          const data = JSON.parse(stored);
          if (data.date === today) {
              setDailyCount(data.count);
          } else {
              // Novo dia, reseta
              setDailyCount(0);
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
          }
      } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
      }
  }, []);

  // Scroll automático para o resultado
  useEffect(() => {
      if (resultImage && resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
  }, [resultImage]);

  const incrementDailyCount = () => {
      const newCount = dailyCount + 1;
      setDailyCount(newCount);
      const today = new Date().toLocaleDateString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'baby' | 'cloth') => {
    const file = e.target.files?.[0];
    if (file) {
      // Limpar erro anterior
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            if (type === 'baby') setBabyImage(reader.result);
            else setClothImage(reader.result);
            
            // Limpar resultado anterior se mudar os inputs
            setResultImage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (dailyCount >= MAX_DAILY_FITTINGS) {
        setError("Você atingiu o limite de provas por hoje. Volte amanhã para mais looks! 🌿");
        return;
    }

    if (!babyImage || !clothImage) return;

    setIsGenerating(true);
    setResultImage(null);
    setError(null);

    try {
        // Simular um tempo mínimo de processamento para UX
        const startTime = Date.now();
        
        const generatedImage = await generateBabyFitting(babyImage, clothImage);
        
        const elapsedTime = Date.now() - startTime;
        const minTime = 2000; // 2 segundos mínimo
        
        if (elapsedTime < minTime) {
            await new Promise(resolve => setTimeout(resolve, minTime - elapsedTime));
        }

        setResultImage(generatedImage);
        incrementDailyCount();

    } catch (err: any) {
        // Exibe a mensagem exata do erro (seja API Key, Segurança ou outro)
        setError(err.message || "Ocorreu um erro inesperado. Tente novamente.");
    } finally {
        setIsGenerating(false);
    }
  };

  const reset = () => {
      setBabyImage(null);
      setClothImage(null);
      setResultImage(null);
      setError(null);
  };

  const limitReached = dailyCount >= MAX_DAILY_FITTINGS;

  return (
    <div className="pb-24 animate-fade-in p-6 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-stone-800">Provador Mágico</h2>
           <p className="text-stone-500 text-sm">A IA veste seu bebê</p>
        </div>
        <div className="flex flex-col items-end">
            <div className="bg-purple-100 p-3 rounded-full text-purple-500 mb-1">
                <Sparkles size={24} />
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${limitReached ? 'bg-rose-100 text-rose-500' : 'bg-stone-100 text-stone-500'}`}>
                {dailyCount}/{MAX_DAILY_FITTINGS} hoje
            </span>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Inputs Area */}
        <div className="flex gap-4">
            {/* Baby Input */}
            <div 
                onClick={() => !isGenerating && babyInputRef.current?.click()}
                className={`flex-1 aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative shadow-sm ${babyImage ? 'border-sage-400 bg-white' : 'border-stone-300 hover:bg-stone-100 bg-stone-50'}`}
            >
                {babyImage ? (
                    <img src={babyImage} alt="Bebê" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <div className="bg-stone-200 p-3 rounded-full text-stone-500 mb-2">
                            <Camera size={24} />
                        </div>
                        <span className="text-xs font-bold text-stone-400 text-center px-2">Foto do Bebê</span>
                    </>
                )}
                <input ref={babyInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'baby')} disabled={isGenerating} />
            </div>

            {/* Cloth Input */}
            <div 
                onClick={() => !isGenerating && clothInputRef.current?.click()}
                className={`flex-1 aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative shadow-sm ${clothImage ? 'border-rose-400 bg-white' : 'border-stone-300 hover:bg-stone-100 bg-stone-50'}`}
            >
                {clothImage ? (
                    <img src={clothImage} alt="Roupa" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <div className="bg-stone-200 p-3 rounded-full text-stone-500 mb-2">
                            <Shirt size={24} />
                        </div>
                        <span className="text-xs font-bold text-stone-400 text-center px-2">Foto da Roupa</span>
                    </>
                )}
                <input ref={clothInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'cloth')} disabled={isGenerating} />
            </div>
        </div>
        
        {/* Error Feedback */}
        {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl text-sm flex gap-2 items-start animate-fade-in">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
            </div>
        )}

        {/* Action Button */}
        {(!resultImage && !isGenerating) && (
            <button
                disabled={!babyImage || !clothImage || limitReached}
                onClick={handleGenerate}
                className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-transform flex items-center justify-center gap-2
                    ${limitReached 
                        ? 'bg-stone-400 cursor-not-allowed opacity-80' 
                        : 'bg-gradient-to-r from-purple-500 to-rose-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
            >
                {limitReached ? (
                    <><Lock size={20} /> Limite Diário Atingido</>
                ) : (
                    <><Sparkles size={20} /> Provador Mágico</>
                )}
            </button>
        )}

        {/* Loading State */}
        {isGenerating && (
             <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center text-center animate-pulse">
                <div className="relative mb-4">
                    <Shirt className="text-stone-200" size={64} />
                    <Sparkles className="text-purple-500 absolute -top-2 -right-2 animate-spin" size={32} />
                </div>
                <h3 className="text-stone-700 font-bold mb-1">Costurando magia...</h3>
                <p className="text-xs text-stone-400">A IA está vestindo seu bebê virtualmente.</p>
             </div>
        )}

        {/* Result */}
        {resultImage && (
            <div className="animate-fade-in" ref={resultRef}>
                <div className="relative bg-white p-2 rounded-3xl shadow-lg border border-purple-100 mb-4">
                    <img src={resultImage} alt="Resultado" className="w-full rounded-2xl" />
                    <div className="absolute top-4 right-4 bg-purple-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Sparkles size={10} /> IA
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={reset} className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                        <RefreshCw size={16} /> Tentar Outra
                    </button>
                    <a href={resultImage} download="meu-bebe-ninho.png" className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-purple-200 shadow-lg">
                        Salvar Foto
                    </a>
                </div>
            </div>
        )}

        {/* Tips */}
        {!resultImage && !isGenerating && !limitReached && (
             <div className="bg-nude-100 rounded-2xl p-4 flex gap-3 items-start">
                <div className="text-xl">💡</div>
                <p className="text-xs text-stone-600 leading-relaxed mt-1">
                    Para um melhor resultado, use uma foto do bebê de corpo inteiro e uma foto da roupa bem iluminada em um fundo liso.
                </p>
             </div>
        )}

        {limitReached && !resultImage && (
             <div className="bg-stone-100 rounded-2xl p-4 flex flex-col items-center text-center">
                <p className="text-xs text-stone-500 leading-relaxed mb-2">
                    Para garantir que todas as mamães possam usar o Provador Mágico, limitamos o uso diário.
                </p>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                    Volte amanhã
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default VirtualFittingRoom;