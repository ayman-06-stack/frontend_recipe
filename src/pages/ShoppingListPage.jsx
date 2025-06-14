import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

// Component to display error messages
const ErrorAlert = ({ message, onDismiss }) => (
  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded flex justify-between items-center">
    <span>{message}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="text-red-500 hover:text-red-700">
        ×
      </button>
    )}
  </div>
);

// Component to display success messages
const SuccessAlert = ({ message, onDismiss }) => (
  <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded flex justify-between items-center">
    <span>{message}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="text-green-500 hover:text-green-700">
        ×
      </button>
    )}
  </div>
);

// Recipe card component
const RecipeCard = ({ recipe, isSelected, onToggle }) => (
  <div 
    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
      isSelected 
        ? 'bg-green-100 border-green-500' 
        : 'bg-white hover:bg-gray-50'
    }`}
    onClick={onToggle}
  >
    <div className="flex items-center">
      <input 
        type="checkbox" 
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="mr-3 h-5 w-5 text-green-600"
      />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{recipe.title}</h3>
          {recipe.isSuggested && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Suggéré</span>
          )}
        </div>
        {recipe.match_percentage && (
          <p className="text-sm text-gray-500">
            {recipe.match_percentage}% compatible avec vos ingrédients
          </p>
        )}
        <p className="text-sm text-gray-500">
          {Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0} ingrédients
        </p>
      </div>
    </div>
  </div>
);

// Component to display existing ingredients
const ExistingIngredients = ({ items, isVisible, onToggle }) => {
  if (items.length === 0) return null;
  
  return (
    <div className="mb-6 border border-blue-200 rounded-lg bg-blue-50 p-4">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={onToggle}
      >
        <h3 className="font-medium text-blue-800">
          Ingrédients déjà disponibles ({items.length})
        </h3>
        <span className="text-blue-500">{isVisible ? '▼' : '►'}</span>
      </div>
      
      {isVisible && (
        <div className="mt-3 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center text-sm p-2 bg-white rounded border border-blue-100">
              <span className="font-medium">{item.name}</span>
              {item.available && item.unit && (
                <span className="text-gray-600 ml-2">
                  (Disponible: {item.available} {item.unit})
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Shopping list selector component
const ShoppingListSelector = ({ lists, selectedListId, onSelect, onAddNew }) => {
  if (!lists || lists.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-800">Vos listes de courses</h3>
        <button 
          onClick={onAddNew}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Nouvelle liste
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {lists.map(list => (
          <div 
            key={list.id}
            onClick={() => onSelect(list.id)}
            className={`p-3 border rounded cursor-pointer ${
              selectedListId === list.id ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{list.name || `Liste du ${new Date(list.created_at).toLocaleDateString()}`}</div>
            <div className="text-sm text-gray-500">{list.items.length} articles</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ShoppingListPage() {
  // State management
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [shoppingLists, setShoppingLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [existingItems, setExistingItems] = useState([]);
  const [showExistingItems, setShowExistingItems] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Category mapping for ingredients
  const categories = {
    "Fruits et Légumes": ["pomme", "banane", "carotte", "tomate", "oignon", "ail", "poireau", "salade", "épinard", "courgette", "aubergine"],
    "Protéines": ["poulet", "boeuf", "porc", "poisson", "oeuf", "tofu", "lentilles", "pois chiche"],
    "Produits Laitiers": ["lait", "fromage", "yaourt", "beurre", "crème"],
    "Épicerie": ["farine", "sucre", "sel", "huile", "vinaigre", "riz", "pâte", "conserve"]
  };

  // Helper functions
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  // Chargement des listes de courses sauvegardées
  const fetchUserShoppingLists = useCallback(async () => {
    try {
      const response = await api.get('/api/smart-pantry/shopping-lists');
      if (response.data && Array.isArray(response.data)) {
        setShoppingLists(response.data);
        
        // S'il y a au moins une liste, sélectionner la plus récente
        if (response.data.length > 0) {
          const mostRecent = response.data.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          )[0];
          
          setSelectedListId(mostRecent.id);
          
          // Charger les articles de cette liste
          if (mostRecent.items && Array.isArray(mostRecent.items)) {
            setShoppingList(mostRecent.items);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des listes de courses:', error);
      // En cas d'erreur, on essaie de charger depuis localStorage
      loadFromLocalStorage();
    }
  }, []);
  
  // Chargement initial - priorité aux données persistantes du serveur
  useEffect(() => {
    fetchUserShoppingLists();
    
    // Charger les recettes sélectionnées du localStorage
    const savedSelectedRecipes = localStorage.getItem('selectedRecipes');
    if (savedSelectedRecipes) {
      try {
        const parsedSelectedRecipes = JSON.parse(savedSelectedRecipes);
        setSelectedRecipes(parsedSelectedRecipes);
      } catch (error) {
        console.error('Erreur lors du chargement des recettes sélectionnées:', error);
      }
    }

    // Charger les ingrédients existants du localStorage
    const savedExistingItems = localStorage.getItem('existingItems');
    if (savedExistingItems) {
      try {
        const parsedExistingItems = JSON.parse(savedExistingItems);
        setExistingItems(parsedExistingItems);
        if (parsedExistingItems.length > 0) {
          setShowExistingItems(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des ingrédients existants:', error);
      }
    }

    // Ajouter des écouteurs d'événements pour l'impression
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [fetchUserShoppingLists]);
  
  // Fonction pour charger depuis localStorage si besoin
  const loadFromLocalStorage = () => {
    const savedList = localStorage.getItem('shoppingList');
    if (savedList) {
      try {
        const parsedList = JSON.parse(savedList);
        setShoppingList(parsedList);
        console.log('Liste de courses chargée du localStorage:', parsedList);
      } catch (error) {
        console.error('Erreur lors du chargement de la liste de courses:', error);
      }
    }
  };
  
  // Gestionnaires d'événements pour l'impression
  const handleBeforePrint = () => {
    setIsPrintMode(true);
  };

  const handleAfterPrint = () => {
    setIsPrintMode(false);
  };
  
  // Fonction pour imprimer la liste
  const printShoppingList = () => {
    // On active le mode impression avant d'ouvrir la boîte de dialogue
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };
  
  // Sauvegarde automatique de la liste de courses
  useEffect(() => {
    // Ne sauvegarder que si la liste n'est pas vide
    if (shoppingList.length > 0) {
      localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
      console.log('Liste de courses sauvegardée dans localStorage:', shoppingList);
    }
  }, [shoppingList]);
  
  // Sauvegarde des recettes sélectionnées
  useEffect(() => {
    if (selectedRecipes.length > 0) {
      localStorage.setItem('selectedRecipes', JSON.stringify(selectedRecipes));
    }
  }, [selectedRecipes]);
  
  // Sauvegarde des ingrédients existants
  useEffect(() => {
    if (existingItems.length > 0) {
      localStorage.setItem('existingItems', JSON.stringify(existingItems));
    }
  }, [existingItems]);

  // Fetch recipe suggestions
  const fetchSuggestedRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get suggested recipes
      const suggestedRecipesResponse = await api.get('/api/smart-pantry/recipes');
      
      // Handle suggested recipes
      if (suggestedRecipesResponse.data) {
        const data = suggestedRecipesResponse.data;
        // Mark suggestions for UI differentiation
        const processedSuggestions = Array.isArray(data) 
          ? data.map(recipe => ({ ...recipe, isSuggested: true }))
          : [];
        setSuggestedRecipes(processedSuggestions);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Impossible de charger les données. Veuillez réessayer plus tard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestedRecipes();
  }, [fetchSuggestedRecipes]);
  
  // Toggle recipe selection
  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipes(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      }
      return [...prev, recipeId];
    });
  };

  // Fonction pour nettoyer les noms d'ingrédients
  const cleanIngredientText = (text) => {
    if (!text || typeof text !== 'string') return 'Ingrédient inconnu';
    
    // Rechercher le motif typique d'erreur de traduction
    const errorPattern = /NO QUERY SPECIFIED|EXAMPLE REQUEST|GET\?Q=|LANGPAIR=/i;
    
    if (errorPattern.test(text)) {
      // Complètement supprimer le texte d'erreur
      return 'Ingrédient à vérifier';
    }
    
    return text;
  };

  // Méthode generateShoppingList corrigée
  const generateShoppingList = async () => {
    if (selectedRecipes.length === 0) {
      setError("Veuillez sélectionner au moins une recette");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Afficher les IDs des recettes sélectionnées pour le débogage
      console.log("Recettes sélectionnées:", selectedRecipes);
      
      // Assurez-vous que tous les IDs sont des nombres (correction de problèmes potentiels)
      const cleanIds = selectedRecipes.map(id => Number(id));
      
      // Demande API avec journalisation détaillée
      console.log("Envoi de la requête avec les IDs:", cleanIds);
      
      const response = await api.post('/api/smart-pantry/missing-ingredients', {
        recipe_ids: cleanIds
      });
      
      console.log("Réponse du serveur:", response.data);
      
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Format de réponse invalide');
      }
      
      // Extraction des données de la réponse
      const { missing_items = [], existing_items = [] } = response.data;
      
      // Vérifiez que missing_items est bien un tableau
      if (!Array.isArray(missing_items)) {
        console.error("Format incorrect pour missing_items:", missing_items);
        setError("Format de données incorrect reçu du serveur");
        setIsLoading(false);
        return;
      }
      
      // Si aucun ingrédient n'est manquant, ajouter un élément d'information
      if (missing_items.length === 0) {
        console.warn("Aucun ingrédient manquant trouvé, vérifiez l'API");
        
        // Vous pouvez ajouter un item de test pour vérifier si le rendu fonctionne
        const testRecipeId = cleanIds[0] || 0;
        missing_items.push({
          name: "Test - Ingrédient exemple",
          quantity: "1",
          unit: "",
          recipes: [{
            id: testRecipeId,
            name: "Recette test"
          }]
        });
      }
      
      // Préserver l'état des cases cochées pour les éléments existants
      const existingCheckedState = {};
      shoppingList.forEach(item => {
        if (item.checked) {
          // Utiliser le nom comme clé pour retrouver l'état plus tard
          existingCheckedState[item.name] = true;
        }
      });
      
      // Nettoyer les noms d'ingrédients avant l'affichage
      const shoppingItems = missing_items.map(item => {
        const cleanName = cleanIngredientText(item.name);
        
        // Vérifier si l'élément existait déjà et était coché
        const wasChecked = existingCheckedState[cleanName] || false;
        
        return {
          name: cleanName, // Utiliser le nom nettoyé
          quantity: item.quantity ? item.quantity.toString() : "1",
          unit: item.unit || "",
          checked: wasChecked,
          recipes: item.recipes || []
        };
      });
      
      console.log("Liste d'ingrédients générée:", shoppingItems);
      
      setShoppingList(shoppingItems);
      
      // Nettoyer également les noms des ingrédients déjà présents
      const cleanedExistingItems = Array.isArray(existing_items) 
        ? existing_items.map(item => ({
            ...item,
            name: cleanIngredientText(item.name)
          }))
        : [];
      
      setExistingItems(cleanedExistingItems);
      
      // Afficher automatiquement les ingrédients disponibles si présents
      if (cleanedExistingItems.length > 0) {
        setShowExistingItems(true);
        setSuccess(`Liste générée ! Vous avez déjà ${cleanedExistingItems.length} ingrédients disponibles.`);
      } else {
        setSuccess("Liste de courses générée avec succès");
      }
      
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      console.error("Erreur lors de la génération de la liste:", err);
      setError("Impossible de générer la liste. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle ingredient check status
  const toggleIngredientCheck = (index) => {
    setShoppingList(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          checked: !updated[index].checked
        };
      }
      return updated;
    });
  };

  // Save shopping list to backend
  const saveShoppingList = async () => {
    if (shoppingList.length === 0) {
      setError("Impossible de sauvegarder une liste vide");
      return;
    }
    
    setIsSaving(true);
    try {
      // Préparer les données à envoyer
      const listData = {
        items: shoppingList,
        // Ajouter un nom à la liste basé sur la date actuelle si c'est une nouvelle liste
        name: `Liste du ${new Date().toLocaleDateString()}`
      };
      
      // Si nous avons un ID de liste, utiliser PUT pour mettre à jour
      let response;
      if (selectedListId) {
        response = await api.put(`/api/smart-pantry/shopping-list/${selectedListId}`, listData);
      } else {
        response = await api.post('/api/smart-pantry/shopping-list', listData);
      }
      
      if (response.data && response.data.id) {
        setSelectedListId(response.data.id);
      }
      
      // Rafraîchir la liste des listes de courses
      await fetchUserShoppingLists();
      
      // Assurez-vous également de sauvegarder en local
      localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
      
      setSuccess("Liste de courses sauvegardée avec succès");
      setTimeout(clearSuccess, 3000);
    } catch (err) {
      console.error("Error saving shopping list:", err);
      setError("Erreur lors de la sauvegarde de la liste. La liste a été sauvegardée localement uniquement.");
      setTimeout(clearError, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Changer de liste sélectionnée
  const handleSelectList = async (listId) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/smart-pantry/shopping-list/${listId}`);
      
      if (response.data && response.data.items) {
        setShoppingList(response.data.items);
        setSelectedListId(listId);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la liste:", error);
      setError("Impossible de charger la liste sélectionnée");
    } finally {
      setIsLoading(false);
    }
  };

  // Créer une nouvelle liste vide
  const handleAddNewList = () => {
    setShoppingList([]);
    setSelectedListId(null);
    setSuccess("Nouvelle liste créée. N'oubliez pas de la sauvegarder.");
    setTimeout(clearSuccess, 3000);
  };

  // Categorize ingredients for display
  const categorizeIngredients = () => {
    const categorized = {
      "Fruits et Légumes": [],
      "Protéines": [],
      "Produits Laitiers": [],
      "Épicerie": [],
      "Autres": []
    };

    shoppingList.forEach(ingredient => {
      if (!ingredient.name) return;
      
      let foundCategory = false;
      const ingredientName = ingredient.name.toLowerCase();
      
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => ingredientName.includes(keyword.toLowerCase()))) {
          categorized[category].push(ingredient);
          foundCategory = true;
          break;
        }
      }
      
      if (!foundCategory) {
        categorized["Autres"].push(ingredient);
      }
    });

    return categorized;
  };

  // Amélioration clearShoppingList avec suppression du localStorage
  const clearShoppingList = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer cette liste ?")) {
      setShoppingList([]);
      localStorage.removeItem('shoppingList');
      
      // Si nous avons un ID de liste sélectionné, supprimer du serveur également
      if (selectedListId) {
        try {
          api.delete(`/api/smart-pantry/shopping-list/${selectedListId}`);
          setSelectedListId(null);
          // Rafraîchir la liste des listes
          fetchUserShoppingLists();
        } catch (error) {
          console.error("Erreur lors de la suppression de la liste:", error);
        }
      }
    }
  };

  // Création des styles spécifiques pour l'impression
  const printStyles = `
    @media print {
      .no-print {
        display: none !important;
      }
      
      .print-only {
        display: block !important;
      }
      
      .print-checkbox {
        width: 16px;
        height: 16px;
        border: 1px solid #000;
        display: inline-block;
        margin-right: 8px;
      }
      
      .print-checkbox.checked {
        background-color: #e0e0e0;
        position: relative;
      }
      
      .print-checkbox.checked:after {
        content: '✓';
        position: absolute;
        top: -2px;
        left: 2px;
      }
      
      .print-line-through {
        text-decoration: line-through;
      }
    }
  `;

  return (
    <Layout>
      {/* Styles pour l'impression */}
      <style>{printStyles}</style>
      
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Générer votre liste de courses 🛍️</h1>
        
        {error && <ErrorAlert message={error} onDismiss={clearError} />}
        {success && <SuccessAlert message={success} onDismiss={clearSuccess} />}
        
        {/* Affichage des listes de courses existantes */}
        <div className={`${isPrintMode ? 'no-print' : ''}`}>
          <ShoppingListSelector 
            lists={shoppingLists} 
            selectedListId={selectedListId}
            onSelect={handleSelectList}
            onAddNew={handleAddNewList}
          />
        </div>
        
        {/* Recipe selection section - Masqué lors de l'impression */}
        <div className={`mb-8 ${isPrintMode ? 'no-print' : ''}`}>
          <h2 className="text-xl font-semibold mb-4">Sélectionnez vos recettes</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700">Suggestions pour vous</h3>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
            </div>
          ) : (
            suggestedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedRecipes.map(recipe => (
                  <RecipeCard 
                    key={recipe.id}
                    recipe={recipe}
                    isSelected={selectedRecipes.includes(recipe.id)}
                    onToggle={() => toggleRecipeSelection(recipe.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-3">Aucune suggestion de recette disponible pour le moment.</p>
                <button 
                  onClick={fetchSuggestedRecipes}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Actualiser
                </button>
              </div>
            )
          )}
        </div>
        
        {/* Generate button - Masqué lors de l'impression */}
        <div className={`mb-8 flex justify-center ${isPrintMode ? 'no-print' : ''}`}>
          <button
            className={`px-6 py-3 rounded-lg font-medium text-white shadow-md ${
              selectedRecipes.length > 0  
                ? isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={generateShoppingList}
            disabled={selectedRecipes.length === 0 || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Génération en cours...
              </span>
            ) : (
              selectedRecipes.length > 0 
                ? `Générer la liste pour ${selectedRecipes.length} recette${selectedRecipes.length !== 1 ? 's' : ''}`
                : "Sélectionnez des recettes"
            )}
          </button>
        </div>
        {/* Generated shopping list - Optimisé pour l'impression */}
        {(shoppingList.length > 0 || existingItems.length > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Votre liste de courses</h2>
              <div className={`flex gap-2 ${isPrintMode ? 'no-print' : ''}`}>
                <button
                  onClick={printShoppingList}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Imprimer
                </button>
                <button
                  onClick={saveShoppingList}
                  disabled={isSaving || shoppingList.length === 0}
                  className={`bg-blue-600 text-white px-4 py-2 rounded transition-colors ${
                    isSaving || shoppingList.length === 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
            
            {/* Afficher les ingrédients déjà disponibles */}
            <ExistingIngredients 
              items={existingItems} 
              isVisible={showExistingItems}
              onToggle={() => setShowExistingItems(!showExistingItems)}
            />
            
            {/* Categorized ingredients - Adaptés pour l'impression */}
            {Object.entries(categorizeIngredients()).map(([category, items]) => {
              if (items.length === 0) return null;
              
              return (
                <div key={category} className="mb-6">
                  <h3 className="font-medium text-lg mb-2 text-gray-700 border-b pb-1">{category}</h3>
                  <ul className="space-y-2">
                    {items.map((item, index) => {
                      const listIndex = shoppingList.findIndex(
                        i => i.name === item.name && i.unit === item.unit
                      );
                      return (
                        <li 
                          key={`${item.name}-${index}`} 
                          className={`flex items-center p-3 rounded ${
                            item.checked ? 'bg-gray-100 text-gray-500' : 'bg-white'
                          }`}
                        >
                          {isPrintMode ? (
                            <div className={`print-checkbox ${item.checked ? 'checked' : ''}`}></div>
                          ) : (
                            <input
                              type="checkbox"
                              checked={!!item.checked}
                              onChange={() => toggleIngredientCheck(listIndex)}
                              className="mr-3 h-5 w-5 text-green-600"
                            />
                          )}
                          <div className={item.checked ? (isPrintMode ? 'print-line-through' : 'line-through') : ''}>
                            <span className="font-medium">{cleanIngredientText(item.name)}</span>
                            {item.quantity && (item.unit && item.unit !== "NO QUERY SPECIFIED. EXAMPLE REQUEST: GET?Q=HELLO&LANGPAIR=EN|IT") && (
                              <span className="text-gray-500">
                                - {item.quantity} {item.unit}
                              </span>
                            )}

                            <div className="text-xs text-gray-500 mt-1">
                              Pour: {Array.isArray(item.recipes) ? item.recipes.map(r => r.name).join(', ') : ''}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {/* Shopping list summary - Adapté pour l'impression */}
            <div className={`mt-6 text-center ${isPrintMode ? 'no-print' : ''}`}>
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>{shoppingList.filter(i => i.checked).length} articles cochés</span>
                <span>{shoppingList.length} articles au total</span>
              </div>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={clearShoppingList}
              >
                Effacer la liste
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}