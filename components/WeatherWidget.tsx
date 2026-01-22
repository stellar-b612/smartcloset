
import React from 'react';
import { CloudSun, Sun, Umbrella } from 'lucide-react';
import { WeatherData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  data: WeatherData;
}

const WeatherWidget: React.FC<Props> = ({ data }) => {
  const { t } = useLanguage();

  const getConditionText = (condition: string) => {
    switch(condition) {
      case 'Sunny': return t('home.weather.sunny');
      case 'Cloudy': return t('home.weather.cloudy');
      case 'Rain': return t('home.weather.rain');
      case 'Snow': return t('home.weather.snow');
      case 'Partly Cloudy': return t('home.weather.partly_cloudy');
      default: return condition;
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-4 text-white shadow-md mb-4 relative overflow-hidden flex items-center justify-between">
      {/* Decorative Circles (Reduced size) */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>

      {/* Left: Location & Condition */}
      <div className="relative z-10 flex flex-col justify-center min-w-[30%]">
        <h2 className="text-xs font-medium opacity-80 uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
           <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
           {data.location}
        </h2>
        <span className="text-sm font-medium opacity-90 truncate">{getConditionText(data.condition)}</span>
        <span className="text-[10px] opacity-70">H:{data.temp + 3}° L:{data.temp - 4}°</span>
      </div>

      {/* Center: Big Temp */}
      <div className="relative z-10 flex items-center justify-center">
         <span className="text-4xl font-bold tracking-tighter">{data.temp}°</span>
      </div>

      {/* Right: Stats & Icon */}
      <div className="relative z-10 flex items-center gap-3">
         {/* Stats Column */}
         <div className="flex flex-col gap-1 pr-3 border-r border-white/20">
            <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold">{data.precipitation}%</span>
                <Umbrella size={14} className="opacity-80" />
            </div>
            <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold">{data.uvIndex}</span>
                <Sun size={14} className="opacity-80" />
            </div>
         </div>
         
         {/* Main Icon */}
         <div className="pl-1">
            <CloudSun size={32} className="text-yellow-300 drop-shadow-sm" strokeWidth={2} />
         </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
