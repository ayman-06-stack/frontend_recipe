import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Loader2, Filter, SortDesc, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/ingredients');
      setIngredients(data);
    } catch (error) {
      console.error('Erreur lors du chargement des ingrédients:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = async () => {
    if (!newIngredient.trim()) return;
    
    setLoading(true);
    try {
      await api.post('/api/ingredients', { name: newIngredient.trim() });
      setNewIngredient('');
      fetchIngredients();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      setLoading(false);
    }
  };

  const deleteIngredient = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/api/ingredients/${id}`);
      fetchIngredients();
      setShowConfirmDelete(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteTargetId(id);
    setShowConfirmDelete(true);
  };

  const startEditing = (ingredient) => {
    setEditingId(ingredient.id);
    setEditValue(ingredient.name);
  };

  const saveEdit = async () => {
    if (!editValue.trim()) return;
    
    setLoading(true);
    try {
      await api.put(`/api/ingredients/${editingId}`, { name: editValue.trim() });
      setEditingId(null);
      fetchIngredients();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Mes Ingrédients</h1>
          <p className="text-gray-600 mt-1">
            Gérez votre liste d'ingrédients pour planifier vos recettes
          </p>
        </div>

        {/* Section d'ajout et recherche */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Formulaire d'ajout */}
            <div className="flex-grow">
              <label htmlFor="new-ingredient" className="block text-sm font-medium text-gray-700 mb-1">
                Nouvel ingrédient
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    id="new-ingredient"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addIngredient)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Ex: Tomates fraîches"
                  />
                </div>
                <button
                  onClick={addIngredient}
                  disabled={!newIngredient.trim()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${!newIngredient.trim() ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  <Plus size={18} />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="md:w-1/3">
              <label htmlFor="search-ingredient" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <div className="relative">
                <input
                  id="search-ingredient"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Filtrer..."
                />
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des ingrédients */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Liste des ingrédients</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{filteredIngredients.length} ingrédient(s)</span>
              <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <Filter size={16} />
              </button>
              <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <SortDesc size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Chargement...</span>
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
              {searchTerm ? (
                <>
                  <p className="text-gray-500 font-medium">Aucun résultat trouvé</p>
                  <p className="text-gray-400 text-sm mt-1">Essayez avec un terme différent</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500 font-medium">Aucun ingrédient disponible</p>
                  <p className="text-gray-400 text-sm mt-1">Commencez par ajouter votre premier ingrédient</p>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredIngredients.map((ingredient) => (
                <li 
                  key={ingredient.id}
                  className="py-3 px-2 flex justify-between items-center hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {editingId === ingredient.id ? (
                    <div className="flex flex-1 mr-2">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                        className="flex-grow border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="font-medium text-gray-700">{ingredient.name}</span>
                  )}
                  
                  <div className="flex items-center gap-1">
                    {editingId === ingredient.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(ingredient)}
                          className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(ingredient.id)}
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Modal de confirmation pour la suppression */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center text-red-500 mb-4">
                <AlertTriangle size={24} className="mr-2" />
                <h3 className="text-lg font-medium">Confirmer la suppression</h3>
              </div>
              <p className="mb-6 text-gray-600">
                Êtes-vous sûr de vouloir supprimer cet ingrédient ? Cette action est irréversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => deleteIngredient(deleteTargetId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}