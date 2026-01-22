
import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Loader2, ChevronDown, ChevronUp, ShoppingBag, ExternalLink, X, ShoppingCart } from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';
import { ClothingItem, WeatherData } from '../types';
import { generateDailyOutfit } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  weather: WeatherData;
  closet: ClothingItem[];
}

interface RecommendationData {
    itemIds: string[];
    text: string;
}

const Home: React.FC<Props> = ({ weather, closet }) => {
  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  // Shopping State
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedBuyItem, setSelectedBuyItem] = useState<ClothingItem | null>(null);

  const fetchRecommendation = async () => {
    if (closet.length === 0) return;
    setLoading(true);
    setIsExpanded(false); // Reset expansion on new fetch
    const result = await generateDailyOutfit(closet, weather, language);
    setRecommendation(result);
    setLoading(false);
  };

  useEffect(() => {
    if (closet.length > 0) {
       fetchRecommendation();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closet, language]); 

  const recommendedItems = recommendation?.itemIds
    .map(id => closet.find(c => c.id === id))
    .filter(Boolean) as ClothingItem[] || [];

  const handleBuyClick = (e: React.MouseEvent, item: ClothingItem) => {
    e.stopPropagation();
    setSelectedBuyItem(item);
    setBuyModalOpen(true);
  };

  const handlePlatformSelect = (platform: 'taobao' | 'jd') => {
    if (!selectedBuyItem) return;

    const keywords = `${selectedBuyItem.brand || ''} ${selectedBuyItem.color} ${selectedBuyItem.description} ${t(`closet.cat.${selectedBuyItem.category.toLowerCase()}`)}`;
    const encoded = encodeURIComponent(keywords.trim());
    
    let url = '';
    if (platform === 'taobao') {
        url = `https://s.taobao.com/search?q=${encoded}`;
    } else {
        url = `https://search.jd.com/Search?keyword=${encoded}`;
    }
    
    window.open(url, '_blank');
    setBuyModalOpen(false);
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen bg-gray-50 relative">
      <header className="flex justify-between items-center mb-4 pt-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('home.greeting')}</h1>
          <p className="text-sm text-gray-500">{t('home.subtitle')}</p>
        </div>
        <div className="h-9 w-9 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
          <span className="font-bold text-xs">{user?.name?.slice(0,2).toUpperCase() || 'ME'}</span>
        </div>
      </header>
      
      {/* User Stats Card - Compact */}
      {user && (
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-4 flex justify-between items-center">
            <div className="flex flex-col items-center flex-1 border-r border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">{t('home.stats.height')}</span>
                <span className="text-sm font-bold text-gray-900">{user.height || '-'}</span>
            </div>
             <div className="flex flex-col items-center flex-1 border-r border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">{t('home.stats.weight')}</span>
                <span className="text-sm font-bold text-gray-900">{user.weight || '-'}</span>
            </div>
             <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">{t('home.stats.size')}</span>
                <span className="text-sm font-bold text-gray-900">{user.size || '-'}</span>
            </div>
        </div>
      )}

      <WeatherWidget data={weather} />

      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Sparkles size={16} className="text-violet-500" />
            {t('home.ai_pick')}
          </h2>
          <button 
            onClick={fetchRecommendation} 
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white p-3 rounded-2xl shadow-sm border border-violet-100 relative overflow-hidden transition-all duration-300 min-h-[120px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12 text-gray-400">
               <Loader2 className="animate-spin mb-2" />
               <p className="text-sm">{t('home.consulting')}</p>
             </div>
          ) : (
            <div className="relative z-10">
              
              {/* 1. Visual Recommendation: Collage Grid */}
              {recommendedItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {recommendedItems.map((item, idx) => {
                          // Simple grid logic: If 3 items, make the first one take full width to look like a collage
                          const isFullWidth = recommendedItems.length === 3 && idx === 0;
                          return (
                            <div 
                                key={item.id} 
                                className={`relative rounded-lg overflow-hidden bg-gray-50 shadow-sm border border-gray-100 group ${isFullWidth ? 'col-span-2 aspect-[2.5/1]' : 'aspect-[4/5]'}`}
                            >
                                <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.description} />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-[10px] truncate text-center font-medium">
                                        {t(`closet.cat.${item.category.toLowerCase()}`)}
                                    </p>
                                </div>
                                {/* Buy Button Overlay */}
                                <button 
                                  onClick={(e) => handleBuyClick(e, item)}
                                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-gray-800 shadow-sm hover:bg-white hover:text-violet-600 transition-colors"
                                >
                                  <ShoppingBag size={14} />
                                </button>
                            </div>
                          );
                      })}
                  </div>
              ) : (
                   !recommendation?.text && <p className="text-gray-400 text-sm py-4">{t('home.no_clothes')}</p>
              )}

              {/* 2. Reasoning Text */}
              {(isExpanded || recommendedItems.length === 0) && (
                  <div className="bg-violet-50/50 p-3 rounded-xl border border-violet-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-line">
                      {recommendation?.text || ''}
                    </p>
                  </div>
              )}
              
              {/* 3. Toggle Button */}
              {recommendedItems.length > 0 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full mt-1 py-1.5 flex items-center justify-center gap-1 text-[10px] font-bold text-violet-600 hover:bg-violet-50 rounded-lg transition-colors uppercase tracking-wider"
                >
                  {isExpanded ? (
                    <>
                      {t('home.read_less')} <ChevronUp size={12} />
                    </>
                  ) : (
                    <>
                      {t('home.read_more')} <ChevronDown size={12} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
          
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-50 rounded-full opacity-50 blur-xl pointer-events-none"></div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold mb-3">{t('home.trending')}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
           {closet.slice(0, 4).map(item => (
             <div key={item.id} className="min-w-[90px] h-[120px] rounded-lg overflow-hidden relative shadow-sm group">
                <img src={item.imageUrl} className="w-full h-full object-cover" alt="trending" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                  <p className="text-white text-[10px] truncate">{t(`closet.cat.${item.category.toLowerCase()}`)}</p>
                </div>
             </div>
           ))}
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
              
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {selectedBuyItem && <img src={selectedBuyItem.imageUrl} className="w-full h-full object-cover" alt="" />}
                 </div>
                 <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-2">{selectedBuyItem?.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('action.buy_similar')}</p>
                 </div>
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
                 <button 
                   onClick={() => setBuyModalOpen(false)}
                   className="w-full py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold mt-2"
                 >
                    {t('action.cancel')}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
