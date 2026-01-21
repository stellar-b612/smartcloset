import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, Layers, Edit2, Save, Plus, Minus, Share2, X } from 'lucide-react';
import { ClothingItem, SavedOutfit } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  outfits: SavedOutfit[];
  closet: ClothingItem[];
  deleteOutfit: (id: string) => void;
  updateOutfit: (outfit: SavedOutfit) => void;
}

const OutfitDetail: React.FC<Props> = ({ outfits, closet, deleteOutfit, updateOutfit }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const outfit = outfits.find(o => o.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOutfit, setEditedOutfit] = useState<SavedOutfit | null>(outfit || null);

  if (!outfit || !editedOutfit) return <div className="p-8 text-center">Outfit not found</div>;

  const items = editedOutfit.itemIds.map(itemId => closet.find(c => c.id === itemId)).filter(Boolean) as ClothingItem[];
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleDelete = () => {
     if (window.confirm(t('detail.delete_confirm'))) {
        deleteOutfit(outfit.id);
        navigate('/closet');
     }
  }

  const handleSave = () => {
      if(editedOutfit) {
          updateOutfit(editedOutfit);
          setIsEditing(false);
      }
  }

  const handleCancel = () => {
      setEditedOutfit(outfit);
      setIsEditing(false);
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: outfit.name,
        text: `Check out my outfit "${outfit.name}" on SmartCloset!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('detail.share_success'));
    }
  };

  const handleWearCountChange = (increment: boolean) => {
      const dates = editedOutfit.wearDates ? [...editedOutfit.wearDates] : [];
      if (increment) {
          dates.push(new Date().toISOString().split('T')[0]);
      } else {
          if (dates.length > 0) dates.pop();
      }
      setEditedOutfit({...editedOutfit, wearDates: dates});
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
       {/* Header */}
       <header className="bg-white p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                <ArrowLeft size={24} />
            </button>
         </div>
         <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
            >
              <Share2 size={24} />
            </button>
         </div>
       </header>

       {/* Content */}
       <div className="p-4 space-y-6">
           
           {/* Collage Preview */}
           <div className="bg-white p-2 rounded-2xl shadow-sm">
              <div className="aspect-[4/3] grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-gray-100">
                  {items.map((item) => (
                      <img key={item.id} src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                  ))}
              </div>
           </div>

           {/* Title & Desc Edit */}
           <div className="bg-white p-4 rounded-xl shadow-sm">
               {isEditing ? (
                   <div className="space-y-3">
                       <div>
                           <label className="text-xs text-gray-400 font-bold uppercase">{t('detail.name')}</label>
                           <input 
                              className="w-full text-lg font-bold border-b border-gray-200 focus:border-violet-600 outline-none py-1"
                              value={editedOutfit.name}
                              onChange={(e) => setEditedOutfit({...editedOutfit, name: e.target.value})}
                           />
                       </div>
                       <div>
                           <label className="text-xs text-gray-400 font-bold uppercase">{t('detail.description')}</label>
                           <textarea 
                              className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:border-violet-600 outline-none"
                              value={editedOutfit.description || ''}
                              onChange={(e) => setEditedOutfit({...editedOutfit, description: e.target.value})}
                              rows={3}
                           />
                       </div>
                   </div>
               ) : (
                   <div>
                       <h1 className="font-bold text-xl">{outfit.name}</h1>
                       {outfit.description && <p className="text-gray-500 text-sm mt-1">{outfit.description}</p>}
                   </div>
               )}
           </div>

           {/* Stats Row */}
           <div className="flex gap-4">
              <div className="flex-1 bg-white p-4 rounded-xl shadow-sm flex flex-col items-center">
                 <span className="text-xs text-gray-500 uppercase font-bold">{t('detail.total_value')}</span>
                 <span className="text-lg font-bold text-gray-900 mt-1">¥{totalPrice}</span>
              </div>
              <div className="flex-1 bg-white p-4 rounded-xl shadow-sm flex flex-col items-center">
                 <span className="text-xs text-gray-500 uppercase font-bold">{t('detail.wear_count')}</span>
                 {isEditing ? (
                     <div className="flex items-center gap-3 mt-1">
                         <button onClick={() => handleWearCountChange(false)} className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200"><Minus size={14}/></button>
                         <span className="text-lg font-bold text-gray-900">{editedOutfit.wearDates?.length || 0}</span>
                         <button onClick={() => handleWearCountChange(true)} className="w-6 h-6 flex items-center justify-center bg-violet-100 text-violet-600 rounded-full hover:bg-violet-200"><Plus size={14}/></button>
                     </div>
                 ) : (
                    <span className="text-lg font-bold text-gray-900 mt-1">{outfit.wearDates?.length || 0}</span>
                 )}
              </div>
           </div>

           {/* Included Items List */}
           <div className="bg-white rounded-xl shadow-sm overflow-hidden">
               <div className="p-4 border-b border-gray-50 flex items-center gap-2">
                   <Layers size={18} className="text-violet-600" />
                   <h3 className="font-bold">{t('detail.outfit_items')}</h3>
               </div>
               <div className="divide-y divide-gray-50">
                   {items.map(item => (
                       <div 
                         key={item.id} 
                         onClick={() => navigate(`/item/${item.id}`)}
                         className="flex items-center p-3 gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
                       >
                           <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                               <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                           </div>
                           <div className="flex-1 min-w-0">
                               <p className="font-medium text-sm truncate">{item.description}</p>
                               <p className="text-xs text-gray-500">{t(`closet.cat.${item.category.toLowerCase()}`)}</p>
                           </div>
                           <ArrowLeft size={16} className="rotate-180 text-gray-300" />
                       </div>
                   ))}
               </div>
           </div>

           {/* History / Calendar Mock */}
           <div className="bg-white rounded-xl shadow-sm p-4">
               <div className="flex items-center gap-2 mb-4">
                   <Calendar size={18} className="text-pink-500" />
                   <h3 className="font-bold">{t('detail.wear_history')}</h3>
               </div>
               {(isEditing ? editedOutfit : outfit).wearDates && (isEditing ? editedOutfit : outfit).wearDates!.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                       {(isEditing ? editedOutfit : outfit).wearDates!.map((date, idx) => (
                           <span key={`${date}-${idx}`} className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600 font-medium">
                               {date}
                           </span>
                       ))}
                   </div>
               ) : (
                   <p className="text-sm text-gray-400 italic">{t('detail.no_history')}</p>
               )}
           </div>

           {/* Bottom Actions */}
           <div className="mt-8 space-y-3">
               {isEditing ? (
                   <div className="flex gap-3">
                       <button 
                           onClick={handleCancel}
                           className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center gap-2 bg-white"
                       >
                           <X size={20} />
                           {t('detail.cancel')}
                       </button>
                       <button 
                           onClick={handleSave}
                           className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
                       >
                           <Save size={20} />
                           {t('detail.save')}
                       </button>
                   </div>
               ) : (
                   <div className="space-y-3">
                       <button 
                           onClick={() => setIsEditing(true)}
                           className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
                       >
                           <Edit2 size={20} />
                           {t('detail.edit')}
                       </button>
                       <button 
                           onClick={handleDelete}
                           className="w-full py-3 rounded-xl border border-red-100 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-50 bg-white"
                       >
                           <Trash2 size={18} />
                           {t('detail.delete')}
                       </button>
                   </div>
               )}
           </div>

       </div>
    </div>
  );
};

export default OutfitDetail;
