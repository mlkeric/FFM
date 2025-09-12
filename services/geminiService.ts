
import { GoogleGenAI } from "@google/genai";
import type { Source } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const runQuery = async (query: string): Promise<{ text: string; sources: Source[] }> => {
  try {
    const model = "gemini-2.5-flash";

    // System instruction to guide the model's behavior
    const systemInstruction = `Você é um assistente virtual especialista no "Guia Prático de Fomento" da FFM (Fundação de Fomento e Apoio à Pesquisa de Minas Gerais). Sua única função é responder a perguntas baseadas no conteúdo do site ffm.br e seus documentos. O site contém páginas web (HTML) e documentos importantes em formato PDF, como o "Regimento Interno" e outros manuais. Dê prioridade às informações contidas nesses documentos PDF ao formular suas respostas. Seja preciso, objetivo e responda sempre em português do Brasil. Se a resposta não estiver no site ou nos documentos, informe que não encontrou a informação. Sempre liste as fontes de onde tirou a informação.`;

    // The user's query, now more specific about PDFs
    const contents = `Com base nas informações do site ffm.br e seus PDFs, responda à seguinte pergunta: "${query}"`;
    
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: Source[] = rawSources
      .map((chunk: any) => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || 'Fonte desconhecida',
      }))
      // Post-filter to ensure relevance to the specific domain
      .filter((source: Source) => source.uri && source.uri.includes('ffm.br'));

    // Deduplicate sources based on URI to avoid showing the same link multiple times
    const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());

    return { text, sources: uniqueSources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a more user-friendly error message
    if (error instanceof Error && error.message.includes('API key not valid')) {
         throw new Error("A chave de API configurada não é válida. Por favor, verifique.");
    }
    throw new Error("Não foi possível obter uma resposta do assistente. Tente novamente mais tarde.");
  }
};
