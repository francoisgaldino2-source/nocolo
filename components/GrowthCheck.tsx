import React, { useState, useMemo } from 'react';
import { BabyProfile, GrowthRecord } from '../types';
import { GROWTH_DATA_BOY, GROWTH_DATA_GIRL } from '../constants';
import { Scale, Info, CheckCircle, AlertCircle, Plus, History } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';

interface Props {
  baby: BabyProfile;
  records: GrowthRecord[];
  onAddRecord: (record: GrowthRecord) => void;
}

const GrowthCheck: React.FC<Props> = ({ baby, records, onAddRecord }) => {
  const [weight, setWeight] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Use baby's gender directly
  const genderData = baby.gender === 'boy' ? GROWTH_DATA_BOY : GROWTH_DATA_GIRL;
  const genderColor = baby.gender === 'boy' ? 'text-sky-700' : 'text-rose-700'; // Mais escuro
  const genderBg = baby.gender === 'boy' ? 'bg-sky-100' : 'bg-rose-100'; // Mais saturado

  const handleSave = () => {
      if (!weight) return;
      const w = parseFloat(weight.replace(',', '.'));
      if (isNaN(w)) return;

      const recordDate = new Date(date);
      // Calculate age in months at that specific date
      const diff = recordDate.getTime() - baby.birthDate.getTime();
      const ageAtDate = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44)); // More precise month calculation

      const newRecord: GrowthRecord = {
          id: Date.now().toString(),
          date: recordDate,
          weight: w,
          ageInMonths: Math.max(0, ageAtDate)
      };

      onAddRecord(newRecord);
      setWeight(''); // Clear input
  };

  // Get the latest record OR the current input for analysis
  const currentAnalysis = useMemo(() => {
    let w: number | null = null;
    let age: number = 0;

    // Priority: Input value -> Latest Record -> None
    if (weight) {
        w = parseFloat(weight.replace(',', '.'));
        const diff = new Date(date).getTime() - baby.birthDate.getTime();
        age = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
    } else if (records.length > 0) {
        const last = records[records.length - 1];
        w = last.weight;
        age = last.ageInMonths;
    }

    if (w === null || isNaN(w)) return null;

    // Cap age at 12 months for this demo data
    const lookupMonth = Math.min(Math.max(0, age), 12);
    
    const [min, median, max] = genderData[lookupMonth] || genderData[12];

    let status: 'low' | 'normal' | 'high' = 'normal';
    let message = `O peso está dentro do esperado para ${age} meses! 💚`;
    let color = "text-emerald-800 bg-emerald-50 border-emerald-300";

    if (w < min) {
      status = 'low';
      message = `Peso um pouco abaixo da média para ${age} meses. Acompanhe com o pediatra.`;
      color = "text-rose-800 bg-rose-50 border-rose-300";
    } else if (w > max) {
      status = 'high';
      message = `Peso acima da média para ${age} meses. Cada bebê tem seu ritmo.`;
      color = "text-stone-800 bg-stone-100 border-stone-300";
    }

    return { status, message, color, min, median, max, current: w, age };
  }, [weight, date, records, baby.birthDate, genderData]);

  // Prepare Chart Data
  const chartData = useMemo(() => {
      // Create base data from WHO standards (months 0-12)
      const data = Object.keys(genderData).map(monthStr => {
          const month = parseInt(monthStr);
          const [min, median, max] = genderData[month];
          
          // Find if there's a baby record for this month (approx)
          // We look for records where ageInMonths matches
          const babyRecord = records.find(r => r.ageInMonths === month);

          return {
              name: month,
              min,
              median,
              max,
              baby: babyRecord ? babyRecord.weight : null
          };
      });
      return data;
  }, [genderData, records]);

  return (
    <div className="pb-24 animate-fade-in p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${genderBg} ${genderColor}`}>
            <Scale size={28} />
            </div>
            <div>
            <h2 className="text-2xl font-bold text-stone-900">Crescimento</h2>
            <p className="text-stone-600 text-sm font-bold">{baby.name} • {baby.gender === 'boy' ? 'Menino' : 'Menina'}</p>
            </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 mb-6">
        <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-stone-600" /> Novo Registro
        </h3>
        <div className="flex gap-3 mb-4">
             <div className="flex-1">
                <label className="block text-xs font-extrabold text-stone-600 mb-1 ml-1 uppercase tracking-wide">Data</label>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-50 rounded-2xl px-4 py-3 text-stone-900 border-2 border-stone-200 outline-none focus:border-stone-400 focus:ring-0 text-sm font-bold"
                />
             </div>
             <div className="flex-1">
                <label className="block text-xs font-extrabold text-stone-600 mb-1 ml-1 uppercase tracking-wide">Peso (kg)</label>
                <input 
                    type="number" 
                    inputMode="decimal"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-stone-50 rounded-2xl px-4 py-3 text-stone-900 font-bold border-2 border-stone-200 outline-none focus:border-stone-400 focus:ring-0 text-sm placeholder:text-stone-400"
                />
             </div>
        </div>
        <button 
            onClick={handleSave}
            disabled={!weight}
            className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold disabled:opacity-50 active:scale-95 transition-all shadow-lg hover:bg-stone-900"
        >
            Salvar Peso
        </button>

        {/* Dynamic Analysis Bar (Appears when typing or showing last record) */}
        {currentAnalysis && (
          <div className={`mt-6 p-4 rounded-2xl border-2 ${currentAnalysis.color} animate-fade-in`}>
            <div className="flex gap-3 items-start">
              {currentAnalysis.status === 'normal' ? <CheckCircle className="shrink-0 w-5 h-5" /> : <AlertCircle className="shrink-0 w-5 h-5" />}
              <p className="text-sm font-bold leading-relaxed">{currentAnalysis.message}</p>
            </div>
            
            {/* Visual Bar */}
            <div className="mt-4 relative h-4 bg-white border border-stone-300 rounded-full w-full overflow-hidden">
               {/* Safe Range Zone */}
               <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-emerald-200/60" />
               
               {/* Indicator */}
               <div 
                 className="absolute top-0 bottom-0 w-4 h-4 bg-stone-900 rounded-full transition-all duration-1000 ease-out shadow-lg border-2 border-white z-10"
                 style={{ 
                   left: `${Math.min(Math.max(((currentAnalysis.current - currentAnalysis.min) / (currentAnalysis.max - currentAnalysis.min)) * 60 + 20, 0), 100)}%` 
                 }}
               />
            </div>
            <div className="flex justify-between text-[11px] text-stone-600 mt-2 font-bold">
               <span>Min: {currentAnalysis.min}kg</span>
               <span>Max: {currentAnalysis.max}kg</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      {records.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-stone-200 mb-6">
             <h3 className="font-bold text-stone-800 mb-4 text-lg">Curva de Crescimento</h3>
             <div className="h-56 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        {/* Escurecendo a Grade */}
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d6d3d1" />
                        {/* Escurecendo o Eixo X */}
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 11, fill: '#1c1917', fontWeight: 700}} 
                            interval={2} 
                            unit="m" 
                        />
                        <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip 
                            contentStyle={{borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}
                            itemStyle={{color: '#1c1917', fontWeight: 'bold'}}
                            labelFormatter={(val) => `${val} meses`}
                        />
                        {/* WHO Standard Area - Tornando o cinza de fundo mais visível */}
                        <Area type="monotone" dataKey="min" stackId="1" stroke="none" fill="transparent" />
                        <Area type="monotone" dataKey="max" stackId="1" stroke="#a8a29e" strokeWidth={1} strokeDasharray="5 5" fill="#e7e5e4" fillOpacity={0.5} />
                        
                        {/* Baby Line */}
                        <Area type="monotone" dataKey="baby" stroke={baby.gender === 'boy' ? '#0ea5e9' : '#f43f5e'} strokeWidth={3} fill="url(#splitColor)" connectNulls />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
             <p className="text-[11px] text-center text-stone-500 mt-2 font-bold">Comparativo com a curva da OMS (área cinza)</p>
          </div>
      )}

      {/* History List */}
      <div className="space-y-3">
         <h3 className="font-bold text-stone-800 ml-2 flex items-center gap-2 text-sm">
            <History size={16} className="text-stone-600" /> Histórico
         </h3>
         {records.length === 0 ? (
             <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-stone-300">
                 <p className="text-stone-500 text-sm font-bold">Nenhum registro ainda.</p>
             </div>
         ) : (
            [...records].reverse().map((rec) => (
                <div key={rec.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex justify-between items-center">
                    <div>
                        <p className="font-bold text-stone-900 text-lg">{rec.weight} kg</p>
                        <p className="text-xs text-stone-500 font-bold">{new Date(rec.date).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                        <span className="text-xs font-bold text-stone-700">{rec.ageInMonths} meses</span>
                    </div>
                </div>
            ))
         )}
      </div>

    </div>
  );
};

export default GrowthCheck;