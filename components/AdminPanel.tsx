
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Users, Plus, LogOut, Copy, Check, Loader2, Database, Wifi, WifiOff } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

const AdminPanel: React.FC<Props> = ({ onLogout }) => {
  const [tab, setTab] = useState<'USERS'>('USERS');
  const [clients, setClients] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ online: boolean; message: string } | null>(null);

  useEffect(() => {
    checkHealth();
    loadData();
  }, []);

  const checkHealth = async () => {
    const status = await storageService.checkConnection();
    setDbStatus(status);
  };

  const loadData = async () => {
    setLoading(true);
    const data = await storageService.getAllClients();
    setClients(data);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    await storageService.generateCode();
    await loadData();
    setLoading(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-200 p-6 animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          Painel Adm
        </h1>
        <button onClick={onLogout} className="text-stone-400 hover:text-white flex items-center gap-1 text-xs">
          <LogOut size={14} /> Sair
        </button>
      </div>

      <div className={`rounded-xl p-3 mb-6 border flex items-center justify-between ${
          dbStatus?.online ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-rose-900/30 border-rose-500/30 text-rose-400'
      }`}>
          <div className="flex items-center gap-3">
              {dbStatus ? (dbStatus.online ? <Database size={18} /> : <WifiOff size={18} />) : <Loader2 size={18} className="animate-spin" />}
              <div>
                  <p className="text-xs font-bold uppercase tracking-wider">Status do Banco</p>
                  <p className="text-sm font-semibold">{dbStatus?.message || 'Verificando...'}</p>
              </div>
          </div>
          <button onClick={checkHealth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Loader2 size={16} className={!dbStatus ? "animate-spin" : ""} />
          </button>
      </div>

      <div className="flex bg-stone-800 rounded-xl p-1 mb-6">
          <button className="flex-1 py-3 rounded-lg text-sm font-bold bg-stone-700 text-white shadow-sm flex items-center justify-center gap-2">
            <Users size={16} /> Clientes
          </button>
      </div>

      {tab === 'USERS' && (
        <>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                    <span className="text-stone-400 text-[10px] uppercase font-bold">Total Clientes</span>
                    <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : clients.length}</p>
                </div>
                <div className="bg-stone-800 p-4 rounded-2xl border border-stone-700">
                    <span className="text-stone-400 text-[10px] uppercase font-bold">Ativos</span>
                    <p className="text-2xl font-bold text-sage-400 mt-1">{loading ? '...' : clients.filter(c => c.data.profile).length}</p>
                </div>
            </div>

            <button onClick={handleGenerate} disabled={loading} className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold mb-8 flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20 active:scale-95 transition-all disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                Gerar Novo Código (Manual)
            </button>

            <div className="space-y-3">
                {clients.slice().reverse().map((client) => (
                <div key={client.code} className="bg-stone-800 p-4 rounded-2xl flex flex-col gap-2 border border-stone-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-yellow-400 tracking-wider">{client.code}</span>
                            <button onClick={() => copyToClipboard(client.code)} className="p-1 hover:bg-stone-700 rounded-md transition-colors">
                                {copied === client.code ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-stone-500" />}
                            </button>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${client.data.profile ? 'bg-sage-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-stone-600'}`} />
                    </div>
                    
                    <div className="flex flex-col gap-1 pl-1">
                        <p className="text-sm font-bold text-stone-300">
                            {client.data.profile ? client.data.profile.name : 'Sem cadastro'}
                        </p>
                        <p className="text-[10px] text-stone-600 mt-1">
                            Criado em: {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Desconhecido'}
                        </p>
                    </div>
                </div>
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
