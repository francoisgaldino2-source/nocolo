import React, { useMemo, useState } from 'react';
import { BabyProfile } from '../types';
import { MILESTONES } from '../constants';
import { Calendar, CheckCircle, Clock, Moon, Milk, RefreshCcw, Heart, Droplets, Sparkles, Star, Lightbulb } from 'lucide-react';

interface Props {
  baby: BabyProfile;
  themeColor: 'rose' | 'sky';
}

const SmartGuide: React.FC<Props> = ({ baby, themeColor }) => {
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'NEWBORN'>('CURRENT');

  // Cores dinâmicas
  const textColor = themeColor === 'sky' ? 'text-sky-500' : 'text-rose-500';
  const textDarkColor = themeColor === 'sky' ? 'text-sky-600' : 'text-rose-600';
  const bgColor = themeColor === 'sky' ? 'bg-sky-100' : 'bg-rose-100';
  const borderColor = themeColor === 'sky' ? 'border-sky-200' : 'border-rose-200';
  const tabActiveBg = themeColor === 'sky' ? 'bg-sky-100 text-sky-500' : 'bg-rose-100 text-rose-500';

  const ageInMonths = useMemo(() => {
    const today = new Date();
    const birth = new Date(baby.birthDate);
    
    // Cálculo preciso de meses
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    
    // Se ainda não chegou o dia do aniversário no mês atual, subtrai um mês
    if (today.getDate() < birth.getDate()) {
        months--;
    }
    
    return Math.max(0, months);
  }, [baby]);

  const ageDisplay = useMemo(() => {
      if (ageInMonths === 0) return "Recém-nascido";
      if (ageInMonths === 1) return "1 mês";
      return `${ageInMonths} meses`;
  }, [ageInMonths]);

  const milestones = useMemo(() => {
    // Find closest milestone key
    const keys = Object.keys(MILESTONES);
    const key = keys.find(k => {
      const [min, max] = k.split('-').map(Number);
      return ageInMonths >= min && ageInMonths <= max;
    });
    return key ? MILESTONES[key] : MILESTONES['10-12']; // Default fallback
  }, [ageInMonths]);

  const routine = [
    { time: '07:00 – 08:00', activity: 'Acordar, Mamada e Troca' },
    { time: '08:00 – 09:00', activity: 'Interação e "Tummy Time"' },
    { time: '09:00 – 10:00', activity: 'Soneca da manhã 😴' },
    { time: '10:00 – 11:00', activity: 'Acordar, Mamada e Troca' },
    { time: '11:00 – 12:00', activity: 'Passeio ou Estímulos visuais' },
    { time: '12:00 – 13:00', activity: 'Soneca curta' },
    { time: '13:00 – 14:00', activity: 'Mamada, Troca e Brincar' },
    { time: '14:00 – 15:30', activity: 'Soneca da tarde (longa)' },
    { time: '15:30 – 16:30', activity: 'Mamada e Massagem' },
    { time: '16:30 – 17:30', activity: 'Brincadeiras calmas' },
    { time: '18:00 – 19:00', activity: 'Banho relaxante 🛁' },
    { time: '19:00 – 20:00', activity: 'Mamada e Ritual do sono' },
    { time: '20:00 – 21:00', activity: 'Hora de Dormir 🌙' },
  ];

  const newbornRoutine = [
    { time: '06:00', activity: 'Mamada + troca + dormir' },
    { time: '09:00', activity: 'Mamada + troca + pele a pele' },
    { time: '12:00', activity: 'Mamada + troca' },
    { time: '15:00', activity: 'Mamada + troca + pele a pele' },
    { time: '18:00', activity: 'Mamada + troca' },
    { time: '21:00', activity: 'Mamada + troca' },
    { time: '00:00', activity: 'Mamada + troca' },
    { time: '03:00', activity: 'Mamada + troca' },
  ];

  return (
    <div className="pb-24 animate-fade-in p-6">
      <div className="mb-6 bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-stone-800 mb-1">{baby.name}</h2>
            <p className={`${textColor} font-semibold`}>{ageDisplay}</p>
        </div>
        <div className="bg-nude-100 p-3 rounded-full">
            <Star className="text-stone-400 fill-current" size={24} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-stone-100 mb-6">
        <button
          onClick={() => setActiveTab('CURRENT')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'CURRENT' 
              ? `${tabActiveBg} shadow-sm` 
              : 'text-stone-400 hover:bg-stone-50'
          }`}
        >
          Guia do Mês
        </button>
        <button
          onClick={() => setActiveTab('NEWBORN')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'NEWBORN' 
              ? `${tabActiveBg} shadow-sm` 
              : 'text-stone-400 hover:bg-stone-50'
          }`}
        >
          Recém-Nascido
        </button>
      </div>

      {activeTab === 'CURRENT' ? (
        <div className="animate-fade-in">
            <h3 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-sage-500" />
                Marcos de Desenvolvimento
            </h3>
            <div className="bg-white/60 rounded-3xl p-6 shadow-sm border border-white mb-8 space-y-4">
                {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-3">
                    <div className="min-w-[20px] h-5 rounded-full border-2 border-sage-300 mt-0.5" />
                    <p className="text-stone-600 text-sm leading-relaxed">{m}</p>
                </div>
                ))}
            </div>

            <h3 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-nude-500" />
                Rotina Sugerida (+3 Meses)
            </h3>
            <div className="space-y-3 mb-8">
                {routine.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm border border-stone-50">
                    <span className="font-bold text-stone-800 bg-nude-100 px-3 py-1 rounded-lg text-xs w-fit">{r.time}</span>
                    <span className="text-stone-600 text-sm ml-1">{r.activity}</span>
                </div>
                ))}
            </div>

            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
                <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                    <Lightbulb size={20} className="text-indigo-500" /> Dicas Importantes
                </h3>
                <ul className="space-y-3 text-sm text-indigo-900/80">
                    <li className="flex gap-2">
                        <span className="text-indigo-400">•</span>
                        Cada bebê tem seu ritmo, este cronograma é apenas um guia.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-indigo-400">•</span>
                        Observe os sinais de sono: bocejos, esfregar os olhos ou ficar quieto de repente.
                    </li>
                    <li className="flex gap-2">
                        <span className="text-indigo-400">•</span>
                        O bebê pode acordar 1 a 2 vezes na noite para mamar, é normal nesta fase.
                    </li>
                </ul>
            </div>
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className={textColor} size={20} />
                <h3 className="text-lg font-bold text-stone-700">Guia do 1º Dia de Vida</h3>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 gap-4">
                {/* Sono */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-indigo-300">
                    <div className="flex items-center gap-2 mb-3">
                        <Moon className="text-indigo-400" size={20} />
                        <h4 className="font-bold text-stone-700">Sono</h4>
                    </div>
                    <ul className="text-sm text-stone-600 space-y-2 list-disc pl-4">
                        <li>Dorme 16h–20h por dia</li>
                        <li>Cochilos de 30min a 2h</li>
                        <li>Acorda apenas para mamar e trocar</li>
                    </ul>
                </div>

                {/* Alimentação */}
                <div className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 ${borderColor}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Milk className={textColor} size={20} />
                        <h4 className="font-bold text-stone-700">Alimentação</h4>
                    </div>
                    <ul className="text-sm text-stone-600 space-y-2 list-disc pl-4">
                        <li>Livre demanda (a cada 2h–3h)</li>
                        <li><strong>Sinais de fome:</strong> cabeça virando, boca procurando, irritação leve</li>
                        <li>Oferecer peito sempre que pedir</li>
                    </ul>
                </div>

                {/* Troca */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-emerald-300">
                    <div className="flex items-center gap-2 mb-3">
                        <RefreshCcw className="text-emerald-400" size={20} />
                        <h4 className="font-bold text-stone-700">Troca de Fraldas</h4>
                    </div>
                    <ul className="text-sm text-stone-600 space-y-2 list-disc pl-4">
                        <li>8 a 12 trocas por dia</li>
                        <li>Cocô do 1º dia = mecônio (escuro)</li>
                        <li>Trocar sempre após mamadas</li>
                    </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     {/* Pele a Pele */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className={textColor} size={18} />
                            <h4 className="font-bold text-stone-700 text-sm">Pele a Pele</h4>
                        </div>
                        <p className="text-xs text-stone-500">3 a 5x ao dia. Ajuda no vínculo e acalma.</p>
                    </div>

                     {/* Banho */}
                     <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Droplets className="text-sky-400" size={18} />
                            <h4 className="font-bold text-stone-700 text-sm">Banho</h4>
                        </div>
                        <p className="text-xs text-stone-500">Não recomendado no 1º dia. Aguarde 24h.</p>
                    </div>
                </div>
            </div>

            {/* Newborn Routine Timeline */}
            <div>
                <h3 className="text-lg font-bold text-stone-700 mb-4 mt-8 flex items-center gap-2">
                    <Clock size={20} className="text-nude-500" />
                    Rotina Exemplo
                </h3>
                <div className="space-y-0 relative border-l-2 border-nude-200 ml-4 pl-6 pb-2">
                    {newbornRoutine.map((r, i) => (
                    <div key={i} className="mb-6 relative">
                        <div className={`absolute -left-[31px] top-1 bg-white border-2 ${borderColor} w-4 h-4 rounded-full`}></div>
                        <div className="flex flex-col">
                            <span className={`font-bold ${textDarkColor} text-sm`}>{r.time}</span>
                            <span className="text-stone-600 text-sm bg-white p-3 rounded-xl shadow-sm mt-1 border border-stone-50">{r.activity}</span>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SmartGuide;