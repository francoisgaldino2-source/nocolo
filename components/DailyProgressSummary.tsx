import React, { useMemo } from 'react';
import { BabyProfile, LogEntry, LogType } from '../types';
import { DAILY_GOALS } from '../constants';
import { Moon, Milk, CheckCircle2 } from 'lucide-react';

interface Props {
  baby: BabyProfile;
  logs: LogEntry[];
  themeColor: 'rose' | 'sky';
}

const DailyProgressSummary: React.FC<Props> = ({ baby, logs, themeColor }) => {
  const progressColor = themeColor === 'sky' ? 'bg-sky-500' : 'bg-rose-500';

  const { stats, goals } = useMemo(() => {
    const today = new Date();
    const birth = new Date(baby.birthDate);
    
    // Cálculo de idade em meses
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    if (today.getDate() < birth.getDate()) months--;
    const age = Math.max(0, months);

    // Buscar Metas
    let goalKey = '25+';
    if (age <= 3) goalKey = '0-3';
    else if (age <= 11) goalKey = '4-11';
    else if (age <= 24) goalKey = '12-24';
    
    const currentGoals = DAILY_GOALS[goalKey];

    // Calcular Totais do Dia
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const todaysLogs = logs.filter(l => new Date(l.timestamp) >= startOfDay);

    const feeds = todaysLogs.filter(l => l.type === LogType.FEEDING).length;
    
    let totalSleepMinutes = 0;
    todaysLogs.filter(l => l.type === LogType.SLEEP).forEach(l => {
        if (l.endTime) {
            const durationMs = new Date(l.endTime).getTime() - new Date(l.timestamp).getTime();
            totalSleepMinutes += durationMs / (1000 * 60);
        } else if (l.value) {
            totalSleepMinutes += l.value;
        }
    });

    return { 
        stats: { sleepHours: totalSleepMinutes / 60, feeds },
        goals: currentGoals
    };
  }, [baby, logs]);

  if (!goals) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 animate-fade-in">
        {/* Card Sono */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-500"><Moon size={14} /></div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Meta: {goals.sleepMin}h+</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-bold text-stone-700">{stats.sleepHours.toFixed(1)}</span>
                    <span className="text-xs text-stone-400">h</span>
                </div>
            </div>
            
            <div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mb-1">
                    <div 
                        className={`h-full ${progressColor} transition-all duration-1000`} 
                        style={{width: `${Math.min((stats.sleepHours / goals.sleepMin) * 100, 100)}%`}} 
                    />
                </div>
                {stats.sleepHours >= goals.sleepMin ? (
                    <p className="text-[9px] text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Ok</p>
                ) : (
                    <p className="text-[9px] text-stone-400">Faltam {(goals.sleepMin - stats.sleepHours).toFixed(1)}h</p>
                )}
            </div>
        </div>

        {/* Card Mamada */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-100 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div className="bg-rose-100 p-1.5 rounded-full text-rose-500"><Milk size={14} /></div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wide">Meta: {goals.feedsMin}+</span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-bold text-stone-700">{stats.feeds}</span>
                    <span className="text-xs text-stone-400">x</span>
                </div>
            </div>

            <div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mb-1">
                    <div 
                        className={`h-full ${themeColor === 'sky' ? 'bg-sky-400' : 'bg-rose-400'} transition-all duration-1000`} 
                        style={{width: `${Math.min((stats.feeds / goals.feedsMin) * 100, 100)}%`}} 
                    />
                </div>
                {stats.feeds >= goals.feedsMin ? (
                    <p className="text-[9px] text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={10} /> Ok</p>
                ) : (
                    <p className="text-[9px] text-stone-400">Faltam {goals.feedsMin - stats.feeds}</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default DailyProgressSummary;