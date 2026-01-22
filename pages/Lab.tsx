
import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Bot, Image as ImageIcon, X, Heart, ShoppingBag, ShoppingCart, Loader2, FolderPlus } from 'lucide-react';
import { ClothingItem, SavedInspiration, InspirationFolder } from '../types';
import { askStylist, fileToGenerativePart } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  closet: ClothingItem[];
  saveInspiration: (insp: SavedInspiration) => void;
  savedInspirations: SavedInspiration[];
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  image?: string; // Base64 of attached image
}

const Lab: React.FC<Props> = ({ closet, saveInspiration, savedInspirations }) => {
  const [query, setQuery] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Shop Modal State
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [shopQuery, setShopQuery] = useState('');

  // Save/Folder Modal State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [contentToSave, setContentToSave] = useState<string | null>(null);

  // Initialize messages from localStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('sc_lab_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sc_lab_messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
        setMessages([
            { id: 'init', role: 'ai', content: t('lab.intro') }
        ]);
    }
  }, [t, messages.length]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const base64 = await fileToGenerativePart(e.target.files[0]);
          setAttachedImage(base64);
      }
  };

  const handleSend = async () => {
    if (!query.trim() && !attachedImage) return;

    const userMsg: Message = { 
        id: Date.now().toString(),
        role: 'user', 
        content: query,
        image: attachedImage || undefined
    };

    const currentImage = attachedImage; // Capture for API call
    const currentQuery = query;

    setQuery('');
    setAttachedImage(null); // Clear input immediately
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Pass image if exists to Gemini
    const response = await askStylist(closet, currentQuery || "What do you think about this?", currentImage || undefined, language);
    
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'ai', content: response }]);
    setLoading(false);
  };

  const initiateSave = (content: string) => {
      setContentToSave(content);
      setSaveModalOpen(true);
  };

  const confirmSave = (folder: InspirationFolder) => {
      if (!contentToSave) return;
      saveInspiration({
          id: Date.now().toString(),
          content: contentToSave,
          date: new Date().toISOString().split('T')[0],
          folder: folder
      });
      setSaveModalOpen(false);
      setContentToSave(null);
  };

  const isSaved = (content: string) => {
      return savedInspirations.some(insp => insp.content === content);
  };

  const handleShop = (content: string, userQuery?: string) => {
      let keyword = userQuery || "Fashion Item";
      if (!userQuery) {
          const aiIndex = messages.findIndex(m => m.content === content);
          if (aiIndex > 0 && messages[aiIndex-1].role === 'user') {
              keyword = messages[aiIndex-1].content;
          }
      }
      if (!keyword.trim()) keyword = "Style Match";

      setShopQuery(keyword);
      setBuyModalOpen(true);
  };

  const handlePlatformSelect = (platform: 'taobao' | 'jd') => {
    const encoded = encodeURIComponent(shopQuery.trim());
    let url = '';
    if (platform === 'taobao') {
        url = `https://s.taobao.com/search?q=${encoded}`;
    } else {
        url = `https://search.jd.com/Search?keyword=${encoded}`;
    }
    window.open(url, '_blank');
    setBuyModalOpen(false);
  };

  const clearChat = () => {
      if(window.confirm(t('detail.delete_confirm'))) {
          setMessages([{ id: 'init', role: 'ai', content: t('lab.intro') }]);
      }
  };

  return (
    <div className="flex flex-col h-screen pb-20 max-w-md mx-auto bg-gray-50">
      <header className="bg-white p-4 shadow-sm z-10 flex justify-between items-center">
         <h1 className="text-xl font-bold flex items-center gap-2">
           <Sparkles className="text-violet-600" />
           {t('lab.title')}
         </h1>
         <button onClick={clearChat} className="text-gray-400 hover:text-red-500">
             <X size={20} />
         </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-violet-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className="flex flex-col gap-1">
                  {msg.image && (
                      <div className={`rounded-xl overflow-hidden border border-gray-200 w-32 ${msg.role === 'user' ? 'self-end' : ''}`}>
                          <img src={`data:image/jpeg;base64,${msg.image}`} alt="attached" className="w-full h-auto" />
                      </div>
                  )}
                  {msg.content && (
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'}`}>
                        {msg.content}
                    </div>
                  )}

                  {/* AI Actions */}
                  {msg.role === 'ai' && msg.id !== 'init' && (
                      <div className="flex gap-2 mt-1 ml-1">
                          <button 
                            onClick={() => isSaved(msg.content) ? null : initiateSave(msg.content)}
                            className={`p-1.5 rounded-full flex items-center gap-1 text-xs font-medium transition-colors ${isSaved(msg.content) ? 'text-pink-500 bg-pink-50 cursor-default' : 'text-gray-400 hover:bg-gray-100'}`}
                          >
                              <Heart size={14} className={isSaved(msg.content) ? 'fill-pink-500' : ''} />
                              {isSaved(msg.content) ? t('lab.saved') : t('lab.save_inspiration')}
                          </button>
                          <button 
                             onClick={() => handleShop(msg.content)}
                             className="p-1.5 rounded-full flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          >
                              <ShoppingBag size={14} />
                              {t('lab.shop_look')}
                          </button>
                      </div>
                  )}
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
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                  <Loader2 size={16} className="animate-spin text-violet-600" />
                  <span className="text-xs text-gray-500 italic px-1">{t('lab.thinking')}</span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        {attachedImage && (
            <div className="mb-2 relative inline-block">
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={`data:image/jpeg;base64,${attachedImage}`} className="w-full h-full object-cover" alt="preview" />
                </div>
                <button 
                    onClick={() => setAttachedImage(null)}
                    className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5"
                >
                    <X size={12} />
                </button>
            </div>
        )}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-2xl">
          <input 
             type="file" 
             ref={fileInputRef}
             accept="image/*"
             className="hidden"
             onChange={handleImageSelect}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-violet-600 p-1"
          >
             <ImageIcon size={22} />
          </button>
          
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
            disabled={loading || (!query.trim() && !attachedImage)}
            className="text-white bg-violet-600 p-2 rounded-full disabled:bg-gray-300 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Buy Modal */}
      {buyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end animate-in fade-in duration-200">
           <div className="bg-white rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg">{t('action.select_platform')}</h3>
                 <button onClick={() => setBuyModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                    <X size={20} className="text-gray-500" />
                 </button>
              </div>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-xl">
                  <label className="text-xs text-gray-500 font-bold uppercase block mb-2">Searching for:</label>
                  <input 
                     className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-medium focus:border-violet-600 outline-none"
                     value={shopQuery}
                     onChange={(e) => setShopQuery(e.target.value)}
                  />
              </div>

              <div className="space-y-3">
                 <button 
                   onClick={() => handlePlatformSelect('taobao')}
                   className="w-full py-3.5 bg-[#FF5000] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                 >
                    <ShoppingCart size={18} />
                    {t('action.search_taobao')}
                 </button>
                 <button 
                   onClick={() => handlePlatformSelect('jd')}
                   className="w-full py-3.5 bg-[#E1251B] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                 >
                    <ShoppingBag size={18} />
                    {t('action.search_jd')}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Save to Folder Modal */}
      {saveModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-200 p-5">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">{t('lab.select_folder')}</h3>
                      <button onClick={() => setSaveModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="grid gap-3">
                      <button 
                          onClick={() => confirmSave('shopping')}
                          className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-violet-50 rounded-xl transition-colors text-left"
                      >
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-violet-600">
                              <ShoppingBag size={20} />
                          </div>
                          <span className="font-bold text-gray-700">{t('folder.shopping')}</span>
                      </button>
                      <button 
                          onClick={() => confirmSave('outfit')}
                          className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-pink-50 rounded-xl transition-colors text-left"
                      >
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-500">
                              <Heart size={20} />
                          </div>
                          <span className="font-bold text-gray-700">{t('folder.outfit')}</span>
                      </button>
                      <button 
                          onClick={() => confirmSave('chat')}
                          className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors text-left"
                      >
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
                              <FolderPlus size={20} />
                          </div>
                          <span className="font-bold text-gray-700">{t('folder.chat')}</span>
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Lab;
