import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Upload, Link as LinkIcon, X, Loader2, Camera, Check, ArrowRight } from 'lucide-react';
import { ClothingItem, Category, SavedOutfit, Season } from '../types';
import ClothingCard from '../components/ClothingCard';
import { analyzeClothingImage, fileToGenerativePart } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  closet: ClothingItem[];
  outfits: SavedOutfit[];
  addItem: (item: ClothingItem) => void;
  addOutfit: (outfit: SavedOutfit) => void;
}

const Closet: React.FC<Props> = ({ closet, outfits, addItem, addOutfit }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'items' | 'outfits'>('items');
  const [filter, setFilter] = useState<string>('All');
  
  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isCreateOutfitModalOpen, setIsCreateOutfitModalOpen] = useState(false);

  // Add Item State
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Outfit State
  const [newOutfitName, setNewOutfitName] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const { t, language } = useLanguage();

  const categories = ['All', ...Object.values(Category)];

  // --- Helpers for Filtering ---
  const filteredCloset = filter === 'All' 
    ? closet 
    : closet.filter(item => item.category === filter);

  // --- Add Item Logic ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      const b64 = await fileToGenerativePart(file);
      setImageBase64(b64);
      setShowLinkInput(false);
    }
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          // remove data:image/...;base64,
          const base64 = res.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn("Image fetch failed (likely CORS). AI analysis will be skipped.", error);
      throw error;
    }
  };

  const handleLinkSubmit = async () => {
    if (!linkInput.trim()) return;
    
    setUploadLoading(true);
    setPreviewUrl(linkInput);
    
    // Try to convert to base64 for AI analysis
    try {
        const base64 = await urlToBase64(linkInput);
        setImageBase64(base64);
    } catch (e) {
        // If CORS fails, we still keep the previewUrl but imageBase64 remains null
        // We will handle this gracefully in handleAnalyzeAndSave
        setImageBase64(null);
    }
    
    setUploadLoading(false);
    setShowLinkInput(false);
  };

  const handleAnalyzeAndSave = async () => {
    if (!previewUrl) return;

    setUploadLoading(true);
    try {
      let analysis: Partial<ClothingItem> = {};
      
      if (imageBase64) {
         analysis = await analyzeClothingImage(imageBase64, language);
      } else {
         // Manual defaults for CORS images where we can't get base64
         analysis = {
            description: t('closet.new_item_manual'),
            category: Category.TOP,
            color: 'Unknown',
            season: Season.ALL
         };
      }

      const newItem: ClothingItem = {
        id: Date.now().toString(),
        imageUrl: previewUrl,
        wearCount: 0,
        category: analysis.category || Category.TOP,
        color: analysis.color || 'Unknown',
        season: analysis.season || 'All Year',
        description: analysis.description || 'New Item',
        ...analysis
      } as ClothingItem;

      addItem(newItem);
      closeAddItemModal();
    } catch (err) {
      alert(t('error.analysis_failed'));
    } finally {
      setUploadLoading(false);
    }
  };

  const closeAddItemModal = () => {
    setIsAddItemModalOpen(false);
    setPreviewUrl(null);
    setImageBase64(null);
    setShowLinkInput(false);
    setLinkInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Create Outfit Logic ---
  const toggleItemSelection = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSaveOutfit = () => {
    if (!newOutfitName.trim() || selectedItemIds.length === 0) return;

    const newOutfit: SavedOutfit = {
      id: Date.now().toString(),
      name: newOutfitName,
      itemIds: selectedItemIds
    };
    addOutfit(newOutfit);
    closeCreateOutfitModal();
  };

  const closeCreateOutfitModal = () => {
    setIsCreateOutfitModalOpen(false);
    setNewOutfitName('');
    setSelectedItemIds([]);
  };

  // --- Render Helpers ---
  const getOutfitImages = (ids: string[]) => {
    return ids.map(id => closet.find(c => c.id === id)).filter(Boolean) as ClothingItem[];
  };

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 pt-2 pb-2 shadow-sm -mx-4 px-4 mb-4">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('closet.title')}</h1>
          <button 
            onClick={() => activeTab === 'items' ? setIsAddItemModalOpen(true) : setIsCreateOutfitModalOpen(true)}
            className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={24} />
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
          <button 
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'items' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
          >
            {t('closet.tab.items')}
          </button>
          <button 
            onClick={() => setActiveTab('outfits')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'outfits' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
          >
            {t('closet.tab.outfits')}
          </button>
        </div>

        {/* Categories Scroller (Only for Items) */}
        {activeTab === 'items' && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === cat 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(`closet.cat.${cat.toLowerCase()}`)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- Items View --- */}
      {activeTab === 'items' && (
        <div className="grid grid-cols-2 gap-4 mt-2 animate-in fade-in duration-300">
          {filteredCloset.map(item => (
            <ClothingCard 
              key={item.id} 
              item={item} 
              onClick={() => navigate(`/item/${item.id}`)}
            />
          ))}
          {filteredCloset.length === 0 && (
            <div className="col-span-2 text-center py-20 text-gray-400">
              <p>{t('closet.no_items')}</p>
            </div>
          )}
        </div>
      )}

      {/* --- Outfits View --- */}
      {activeTab === 'outfits' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {outfits.map(outfit => {
            const items = getOutfitImages(outfit.itemIds);
            return (
              <div 
                key={outfit.id} 
                onClick={() => navigate(`/outfit/${outfit.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-all"
              >
                {/* Image Grid */}
                <div className="aspect-[4/3] bg-gray-50 grid grid-cols-2 gap-0.5 relative">
                  {items.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="relative overflow-hidden bg-white">
                      <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                  {/* Overlay name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold text-lg">{outfit.name}</h3>
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center text-sm text-gray-500">
                   <span>{items.length} items</span>
                   <div className="flex -space-x-2">
                     {items.slice(0, 3).map((item, i) => (
                       <div key={i} className="w-6 h-6 rounded-full border border-white overflow-hidden bg-gray-200">
                         <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            );
          })}
          
          {outfits.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>{t('closet.no_outfits')}</p>
            </div>
          )}
        </div>
      )}

      {/* --- Add Item Modal --- */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">{t('closet.add_item')}</h3>
              <button onClick={closeAddItemModal} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {!previewUrl ? (
                <>
                  {showLinkInput ? (
                      <div className="space-y-4">
                           <div className="flex flex-col gap-2">
                              <label className="text-sm font-medium text-gray-700">{t('closet.enter_url')}</label>
                              <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-600"
                                    placeholder="https://..."
                                    value={linkInput}
                                    onChange={(e) => setLinkInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
                                  />
                                  <button 
                                    onClick={handleLinkSubmit}
                                    disabled={uploadLoading}
                                    className="bg-black text-white rounded-lg px-4 flex items-center justify-center disabled:opacity-50"
                                  >
                                      {uploadLoading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                                  </button>
                              </div>
                           </div>
                           <button 
                              onClick={() => setShowLinkInput(false)}
                              className="text-sm text-gray-500 hover:text-gray-900"
                           >
                               {t('detail.cancel')}
                           </button>
                      </div>
                  ) : (
                    <div className="space-y-4">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-violet-500 hover:bg-violet-50 transition-colors text-gray-500 hover:text-violet-600"
                      >
                        <Upload size={32} />
                        <span className="font-medium text-sm">{t('closet.upload_photo')}</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">{t('closet.or_import')}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => setShowLinkInput(true)}
                        className="w-full py-3 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-gray-600 font-medium hover:bg-gray-100"
                      >
                        <LinkIcon size={18} />
                        <span>{t('closet.paste_link')}</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden aspect-square bg-gray-100 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    {uploadLoading && (
                       <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                         <Loader2 className="animate-spin mb-2" size={32} />
                         <p className="text-sm font-medium">{t('closet.analyzing')}</p>
                         <p className="text-xs opacity-80 mt-1">{t('closet.analyzing_sub')}</p>
                       </div>
                    )}
                    {!imageBase64 && !uploadLoading && (
                        <div className="absolute bottom-0 left-0 right-0 bg-yellow-500/90 p-2 text-xs text-white text-center">
                            {t('closet.cors_hint')}
                        </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                     <button 
                        onClick={() => { setPreviewUrl(null); setImageBase64(null); }}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                     >
                        {t('detail.cancel')}
                     </button>
                     <button 
                        onClick={handleAnalyzeAndSave}
                        disabled={uploadLoading}
                        className="flex-[2] bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                     >
                        {t('closet.confirm')}
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Create Outfit Modal --- */}
      {isCreateOutfitModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-end md:justify-center">
          <div className="bg-white w-full max-w-md h-[90vh] md:h-auto md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg">{t('closet.create_outfit')}</h3>
              <button onClick={closeCreateOutfitModal} className="text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4">
               <div className="mb-6">
                 <input 
                    type="text" 
                    placeholder={t('closet.outfit_name_placeholder')}
                    className="w-full text-lg font-medium border-b-2 border-gray-200 focus:border-violet-600 outline-none py-2 bg-transparent placeholder:text-gray-300"
                    value={newOutfitName}
                    onChange={(e) => setNewOutfitName(e.target.value)}
                 />
               </div>

               <h4 className="font-bold text-sm text-gray-500 mb-3 uppercase tracking-wider">{t('closet.select_items')}</h4>
               
               <div className="grid grid-cols-3 gap-3">
                  {closet.map(item => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => toggleItemSelection(item.id)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-violet-600 ring-offset-1' : 'opacity-80'}`}
                      >
                         <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                         {isSelected && (
                           <div className="absolute inset-0 bg-violet-600/20 flex items-center justify-center">
                             <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-white">
                               <Check size={14} strokeWidth={3} />
                             </div>
                           </div>
                         )}
                      </div>
                    )
                  })}
               </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 shrink-0 bg-white md:rounded-b-2xl">
              <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                <span>{selectedItemIds.length} {t('closet.selected')}</span>
              </div>
              <button 
                onClick={handleSaveOutfit}
                disabled={!newOutfitName.trim() || selectedItemIds.length === 0}
                className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {t('closet.save_outfit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Closet;
