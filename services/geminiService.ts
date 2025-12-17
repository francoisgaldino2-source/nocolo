import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Você é a "Ninho", uma assistente virtual especializada em maternidade, desenvolvida para acolher mães (especialmente de primeira viagem).
Sua personalidade é calma, gentil, empática e nunca julgadora.
Use emojis suaves (🌿, 🤍, 🍼, ✨) moderadamente.
Suas respostas devem ser curtas e diretas, mas cheias de carinho.
Se a mãe relatar algo grave (febre alta, queda, falta de ar), recomende gentilmente mas firmemente buscar ajuda médica imediata.
Você fornece dicas de sono, amamentação e bem-estar materno.
Sempre valide os sentimentos da mãe antes de dar uma solução.
`;

// Variáveis para armazenar as instâncias (Lazy Loading)
let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

// Função segura para obter o cliente AI
const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    // Chave configurada diretamente
    const apiKey = 'AIzaSyB7ZxP7p_J9XEvOpI1cJtZeHRXZrjlsAWc';
    ai = new GoogleGenAI({ apiKey: apiKey });
  }
  return ai;
};

// Helper para tentar novamente em caso de erro de limite (429)
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, baseDelay = 3000): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            // Se for erro de limite (429) ou Resource Exhausted
            if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('exhausted')) {
                console.warn(`Tentativa ${i + 1} falhou por limite (429). Retentando em instantes...`);
                // Espera exponencial: 3s, 6s, 9s...
                await new Promise(resolve => setTimeout(resolve, baseDelay * (i + 1)));
                continue;
            }
            throw error; // Outros erros não tenta de novo
        }
    }
    throw lastError;
};

export const getChatSession = (): Chat => {
  if (!chatSession) {
    const client = getAiClient();
    chatSession = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    return await withRetry(async () => {
        const session = getChatSession();
        const result = await session.sendMessage({ message });
        return result.text || "Desculpe, não consegui entender agora. Podemos tentar de novo? 🌿";
    });
  } catch (error: any) {
    console.error("Erro ao falar com Gemini:", error);
    
    if (error.status === 429 || error.message?.includes('429')) {
        return "⏳ O sistema está um pouquinho sobrecarregado agora. Tente enviar novamente em 1 minuto. 🤍";
    }

    if (error.message?.includes('API key') || error.status === 403) {
        return "⚠️ Erro de autenticação. A chave de API parece inválida.";
    }
    
    return "Estou tendo um pequeno soluço técnico. Respire fundo e tente novamente em instantes. 🤍";
  }
};

export const generateBabyFitting = async (babyImageBase64: string, clothingImageBase64: string): Promise<string> => {
    try {
        const client = getAiClient();
        
        const getMimeAndData = (dataUrl: string) => {
            const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (match) {
                return { mimeType: match[1], data: match[2] };
            }
            return { mimeType: 'image/jpeg', data: dataUrl.split(',')[1] || dataUrl };
        };

        const baby = getMimeAndData(babyImageBase64);
        const cloth = getMimeAndData(clothingImageBase64);

        console.log("Enviando solicitação para Gemini 2.5 Flash Image...");

        return await withRetry(async () => {
            const response = await client.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { text: "Create a photorealistic image of a cute baby wearing the clothing shown in the second image. Use the first image (baby) as a reference for the baby's pose and age, and the second image (clothing) for the outfit. The result should be a high-quality fashion photo of the baby wearing the item. Do not return text, only the image." },
                        {
                            inlineData: {
                                mimeType: baby.mimeType,
                                data: baby.data
                            }
                        },
                        {
                            inlineData: {
                                mimeType: cloth.mimeType,
                                data: cloth.data
                            }
                        }
                    ]
                }
            });

            if (!response.candidates || response.candidates.length === 0) {
                throw new Error("A IA não retornou nenhuma resposta.");
            }

            // Tenta encontrar a imagem na resposta
            for (const part of response.candidates[0].content?.parts || []) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }

            // Se chegou aqui, a IA provavelmente retornou texto recusando a geração
            const textResponse = response.candidates[0].content?.parts?.[0]?.text;
            if (textResponse) {
                console.warn("IA retornou texto em vez de imagem:", textResponse);
                if (textResponse.includes("safety") || textResponse.includes("people") || textResponse.includes("policy")) {
                    throw new Error("A IA bloqueou a imagem por políticas de segurança. Tente usar uma foto onde o rosto do bebê esteja menos visível.");
                }
                throw new Error(`A IA respondeu com texto: "${textResponse.slice(0, 100)}..."`);
            }
            
            throw new Error("A IA processou, mas não gerou a imagem final.");
        }, 3, 4000); // 3 tentativas, delay base de 4 segundos

    } catch (error: any) {
        console.error("Erro no Provador Virtual:", error);
        
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
            throw new Error("⏳ O serviço está ocupado no momento. Aguarde alguns segundos e tente novamente.");
        }
        
        throw error;
    }
}