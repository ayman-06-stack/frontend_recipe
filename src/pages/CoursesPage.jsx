import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, Sparkles } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import CourseCard from '../components/CourseCard';
import CourseDetail from '../components/CourseDetail';
import FilterBar from '../components/FilterBar';
import GenerateCourseForm from '../components/GenerateCourseForm';
import { useParams } from 'react-router-dom';

export default function CoursesPage() { 
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    duration: 'all',
    category: 'all',
    source: 'all' // nouveau filtre pour différencier cours IA/standard
  });
  const [userProgress, setUserProgress] = useState({});
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const navigate = useNavigate();
  const { courseId } = useParams();

  // Supprimer un cours
const handleDeleteCourse = async (courseId) => {
  if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
    return;
  }
  
  try {
    await api.delete(`/api/ai-courses/${courseId}`);
    
    // Retirer le cours supprimé de la liste
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    
    // Si le cours supprimé était sélectionné, retourner à la liste
    if (selectedCourse && selectedCourse.id === courseId) {
      setSelectedCourse(null);
      window.history.pushState({}, '', '/courses');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du cours', error);
  }
};

  useEffect(() => {
    if (courseId) {
      // Charger le cours spécifique
      const fetchCourse = async () => {
        try {
          const response = await api.get(`/api/courses/${courseId}`);
          setSelectedCourse(response.data.course);
          setUserProgress(response.data.userProgress || {});
        } catch (error) {
          console.error('Erreur lors du chargement du cours', error);
        }
      };
      
      fetchCourse();
    }
  }, [courseId]);


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/courses', { params: filters });
        setCourses(response.data.courses);
        setUserProgress(response.data.userProgress || {});
      } catch (error) {
        console.error('Erreur lors du chargement des cours', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourses();
  }, [filters]);

  // Gestion des filtres
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Sélection d'un cours
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    // Mettre à jour l'URL avec l'ID du cours sans toucher au localStorage
    window.history.pushState({}, '', `?courseId=${course.id}`);
  };

  const handleBackToCoursesList = () => {
    setSelectedCourse(null);
    // Nettoyer l'URL
    window.history.pushState({}, '', '/courses');
  };

  // Marquer une leçon comme terminée
  const markLessonAsCompleted = async (courseId, lessonId) => {
    try {
      await api.post(`/api/courses/${courseId}/lessons/${lessonId}/complete`);
      
      // Mettre à jour le progrès local
      setUserProgress(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          completedLessons: [...(prev[courseId]?.completedLessons || []), lessonId]
        }
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du progrès', error);
    }
  };

  // Ajouter des ingrédients du cours à la liste d'ingrédients
  const addCourseIngredientsToInventory = async (ingredients) => {
    try {
      await api.post('/api/ingredients/bulk', { ingredients });
      navigate('/ingredients');
    } catch (error) {
      console.error('Erreur lors de l\'ajout des ingrédients', error);
    }
  };

  // Ajouter une recette du cours aux favoris
  const addCourseRecipeToFavorites = async (recipeId) => {
    try {
      await api.post('/api/recipes/favorites', { recipe_id: recipeId });
      // Feedback visuel à implémenter
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris', error);
    }
  };

  // Gérer la réussite de la génération d'un cours
  const handleAICourseGenerated = (course) => {
    // Ajouter le nouveau cours à la liste
    setCourses(prevCourses => [course, ...prevCourses]);
    // Fermer le formulaire
    setShowAIGenerator(false);
    // Optionnel: naviguer directement vers le cours
    // setSelectedCourse(course);
  };

  return (
    <Layout title="Cours Culinaires">
      <div className="container mx-auto px-4 py-8">
        {!selectedCourse ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Cours Culinaires 👨‍🍳</h1>
              
              <button 
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700"
              >
                {showAIGenerator ? (
                  <>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Voir tous les cours
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Générer avec l'IA
                  </>
                )}
              </button>
            </div>
            
            {showAIGenerator ? (
              <GenerateCourseForm onSuccess={handleAICourseGenerated} />
            ) : (
              <>
                <FilterBar 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                  showSourceFilter={true} // Ajouter l'option pour filtrer par source (IA ou standard)
                />
                
                {loading ? (
                  <div className="flex justify-center my-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : (
                  <>
                    {courses.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mb-4 text-gray-400">
                          <BookOpen className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-600 mb-2">
                          Aucun cours trouvé
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Essayez de modifier vos filtres ou de générer un nouveau cours avec l'IA
                        </p>
                        <button
                          onClick={() => setShowAIGenerator(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          Créer avec l'IA
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {courses.map(course => (
                          <CourseCard 
                            key={course.id}
                            course={course}
                            progress={userProgress[course.id]?.progress || 0}
                            onClick={() => handleCourseSelect(course)}
                            isAIGenerated={course.is_ai_generated}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <CourseDetail
            course={selectedCourse}
            userProgress={userProgress[selectedCourse.id]}
            onBackClick={() => setSelectedCourse(null)}
            onLessonComplete={markLessonAsCompleted}
            onAddIngredientsToInventory={addCourseIngredientsToInventory}
            onAddRecipeToFavorites={addCourseRecipeToFavorites}
            onDeleteCourse={handleDeleteCourse}
            isAIGenerated={selectedCourse.is_ai_generated}
          />
        )}
      </div>
    </Layout>
  );
}