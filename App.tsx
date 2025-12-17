import React, { useState, useEffect } from 'react';
import { View, BabyProfile, LogEntry, GrowthRecord } from './types';
import { QUOTES, APP_LOGO } from './constants';
import { storageService } from './services/storageService';
import WelcomeScreen from './components/WelcomeScreen';
import Layout from './components/Layout';
import BabyDiary from './components/BabyDiary';
import SupportChat from './components/SupportChat';
import Relaxation from './components/Relaxation';
import SmartGuide from './components/SmartGuide';
import FoodGuide from './components/FoodGuide';
import GrowthCheck from './components/GrowthCheck';
import AdminPanel from './components/AdminPanel';
import DailyProgressSummary from './components/DailyProgressSummary';
import { Sun, Utensils, LogOut, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.WELCOME);
  
  // Auth State
  const [currentCode, setCurrentCode] = useState<string | null>(null);

  // User Data State
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [themeColor, setThemeColor] = useState<'rose' | 'sky'>('rose');
  const [imgError, setImgError] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [quote, setQuote] = useState(QUOTES[0]);

  // Rotate quotes
  useEffect(() => {
    const interval = setInterval(() => {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Set Theme based on Baby Gender
  useEffect(() => {
    if (baby?.gender === 'boy') {
        setThemeColor('sky');
    } else {
        setThemeColor('rose');
    }
  }, [baby]);

  // PERSISTENCE: Auto-save when key data changes
  useEffect(() => {
    if (currentCode && view !== View.ADMIN && view !== View.WELCOME && !isLoadingData) {
        // Debounce simple para não salvar a cada tecla
        const timer = setTimeout(() => {
            storageService.saveUserData(currentCode, {
                profile: baby,
                logs: logs,
                growthRecords: growthRecords,
            });
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [baby, logs, growthRecords, currentCode, view, isLoadingData]);

  const handleLoginSuccess = async (code: string, profile: BabyProfile | null) => {
    setIsLoadingData(true);
    setCurrentCode(code);
    
    // Tenta carregar dados existentes do banco
    const existingData = await storageService.login(code);
    
    if (existingData) {
        // Se temos dados no banco, usamos eles
        if (existingData.profile) setBaby(existingData.profile);
        
        // Se o profile veio do argumento (recém criado no WelcomeScreen) e não tinha no banco antes
        if (profile && !existingData.profile) {
            setBaby(profile);
            // Salva imediatamente para garantir
            await storageService.saveUserData(code, { profile });
        }
        
        setLogs(existingData.logs || []);
        setGrowthRecords(existingData.growthRecords || []);
    } else if (profile) {
        // Fallback: se o login retornou null (ex: offline), mas temos perfil local
        setBaby(profile);
    }

    setIsLoadingData(false);
    setView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentCode(null);
    setBaby(null);
    setLogs([]);
    setGrowthRecords([]);
    setView(View.WELCOME);
  };

  const handleAddLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };
  
  const handleAddGrowthRecord = (record: GrowthRecord) => {
    setGrowthRecords(prev => [...prev, record].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  // Helper for dynamic colors
  const accentColorClass = themeColor === 'sky' ? 'text-sky-400' : 'text-rose-400';
  const bgAccentClass = themeColor === 'sky' ? 'bg-sky-100' : 'bg-rose-100';
  const textAccentClass = themeColor === 'sky' ? 'text-sky-500' : 'text-rose-500';

  // Render Logic
  if (view === View.WELCOME) {
    return (
        <WelcomeScreen 
            onLoginSuccess={handleLoginSuccess} 
            onAdminLogin={() => setView(View.ADMIN)}
        />
    );
  }

  if (view === View.ADMIN) {
      return <AdminPanel onLogout={() => setView(View.WELCOME)} />;
  }

  if (isLoadingData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-nude-50">
              <div className="animate-bounce text-rose-400 font-bold">Carregando seu ninho...</div>
          </div>
      );
  }

  const renderContent = () => {
    switch(view) {
      case View.DASHBOARD:
        return (
          <div className="pb-24 animate-fade-in p-6 pt-10">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    {!imgError ? (
                        <img 
                            src={APP_LOGO} 
                            alt="nocolo" 
                            className="w-12 h-12 object-contain bg-white rounded-full border border-stone-100 shadow-sm p-0.5" 
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 border border-stone-100 shadow-sm">
                            <Heart size={20} fill="currentColor" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-stone-800">Olá, Mamãe</h1>
                        <p className="text-stone-500 text-[10px] mt-0.5 max-w-[180px] leading-tight line-clamp-2">{quote}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {baby && (
                        <>
                            <span className={`font-bold ${accentColorClass}`}>{baby.name}</span>
                            <span className="text-xs text-stone-400">
                                {Math.floor((Date.now() - baby.birthDate.getTime()) / (1000 * 60 * 60 * 24))} dias
                            </span>
                        </>
                    )}
                    <button onClick={handleLogout} className="text-[10px] text-stone-300 flex items-center gap-1 hover:text-stone-500 transition-colors mt-1">
                        <LogOut size={10} /> Sair
                    </button>
                </div>
            </header>

            {/* Daily Progress Widget (New) */}
            {baby && <DailyProgressSummary baby={baby} logs={logs} themeColor={themeColor} />}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <button onClick={() => setView(View.DIARY)} className={`${bgAccentClass} p-5 rounded-3xl flex flex-col gap-2 items-start hover:scale-[1.02] transition-transform shadow-sm`}>
                    <div className={`bg-white/60 p-2 rounded-full ${textAccentClass}`}><Sun size={20} /></div>
                    <span className="font-bold text-stone-700">Diário</span>
                </button>
                <button onClick={() => setView(View.NUTRITION)} className="bg-sage-100 p-5 rounded-3xl flex flex-col gap-2 items-start hover:scale-[1.02] transition-transform shadow-sm">
                    <div className="bg-white/60 p-2 rounded-full text-sage-500"><Utensils size={20} /></div>
                    <span className="font-bold text-stone-700">Nutrição</span>
                </button>
            </div>

            {/* Featured Section */}
            <div className="bg-stone-800 rounded-3xl p-6 text-white mb-6 relative overflow-hidden shadow-lg">
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2">Precisa conversar?</h3>
                    <p className="text-stone-300 text-sm mb-4 max-w-[90%]">Converse com outras mamães. Troque experiências e sinta o apoio de quem te entende.</p>
                    <button onClick={() => setView(View.CHAT)} className="bg-white text-stone-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-stone-100 transition-colors">Ir para Comunidade</button>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <Heart size={120} />
                </div>
            </div>

            {/* Daily Tip */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                <span className="uppercase tracking-widest text-[10px] font-bold text-sage-500 mb-2 block">Dica do dia</span>
                <p className="text-stone-600 font-medium leading-relaxed">"Durante saltos de desenvolvimento, é normal que o sono fique agitado. Mantenha a rotina e tenha paciência, isso também passa."</p>
            </div>
          </div>
        );
      case View.DIARY: return <BabyDiary logs={logs} addLog={handleAddLog} themeColor={themeColor} baby={baby} />;
      case View.CHAT: return <SupportChat themeColor={themeColor} babyProfile={baby} />;
      case View.RELAX: return <Relaxation />;
      case View.GUIDE: return baby ? <SmartGuide baby={baby} themeColor={themeColor} /> : null;
      case View.GROWTH: return baby ? <GrowthCheck baby={baby} records={growthRecords} onAddRecord={handleAddGrowthRecord} /> : null;
      case View.NUTRITION: return <FoodGuide />;
      default: return null;
    }
  };

  return (
    <Layout currentView={view} onChangeView={setView}>
      {renderContent()}
    </Layout>
  );
};

export default App;