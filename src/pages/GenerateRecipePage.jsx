import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function GenerateRecipePage() {
  const [ingredients, setIngredients] = useState('');
  const [preferences, setPreferences] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000));
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // New state for language
  const [language, setLanguage] = useState('en');
  const [supportedLanguages, setSupportedLanguages] = useState({});

  // Fetch supported languages on component mount
  useEffect(() => {
    const fetchSupportedLanguages = async () => {
      try {
        const response = await api.get('/api/recipes/languages');
        setSupportedLanguages(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des langues', err);
      }
    };

    fetchSupportedLanguages();
  }, []);

  const checkIfFavorite = async (recipeId) => {
    try {
      const response = await api.get('/api/favorites');
      const favorites = response.data;
      const isInFavorites = favorites.some(fav => fav.recipe_id === recipeId);
      setIsFavorite(isInFavorites);
    } catch (err) {
      console.error('Erreur lors de la vérification des favoris:', err);
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!recipe || !recipe.id) {
      setError('Impossible d\'ajouter aux favoris: recette non identifiée');
      return;
    }
    
    setFavoriteLoading(true);
    
    try {
      if (isFavorite) {
        // Trouver l'ID du favori pour le supprimer
        const response = await api.get('/api/favorites');
        const favorites = response.data;
        const favorite = favorites.find(fav => fav.recipe_id === recipe.id);
        
        if (favorite) {
          await api.delete(`/api/favorites/${favorite.id}`);
          setIsFavorite(false);
        }
      } else {
        await api.post('/api/favorites', {
          recipe_id: recipe.id
        });
        setIsFavorite(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur avec les favoris');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setError('');
    setRecipe(null);
    setIsFavorite(false);
    
    setSeed(Math.floor(Math.random() * 1000));

    try {
      const ingredientsArray = ingredients.split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const preferencesArray = preferences.split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      if (ingredientsArray.length === 0) {
        throw new Error('Veuillez entrer au moins un ingrédient');
      }

      const response = await api.post('/api/recipes/ai', {
        ingredients: ingredientsArray,
        preferences: preferencesArray,
        language: language,
        seed: seed
      });

      setRecipe(response.data);
      
      // Vérifier si cette recette est dans les favoris
      if (response.data.id) {
        checkIfFavorite(response.data.id);
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecipe = async () => {
    if (!ingredients) {
      setError('Veuillez entrer au moins un ingrédient');
      return;
    }
    
    setLoading(true);
    setIsFavorite(false);
    const newSeed = seed + 1;
    setSeed(newSeed);
    
    try {
      const ingredientsArray = ingredients.split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const preferencesArray = preferences.split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const response = await api.post('/api/recipes/regenerate', {
        ingredients: ingredientsArray,
        preferences: preferencesArray,
        language: language,
        seed: newSeed
      });

      setRecipe(response.data);
      setError('');
      
      // Vérifier si cette recette est dans les favoris
      if (response.data.id) {
        checkIfFavorite(response.data.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la régénération');
    } finally {
      setLoading(false);
    }
  };

  const hasIngredients = ingredients.trim().length > 0;

  return (
    <Layout>
      {/* Début du design modifié */}
      <div className="max-w-3xl mx-auto p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-center text-emerald-800 flex items-center justify-center">
          <svg className="w-8 h-8 mr-2 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6V13.87Z"></path>
            <line x1="6" y1="17" x2="18" y2="17"></line>
          </svg>
          Générer une Recette
        </h1>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-5 mb-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                <path d="M7 2v20"></path>
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
              </svg>
              Ingrédients disponibles
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Tomate, Fromage, Oeuf..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
            <p className="text-sm text-gray-500 mt-1 ml-6">Séparez par des virgules</p>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Allergies/Éviter
            </label>
            <input
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Lait, Gluten, etc."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
              </svg>
              Langue de la recette
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            >
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1 ml-6">Sélectionnez la langue de votre recette</p>
          </div>

          <button
            onClick={handleGenerateRecipe}
            className={`w-full flex items-center justify-center rounded-lg px-4 py-3 font-medium text-white transition-colors ${
              hasIngredients 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={loading || !hasIngredients}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c.3 0 .5.12.7.32 1.3 1.33 2.98 2.65 3.3 2.82a2 2 0 0 1 1 1.74v9.12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7.88a2 2 0 0 1 1-1.74c.32-.17 2-1.49 3.3-2.82A.98.98 0 0 1 12 3Z"></path>
                  <path d="m7.5 12 3 3 6-6"></path>
                </svg>
                <span>Générer ma recette</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {recipe && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* En-tête de la recette avec image si disponible */}
            <div className="relative">
              {recipe.image && (
                <div className="relative h-60">
                  <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
              )}
              
              <div className={`${recipe.image ? 'absolute bottom-0 left-0 w-full text-white p-4' : 'bg-emerald-50 p-4'}`}>
                <h2 className="text-2xl font-bold">{recipe.title}</h2>
                
                {recipe.ready_in_minutes && (
                  <div className="flex items-center mt-2 text-sm">
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span className="mr-3">Temps de préparation: {recipe.ready_in_minutes} minutes</span>
                    
                    {recipe.servings && (
                      <>
                        <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>Portions: {recipe.servings}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-b border-gray-100 px-4 py-3 flex justify-between items-center">
              <div className="flex space-x-2">
                <button 
                  onClick={handleToggleFavorite}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center transition ${
                    isFavorite 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading ? (
                    <div className="animate-pulse flex">
                      <div className="h-4 w-4 bg-gray-300 rounded-full mr-2"></div>
                      <div className="h-4 w-16 bg-gray-300 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-4 h-4 mr-1"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                      {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
                    </>
                  )}
                </button>
                <button 
                  onClick={handleRegenerateRecipe} 
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-2 rounded-lg text-sm flex items-center transition"
                  disabled={loading || !ingredients}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700 mr-2"></div>
                  ) : (
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M20 16.5A9 9 0 0 0 9.5 6M4 7.5A9 9 0 0 0 14.5 18"></path>
                    </svg>
                  )}
                  {loading ? 'Régénération...' : 'Autre recette'}
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Score de correspondance */}
              {recipe.match_score !== undefined && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">Adéquation avec vos ingrédients</span>
                    <span className="text-sm font-semibold text-emerald-600">{recipe.match_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2.5 rounded-full" 
                      style={{ width: `${recipe.match_score}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="md:flex md:space-x-6">
                {/* Ingrédients */}
                <div className="md:w-2/5">
                  {recipe.all_ingredients && recipe.all_ingredients.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h6"></path>
                          <path d="M14 3v5h5M18 21v-6M15 18h6"></path>
                        </svg>
                        Ingrédients nécessaires:
                      </h3>
                      <ul className="space-y-2 pl-5">
                        {recipe.all_ingredients.map((ing, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="w-4 h-4 text-emerald-500 mr-2 mt-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <span>{ing.original}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recipe.missing_ingredients?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <h3 className="font-medium text-amber-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-amber-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Ingrédients manquants:
                      </h3>
                      <ul className="space-y-1 pl-5">
                        {recipe.missing_ingredients.map((ing, i) => (
                          <li key={i} className="flex items-center text-amber-700">
                            <svg className="w-4 h-4 text-amber-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                              <line x1="12" y1="9" x2="12" y2="13"></line>
                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="md:w-3/5">
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-emerald-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                    Instructions:
                  </h3>
                  <ol className="space-y-4 pl-5">
                    {recipe.instructions.map((step, i) => (
                      <li key={i} className="flex">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-medium text-sm">
                            {i+1}
                          </div>
                        </div>
                        <div className="pt-0.5">
                          <p className="text-gray-700">{step.step}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {recipe.source_url && (
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Voir la recette originale
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}