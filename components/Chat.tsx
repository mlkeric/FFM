import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';
import { SendIcon, LinkIcon } from './icons';

interface ChatProps {
  messages: Message[];
  userInput: string;
  isLoading: boolean;
  setUserInput: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  userInput,
  isLoading,
  setUserInput,
  handleSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col flex-grow bg-white rounded-lg shadow-xl overflow-hidden h-full">
      <div className="flex-grow p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-xl p-4 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-[#00a9e0] text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
               {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <h4 className="text-sm font-bold text-gray-600 mb-2">Fontes:</h4>
                  <div className="flex flex-col space-y-1">
                    {msg.sources.map((source, index) => (
                      <a
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-sm text-[#004b87] hover:underline"
                      >
                        <LinkIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{source.title || source.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-4">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 bg-[#004b87] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-[#004b87] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-[#004b87] rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Digite sua pergunta aqui..."
            className="flex-grow w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#00a9e0]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-[#004b87] text-white p-3 rounded-full hover:bg-[#003a6a] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
            aria-label="Enviar mensagem"
          >
            <SendIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
