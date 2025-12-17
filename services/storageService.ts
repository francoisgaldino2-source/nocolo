
import { createClient } from '@supabase/supabase-js';
import { UserData, BabyProfile, LogEntry, Product, CommunityMessage, GrowthRecord } from '../types';
import { MOCK_PRODUCTS } from '../constants';

// Configuração do Supabase (Mesmas credenciais do arquivo api.ts original)
const supabaseUrl = 'https://prhwjgwpaprpptkcydri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaHdqZ3dwYXBycHB0a2N5ZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MjI1NzgsImV4cCI6MjA4MTQ5ODU3OH0.TrSabKmf1o_htaoihRGNgtuSXK6nmCsifasYm5QRBhA';

const supabase = createClient(supabaseUrl, supabaseKey);

export const storageService = {
  // Verifica conexão com o banco
  checkConnection: async (): Promise<{ online: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.from('app_users').select('count', { count: 'exact', head: true });
      if (error) throw error;
      return { online: true, message: "Conectado ao Supabase" };
    } catch (e: any) {
      console.error("Database Check Error:", e);
      return { online: false, message: "Erro de conexão" };
    }
  },

  // Gera um código único e cria o registro inicial no banco
  generateCode: async (): Promise<string> => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Insere no Supabase
    const { error } = await supabase
        .from('app_users')
        .insert([{ 
            code, 
            profile: null, 
            logs: [], 
            growth_records: [] 
        }]);

    if (error) {
        console.error("Erro ao gerar código:", error);
        throw new Error("Falha ao criar usuário no banco.");
    }
    
    return code;
  },

  // Busca todos os clientes (Para o Painel Admin)
  getAllClients: async () => {
    const { data, error } = await supabase
        .from('app_users')
        .select('*');
    
    if (error) return [];
    
    // Mapeia para formato amigável
    return data.map(row => ({
        code: row.code,
        createdAt: row.created_at,
        data: {
            profile: row.profile
        }
    }));
  },

  getProducts: (): Product[] => {
    return MOCK_PRODUCTS;
  },

  // Realiza Login buscando pelo código
  login: async (code?: string): Promise<UserData | null> => {
    if (!code) return null;

    try {
        const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('code', code)
            .single();

        if (error || !data) return null;

        // Parse dos dados vindos do banco
        return {
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
            messages: [], // Chat é carregado separadamente
            createdAt: data.created_at
        };
    } catch (e) {
        console.error("Login Error:", e);
        return null;
    }
  },

  // Salva dados do usuário
  saveUserData: async (code: string | null, data: Partial<UserData>) => {
    if (!code) return; // Não salva se não tiver código (modo local restrito)

    try {
        const updates: any = {};
        if (data.profile) updates.profile = data.profile;
        if (data.logs) updates.logs = data.logs;
        if (data.growthRecords) updates.growth_records = data.growthRecords;

        await supabase
            .from('app_users')
            .update(updates)
            .eq('code', code);
            
    } catch (e) {
        console.error("Save Error:", e);
    }
  },

  // --- CHAT COMUNITÁRIO ---

  getCommunityMessages: async (): Promise<CommunityMessage[]> => {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .order('timestamp', { ascending: true }) // Antigas primeiro (ordem cronológica de chat)
        .limit(50);

      if (error || !data) return [];

      return data.map((msg: any) => ({
          id: msg.id,
          authorName: msg.author_name,
          text: msg.text,
          timestamp: new Date(msg.timestamp),
          isUser: msg.is_user, // Nota: num app real, compararíamos ID do user. Aqui simplificamos.
          avatarColor: msg.avatar_color
      }));
  },

  addCommunityMessage: async (msg: CommunityMessage) => {
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
  }
};
