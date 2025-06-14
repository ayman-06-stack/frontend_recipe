import React, { useState } from 'react';
import { AlertCircle, Check, ChevronRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import CourseGenerationStatus from '../components/CourseGenerationStatus';

export default function GenerateCourseForm({ onSuccess }) {
  const [coursesGenerating, setCoursesGenerating] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'basiques',
    difficulty: 'débutant',
    useUserIngredients: false
  });
  
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null
  });
  
  const [generatedCourse, setGeneratedCourse] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setStatus({ loading: true, success: false, error: null });
      
      // Choisir l'endpoint en fonction du choix utilisateur
      const endpoint = formData.useUserIngredients
        ? '/api/ai-courses/generate-from-ingredients'
        : '/api/ai-courses/generate';
      
      // Préparer les données à envoyer
      const requestData = {
        title: formData.title || null,
        category: formData.category,
        difficulty: formData.difficulty
      };
      
      console.log('Envoi de la requête:', { endpoint, data: requestData });
      
      const response = await api.post(endpoint, requestData);
      
      console.log('Réponse reçue:', response.data);
      
      if (response.data.status === 'pending' || response.data.status === 'processing') {
        // Si le cours est en traitement, ajoutez-le à la liste des cours en génération
        setCoursesGenerating(prev => [...prev, response.data.course]);
        setStatus({ loading: false, success: false, error: null });
      } else {
        // Si le cours est déjà prêt
        setGeneratedCourse(response.data.course);
        setStatus({ loading: false, success: true, error: null });
        
        if (onSuccess) {
          onSuccess(response.data.course);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      
      let errorMessage = "Une erreur s'est produite";
      
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        console.error('Erreur serveur:', error.response.data);
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Erreur ${error.response.status}`;
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        console.error('Pas de réponse du serveur:', error.request);
        errorMessage = "Impossible de contacter le serveur";
      } else {
        // Autre erreur
        console.error('Erreur:', error.message);
        errorMessage = error.message;
      }
      
      setStatus({
        loading: false,
        success: false,
        error: errorMessage
      });
    }
  };

  const handleCourseGenerationCompleted = async (courseId) => {
    try {
      // Récupérer les détails du cours généré
      const response = await api.get(`/api/ai-courses/${courseId}`);
      
      // Mettre à jour l'état
      setGeneratedCourse(response.data);
      setStatus({ loading: false, success: true, error: null });
      
      // Retirer ce cours de la liste des cours en génération
      setCoursesGenerating(prev => prev.filter(course => course.id !== courseId));
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du cours généré:', error);
      setStatus({
        loading: false,
        success: false,
        error: "Erreur lors de la récupération du cours généré"
      });
    }
  };

  const categories = [
    { value: 'basiques', label: 'Techniques de base' },
    { value: 'pâtisserie', label: 'Pâtisserie' },
    { value: 'cuisine française', label: 'Cuisine française' },
    { value: 'cuisine internationale', label: 'Cuisine internationale' },
    { value: 'nutrition', label: 'Nutrition et alimentation' }
  ];
  
  const difficulties = [
    { value: 'débutant', label: 'Débutant' },
    { value: 'intermédiaire', label: 'Intermédiaire' },
    { value: 'avancé', label: 'Avancé' }
  ];

  if (status.success && generatedCourse) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center text-green-600 mb-4">
          <Check className="mr-2" />
          <h3 className="text-lg font-semibold">Cours généré avec succès !</h3>
        </div>
        
        <div className="mb-4">
          <h4 className="font-bold text-xl">{generatedCourse.title}</h4>
          <p className="text-gray-600 mt-2">{generatedCourse.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Catégorie</span>
            <p>{generatedCourse.category}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Difficulté</span>
            <p>{generatedCourse.difficulty}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Durée</span>
            <p>{generatedCourse.duration} minutes</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Leçons</span>
            <p>{generatedCourse.lessons?.length || 0} leçons</p>
          </div>
        </div>
        
        {generatedCourse.lessons && generatedCourse.lessons.length > 0 && (
          <div className="mt-6">
            <h5 className="font-semibold mb-2">Contenu du cours :</h5>
            <ul className="space-y-2">
              {generatedCourse.lessons.map((lesson, index) => (
                <li key={lesson.id} className="flex items-center">
                  <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  {lesson.title}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            onClick={() => {
              setStatus({ loading: false, success: false, error: null });
              setGeneratedCourse(null);
            }}
          >
            Générer un autre cours
          </button>
          
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            onClick={() => {
              // Rediriger vers le cours généré
              window.location.href = `/courses/${generatedCourse.id}`;
            }}
          >
            Voir le cours <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Générer un cours avec l'IA</h2>
      
      {status.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{status.error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre du cours (facultatif)
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Laissez vide pour génération automatique"
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si non renseigné, l'IA générera un titre basé sur la catégorie
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau de difficulté
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="useUserIngredients"
              checked={formData.useUserIngredients}
              onChange={handleChange}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
            />
            <span className="text-sm text-gray-700">
              Utiliser les ingrédients de mon inventaire
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Le cours sera adapté pour utiliser les ingrédients que vous avez déjà
          </p>
        </div>
        
        <div className="border-t pt-4">
          <button
            type="submit"
            disabled={status.loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {status.loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" />
                Génération en cours...
              </>
            ) : (
              "Générer un cours"
            )}
          </button>
          
          {coursesGenerating.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Cours en cours de génération :</h3>
              {coursesGenerating.map(course => (
                <CourseGenerationStatus 
                  key={course.id}
                  courseId={course.id}
                  onCompleted={(courseId) => handleCourseGenerationCompleted(courseId)}
                />
              ))}
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            La génération peut prendre jusqu'à 1 minute
          </p>
        </div>
      </form>
    </div>
  );
}