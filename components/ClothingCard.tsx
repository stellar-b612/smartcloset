import React from 'react';
import { ClothingItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  item: ClothingItem;
  onClick?: () => void;
}

const ClothingCard: React.FC<Props> = ({ item, onClick }) => {
  const { t } = useLanguage();
  
  const categoryLabel = t(`closet.cat.${item.category.toLowerCase()}`);

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer aspect-[3/4]"
    >
      <img 
        src={item.imageUrl} 
        alt={item.description} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <span className="text-white text-xs font-bold uppercase tracking-wider">{categoryLabel}</span>
        <span className="text-white text-sm truncate">{item.description}</span>
      </div>
      
      {/* Mobile Always Visible Tag */}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full md:hidden">
        {categoryLabel}
      </div>
    </div>
  );
};

export default ClothingCard;
