import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Save, Star, Droplets, Share2, X } from 'lucide-react';
import { ClothingItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  closet: ClothingItem[];
  updateItem: (item: ClothingItem) => void;
  deleteItem: (id: string) => void;
}

const ItemDetail: React.FC<Props> = ({ closet, updateItem, deleteItem }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const item = closet.find(c => c.id === id);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState<ClothingItem | null>(item || null);

  if (!item || !editedItem) {
    return <div className="p-8 text-center">Item not found</div>;
  }

  // CPW Calculation
  const price = item.price || 0;
  const wears = item.wearCount || 0;
  const cpw = wears > 0 ? (price / wears).toFixed(1) : price;
  
  // Handlers
  const handleSave = () => {
    if (editedItem) {
      updateItem(editedItem);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedItem(item);
    setIsEditing(false);
  }

  const handleDelete = () => {
    if (window.confirm(t('detail.delete_confirm'))) {
      deleteItem(item.id);
      navigate('/closet');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.description,
        text: `Check out my ${item.description} on SmartCloset!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(t('detail.share_success'));
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
           <Star 
             key={star} 
             size={16} 
             className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${isEditing ? 'cursor-pointer' : ''}`}
             onClick={() => isEditing && setEditedItem({...editedItem, rating: star})}
           />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header Image */}
      <div className="relative h-[50vh]">
        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.description} />
        
        {/* Header Actions */}
        <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-center">
             <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50"
            >
              <ArrowLeft size={24} />
            </button>
            
            <button 
              onClick={handleShare}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-800 shadow-sm hover:bg-white"
            >
              <Share2 size={20} />
            </button>
        </div>
      </div>

      <div className="p-6 -mt-6 bg-white rounded-t-3xl relative z-10 min-h-[50vh] flex flex-col">
         {/* Main Info */}
         <div className="mb-6">
            <span className="text-sm font-bold text-violet-600 uppercase tracking-wider mb-1 block">
                {t(`closet.cat.${item.category.toLowerCase()}`)}
            </span>
            {isEditing ? (
                <input 
                  className="text-2xl font-bold w-full border-b border-gray-200 focus:border-violet-600 outline-none"
                  value={editedItem.description}
                  onChange={(e) => setEditedItem({...editedItem, description: e.target.value})}
                />
            ) : (
                <h1 className="text-2xl font-bold text-gray-900">{item.description}</h1>
            )}
         </div>

         {/* Stats Grid - CPW Focus */}
         <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col justify-center">
               <span className="text-xs text-gray-500 uppercase font-bold">{t('detail.cpw')}</span>
               <div className="flex items-baseline mt-1">
                 <span className="text-xl font-bold text-violet-600">¥{cpw}</span>
                 <span className="text-xs text-gray-400 ml-1">/ wear</span>
               </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-col justify-center">
               <span className="text-xs text-gray-500 uppercase font-bold">{t('detail.wear_count')}</span>
               <div className="flex items-baseline mt-1">
                 {isEditing ? (
                    <input 
                      type="number" 
                      className="text-xl font-bold text-gray-900 w-20 bg-transparent border-b border-gray-300 focus:border-violet-600 outline-none"
                      value={editedItem.wearCount}
                      onChange={(e) => setEditedItem({...editedItem, wearCount: parseInt(e.target.value) || 0})}
                    />
                 ) : (
                    <span className="text-xl font-bold text-gray-900">{item.wearCount}</span>
                 )}
                 <span className="text-xs text-gray-400 ml-1">times</span>
               </div>
            </div>
         </div>

         {/* Detailed Attributes */}
         <div className="space-y-6 flex-1">
             {/* Brand & Price */}
             <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">{t('detail.brand')}</span>
                {isEditing ? (
                   <input 
                    className="text-right font-medium border-b border-gray-200 outline-none w-32"
                    value={editedItem.brand || ''}
                    placeholder="Brand"
                    onChange={(e) => setEditedItem({...editedItem, brand: e.target.value})}
                   />
                ) : (
                    <span className="font-medium">{item.brand || '-'}</span>
                )}
             </div>

             <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">{t('detail.price')}</span>
                {isEditing ? (
                   <div className="flex items-center justify-end">
                       <span>¥</span>
                       <input 
                        type="number"
                        className="text-right font-medium border-b border-gray-200 outline-none w-20"
                        value={editedItem.price || ''}
                        placeholder="0"
                        onChange={(e) => setEditedItem({...editedItem, price: Number(e.target.value)})}
                       />
                   </div>
                ) : (
                    <span className="font-medium">{item.price ? `¥${item.price}` : '-'}</span>
                )}
             </div>

             {/* Rating */}
             <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">{t('detail.rating')}</span>
                {renderStars(isEditing ? (editedItem.rating || 0) : (item.rating || 0))}
             </div>

             {/* Care Instructions */}
             <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                   <Droplets size={18} className="text-blue-400" />
                   <h3 className="font-bold text-gray-900">{t('detail.care')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                   {(item.careInstructions && item.careInstructions.length > 0) ? (
                      item.careInstructions.map((inst, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {inst}
                        </span>
                      ))
                   ) : (
                      <span className="text-sm text-gray-400 italic">No special instructions.</span>
                   )}
                </div>
             </div>
         </div>

         {/* Bottom Actions */}
         <div className="mt-12 space-y-3">
            {isEditing ? (
                <div className="flex gap-3">
                    <button 
                        onClick={handleCancel}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
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
                        className="w-full py-3 rounded-xl border border-red-100 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-50"
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

export default ItemDetail;
