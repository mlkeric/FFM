import React, { useState } from 'react';
import Chat from './components/Chat.tsx';
import { ShareIcon } from './components/icons.tsx';
import type { Message } from './types.ts';
import { runQuery } from './services/geminiService.ts';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'bot',
      text: 'Olá! Sou o assistente virtual do Guia Prático de Orientações da Fundação Faculdade de Medicina. Como posso ajudar?',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await runQuery(trimmedInput);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: text,
        sources: sources,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
       const botErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: errorMessage,
      };
      setMessages((prev) => [...prev, botErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const chatHistory = messages.map(msg => {
      let history = '';
      if (msg.sender === 'bot') {
        history += `Assistente: ${msg.text}`;
        if (msg.sources && msg.sources.length > 0) {
          history += '\nFontes:\n';
          msg.sources.forEach(source => {
            history += `- ${source.title || source.uri} (${source.uri})\n`;
          });
        }
      } else {
        history += `Você: ${msg.text}`;
      }
      return history;
    }).join('\n\n');

    navigator.clipboard.writeText(chatHistory).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5]">
      <header className="w-full bg-white shadow-md z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <img 
                    src="https://ffm.br/ffm/conteudo/MARCAFFM_PRGB-v3.png" 
                    alt="FFM Logo" 
                    className="h-12"
                />
                <div className="border-l border-gray-300 h-10"></div>
                <h1 className="text-xl md:text-2xl font-bold text-[#004b87]">
                    Assistente Virtual - Guia Prático
                </h1>
            </div>
             <div className="relative">
                <button 
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#004b87] bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Compartilhar conversa"
                    disabled={messages.length <= 1}
                >
                    <ShareIcon className="h-5 w-5" />
                    <span>Compartilhar</span>
                </button>
                {isCopied && (
                    <div 
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-md shadow-lg"
                        role="status"
                    >
                        Copiado para a área de transferência!
                    </div>
                )}
            </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 flex flex-col">
        <Chat 
            messages={messages}
            userInput={userInput}
            isLoading={isLoading}
            setUserInput={setUserInput}
            handleSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;