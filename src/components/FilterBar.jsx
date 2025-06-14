import React from 'react';
import { Filter, Sparkles } from 'lucide-react';

export default function FilterBar({ filters, onFilterChange, showSourceFilter = false }) {
  const difficulties = ['all', 'débutant', 'intermédiaire', 'avancé'];
  const durations = ['all', 'court', 'moyen', 'long'];
  const categories = ['all', 'basiques', 'pâtisserie', 'cuisine française', 'cuisine internationale', 'nutrition'];
  const sources = ['all', 'standard', 'ai'];
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="font-medium">Filtrer les cours</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
          <select 
            value={filters.difficulty}
            onChange={(e) => onFilterChange({ difficulty: e.target.value })}
            className="w-full rounded-md border border-gray-300 py-2 px-3"
          >
            {difficulties.map(item => (
              <option key={item} value={item}>
                {item === 'all' ? 'Toutes les difficultés' : item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
          <select 
            value={filters.duration}
            onChange={(e) => onFilterChange({ duration: e.target.value })}
            className="w-full rounded-md border border-gray-300 py-2 px-3"
          >
            {durations.map(item => (
              <option key={item} value={item}>
                {item === 'all' ? 'Toutes les durées' : item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select 
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="w-full rounded-md border border-gray-300 py-2 px-3"
          >
            {categories.map(item => (
              <option key={item} value={item}>
                {item === 'all' ? 'Toutes les catégories' : item.charAt(0).toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* {showSourceFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select 
              value={filters.source}
              onChange={(e) => onFilterChange({ source: e.target.value })}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              {sources.map(item => (
                <option key={item} value={item}>
                  {item === 'all' ? 'Toutes les sources' : 
                   item === 'standard' ? 'Cours standards' : 
                   'Générés par IA'}
                </option>
              ))}
            </select>
          </div>
        )} */}
      </div>
    </div>
  );
}