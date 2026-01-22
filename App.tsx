
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Closet from './pages/Closet';
import Lab from './pages/Lab';
import Profile from './pages/Profile';
import ItemDetail from './pages/ItemDetail';
import OutfitDetail from './pages/OutfitDetail';
import { INITIAL_CLOSET, INITIAL_OUTFITS, WEATHER_MOCK } from './constants';
import { ClothingItem, SavedOutfit, SavedInspiration } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  const [closet, setCloset] = useState<ClothingItem[]>(INITIAL_CLOSET);
  const [outfits, setOutfits] = useState<SavedOutfit[]>(INITIAL_OUTFITS);
  const [savedInspirations, setSavedInspirations] = useState<SavedInspiration[]>([]);
  // In a real app, weather would be fetched via API
  const [weather] = useState(WEATHER_MOCK); 

  // --- CRUD Handlers ---

  const handleAddItem = (item: ClothingItem) => {
    setCloset(prev => [item, ...prev]);
  };

  const handleUpdateItem = (updatedItem: ClothingItem) => {
    setCloset(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteItem = (id: string) => {
    setCloset(prev => prev.filter(item => item.id !== id));
  };

  const handleAddOutfit = (outfit: SavedOutfit) => {
    setOutfits(prev => [outfit, ...prev]);
  };

  const handleUpdateOutfit = (updatedOutfit: SavedOutfit) => {
    setOutfits(prev => prev.map(outfit => outfit.id === updatedOutfit.id ? updatedOutfit : outfit));
  };

  const handleDeleteOutfit = (id: string) => {
    setOutfits(prev => prev.filter(outfit => outfit.id !== id));
  };

  const handleSaveInspiration = (inspiration: SavedInspiration) => {
    setSavedInspirations(prev => [inspiration, ...prev]);
  };

  const handleDeleteInspiration = (id: string) => {
    setSavedInspirations(prev => prev.filter(insp => insp.id !== id));
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased selection:bg-violet-200 selection:text-violet-900">
            <Routes>
              <Route path="/" element={<Home weather={weather} closet={closet} />} />
              
              <Route 
                path="/closet" 
                element={
                  <Closet 
                    closet={closet} 
                    addItem={handleAddItem} 
                    outfits={outfits} 
                    addOutfit={handleAddOutfit} 
                  />
                } 
              />
              
              <Route 
                path="/item/:id" 
                element={
                  <ItemDetail 
                    closet={closet} 
                    updateItem={handleUpdateItem} 
                    deleteItem={handleDeleteItem} 
                  />
                } 
              />

              <Route 
                path="/outfit/:id" 
                element={
                  <OutfitDetail 
                    outfits={outfits}
                    closet={closet}
                    deleteOutfit={handleDeleteOutfit}
                    updateOutfit={handleUpdateOutfit}
                  />
                } 
              />

              <Route 
                path="/lab" 
                element={
                  <Lab 
                    closet={closet} 
                    saveInspiration={handleSaveInspiration}
                    savedInspirations={savedInspirations}
                  />
                } 
              />
              <Route 
                path="/profile" 
                element={
                    <Profile 
                        closet={closet} 
                        savedInspirations={savedInspirations}
                        deleteInspiration={handleDeleteInspiration}
                    />
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BottomNav />
          </div>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
