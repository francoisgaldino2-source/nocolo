
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Você é a "Ninho", uma assistente virtual especializada em maternidade, desenvolvida para acolher mães (especialmente de primeira viagem).
Sua personalidade é calma, gentil, empática e nunca julgadora.
Use emojis suaves (🌿, 🤍, 🍼, ✨) moderadamente.
Suas respostas devem ser curtas e diretas, mas cheias de carinho.
Se a mãe relatar algo grave (febre alta, queda, falta de ar), recomende gentilmente mas firmemente buscar ajuda médica imediata.
Você fornece dicas de sono, amamentação e bem-estar materno.
Sempre valide os sentimentos da mãe antes de dar uma solução.
`;

// Inicialização centralizada seguindo as diretrizes
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Helper para tentativas em caso de limite de cota
const withRetry = async <T>(fn: () => Promise<T>, retries = 2, baseDelay = 2000): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            if (error.status === 429 || error.message?.includes('429')) {
                await new Promise(resolve => setTimeout(resolve, baseDelay * (i + 1)));
                continue;
            }
            throw error;
        }
    }
    throw lastError;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "Desculpe, não consegui entender agora. Podemos tentar de novo? 🌿";
  } catch (error: any) {
    console.error("Erro ao falar com Gemini:", error);
    if (error.status === 429) {
        return "⏳ O sistema está descansando um pouquinho. Tente novamente em um minuto. 🤍";
    }
    return "Estou tendo um pequeno soluço técnico. Respire fundo e tente novamente em instantes. 🤍";
  }
};

export const generateBabyFitting = async (babyImageBase64: string, clothingImageBase64: string): Promise<string> => {
    try {
        const ai = getAiClient();
        
        const getMimeAndData = (dataUrl: string) => {
            const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            return match ? { mimeType: match[1], data: match[2] } : { mimeType: 'image/jpeg', data: dataUrl.split(',')[1] || dataUrl };
        };

        const baby = getMimeAndData(babyImageBase64);
        const cloth = getMimeAndData(clothingImageBase64);

        const response = await withRetry(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { text: "Crie uma imagem fotorrealista de um bebê usando a roupa mostrada na segunda imagem. Use a primeira imagem como referência de pose e idade. O resultado deve ser apenas a imagem final, sem texto." },
                        { inlineData: { mimeType: baby.mimeType, data: baby.data } },
                        { inlineData: { mimeType: cloth.mimeType, data: cloth.data } }
                    ]
                }
            });
        });

        if (!response.candidates?.[0]?.content?.parts) {
            throw new Error("Não foi possível gerar a imagem agora.");
        }

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }

        throw new Error("A IA não gerou uma imagem válida.");

    } catch (error: any) {
        console.error("Erro no Provador Virtual:", error);
        if (error.message?.includes('safety')) {
            throw new Error("Não conseguimos processar esta imagem por motivos de segurança. Tente outra foto.");
        }
        throw new Error("O serviço de imagem está instável. Tente novamente em breve.");
    }
};
