import React from 'react';
import { View } from '../types';
import { Home, BookOpen, MessageCircle, Music, Scale, Utensils } from 'lucide-react';

interface Props {
  currentView: View;
  onChangeView: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ currentView, onChangeView, children }) => {
  const navItems = [
    { view: View.DASHBOARD, icon: Home, label: 'Início' },
    { view: View.GUIDE, icon: BookOpen, label: 'Guia' },
    { view: View.GROWTH, icon: Scale, label: 'Peso' },
    { view: View.CHAT, icon: MessageCircle, label: 'Ajuda' },
    { view: View.NUTRITION, icon: Utensils, label: 'Nutrição' },
  ];

  return (
    <div className="min-h-screen bg-nude-50 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <main className="h-screen overflow-y-auto no-scrollbar scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-lg rounded-[2rem] shadow-lg border border-white/50 h-16 flex items-center justify-between px-2 z-50">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onChangeView(item.view)}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-stone-800 text-white -translate-y-4 shadow-lg shadow-stone-800/30' 
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <item.icon size={isActive ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
              {!isActive && <span className="text-[9px] font-bold mt-0.5">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;