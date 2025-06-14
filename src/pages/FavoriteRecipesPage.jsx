import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Ajout du hook de navigation
import api from '../services/api';
import Layout from '../components/Layout';

export default function FavoriteRecipesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  
  // Hook de navigation pour React Router
  const navigate = useNavigate();
  
  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Appel à l'API pour la déconnexion
      await api.post('/api/auth/logout');
      // Redirection vers la page de connexion
      navigate('/login');
    } catch (err) {
      console.error('Erreur lors de la déconnexion', err);
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await api.get('/api/recipes/favorites');
        
        // Process each recipe to ensure ingredients and instructions are arrays
        const processedFavorites = response.data.map(favorite => {
          const recipe = favorite.recipe;
          
          // Parse JSON strings if they're not already arrays
          if (recipe.all_ingredients && typeof recipe.all_ingredients === 'string') {
            recipe.all_ingredients = JSON.parse(recipe.all_ingredients);
          }
          
          if (recipe.missing_ingredients && typeof recipe.missing_ingredients === 'string') {
            recipe.missing_ingredients = JSON.parse(recipe.missing_ingredients);
          }
          
          if (recipe.instructions && typeof recipe.instructions === 'string') {
            recipe.instructions = JSON.parse(recipe.instructions);
          }
          
          return { ...favorite, recipe };
        });
        
        setFavorites(processedFavorites);
      } catch (err) {
        setError('Erreur lors du chargement des favoris');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await api.delete(`/api/favorites/${favoriteId}`);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (err) {
      setError('Erreur lors de la suppression du favori');
      console.error(err);
    }
  };

  const toggleExpandRecipe = (recipeId) => {
    if (expandedRecipe === recipeId) {
      setExpandedRecipe(null);
    } else {
      setExpandedRecipe(recipeId);
    }
  };

  // Helper function to ensure we have a valid array
  const ensureArray = (possibleArray) => {
    if (!possibleArray) return [];
    if (Array.isArray(possibleArray)) return possibleArray;
    if (typeof possibleArray === 'string') {
      try {
        const parsed = JSON.parse(possibleArray);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Contenu de la page
  const content = (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Mes Recettes Favorites</h1>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && <p className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>}

      {!loading && favorites.length === 0 && (
        <div className="bg-gray-50 p-6 text-center rounded-lg shadow-sm">
          <p className="text-gray-600">Vous n'avez pas encore de recettes favorites</p>
          <button 
            onClick={() => navigate('/recipes/generate')}
            className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
            type="button"
          >
            Générer une recette
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {favorites.map(favorite => {
          const recipe = favorite.recipe;
          const isExpanded = expandedRecipe === recipe.id;
          
          // Ensure arrays for rendering
          const allIngredients = ensureArray(recipe.all_ingredients);
          const missingIngredients = ensureArray(recipe.missing_ingredients);
          const instructions = ensureArray(recipe.instructions);
          
          return (
            <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {recipe.image && (
                  <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="font-semibold text-xl text-gray-800">{recipe.title}</h2>
                    <button 
                      onClick={() => handleRemoveFavorite(favorite.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Retirer des favoris"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {recipe.ready_in_minutes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Temps de préparation:</span> {recipe.ready_in_minutes} minutes
                      {recipe.servings && (
                        <span className="ml-2">| <span className="font-medium">Portions:</span> {recipe.servings}</span>
                      )}
                    </p>
                  )}
                  
                  {recipe.match_score !== undefined && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 mb-1">Adéquation avec les ingrédients: {recipe.match_score}%</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${recipe.match_score}%` }}></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-between">
                    <button 
                      onClick={() => toggleExpandRecipe(recipe.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                      type="button"
                    >
                      {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
                    </button>
                    
                    {recipe.source_url && (
                      <a 
                        href={recipe.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Source originale
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="p-4 border-t border-gray-200">
                  {allIngredients.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Ingrédients:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {allIngredients.map((ing, i) => (
                          <li key={i}>{typeof ing === 'object' ? ing.original : ing}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {missingIngredients.length > 0 && (
                    <div className="mb-4 bg-yellow-50 p-3 rounded">
                      <h3 className="font-medium mb-2">Ingrédients manquants:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {missingIngredients.map((ing, i) => (
                          <li key={i}>{typeof ing === 'object' ? ing.original : ing}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {instructions.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Instructions:</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        {instructions.map((step, i) => (
                          <li key={i}>{typeof step === 'object' ? step.step : step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <Layout navigate={navigate} onLogout={handleLogout}>
      {content}
    </Layout>
  );
}