import React, { useState, useMemo, useEffect } from 'react';
import { LogEntry, LogType, BabyProfile } from '../types';
import { DAILY_GOALS } from '../constants';
import { Plus, Milk, Moon, Smile, Syringe, Target, CheckCircle2, Play, Square, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  themeColor: 'rose' | 'sky';
  baby: BabyProfile | null;
}

const BabyDiary: React.FC<Props> = ({ logs, addLog, themeColor, baby }) => {
  const [activeType, setActiveType] = useState<LogType>(LogType.FEEDING);
  
  // Estado para cronômetro de sono
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepStartTime, setSleepStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Styles based on theme
  const activeBg = themeColor === 'sky' ? 'bg-sky-100' : 'bg-rose-100';
  const activeText = themeColor === 'sky' ? 'text-sky-600' : 'text-rose-600';
  const activeBorder = themeColor === 'sky' ? 'border-sky-300' : 'border-rose-300';
  const buttonBg = themeColor === 'sky' ? 'bg-sky-400 hover:bg-sky-500 shadow-sky-200' : 'bg-rose-400 hover:bg-rose-500 shadow-rose-200';
  const progressColor = themeColor === 'sky' ? 'bg-sky-500' : 'bg-rose-500';

  // Persistence for sleep timer
  useEffect(() => {
    const storedStart = localStorage.getItem('ninho_sleep_start');
    if (storedStart) {
        setSleepStartTime(new Date(storedStart));
        setIsSleeping(true);
    }
  }, []);

  // Update elapsed time for display
  useEffect(() => {
    let interval: any;
    if (isSleeping && sleepStartTime) {
        interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - sleepStartTime.getTime()) / 1000));
        }, 1000);
    } else {
        setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isSleeping, sleepStartTime]);

  const formatDuration = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate age and Daily Stats
  const { ageInMonths, stats, goals } = useMemo(() => {
    if (!baby) return { ageInMonths: 0, stats: { sleepHours: 0, feeds: 0 }, goals: null };

    const today = new Date();
    const birth = new Date(baby.birthDate);
    
    // Cálculo preciso de meses
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    const age = Math.max(0, months);

    // Get Goals
    let goalKey = '25+';
    if (age <= 3) goalKey = '0-3';
    else if (age <= 11) goalKey = '4-11';
    else if (age <= 24) goalKey = '12-24';
    
    const currentGoals = DAILY_GOALS[goalKey];

    // Calculate Daily Stats (Today)
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const todaysLogs = logs.filter(l => new Date(l.timestamp) >= startOfDay);

    const feeds = todaysLogs.filter(l => l.type === LogType.FEEDING).length;
    
    // Calculate total sleep duration
    let totalSleepMinutes = 0;
    todaysLogs.filter(l => l.type === LogType.SLEEP).forEach(l => {
        if (l.endTime) {
            const durationMs = new Date(l.endTime).getTime() - new Date(l.timestamp).getTime();
            totalSleepMinutes += durationMs / (1000 * 60);
        } else if (l.value) {
            // Fallback for manually entered values (legacy)
            totalSleepMinutes += l.value;
        }
    });

    return { 
        ageInMonths: age, 
        stats: { sleepHours: totalSleepMinutes / 60, feeds },
        goals: currentGoals
    };
  }, [baby, logs]);

  const toggleSleep = () => {
      if (isSleeping) {
          // WAKE UP
          if (!sleepStartTime) return;
          const endTime = new Date();
          const durationMinutes = (endTime.getTime() - sleepStartTime.getTime()) / (1000 * 60);
          
          const newLog: LogEntry = {
              id: Date.now().toString(),
              type: LogType.SLEEP,
              timestamp: sleepStartTime,
              endTime: endTime,
              details: `Duração: ${Math.round(durationMinutes)} min`,
              value: durationMinutes
          };
          
          addLog(newLog);
          
          setIsSleeping(false);
          setSleepStartTime(null);
          localStorage.removeItem('ninho_sleep_start');
      } else {
          // START SLEEP
          const start = new Date();
          setSleepStartTime(start);
          setIsSleeping(true);
          localStorage.setItem('ninho_sleep_start', start.toISOString());
      }
  };

  const handleAddSimpleLog = () => {
    if (activeType === LogType.SLEEP) {
        toggleSleep();
        return;
    }

    const newLog: LogEntry = {
      id: Date.now().toString(),
      type: activeType,
      timestamp: new Date(),
      details: activeType === LogType.FEEDING ? 'Registrado' : 'Normal'
    };
    addLog(newLog);
  };

  const getIcon = (type: LogType) => {
    switch(type) {
      case LogType.FEEDING: return <Milk size={20} />;
      case LogType.SLEEP: return <Moon size={20} />;
      case LogType.MOOD: return <Smile size={20} />;
      case LogType.MEDICINE: return <Syringe size={20} />;
      default: return <div className="w-5 h-5 rounded-full bg-stone-300" />;
    }
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-6 py-6">
        <h2 className="text-2xl font-bold text-stone-800 mb-1">Diário do Bebê</h2>
        <p className="text-stone-500 mb-6">Registre e acompanhe a rotina.</p>

        {/* DAILY GOALS SECTION */}
        {goals && (
            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Sleep Goal */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-500"><Moon size={18} /></div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Meta: {goals.sleepMin}-{goals.sleepMax}h</span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-700">{stats.sleepHours.toFixed(1)}<span className="text-sm text-stone-400 font-normal">h</span></h3>
                    <p className="text-xs text-stone-500 mb-3">Dormidas hoje</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${progressColor} transition-all duration-1000`} 
                            style={{width: `${Math.min((stats.sleepHours / goals.sleepMin) * 100, 100)}%`}} 
                        />
                    </div>
                    {stats.sleepHours < goals.sleepMin ? (
                        <p className="text-[10px] text-stone-400 mt-2">Faltam {(goals.sleepMin - stats.sleepHours).toFixed(1)}h</p>
                    ) : (
                        <p className="text-[10px] text-green-500 mt-2 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Meta batida!</p>
                    )}
                </div>

                {/* Feeding Goal */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="bg-rose-100 p-2 rounded-full text-rose-500"><Milk size={18} /></div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Meta: {goals.feedsMin}-{goals.feedsMax}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-700">{stats.feeds}</h3>
                    <p className="text-xs text-stone-500 mb-3">Mamadas hoje</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${themeColor === 'sky' ? 'bg-sky-400' : 'bg-rose-400'} transition-all duration-1000`} 
                            style={{width: `${Math.min((stats.feeds / goals.feedsMin) * 100, 100)}%`}} 
                        />
                    </div>
                    {stats.feeds < goals.feedsMin ? (
                        <p className="text-[10px] text-stone-400 mt-2">Faltam {goals.feedsMin - stats.feeds} mamadas</p>
                    ) : (
                        <p className="text-[10px] text-green-500 mt-2 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Meta batida!</p>
                    )}
                </div>
            </div>
        )}

        {/* Action Type Selector */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 mb-2">
          {Object.values(LogType).map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl transition-all border-2 ${
                activeType === type 
                  ? `bg-white ${activeBorder} shadow-md transform -translate-y-1` 
                  : 'bg-white/50 border-transparent hover:bg-white'
              }`}
            >
              <div className={`mb-2 p-2 rounded-full ${activeType === type ? `${activeBg} ${activeText}` : 'bg-stone-100 text-stone-400'}`}>
                {getIcon(type)}
              </div>
              <span className={`text-xs font-bold ${activeType === type ? 'text-stone-800' : 'text-stone-400'}`}>
                {type}
              </span>
            </button>
          ))}
        </div>

        {/* Main Action Button (Context Aware) */}
        {activeType === LogType.SLEEP ? (
            <div className="mb-8">
                 <button 
                    onClick={toggleSleep}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 ${
                        isSleeping 
                            ? 'bg-stone-800 text-white animate-pulse' 
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    }`}
                >
                    {isSleeping ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    {isSleeping ? `Acordar (${formatDuration(elapsedTime)})` : 'Iniciar Soneca'}
                </button>
                {isSleeping && (
                    <p className="text-center text-xs text-stone-400 mt-2">O cronômetro continua rodando mesmo se você sair do app.</p>
                )}
            </div>
        ) : (
            <button 
            onClick={handleAddSimpleLog}
            className={`w-full ${buttonBg} text-white rounded-2xl py-4 font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mb-8`}
            >
            <Plus size={24} />
            Registrar {activeType}
            </button>
        )}

        {/* Recent Logs List */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-stone-700 mb-2 ml-1">Últimos Registros</h3>
          {logs.slice().reverse().map((log) => (
            <div key={log.id} className="bg-white/80 rounded-2xl p-4 flex items-center justify-between shadow-sm border border-stone-50">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${log.type === LogType.SLEEP ? 'bg-indigo-100 text-indigo-500' : 'bg-sage-100 text-sage-500'}`}>
                  {getIcon(log.type)}
                </div>
                <div>
                  <h4 className="font-bold text-stone-700">{log.type}</h4>
                  <div className="flex flex-col">
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                         <Clock size={10} />
                        {log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {log.endTime && ` - ${log.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </span>
                    <span className="text-xs text-stone-500 font-medium mt-0.5">{log.details}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-stone-400 py-4 text-sm">Nenhum registro hoje ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BabyDiary;