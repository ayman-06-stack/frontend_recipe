import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, AlertCircle, ArrowRight, Plus, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import LessonView from './LessonView';
import api from '../services/api'; // Assurez-vous que le chemin d'importation est correct

export default function CourseDetail({ 
  course, 
  userProgress, 
  onBackClick,
  onLessonComplete,
  onAddIngredientsToInventory,
  onAddRecipeToFavorites, 
  isAIGenerated,
  onDeleteCourse,
}) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const completedLessons = userProgress?.completedLessons || [];
  
  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId);
  
  // Récupérer la leçon active du localStorage lors du chargement initial
  useEffect(() => {
    if (!course?.id || !course?.lessons) return;
    
    const savedLessonId = localStorage.getItem(`activeLesson_${course.id}`);
    
    if (savedLessonId) {
      const lesson = course.lessons.find(l => l.id.toString() === savedLessonId);
      if (lesson) {
        // Juste stocker la référence à la leçon, pas son contenu complet
        setActiveLesson({...lesson});
      }
    }
  }, [course?.id, course?.lessons]);

  // Charger les données de la leçon active si nécessaire
  useEffect(() => {
    if (!activeLesson || !course?.id) {
      setLessonData(null);
      return;
    }
    
    // Précharger le contenu de la leçon depuis l'API
    const fetchLessonContent = async () => {
      try {
        setIsLoadingLesson(true);
        console.log(`Préchargement du contenu pour la leçon ${activeLesson.id}`);
        
        const response = await api.get(`/api/ai-courses/${course.id}/lessons/${activeLesson.id}/content`);
        const data = response.data;
        
        console.log("Contenu préchargé avec succès:", data);
        
        if (data.content) {
          setLessonData({
            ...activeLesson,
            content: data.content
          });
        } else {
          // En cas d'absence de contenu, on utilise juste les données de base
          console.log("Pas de contenu disponible, utilisation des données de base");
          setLessonData(activeLesson);
        }
      } catch (error) {
        console.error("Erreur lors du préchargement du contenu:", error);
        setLessonData(activeLesson);
      } finally {
        setIsLoadingLesson(false);
      }
    };
    
    fetchLessonContent();
    
  }, [activeLesson, course?.id]);

  // Gestion de la leçon active
  const handleSetActiveLesson = (lesson) => {
    setActiveLesson(lesson);
    setLessonData(null); // Réinitialiser les données pour éviter d'afficher le contenu d'une ancienne leçon
    
    if (lesson) {
      localStorage.setItem(`activeLesson_${course.id}`, lesson.id);
    } else {
      localStorage.removeItem(`activeLesson_${course.id}`);
    }
  };
  
  // Protection contre les erreurs si course n'est pas chargé
  if (!course) {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-lg p-8 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mr-3"></div>
          <p>Chargement du cours...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      {/* En-tête avec bouton retour et options */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBackClick} className="mr-3">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold">{course.title}</h2>
        </div>
        
        {/* Bouton de suppression intégré dans l'en-tête */}
        {isAIGenerated && (
          <button 
            onClick={() => onDeleteCourse(course.id)}
            className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition duration-150 text-sm flex items-center"
            aria-label="Supprimer ce cours"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </button>
        )}
      </div>

      {/* Contenu principal - affiche soit la vue d'ensemble du cours, soit une leçon spécifique */}
      {!activeLesson ? (
        <CourseOverview 
          course={course}
          completedLessons={completedLessons}
          onLessonSelect={handleSetActiveLesson}
          onAddRecipeToFavorites={onAddRecipeToFavorites} 
          onAddIngredientsToInventory={onAddIngredientsToInventory}
          isLessonCompleted={isLessonCompleted}
        />
      ) : lessonData ? (
        <LessonView 
          lesson={lessonData}
          courseId={course.id}
          isCompleted={isLessonCompleted(activeLesson.id)}
          onBackClick={() => handleSetActiveLesson(null)}
          onMarkComplete={() => {
            onLessonComplete(course.id, activeLesson.id);
          }}
        />
      ) : (
        <div className="p-6 text-center">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
            <p className="ml-3">Chargement de la leçon...</p>
          </div>
          <button 
            onClick={() => handleSetActiveLesson(null)}
            className="mt-4 px-4 py-2 border rounded-lg hover:bg-gray-50 transition duration-150"
          >
            <ChevronLeft className="h-4 w-4 inline mr-1" />
            Retour au cours
          </button>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher la vue d'ensemble du cours
function CourseOverview({ 
  course, 
  completedLessons, 
  onLessonSelect, 
  onAddRecipeToFavorites, 
  onAddIngredientsToInventory,
  isLessonCompleted 
}) {
  return (
    <div>
      <img src={course.image_url} alt={course.title} className="w-full h-64 object-cover" />
      
      <div className="p-6">
        {/* Badges et favoris */}
        <div className="flex justify-between mb-4">
          <div className="flex space-x-4">
            <span className="text-sm bg-gray-100 rounded-full px-3 py-1">{course.difficulty}</span>
            <span className="text-sm bg-gray-100 rounded-full px-3 py-1">{course.duration} min</span>
          </div>
          
          {course.recipe_id && (
            <button 
              onClick={() => onAddRecipeToFavorites(course.recipe_id)}
              className="bg-red-50 text-red-500 p-2 rounded-full hover:bg-red-100"
              aria-label="Ajouter aux favoris"
            >
              <Heart className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Description du cours */}
        <p className="text-gray-700 mb-6">{course.description}</p>
        
        {/* Liste des ingrédients */}
        {course.ingredients?.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Ingrédients nécessaires</h3>
              <button 
                onClick={() => onAddIngredientsToInventory(course.ingredients)}
                className="text-sm text-green-600 flex items-center hover:text-green-700"
              >
                <Plus className="h-4 w-4 mr-1" /> Ajouter à mon inventaire
              </button>
            </div>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {course.ingredients.map((ingredient, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{ingredient.name} {ingredient.quantity && `(${ingredient.quantity})`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Liste des leçons */}
        <h3 className="text-lg font-semibold mb-4">Leçons</h3>
        <div className="space-y-3">
          {course.lessons?.map((lesson, index) => (
            <div 
              key={lesson.id}
              onClick={() => onLessonSelect(lesson)}
              className="flex justify-between items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition duration-150"
            >
              <div className="flex items-center">
                <div className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
                  {index + 1}
                </div>
                <span className="line-clamp-1">{lesson.title}</span>
              </div>
              
              <div className="flex items-center">
                {isLessonCompleted(lesson.id) && (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                )}
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}