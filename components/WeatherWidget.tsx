import React from 'react';
import { CloudSun, Wind, Droplets } from 'lucide-react';
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
    <div className="bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-medium opacity-90 uppercase tracking-wider mb-1">{data.location}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-bold">{data.temp}°</span>
            <span className="text-lg opacity-90">{getConditionText(data.condition)}</span>
          </div>
        </div>
        <CloudSun size={48} className="text-yellow-300" />
      </div>
      
      <div className="mt-4 flex space-x-6 text-sm opacity-80 border-t border-white/20 pt-3">
        <div className="flex items-center space-x-1">
          <Wind size={16} />
          <span>12 km/h</span>
        </div>
        <div className="flex items-center space-x-1">
          <Droplets size={16} />
          <span>45%</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
