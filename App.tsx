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
import DailyProgressSummary from './components/DailyProgressSummary';
import VirtualFittingRoom from './components/VirtualFittingRoom';
import BabyMonitor from './components/BabyMonitor';
import BabyStore from './components/BabyStore';
import AdminPanel from './components/AdminPanel';
import { Sun, Utensils, LogOut, Heart, Sparkles, Moon, ShoppingBag } from 'lucide-react';

const App: React.FC = () => {
  const [userCode, setUserCode] = useState<string | null>(null);
  const [view, setView] = useState<View>(View.WELCOME);
  
  // User Data State
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [themeColor, setThemeColor] = useState<'rose' | 'sky'>('rose');
  const [imgError, setImgError] = useState(false);
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (baby?.gender === 'boy') {
        setThemeColor('sky');
    } else {
        setThemeColor('rose');
    }
  }, [baby]);

  const handleLoginSuccess = async (code: string, profile: BabyProfile | null) => {
    setUserCode(code);
    if (profile) {
        setBaby(profile);
        const fullData = await storageService.login(code);
        if (fullData) {
            setLogs(fullData.logs || []);
            setGrowthRecords(fullData.growthRecords || []);
        }
        setView(View.DASHBOARD);
    } else {
        setView(View.WELCOME); 
    }
  };

  const handleLogout = () => {
    if (confirm("Deseja sair? Você precisará do seu código para entrar novamente.")) {
        setUserCode(null);
        setBaby(null);
        setLogs([]);
        setGrowthRecords([]);
        setView(View.WELCOME);
    }
  };

  const handleAddLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };
  
  const handleAddGrowthRecord = (record: GrowthRecord) => {
    setGrowthRecords(prev => [...prev, record].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  const accentColorClass = themeColor === 'sky' ? 'text-sky-400' : 'text-rose-400';
  const bgAccentClass = themeColor === 'sky' ? 'bg-sky-100' : 'bg-rose-100';
  const textAccentClass = themeColor === 'sky' ? 'text-sky-500' : 'text-rose-500';

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
                            alt="logo" 
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
                                {Math.floor((Date.now() - new Date(baby.birthDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                            </span>
                        </>
                    )}
                    <button onClick={handleLogout} className="text-[10px] text-stone-300 flex items-center gap-1 hover:text-stone-500 transition-colors mt-1">
                        <LogOut size={10} /> Sair
                    </button>
                </div>
            </header>

            {baby && <DailyProgressSummary baby={baby} logs={logs} themeColor={themeColor} />}

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

            <h3 className="text-stone-700 font-bold mb-4 ml-1 text-sm uppercase tracking-widest">Ferramentas</h3>
            <div className="grid grid-cols-3 gap-3 mb-8">
                 <button onClick={() => setView(View.RELAX)} className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center gap-2 h-24 hover:bg-stone-50 transition-all">
                    <Sparkles className="text-purple-400" size={24} />
                    <span className="text-[9px] font-bold text-stone-600 text-center">IA</span>
                 </button>
                 <button onClick={() => setView(View.RELAX)} className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center gap-2 h-24 hover:bg-stone-50 transition-all">
                    <Moon className="text-indigo-400" size={24} />
                    <span className="text-[9px] font-bold text-stone-600 text-center">Monitor</span>
                 </button>
                 <button onClick={() => setView(View.RELAX)} className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center justify-center gap-2 h-24 hover:bg-stone-50 transition-all">
                    <ShoppingBag className="text-rose-400" size={24} />
                    <span className="text-[9px] font-bold text-stone-600 text-center">Loja</span>
                 </button>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                <span className="uppercase tracking-widest text-[10px] font-bold text-sage-500 mb-2 block">Dica do dia</span>
                <p className="text-stone-600 font-medium leading-relaxed text-sm">"O vínculo entre você e seu bebê é construído nos pequenos detalhes do dia a dia. Confie no seu amor."</p>
            </div>
          </div>
        );
      case View.DIARY: return <BabyDiary logs={logs} addLog={handleAddLog} themeColor={themeColor} baby={baby} />;
      case View.CHAT: return <SupportChat themeColor={themeColor} babyProfile={baby} />;
      case View.RELAX: 
        return (
            <div className="pb-20">
                <VirtualFittingRoom />
                <div className="h-4 bg-stone-50" />
                <BabyMonitor />
                <div className="h-4 bg-stone-50" />
                <Relaxation />
                <div className="h-4 bg-stone-50" />
                <BabyStore />
            </div>
        );
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