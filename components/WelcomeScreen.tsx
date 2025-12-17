
import React, { useState } from 'react';
import { BabyProfile } from '../types';
import { storageService } from '../services/storageService';
import { APP_LOGO } from '../constants';
import { ArrowRight, Loader2, Heart, Copy, User, Baby, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

interface Props {
  onLoginSuccess: (code: string, profile: BabyProfile | null) => void;
  onAdminLogin: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onLoginSuccess, onAdminLogin }) => {
  const [step, setStep] = useState<'INITIAL' | 'LOGIN' | 'SETUP' | 'CODE_DISPLAY'>('INITIAL');
  
  // Login Data
  const [accessCode, setAccessCode] = useState('');
  
  // Setup Data
  const [generatedCode, setGeneratedCode] = useState('');
  const [setupName, setSetupName] = useState('');
  const [setupDate, setSetupDate] = useState<Date | null>(null);
  const [setupGender, setSetupGender] = useState<'boy' | 'girl'>('girl');

  // Calendar State
  const [viewDate, setViewDate] = useState(new Date());

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // LOGIN FLOW
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Interceptação do Código Admin - Atualizado para ADMIN8186
    if (accessCode.trim().toUpperCase() === 'ADMIN8186') {
        onAdminLogin();
        return;
    }
    
    setError('');
    setIsLoading(true);
    
    const userData = await storageService.login(accessCode.trim().toUpperCase());
    
    if (userData) {
        onLoginSuccess(accessCode.trim().toUpperCase(), userData.profile);
    } else {
        setError('Código inválido ou não encontrado.');
        setIsLoading(false);
    }
  };

  // CREATE ACCOUNT FLOW - Step 1: Generate Code
  const handleGenerateCode = async () => {
      setIsLoading(true);
      try {
          const code = await storageService.generateCode();
          setGeneratedCode(code);
          setStep('CODE_DISPLAY');
      } catch (e) {
          setError('Erro ao conectar com o servidor. Tente novamente.');
      } finally {
          setIsLoading(false);
      }
  };

  // CREATE ACCOUNT FLOW - Step 2: Save Profile
  const handleSetupSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!setupName.trim()) {
          setError('Por favor, digite o nome do bebê.');
          return;
      }
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

      try {
          await storageService.saveUserData(generatedCode, { profile });
          onLoginSuccess(generatedCode, profile);
      } catch (err) {
          setError('Erro ao salvar dados.');
          setIsLoading(false);
      }
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(generatedCode);
  };

  // --- Calendar Logic ---
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
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
      
      const firstDayOfMonth = new Date(year, month, 1).getDay(); 
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days = [];
      
      for (let i = 0; i < firstDayOfMonth; i++) {
          days.push(<div key={`empty-${i}`} className="p-2"></div>);
      }

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

        {step === 'INITIAL' && (
            <div className="space-y-4 animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 mb-2">Bem-vinda</h1>
                    <p className="text-stone-500">Seu refúgio de maternidade leve e acolhedora.</p>
                </div>
                
                <button 
                    onClick={() => setStep('LOGIN')}
                    className="w-full bg-stone-800 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-stone-200 hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    Já tenho um código <ArrowRight size={20} />
                </button>
                <button 
                    onClick={handleGenerateCode}
                    className="w-full bg-white text-stone-600 border-2 border-stone-100 rounded-2xl py-4 font-bold text-lg hover:bg-stone-50 active:scale-95 transition-all"
                >
                    {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Sou nova por aqui'}
                </button>
            </div>
        )}

        {step === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-stone-800">Acessar Ninho</h2>
                    <p className="text-sm text-stone-500">Digite seu código de acesso pessoal.</p>
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                        className="w-full bg-stone-50 rounded-2xl px-6 py-4 pl-12 font-mono text-lg tracking-widest uppercase outline-none border border-transparent focus:border-rose-300 focus:bg-white transition-all text-center"
                        placeholder="CÓDIGO"
                        autoFocus
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                </div>

                <button 
                    type="submit"
                    disabled={!accessCode || isLoading}
                    className="w-full bg-stone-800 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-stone-200 hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Entrar <ArrowRight size={20} /></>}
                </button>
                <button 
                    type="button" 
                    onClick={() => setStep('INITIAL')}
                    className="w-full text-stone-400 text-sm font-bold py-2 hover:text-stone-600"
                >
                    Voltar
                </button>
            </form>
        )}

        {step === 'CODE_DISPLAY' && (
             <div className="space-y-6 animate-fade-in text-center">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Seu Código Pessoal</h2>
                    <p className="text-sm text-stone-500 px-4">Guarde este código com carinho. É a única chave para acessar seu diário em qualquer dispositivo.</p>
                </div>

                <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-6 relative group">
                    <span className="text-3xl font-mono font-bold text-rose-500 tracking-widest">{generatedCode}</span>
                    <button 
                        onClick={copyToClipboard}
                        className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-rose-300 hover:text-rose-500 transition-colors"
                    >
                        <Copy size={20} />
                    </button>
                </div>

                <button 
                    onClick={() => setStep('SETUP')}
                    className="w-full bg-stone-800 text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-stone-200 hover:bg-stone-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    Guardei, continuar <ArrowRight size={20} />
                </button>
             </div>
        )}

        {step === 'SETUP' && (
            <form onSubmit={handleSetupSubmit} className="space-y-4 animate-fade-in">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-stone-800">Quem vamos amar?</h2>
                </div>

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

                <div className="relative">
                    {renderCalendar()}
                </div>

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
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Finalizar <ArrowRight size={20} /></>}
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
