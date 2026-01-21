import React, { useState, useEffect } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { ClothingItem } from '../types';
import { askStylist } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  closet: ClothingItem[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const Lab: React.FC<Props> = ({ closet }) => {
  const [query, setQuery] = useState('');
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Initialize messages from localStorage or default to empty
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('sc_lab_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sc_lab_messages', JSON.stringify(messages));
  }, [messages]);

  // Only add intro if messages are completely empty (first time use)
  useEffect(() => {
    if (messages.length === 0) {
        setMessages([
            { role: 'ai', content: t('lab.intro') }
        ]);
    }
    // We do NOT want to reset this when language changes, to preserve history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const response = await askStylist(closet, userMsg, language);
    
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen pb-20 max-w-md mx-auto bg-gray-50">
      <header className="bg-white p-4 shadow-sm z-10">
         <h1 className="text-xl font-bold flex items-center gap-2">
           <Sparkles className="text-violet-600" />
           {t('lab.title')}
         </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-violet-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                  <span className="text-xs text-gray-500 italic px-1">{t('lab.thinking')}</span>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
          <input 
            type="text" 
            placeholder={t('lab.placeholder')}
            className="flex-1 bg-transparent border-none outline-none text-sm py-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !query.trim()}
            className="text-violet-600 font-bold disabled:text-gray-400"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lab;
