
import React, { useState } from 'react';
import { ClothingItem, Category, User, SavedInspiration, InspirationFolder } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Settings, Heart, RotateCcw, Globe, LogOut, X, ChevronRight, User as UserIcon, Lock, Mail, Edit2, Ruler, Weight, Shirt, Trash2, Sparkles, ShoppingBag, FolderPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  closet: ClothingItem[];
  savedInspirations?: SavedInspiration[];
  deleteInspiration?: (id: string) => void;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#6366f1'];

const Profile: React.FC<Props> = ({ closet, savedInspirations = [], deleteInspiration }) => {
  const { t, language, setLanguage } = useLanguage();
  const { user, login, register, logout, isAuthenticated, updateProfile } = useAuth();
  
  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInspirationsOpen, setIsInspirationsOpen] = useState(false);
  
  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Inspiration Modal State
  const [activeFolder, setActiveFolder] = useState<InspirationFolder>('shopping');

  const data = Object.values(Category).map(cat => ({
    name: t(`closet.cat.${cat.toLowerCase()}`),
    value: closet.filter(c => c.category === cat).length
  })).filter(d => d.value > 0);

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authMode === 'login') {
        await login(emailOrPhone, password);
      } else {
        await register(name, emailOrPhone, password);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditProfile = () => {
    if (user) {
        setEditForm({
            name: user.name,
            height: user.height,
            weight: user.weight,
            size: user.size
        });
        setIsEditProfileOpen(true);
    }
  };

  const handleSaveProfile = async () => {
      await updateProfile(editForm);
      setIsEditProfileOpen(false);
  };

  const filteredInspirations = savedInspirations.filter(insp => (insp.folder || 'chat') === activeFolder);

  // --- Render Login/Register Screen if not authenticated ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 pb-24">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-violet-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white shadow-lg shadow-violet-200 transform rotate-3">
              <UserIcon size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('auth.welcome')}</h1>
            <p className="text-gray-500 mt-2">{t('auth.subtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${authMode === 'login' ? 'text-violet-600 bg-violet-50' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t('auth.login')}
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${authMode === 'register' ? 'text-violet-600 bg-violet-50' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t('auth.register')}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authMode === 'register' && (
                <div className="space-y-1">
                  <div className="relative">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('auth.name_placeholder')}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('auth.email_placeholder')}
                    value={emailOrPhone}
                    onChange={e => setEmailOrPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder={t('auth.password_placeholder')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 mt-2 disabled:opacity-70"
              >
                {isLoading 
                  ? (authMode === 'login' ? 'Logging in...' : 'Registering...') 
                  : (authMode === 'login' ? t('auth.submit_login') : t('auth.submit_register'))
                }
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="hover:text-violet-600 underline">
              {authMode === 'login' ? t('auth.switch_to_register') : t('auth.switch_to_login')}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // --- Render Profile Screen if authenticated ---
  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen bg-gray-50 relative">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        <div className="flex gap-2">
            <button 
                onClick={openEditProfile}
                className="text-gray-500 hover:text-violet-600 p-2 rounded-full hover:bg-violet-50 transition-colors"
            >
                <Edit2 size={22} />
            </button>
            <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
            <Settings size={24} />
            </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 flex flex-col items-center">
        <div className="w-24 h-24 bg-gradient-to-tr from-violet-200 to-pink-200 rounded-full mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold">{user?.name}</h2>
        <p className="text-gray-500 text-sm mb-4">{t('profile.role')}</p>
        
        {/* User Stats Display */}
        <div className="flex w-full justify-around mt-2 border-t border-gray-100 pt-4 px-2 gap-2">
             <div className="flex flex-col items-center flex-1 p-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('home.stats.height')}</span>
                <span className="text-base font-bold text-gray-900">{user?.height || '-'} <span className="text-[10px] font-normal text-gray-400">cm</span></span>
            </div>
             <div className="flex flex-col items-center flex-1 p-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('home.stats.weight')}</span>
                <span className="text-base font-bold text-gray-900">{user?.weight || '-'} <span className="text-[10px] font-normal text-gray-400">kg</span></span>
            </div>
             <div className="flex flex-col items-center flex-1 p-2 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-400 uppercase font-bold mb-1">{t('home.stats.size')}</span>
                <span className="text-base font-bold text-gray-900">{user?.size || '-'}</span>
            </div>
        </div>
        
        <div className="flex w-full justify-around mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900">{closet.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{t('profile.items')}</span>
            </div>
            <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900">124</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{t('profile.outfits')}</span>
            </div>
            <div className="text-center">
                <span className="block text-2xl font-bold text-gray-900">85%</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{t('profile.utilized')}</span>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
        <h3 className="font-bold text-lg mb-4">{t('profile.breakdown')}</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
            {data.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
        </div>
      </div>

      <div className="space-y-3">
        <button 
            onClick={() => setIsInspirationsOpen(true)}
            className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
             <div className="p-2 bg-pink-100 text-pink-500 rounded-lg">
               <Sparkles size={20} />
             </div>
             <span className="font-medium">{t('profile.favorites')} (Inspirations)</span>
          </div>
          <span className="text-gray-400">{savedInspirations.length} saved</span>
        </button>

        <button className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group hover:bg-gray-50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 text-blue-500 rounded-lg">
               <RotateCcw size={20} />
             </div>
             <span className="font-medium">{t('profile.least_worn')}</span>
          </div>
          <span className="text-gray-400">5 items</span>
        </button>
      </div>

      {/* Inspirations Modal */}
      {isInspirationsOpen && (
          <div className="fixed inset-0 z-50 bg-gray-50 animate-in slide-in-from-right duration-200 flex flex-col">
              <header className="flex justify-between items-center p-4 bg-white shadow-sm shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles size={20} className="text-pink-500" />
                    {t('profile.inspirations')}
                </h2>
                <button 
                  onClick={() => setIsInspirationsOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <X size={20} />
                </button>
              </header>
              
              {/* Folder Tabs */}
              <div className="p-4 pb-0 overflow-x-auto">
                  <div className="flex gap-2">
                      {(['shopping', 'outfit', 'chat'] as InspirationFolder[]).map(folder => (
                          <button
                            key={folder}
                            onClick={() => setActiveFolder(folder)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                                activeFolder === folder 
                                ? 'bg-black text-white' 
                                : 'bg-white text-gray-500 border border-gray-200'
                            }`}
                          >
                              {folder === 'shopping' && <ShoppingBag size={14} />}
                              {folder === 'outfit' && <Heart size={14} />}
                              {folder === 'chat' && <FolderPlus size={14} />}
                              {t(`folder.${folder}`)}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {filteredInspirations.length === 0 ? (
                      <div className="text-center py-20 text-gray-400">
                          <p>No items in this folder.</p>
                      </div>
                  ) : (
                      filteredInspirations.map(insp => (
                          <div key={insp.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group animate-in fade-in duration-300">
                              <p className="text-sm text-gray-800 leading-relaxed pr-6 whitespace-pre-line">{insp.content}</p>
                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                                  <span className="text-xs text-gray-400">{insp.date}</span>
                                  {deleteInspiration && (
                                      <button 
                                        onClick={() => deleteInspiration(insp.id)}
                                        className="text-gray-300 hover:text-red-500 p-1"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  )}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">{t('profile.edit_title')}</h3>
                    <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-gray-900">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-bold uppercase">{t('auth.name_placeholder')}</label>
                        <div className="relative">
                            <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="space-y-1 flex-1">
                            <label className="text-xs text-gray-500 font-bold uppercase">{t('home.stats.height')} (cm)</label>
                            <div className="relative">
                                <Ruler size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    value={editForm.height || ''}
                                    placeholder='-'
                                    onChange={e => setEditForm({...editForm, height: Number(e.target.value)})}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-1 flex-1">
                            <label className="text-xs text-gray-500 font-bold uppercase">{t('home.stats.weight')} (kg)</label>
                            <div className="relative">
                                <Weight size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="number"
                                    value={editForm.weight || ''}
                                    placeholder='-'
                                    onChange={e => setEditForm({...editForm, weight: Number(e.target.value)})}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-bold uppercase">{t('home.stats.size')}</label>
                        <div className="relative">
                            <Shirt size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={editForm.size || ''}
                                placeholder="S, M, L..."
                                onChange={e => setEditForm({...editForm, size: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSaveProfile}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 mt-4"
                    >
                        {t('detail.save')}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 bg-gray-50 animate-in slide-in-from-right duration-200">
          <header className="flex justify-between items-center p-4 bg-white shadow-sm">
            <h2 className="text-xl font-bold">{t('settings.title')}</h2>
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </header>

          <div className="p-4 space-y-4">
             {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group hover:bg-gray-50 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 text-violet-500 rounded-lg">
                  <Globe size={20} />
                </div>
                <span className="font-medium text-gray-900">{t('profile.language')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                 <span className="font-medium text-violet-600">{language === 'zh' ? '中文' : 'English'}</span>
                 <ChevronRight size={16} />
              </div>
            </button>

            {/* Logout Button */}
            <button 
              onClick={() => {
                logout();
                setIsSettingsOpen(false);
              }}
              className="w-full bg-white p-4 rounded-xl shadow-sm flex items-center justify-between group hover:bg-red-50 border border-red-100 mt-8"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-500 rounded-lg">
                  <LogOut size={20} />
                </div>
                <span className="font-medium text-red-600">{t('auth.logout')}</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
