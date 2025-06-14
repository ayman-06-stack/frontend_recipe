import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState([]);
  const [ingredientName, setIngredientName] = useState('');
  const [type, setType] = useState('dislike');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    const { data } = await api.get('/user/preferences');
    setPreferences(data);
  };

  const addPreference = async () => {
    if (!ingredientName.trim()) return;
    await api.post('/user/preferences', { ingredient_name: ingredientName, type });
    setIngredientName('');
    fetchPreferences();
  };

  const removePreference = async (id) => {
    await api.delete(`/user/preferences/${id}`);
    fetchPreferences();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">🛑 Préférences & Allergies</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Nom de l’ingrédient"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className="border p-2 rounded">
          <option value="dislike">Je n’aime pas</option>
          <option value="allergy">Allergie</option>
        </select>
        <button onClick={addPreference} className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
      </div>

      <ul className="space-y-2">
        {preferences.map(pref => (
          <li key={pref.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
            <span>{pref.ingredient_name} ({pref.type})</span>
            <button onClick={() => removePreference(pref.id)} className="text-red-500 hover:underline">Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
