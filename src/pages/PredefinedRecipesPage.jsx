import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function PredefinedRecipesPage() {
  const [recipes, setRecipes] = useState([]);

  const fetchRecipes = async () => {
    const res = await api.get('/recipes/predefined');
    setRecipes(res.data);
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <Layout title="Recettes prédéfinies">
      <h1 className="text-2xl font-bold mb-4">Catalogue de recettes</h1>

      {recipes.length === 0 && <p>Aucune recette disponible pour le moment.</p>}

      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-lg">{recipe.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => window.location.href = `/recipes/${recipe.id}`}
            >
              Voir la recette
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
