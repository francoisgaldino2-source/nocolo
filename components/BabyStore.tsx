import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { storageService } from '../services/storageService';
import { ShoppingBag, ExternalLink } from 'lucide-react';

const BabyStore: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Carrega os produtos cadastrados no Admin (ou os padrão)
    setProducts(storageService.getProducts());
  }, []);

  const handleBuy = (link?: string) => {
      if (link) {
          window.open(link, '_blank');
      } else {
          alert('Link indisponível no momento.');
      }
  };

  return (
    <div className="pb-24 animate-fade-in p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-stone-800">Lojinha do Ninho</h2>
           <p className="text-stone-500 text-sm">Curadoria para a idade do seu bebê</p>
        </div>
        <div className="bg-rose-100 p-3 rounded-full text-rose-500">
            <ShoppingBag size={24} />
        </div>
      </div>

      {products.length === 0 ? (
          <div className="text-center py-10 text-stone-400">
              <p>Nenhum produto cadastrado ainda.</p>
          </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-3 shadow-sm border border-stone-50 flex flex-col">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-stone-100 group">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-600">
                    {product.minAgeMonths}m+
                </div>
                </div>
                <div className="flex-1 flex flex-col">
                    <span className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">{product.category}</span>
                    <h3 className="text-stone-700 font-bold text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>
                    <div className="mt-auto flex justify-between items-center">
                        <span className="text-stone-800 font-bold">R$ {product.price.toFixed(2)}</span>
                        <button 
                            onClick={() => handleBuy(product.link)}
                            className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center shadow-lg hover:bg-rose-500 active:scale-95 transition-all"
                            title="Ver na loja"
                        >
                            <ExternalLink size={14} />
                        </button>
                    </div>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default BabyStore;