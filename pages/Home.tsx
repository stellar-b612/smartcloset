import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Loader2, Ruler, Weight, ChevronDown, ChevronUp } from 'lucide-react';
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

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen bg-gray-50">
      <header className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('home.greeting')}</h1>
          <p className="text-gray-500">{t('home.subtitle')}</p>
        </div>
        <div className="h-10 w-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
          <span className="font-bold text-sm">{user?.name?.slice(0,2).toUpperCase() || 'ME'}</span>
        </div>
      </header>
      
      {/* User Stats Card */}
      {user && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex justify-between items-center">
            <div className="flex flex-col items-center flex-1 border-r border-gray-100">
                <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('home.stats.height')}</span>
                <span className="text-lg font-bold text-gray-900">{user.height || '-'} <span className="text-xs font-normal text-gray-400">cm</span></span>
            </div>
             <div className="flex flex-col items-center flex-1 border-r border-gray-100">
                <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('home.stats.weight')}</span>
                <span className="text-lg font-bold text-gray-900">{user.weight || '-'} <span className="text-xs font-normal text-gray-400">kg</span></span>
            </div>
             <div className="flex flex-col items-center flex-1">
                <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('home.stats.size')}</span>
                <span className="text-lg font-bold text-gray-900">{user.size || '-'}</span>
            </div>
        </div>
      )}

      <WeatherWidget data={weather} />

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles size={18} className="text-violet-500" />
            {t('home.ai_pick')}
          </h2>
          <button 
            onClick={fetchRecommendation} 
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-violet-100 relative overflow-hidden transition-all duration-300 min-h-[120px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-8 text-gray-400">
               <Loader2 className="animate-spin mb-2" />
               <p className="text-sm">{t('home.consulting')}</p>
             </div>
          ) : (
            <div className="relative z-10">
              
              {/* 1. Visual Recommendation: Show items if available */}
              {recommendedItems.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                      {recommendedItems.map(item => (
                          <div key={item.id} className="min-w-[80px] w-[80px] h-[100px] rounded-lg overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-gray-50">
                              <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.description} />
                          </div>
                      ))}
                  </div>
              ) : (
                   /* Fallback if no specific items returned (e.g. error text only) */
                   !recommendation?.text && <p className="text-gray-400 text-sm">{t('home.no_clothes')}</p>
              )}

              {/* 2. Reasoning Text - Hidden by default if items exist, otherwise shown */}
              {(isExpanded || recommendedItems.length === 0) && (
                  <div className="prose prose-sm prose-violet animate-in fade-in slide-in-from-top-2 duration-300 mt-2">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {recommendation?.text || ''}
                    </p>
                  </div>
              )}
              
              {/* 3. Toggle Button - Only show if we have items (meaning content is hidden) */}
              {recommendedItems.length > 0 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 transition-colors uppercase tracking-wider"
                >
                  {isExpanded ? (
                    <>
                      {t('home.read_less')} <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      {t('home.read_more')} <ChevronDown size={14} />
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
        <h2 className="text-lg font-bold mb-4">{t('home.trending')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
           {closet.slice(0, 4).map(item => (
             <div key={item.id} className="min-w-[100px] h-[140px] rounded-lg overflow-hidden relative shadow-sm">
                <img src={item.imageUrl} className="w-full h-full object-cover" alt="trending" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-white text-[10px] truncate">{t(`closet.cat.${item.category.toLowerCase()}`)}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
