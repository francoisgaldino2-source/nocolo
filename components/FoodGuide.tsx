import React, { useState } from 'react';
import { Milk, AlertTriangle, CheckCircle, XCircle, Utensils, Heart, ChefHat, Droplet, Coffee, Apple, Ban } from 'lucide-react';

const FoodGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'0-6' | 'MOM' | '6+'>('0-6');

  return (
    <div className="pb-24 animate-fade-in p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-stone-800">Guia Alimentar</h2>
           <p className="text-stone-500 text-sm">Segurança e nutrição consciente</p>
        </div>
        <div className="bg-sage-100 p-3 rounded-full text-sage-500">
            <Utensils size={24} />
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3 items-start shadow-sm">
        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
            <h3 className="text-amber-700 font-bold text-sm mb-1">Aviso Importante</h3>
            <p className="text-amber-600/90 text-xs leading-relaxed">
                Este guia é educativo e não substitui orientação médica. A alimentação do recém-nascido deve sempre seguir as recomendações do pediatra.
            </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-stone-100 mb-6">
        <button
          onClick={() => setActiveTab('0-6')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === '0-6' 
              ? 'bg-rose-100 text-rose-500 shadow-sm' 
              : 'text-stone-400 hover:bg-stone-50'
          }`}
        >
          0 a 6 Meses
        </button>
        <button
          onClick={() => setActiveTab('MOM')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'MOM' 
              ? 'bg-purple-100 text-purple-500 shadow-sm' 
              : 'text-stone-400 hover:bg-stone-50'
          }`}
        >
          Para a Mãe
        </button>
        <button
          onClick={() => setActiveTab('6+')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === '6+' 
              ? 'bg-sage-100 text-sage-500 shadow-sm' 
              : 'text-stone-400 hover:bg-stone-50'
          }`}
        >
          +6 Meses
        </button>
      </div>

      {/* Content 0-6 Months */}
      {activeTab === '0-6' && (
        <div className="space-y-6 animate-fade-in">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
                <h3 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
                    <Milk className="text-rose-400" size={20} /> O que o bebê pode?
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <CheckCircle className="text-rose-500 shrink-0" size={18} />
                        <span className="text-stone-700 font-medium text-sm">Leite materno (livre demanda)</span>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <CheckCircle className="text-stone-500 shrink-0" size={18} />
                        <span className="text-stone-700 font-medium text-sm">Fórmula infantil (se indicada)</span>
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
                <h3 className="text-lg font-bold text-stone-700 mb-4 flex items-center gap-2">
                    <Ban className="text-red-400" size={20} /> O que NÃO oferecer
                </h3>
                <p className="text-xs text-stone-400 mb-4">O sistema digestivo do bebê ainda está em formação.</p>
                <div className="grid grid-cols-2 gap-3">
                    {['Água', 'Chás', 'Sucos', 'Frutas amassadas', 'Papinhas', 'Açúcar / Mel'].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-stone-600 text-sm">
                            <XCircle className="text-red-300" size={14} /> {item}
                        </div>
                    ))}
                </div>
             </div>
        </div>
      )}

      {/* Content For Mom */}
      {activeTab === 'MOM' && (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-2">
                <p className="text-sm text-stone-600">A alimentação da mãe influencia diretamente na qualidade do leite materno. Cuide de você! 🌿</p>
            </div>

            {/* Recipe 1 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-500"><Utensils size={18} /></div>
                    <h4 className="font-bold text-stone-700">Mingau de Aveia com Banana</h4>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl mb-3">
                    <p className="text-xs font-bold text-stone-500 uppercase mb-2">Ingredientes</p>
                    <ul className="text-xs text-stone-600 space-y-1">
                        <li>• 1 colher de sopa de aveia</li>
                        <li>• 1 banana madura</li>
                        <li>• 200 ml de leite ou bebida vegetal</li>
                    </ul>
                </div>
                <p className="text-xs text-purple-600 font-medium flex gap-1 items-center">
                    <Heart size={12} fill="currentColor" /> Benefícios: Energia e auxilia na produção de leite.
                </p>
            </div>

            {/* Recipe 2 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-500"><Droplet size={18} /></div>
                    <h4 className="font-bold text-stone-700">Vitamina Pós-Parto</h4>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl mb-3">
                    <p className="text-xs font-bold text-stone-500 uppercase mb-2">Ingredientes</p>
                    <ul className="text-xs text-stone-600 space-y-1">
                        <li>• 1 copo de leite</li>
                        <li>• 1 colher de aveia</li>
                        <li>• 1 colher de linhaça</li>
                        <li>• 1 fruta (maçã ou banana)</li>
                    </ul>
                </div>
            </div>

            {/* Recipe 3 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-100 p-2 rounded-full text-purple-500"><Coffee size={18} /></div>
                    <h4 className="font-bold text-stone-700">Sopa Nutritiva</h4>
                </div>
                <p className="text-xs text-stone-500 mb-3">Rica em ferro e vitaminas para lactantes.</p>
                <div className="bg-stone-50 p-3 rounded-xl">
                    <p className="text-xs font-bold text-stone-500 uppercase mb-2">Base</p>
                    <p className="text-xs text-stone-600">Abóbora, Cenoura, Batata-doce e Frango desfiado.</p>
                </div>
            </div>
        </div>
      )}

      {/* Content 6+ Months */}
      {activeTab === '6+' && (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-sage-50 p-4 rounded-2xl border border-sage-200 mb-4">
                <h3 className="text-sage-700 font-bold text-sm mb-1 flex items-center gap-2">
                    <ChefHat size={16} /> Introdução Alimentar
                </h3>
                <p className="text-sage-600 text-xs">A partir dos 6 meses, com liberação do pediatra. Deve ser gradual e natural.</p>
            </div>

            <h3 className="text-lg font-bold text-stone-700 ml-1">Primeiras Papinhas</h3>
            
            {/* Papinha 1 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex gap-4 items-center">
                <div className="bg-orange-100 p-3 rounded-full text-orange-500">
                    <Utensils size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-stone-700 text-sm">Abóbora com Cenoura</h4>
                    <p className="text-xs text-stone-500 mt-1">Cozinhar no vapor e amassar com garfo.</p>
                </div>
            </div>

             {/* Papinha 2 */}
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex gap-4 items-center">
                <div className="bg-yellow-100 p-3 rounded-full text-yellow-500">
                    <Ban size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-stone-700 text-sm">Banana Amassada</h4>
                    <p className="text-xs text-stone-500 mt-1">Apenas banana madura. Sem açúcar.</p>
                </div>
            </div>

             {/* Papinha 3 */}
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex gap-4 items-center">
                <div className="bg-red-100 p-3 rounded-full text-red-500">
                    <Apple size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-stone-700 text-sm">Maçã Cozida</h4>
                    <p className="text-xs text-stone-500 mt-1">Cozinhar até ficar macia e amassar.</p>
                </div>
            </div>

            <div className="bg-rose-50 rounded-2xl p-5 mt-6 border border-rose-100">
                <h4 className="text-rose-700 font-bold text-sm mb-3 flex items-center gap-2">
                    <XCircle size={16} /> O que NÃO usar nas papinhas
                </h4>
                <div className="flex flex-wrap gap-2">
                    {['Sal', 'Açúcar', 'Mel', 'Temperos prontos', 'Frituras'].map(i => (
                        <span key={i} className="bg-white text-rose-500 text-[10px] font-bold px-2 py-1 rounded-md border border-rose-100">{i}</span>
                    ))}
                </div>
            </div>

            <div className="text-center py-4">
                <p className="text-xs text-stone-400 italic">"A alimentação do bebê começa com amor, paciência e informação correta." ❤️</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default FoodGuide;