import React, { useState } from 'react';
import { BabyProfile } from '../types';
import { storageService } from '../services/storageService';
import { APP_LOGO } from '../constants';
import { Lock, ArrowRight, Loader2, Heart, User, Calendar, Baby, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  onLoginSuccess: (code: string, profile: BabyProfile | null) => void;
  onAdminLogin: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onLoginSuccess, onAdminLogin }) => {
  // Step 0: Code Entry, Step 1: Profile Setup
  const [step, setStep] = useState<0 | 1>(0);
  
  // Login Data
  const [code, setCode] = useState('');
  
  // Setup Data
  const [setupName, setSetupName] = useState('');
  const [setupDate, setSetupDate] = useState<Date | null>(null);
  const [setupGender, setSetupGender] = useState<'boy' | 'girl'>('girl');

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // STEP 0: Verify Code
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (code.trim().toLowerCase() === 'admin8186') {
        onAdminLogin();
        setIsLoading(false);
        return;
    }

    const normalizedCode = code.toUpperCase().trim();
    
    try {
        const userData = await storageService.login(normalizedCode);
        
        if (userData) {
          if (userData.profile) {
            onLoginSuccess(normalizedCode, userData.profile);
          } else {
            setStep(1);
          }
        } else {
          setError('Código inválido ou não encontrado.');
        }
    } catch (err) {
        setError('Erro de conexão. Verifique sua internet.');
    } finally {
        setIsLoading(false);
    }
  };

  // STEP 1: Save Profile
  const handleSetupSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!setupDate) {
          setError('Por favor, selecione a data de nascimento no calendário.');
          return;
      }

      setIsLoading(true);

      const profile: BabyProfile = {
          name: setupName,
          birthDate: setupDate,
          gender: setupGender
      };

      const normalizedCode = code.toUpperCase().trim();

      try {
          await storageService.saveUserData(normalizedCode, { profile });
          onLoginSuccess(normalizedCode, profile);
      } catch (err) {
          setError('Erro ao salvar dados. Tente novamente.');
          setIsLoading(false);
      }
  };

  // --- Calendar Logic ---
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    // Impede ir para o futuro além do mês atual
    if (nextMonth <= new Date()) {
        setViewDate(nextMonth);
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getDate() === d2.getDate() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getFullYear() === d2.getFullYear();
  };

  const renderCalendar = () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      
      const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days = [];
      
      // Empty slots for previous month
      for (let i = 0; i < firstDayOfMonth; i++) {
          days.push(<div key={`empty-${i}`} className="p-2"></div>);
      }

      // Days
      for (let d = 1; d <= daysInMonth; d++) {
          const date = new Date(year, month, d);
          const isSelected = setupDate && isSameDay(date, setupDate);
          const isToday = isSameDay(date, new Date());
          const isFuture = date > new Date();

          days.push(
              <button
                  key={d}
                  type="button"
                  disabled={isFuture}
                  onClick={() => { setSetupDate(date); setError(''); }}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mx-auto
                    ${isSelected ? 'bg-stone-800 text-white shadow-md scale-110' : ''}
                    ${!isSelected && isToday ? 'border border-stone-800 text-stone-800' : ''}
                    ${!isSelected && !isToday && !isFuture ? 'text-stone-600 hover:bg-stone-100' : ''}
                    ${isFuture ? 'text-stone-300 cursor-default' : ''}
                  `}
              >
                  {d}
              </button>
          );
      }

      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

      return (
          <div className="bg-stone-50 rounded-3xl p-4 border border-stone-200 shadow-inner">
              <div className="flex items-center justify-between mb-4 px-2">
                  <button type="button" onClick={handlePrevMonth} className="p-1 text-stone-400 hover:text-stone-600">
                      <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm font-bold text-stone-700 capitalize">
                      {monthNames[month]} {year}
                  </span>
                  <button type="button" onClick={handleNextMonth} className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-30" disabled={new Date(year, month + 1, 1) > new Date()}>
                      <ChevronRight size={20} />
                  </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                      <span key={i} className="text-[10px] font-bold text-stone-400">{day}</span>
                  ))}
              </div>
              <div className="grid grid-cols-7 gap-y-2">
                  {days}
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-stone-500 font-medium">
                    {setupDate 
                        ? `Nascimento: ${setupDate.toLocaleDateString()}` 
                        : 'Selecione o dia do nascimento'}
                </p>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-nude-50 to-white text-stone-700 animate-fade-in relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-rose-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-sky-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-md p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-white relative z-10 mt-12 transition-all duration-500 hover:shadow-3xl">
        
        <div className="flex justify-center -mt-24 mb-6 relative z-10">
            <div className="p-2 animate-float">
                {!imgError ? (
                    <img 
                        src={APP_LOGO} 
                        alt="Ninho" 
                        className="w-48 h-48 rounded-full object-cover shadow-2xl border-4 border-white" 
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-48 h-48 bg-rose-100 rounded-full flex items-center justify-center text-rose-400 shadow-inner border-4 border-white">
                        <Heart size={64} fill="currentColor" />
                    </div>
                )}
            </div>
        </div>

        <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">
                {step === 0 ? 'Bem-vinda' : 'Configurar Perfil'}
            </h1>
            <p className="text-stone-500">
                {step === 0 
                    ? 'Insira seu código de acesso para entrar.' 
                    : 'Vamos personalizar o cantinho do seu bebê.'}
            </p>
        </div>

        {step === 0 ? (
            // --- FORMULÁRIO DE CÓDIGO ---
            <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                    <div className="relative group">
                        <input 
                        type="text" 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-white rounded-2xl px-6 py-5 pl-14 outline-none border-2 border-stone-100 focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all text-lg font-mono text-stone-800 placeholder-stone-300 tracking-widest shadow-sm"
                        placeholder="CÓDIGO"
                        autoCapitalize="none"
                        disabled={isLoading}
                        />
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-rose-400 transition-colors" size={22} />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading || !code}
                    className="w-full bg-stone-800 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-stone-200 hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                        <>Entrar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                </button>
            </form>
        ) : (
            // --- FORMULÁRIO DE PRIMEIRO ACESSO (PERFIL) ---
            <form onSubmit={handleSetupSubmit} className="space-y-4 animate-fade-in">
                 {/* Name Input */}
                 <div className="relative">
                    <input 
                      type="text" 
                      value={setupName}
                      onChange={(e) => setSetupName(e.target.value)}
                      className="w-full bg-stone-50 rounded-2xl px-6 py-4 pl-12 outline-none border border-transparent focus:border-rose-300 focus:bg-white transition-all"
                      placeholder="Nome do Bebê"
                      required
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                </div>

                {/* Calendar Input */}
                <div className="relative">
                    {renderCalendar()}
                </div>

                {/* Gender Select */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setSetupGender('girl')}
                        className={`flex-1 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm border ${
                        setupGender === 'girl' 
                            ? 'bg-rose-50 text-rose-500 border-rose-200' 
                            : 'bg-stone-50 text-stone-400 border-transparent'
                        }`}
                    >
                        <Baby size={18} /> Menina
                    </button>
                    <button
                        type="button"
                        onClick={() => setSetupGender('boy')}
                        className={`flex-1 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm border ${
                        setupGender === 'boy' 
                            ? 'bg-sky-50 text-sky-500 border-sky-200' 
                            : 'bg-stone-50 text-stone-400 border-transparent'
                        }`}
                    >
                        <Baby size={18} /> Menino
                    </button>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-stone-800 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-stone-200 hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Começar Jornada <ArrowRight size={20} /></>}
                </button>
            </form>
        )}

        {error && (
            <div className="mt-6 bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center animate-pulse flex items-center justify-center gap-2">
                <span className="text-sm text-rose-500 font-bold">{error}</span>
            </div>
        )}

      </div>
      
      <div className="mt-8 text-center relative z-10">
            <p className="text-stone-300 text-[10px] uppercase tracking-widest font-bold">Ninho App • Maternidade Leve</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
