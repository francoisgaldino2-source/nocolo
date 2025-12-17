import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as credenciais fornecidas
const supabaseUrl = 'https://prhwjgwpaprpptkcydri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaHdqZ3dwYXBycHB0a2N5ZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MjI1NzgsImV4cCI6MjA4MTQ5ODU3OH0.TrSabKmf1o_htaoihRGNgtuSXK6nmCsifasYm5QRBhA';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function handler(event, context) {
  const { httpMethod, queryStringParameters, body } = event;
  const params = JSON.parse(body || '{}');

  console.log(`[API] Request: ${httpMethod} ${queryStringParameters.action}`);

  try {
    // --- LOGIN / GET USER ---
    if (httpMethod === 'POST' && queryStringParameters.action === 'login') {
      const { code } = params;
      
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('code', code)
        .single();
      
      if (error || !data) {
        return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }) };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data),
      };
    }

    // --- CREATE CODE (ADMIN) ---
    if (httpMethod === 'POST' && queryStringParameters.action === 'create_code') {
      const { code } = params;
      
      const { error } = await supabase
        .from('app_users')
        .insert([
          { code: code, profile: null, logs: [], growth_records: [] }
        ]);

      if (error) throw error;
      
      return { statusCode: 200, body: JSON.stringify({ success: true, code }) };
    }

    // --- SAVE USER DATA ---
    if (httpMethod === 'POST' && queryStringParameters.action === 'save_data') {
      const { code, data } = params;
      
      // Monta o objeto de atualização dinamicamente
      const updates: any = {};
      // No Supabase, enviamos o objeto JSON direto, não stringificado
      if (data.profile) updates.profile = data.profile;
      if (data.logs) updates.logs = data.logs;
      if (data.growthRecords) updates.growth_records = data.growthRecords;

      const { error } = await supabase
        .from('app_users')
        .update(updates)
        .eq('code', code);

      if (error) throw error;
      
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    // --- GET COMMUNITY MESSAGES ---
    if (httpMethod === 'GET' && queryStringParameters.action === 'get_messages') {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .order('timestamp', { ascending: true }) // Mais antigas primeiro para o chat
        .limit(50);

      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify(data) };
    }

    // --- ADD MESSAGE ---
    if (httpMethod === 'POST' && queryStringParameters.action === 'add_message') {
      const { id, authorName, text, timestamp, isUser, avatarColor } = params;
      
      const { error } = await supabase
        .from('community_messages')
        .insert([{
          id,
          author_name: authorName,
          text,
          timestamp,
          is_user: isUser,
          avatar_color: avatarColor
        }]);

      if (error) throw error;
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
    
    // --- LIST CLIENTS (ADMIN) ---
    if (httpMethod === 'GET' && queryStringParameters.action === 'list_clients') {
      const { data, error } = await supabase
        .from('app_users')
        .select('code, profile');

      if (error) throw error;

      // Mantemos o formato que o frontend espera
      const formatted = data.map(row => ({
        code: row.code,
        data: { profile: row.profile }
      }));
      
      return { statusCode: 200, body: JSON.stringify(formatted) };
    }

    return { statusCode: 400, body: "Action not supported" };

  } catch (error) {
    console.error("Supabase Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, detail: JSON.stringify(error) }),
    };
  }
}