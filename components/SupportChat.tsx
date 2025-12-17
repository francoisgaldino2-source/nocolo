import React, { useState, useRef, useEffect } from 'react';
import { CommunityMessage, BabyProfile } from '../types';
import { storageService } from '../services/storageService';
import { Send, Users, User, CheckCheck } from 'lucide-react';

interface Props {
    themeColor: 'rose' | 'sky';
    babyProfile: BabyProfile | null;
}

const SupportChat: React.FC<Props> = ({ themeColor, babyProfile }) => {
  // Community State
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Styles
  const btnBg = themeColor === 'sky' ? 'bg-sky-500 hover:bg-sky-600' : 'bg-rose-500 hover:bg-rose-600';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Carregar mensagens ao montar o componente
  useEffect(() => {
      const loadMessages = async () => {
          const msgs = await storageService.getCommunityMessages();
          setCommunityMessages(msgs);
      };
      loadMessages();
      
      // Polling simples para novas mensagens (a cada 10s)
      const interval = setInterval(loadMessages, 10000);
      return () => clearInterval(interval);
  }, []);

  // Scroll sempre que chegar nova mensagem
  useEffect(() => {
    scrollToBottom();
  }, [communityMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Send to Community
    const newMsg: CommunityMessage = {
        id: Date.now().toString(),
        authorName: babyProfile ? `Mãe de ${babyProfile.name}` : 'Você',
        text: input,
        timestamp: new Date(),
        isUser: true,
        avatarColor: 'bg-emerald-100' // Placeholder
    };
    
    // Optimistic UI update
    setCommunityMessages(prev => [...prev, newMsg]);
    setInput('');
    
    // Save to DB
    await storageService.addCommunityMessage(newMsg);
  };

  // Cores aleatórias consistentes para nomes de outras mães
  const getNameColor = (name: string) => {
    const colors = ['text-orange-500', 'text-purple-500', 'text-pink-500', 'text-blue-500', 'text-teal-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="h-full flex flex-col bg-[#e5ddd5] pb-20 pt-0 animate-fade-in relative">
      {/* Background Pattern Overlay (Sutil) */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
          backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
          backgroundSize: '400px'
      }}></div>

      {/* Header */}
      <div className="px-4 py-3 bg-stone-100/95 backdrop-blur-md border-b border-stone-200 shadow-sm sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sage-500 flex items-center justify-center text-white shadow-sm">
                <Users size={20} />
            </div>
            <div className="flex flex-col">
                <h2 className="text-sm font-bold text-stone-800 leading-tight">Mães do Ninho 🌿</h2>
                <p className="text-xs text-stone-500 leading-tight">
                    {communityMessages.length > 0 ? 'Online agora' : 'Toque para conversar'}
                </p>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 no-scrollbar relative z-10">
            {communityMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-stone-400 opacity-60">
                    <div className="bg-[#dcf8c6] p-4 rounded-full mb-2 shadow-sm">
                        <Users size={32} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-medium bg-white/50 px-3 py-1 rounded-full shadow-sm">Este grupo é seguro e acolhedor.</p>
                </div>
            )}
            
            {communityMessages.map((msg) => {
                const isMe = msg.isUser;
                return (
                    <div 
                        key={msg.id} 
                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 drop-shadow-sm`}>
                            {/* Avatar (Apenas para outros) */}
                            {!isMe && (
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-white bg-white`}>
                                     <User size={14} className="text-stone-400" />
                                </div>
                            )}
                            
                            {/* Message Bubble */}
                            <div className={`px-3 py-1.5 min-w-[100px] relative text-sm ${
                                isMe 
                                    ? 'bg-[#d9fdd3] text-stone-900 rounded-2xl rounded-tr-none' // Verde WhatsApp
                                    : 'bg-white text-stone-900 rounded-2xl rounded-tl-none' // Branco
                                }`}>
                                
                                {/* Nome do Autor (Apenas outros) */}
                                {!isMe && (
                                    <p className={`text-[11px] font-bold mb-0.5 leading-tight ${getNameColor(msg.authorName)}`}>
                                        {msg.authorName}
                                    </p>
                                )}

                                <p className="leading-relaxed whitespace-pre-wrap mr-10 pb-1.5 text-[13px]">
                                    {msg.text}
                                </p>

                                {/* Timestamp & Check */}
                                <div className="absolute right-2 bottom-1 flex items-center gap-0.5 select-none">
                                    <span className="text-[9px] text-stone-400/80">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {isMe && <CheckCheck size={12} className="text-blue-400" strokeWidth={2.5} />}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-stone-100 border-t border-stone-200 relative z-20">
        <div className="flex gap-2 items-end bg-white rounded-[24px] px-4 py-2 border border-stone-200 shadow-sm">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mensagem"
            className="flex-1 bg-transparent outline-none text-stone-700 placeholder-stone-400 py-2 max-h-24 overflow-y-auto text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className={`${btnBg} w-10 h-10 rounded-full text-white disabled:opacity-50 disabled:bg-stone-300 transition-all shadow-md flex items-center justify-center mb-0.5`}
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;