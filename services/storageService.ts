import { UserData, BabyProfile, LogEntry, Product, CommunityMessage, GrowthRecord } from '../types';
import { MOCK_PRODUCTS } from '../constants';
import { createClient } from '@supabase/supabase-js';

// Configuração Direta do Supabase (Frontend)
const SUPABASE_URL = 'https://prhwjgwpaprpptkcydri.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaHdqZ3dwYXBycHB0a2N5ZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MjI1NzgsImV4cCI6MjA4MTQ5ODU3OH0.TrSabKmf1o_htaoihRGNgtuSXK6nmCsifasYm5QRBhA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const getLocal = (key: string) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
};

const setLocal = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) { console.error("Erro ao salvar local", e); }
};

export const storageService = {
  checkConnection: async (): Promise<{ online: boolean; message: string }> => {
    try {
        const start = Date.now();
        const { error } = await supabase.from('app_users').select('code').limit(1);
        const duration = Date.now() - start;
        if (error) throw error;
        return { online: true, message: `Conectado ao Supabase (${duration}ms)` };
    } catch (e: any) {
        return { online: false, message: "Modo Offline ou Erro de Conexão" };
    }
  },

  generateCode: async (): Promise<string> => {
    const code = 'NH-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    try {
        const { error } = await supabase
            .from('app_users')
            .insert([{ code, profile: null, logs: [], growth_records: [] }]);
        if (error) throw error;
    } catch (e) {
        console.warn("Offline mode: Code generated locally only");
    }
    return code;
  },

  getAllClients: async () => {
    try {
        const { data, error } = await supabase
            .from('app_users')
            .select('code, profile, created_at');

        if (error) throw error;

        return data.map((row: any) => ({
            code: row.code,
            data: { profile: row.profile },
            createdAt: row.created_at
        }));
    } catch (e) {
        return [];
    }
  },

  getProducts: (): Product[] => {
    return MOCK_PRODUCTS;
  },

  login: async (code: string): Promise<UserData | null> => {
    let remoteData = null;
    const localKey = `ninho_data_${code}`;

    try {
        const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('code', code)
            .single();

        if (!error && data) {
            remoteData = {
                profile: data.profile ? {
                    ...data.profile,
                    birthDate: new Date(data.profile.birthDate)
                } : null,
                logs: (data.logs || []).map((l: any) => ({
                    ...l,
                    timestamp: new Date(l.timestamp),
                    endTime: l.endTime ? new Date(l.endTime) : undefined
                })),
                growthRecords: (data.growth_records || []).map((r: any) => ({
                    ...r,
                    date: new Date(r.date)
                })),
                messages: [],
                createdAt: data.created_at
            };
            setLocal(localKey, remoteData);
        }
    } catch (e) {
        console.warn("Offline, buscando cache...");
    }

    if (!remoteData) {
        const localData = getLocal(localKey);
        if (localData) {
            return {
                ...localData,
                profile: localData.profile ? {
                    ...localData.profile,
                    birthDate: new Date(localData.profile.birthDate)
                } : null,
                logs: (localData.logs || []).map((l: any) => ({
                    ...l,
                    timestamp: new Date(l.timestamp),
                    endTime: l.endTime ? new Date(l.endTime) : undefined
                })),
                growthRecords: (localData.growthRecords || []).map((r: any) => ({
                    ...r,
                    date: new Date(r.date)
                })),
            };
        }
    }
    return remoteData;
  },

  saveUserData: async (code: string, data: Partial<UserData>) => {
    const localKey = `ninho_data_${code}`;
    const currentLocal = getLocal(localKey) || {};
    const updatedLocal = { ...currentLocal, ...data };
    setLocal(localKey, updatedLocal);

    try {
        const updates: any = {};
        if (data.profile) updates.profile = data.profile;
        if (data.logs) updates.logs = data.logs;
        if (data.growthRecords) updates.growth_records = data.growthRecords;

        if (Object.keys(updates).length > 0) {
            await supabase
                .from('app_users')
                .update(updates)
                .eq('code', code);
        }
    } catch (e) {
        console.warn("Sync pendente (offline)");
    }
  },

  getCommunityMessages: async (): Promise<CommunityMessage[]> => {
      try {
        // Calcula a data de 24 horas atrás
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('community_messages')
            .select('*')
            .gt('timestamp', oneDayAgo) // Filtra mensagens maiores que (mais recentes que) 24h atrás
            .order('timestamp', { ascending: true })
            .limit(50);
            
        if (error) throw error;
        return (data || []).map((row: any) => ({
            id: row.id,
            authorName: row.author_name,
            text: row.text,
            timestamp: new Date(row.timestamp),
            isUser: row.is_user,
            avatarColor: row.avatar_color
        }));
      } catch (e) { return []; }
  },

  addCommunityMessage: async (msg: CommunityMessage) => {
      try {
          await supabase
            .from('community_messages')
            .insert([{
                id: msg.id,
                author_name: msg.authorName,
                text: msg.text,
                timestamp: msg.timestamp,
                is_user: msg.isUser,
                avatar_color: msg.avatarColor
            }]);
      } catch (e) { console.error(e); }
  }
};
