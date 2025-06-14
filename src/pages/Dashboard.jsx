import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  ChefHat,
  ShoppingCart,
  Heart,
  Rocket,
  Book,
  Clock,
  CheckCircle,
  Flame,
  Salad,
  Utensils,
  User,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    user: false,
    stats: false,
    favorites: false,
    courses: false
  });
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({
    ingredients: 0,
    favorites: 0,
    generatedRecipes: 0,
    completedCourses: 0
  });
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // Fonction utilitaire pour gérer les durées de recettes
  const getRecipeDuration = useCallback((recipe) => {
    if (!recipe) return 'N/A';
    return recipe.duration || 
           recipe.preparation_time || 
           recipe.ready_in_minutes || 
           'N/A';
  }, []);

  // Fonction pour mettre à jour l'état de chargement
  const updateLoadingState = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  // Fonction pour gérer les erreurs
  const handleError = useCallback((key, error) => {
    console.error(`Error fetching ${key}:`, error);
    setErrors(prev => ({ ...prev, [key]: error.message || `Erreur lors du chargement de ${key}` }));
    
    // Redirection si erreur d'authentification
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate]);

  // Fonctions de récupération des données avec gestion d'erreur améliorée
  const fetchUserData = useCallback(async () => {
    try {
      updateLoadingState('user', true);
      const response = await api.get('/api/user');
      setUser(response.data);
      setErrors(prev => ({ ...prev, user: null }));
    } catch (error) {
      handleError('user', error);
    } finally {
      updateLoadingState('user', false);
    }
  }, [updateLoadingState, handleError]);

  const fetchStats = useCallback(async () => {
    try {
      updateLoadingState('stats', true);
      const response = await api.get('/api/dashboard/stats');
      
      // Validation et normalisation des données de statistiques
      const safeStats = {
        ingredients: Math.max(0, Number(response.data.ingredients) || 0),
        favorites: Math.max(0, Number(response.data.favorites) || 0),
        generatedRecipes: Math.max(0, Number(response.data.generatedRecipes) || 0),
        completedCourses: Math.max(0, Number(response.data.completedCourses) || 0)
      };
      
      setStats(safeStats);
      setErrors(prev => ({ ...prev, stats: null }));
    } catch (error) {
      handleError('stats', error);
    } finally {
      updateLoadingState('stats', false);
    }
  }, [updateLoadingState, handleError]);

  const fetchFavorites = useCallback(async () => {
    try {
      updateLoadingState('favorites', true);
      const response = await api.get('/api/dashboard/favorites');
      
      // Validation des données favorites
      const validFavorites = Array.isArray(response.data) 
        ? response.data.filter(fav => fav && fav.recipe && fav.recipe.title)
        : [];
      
      setFavoriteRecipes(validFavorites);
      setErrors(prev => ({ ...prev, favorites: null }));
    } catch (error) {
      handleError('favorites', error);
      setFavoriteRecipes([]);
    } finally {
      updateLoadingState('favorites', false);
    }
  }, [updateLoadingState, handleError]);

  const fetchCourses = useCallback(async () => {
    try {
      updateLoadingState('courses', true);
      const response = await api.get('/api/courses/recommended');
      
      // Validation des données de cours
      const validCourses = Array.isArray(response.data) 
        ? response.data.filter(course => course && course.id)
        : [];
      
      setUserCourses(validCourses);
      setErrors(prev => ({ ...prev, courses: null }));
    } catch (error) {
      handleError('courses', error);
      setUserCourses([]);
    } finally {
      updateLoadingState('courses', false);
    }
  }, [updateLoadingState, handleError]);

  // Fonction de retry pour les requêtes échouées
  const retryFailedRequests = useCallback(async () => {
    if (retryCount >= 3) return; // Limite à 3 tentatives
    
    setRetryCount(prev => prev + 1);
    
    const retryPromises = [];
    if (errors.user) retryPromises.push(fetchUserData());
    if (errors.stats) retryPromises.push(fetchStats());
    if (errors.favorites) retryPromises.push(fetchFavorites());
    if (errors.courses) retryPromises.push(fetchCourses());
    
    await Promise.allSettled(retryPromises);
  }, [errors, retryCount, fetchUserData, fetchStats, fetchFavorites, fetchCourses]);

  // Chargement initial des données avec Promise.allSettled pour ne pas bloquer en cas d'erreur
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      // Utilisation de Promise.allSettled pour exécuter toutes les requêtes en parallèle
      // même si certaines échouent
      await Promise.allSettled([
        fetchUserData(),
        fetchStats(),
        fetchFavorites(),
        fetchCourses()
      ]);
      
      setLoading(false);
    };

    fetchAllData();
  }, [fetchUserData, fetchStats, fetchFavorites, fetchCourses]);

  // Calcul mémorisé pour vérifier s'il y a des erreurs
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== null);
  }, [errors]);

  // Calcul mémorisé pour vérifier si des données sont en cours de chargement
  const isPartiallyLoading = useMemo(() => {
    return Object.values(loadingStates).some(state => state);
  }, [loadingStates]);

  // Composant d'erreur avec bouton de retry
  const ErrorAlert = ({ message, onRetry }) => (
    <div className="flex items-center justify-between p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 px-3 py-1 text-xs bg-red-200 hover:bg-red-300 rounded-md transition-colors flex items-center"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Réessayer
        </button>
      )}
    </div>
  );

  // Affichage du chargement initial
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Affichage des erreurs avec option de retry */}
      {hasErrors && (
        <ErrorAlert 
          message="Certaines données n'ont pas pu être chargées" 
          onRetry={retryFailedRequests}
        />
      )}
      
      {/* Indicateur de chargement partiel */}
      {isPartiallyLoading && (
        <div className="flex items-center p-3 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
          <span>Mise à jour des données en cours...</span>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Cartes de statistiques avec gestion d'erreur */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
            title="Ingrédients"
            value={stats.ingredients}
            description="dans votre inventaire"
            color="blue"
            loading={loadingStates.stats}
            error={errors.stats}
          />
          <StatCard 
            icon={<Heart className="h-6 w-6 text-red-600" />}
            title="Favoris"
            value={stats.favorites}
            description="recettes enregistrées"
            color="red"
            loading={loadingStates.stats}
            error={errors.stats}
          />
          <StatCard 
            icon={<Rocket className="h-6 w-6 text-purple-600" />}
            title="Recettes IA"
            value={stats.generatedRecipes}
            description="générées ce mois"
            color="purple"
            loading={loadingStates.stats}
            error={errors.stats}
          />
          <StatCard 
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            title="Cours terminés"
            value={stats.completedCourses}
            description="dans votre parcours"
            color="green"
            loading={loadingStates.stats}
            error={errors.stats}
          />
        </div>

        {/* Section Recettes Favorites */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Vos recettes favorites
              {loadingStates.favorites && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 ml-2"></div>
              )}
            </h3>
          </div>
          
          {errors.favorites ? (
            <div className="p-4">
              <ErrorAlert 
                message={errors.favorites}
                onRetry={fetchFavorites}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {favoriteRecipes.length > 0 ? (
                favoriteRecipes.map((favorite, index) => {
                  const recipe = favorite.recipe;
                  const duration = getRecipeDuration(recipe);

                  return (
                    <div 
                      key={favorite.id || index} 
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate('/favorites')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {recipe.title}
                          </h4>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {duration} min
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                            <Salad className="h-3 w-3 mr-1" />
                            {recipe.category || 'Recette'}
                          </span>
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            Favori
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-gray-500">
                  {loadingStates.favorites ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400 mr-2"></div>
                      Chargement des favoris...
                    </div>
                  ) : (
                    "Vous n'avez aucune recette favorite. Ajoutez des recettes à vos favoris pour les voir ici!"
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={() => navigate('/recipes')}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors"
            >
              <Utensils className="h-4 w-4 mr-1" />
              Explorer les recettes
            </button>
          </div>
        </div>

        {/* Section Cours de l'utilisateur */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Book className="h-5 w-5 text-indigo-500 mr-2" />
              Vos cours de cuisine
              {loadingStates.courses && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500 ml-2"></div>
              )}
            </h3>
          </div>
          
          {errors.courses ? (
            <div className="p-4">
              <ErrorAlert 
                message={errors.courses}
                onRetry={fetchCourses}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {userCourses.length > 0 ? (
                userCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                      <Utensils className="h-10 w-10 text-indigo-400" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium text-gray-800">{course.title}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                          {course.difficulty || 'Débutant'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {course.lessonsCount || 0} leçons
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 p-6 text-center text-gray-500">
                  {loadingStates.courses ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400 mr-2"></div>
                      Chargement des cours...
                    </div>
                  ) : (
                    "Vous n'avez pas encore de cours. Créez votre premier cours de cuisine ou explorez notre catalogue."
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={() => navigate('/courses/create')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center transition-colors"
            >
              <ChefHat className="h-4 w-4 mr-1" />
              Créer un nouveau cours
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Composant Carte de Statistique amélioré
function StatCard({ icon, title, value, description, color, loading, error }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
        </div>
      )}
      
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]} ${error ? 'opacity-50' : ''}`}>
          {error ? <AlertCircle className="h-6 w-6" /> : icon}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className={`mt-1 text-2xl font-semibold ${error ? 'text-red-500' : 'text-gray-900'}`}>
          {error ? '!' : value}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {error ? 'Erreur de chargement' : description}
        </p>
      </div>
    </div>
  );
}