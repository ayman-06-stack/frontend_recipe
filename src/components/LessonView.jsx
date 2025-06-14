import React, { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api'; // Assurez-vous que le chemin d'importation est correct

function LessonView({ lesson, courseId, isCompleted, onBackClick, onMarkComplete }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('inline'); // 'inline' ou 'iframe'
  const [retryCount, setRetryCount] = useState(0);
  
  // URLs pour les deux formats de contenu
  const contentJsonUrl = `/api/ai-courses/${courseId}/lessons/${lesson.id}/content`;
  const contentHtmlUrl = `/api/ai-courses/${courseId}/lessons/${lesson.id}/raw-content`;

 const cleanHtmlContent = (content) => {
  if (!content) return '';
  
  // Remplacer les balises ```html par du vide
  return content
    .replace(/```html/gi, '') // Supprime ```html (insensible à la casse)
    .replace(/```/g, '')      // Supprime les ``` restants
    .trim();                  // Supprime les espaces en début/fin
};
  
  const loadContent = async (useIframe = false) => {
    setIsLoading(true);
    setError(null);
    
    // Si on veut utiliser l'iframe directement
    if (useIframe) {
      console.log("Passage au mode iframe");
      setContentType('iframe');
      setContent('');
      setIsLoading(false);
      return;
    }
    
    try {
      // Vérifier si le contenu est déjà disponible dans l'objet de leçon
      if (lesson.content && lesson.content.trim() !== '') {
        console.log("Utilisation du contenu préchargé de la leçon");
        setContent(lesson.content);
        setContentType('inline');
        setIsLoading(false);
        return;
      }
      
      // Si non, charger depuis l'API en utilisant axios avec nos configurations anti-cache
      console.log("Contenu non disponible dans l'objet, chargement depuis API");
      
      const response = await api.get(contentJsonUrl);
      const data = response.data;
      
      console.log("Réponse de l'API:", data);
      
      if (data.status === 'error') {
        throw new Error(data.message || "Erreur serveur lors du chargement");
      }
      
      if (data.content && data.content.trim() !== '') {
        console.log("Contenu reçu avec succès de l'API");
        setContent(data.content);
        // setContent(cleanMarkdownCode(data.content));
        setContentType('inline');
        setIsLoading(false);
      } else {
        console.warn("Contenu vide reçu de l'API");
        
        // Tentative d'obtenir le contenu brut en cas d'échec du format JSON
        const rawResponse = await api.get(contentHtmlUrl);
        
        if (rawResponse.status === 200 && rawResponse.data) {
          console.log("Contenu brut récupéré avec succès");
          setContentType('iframe');
          setIsLoading(false);
        } else {
          throw new Error("Le contenu de la leçon est vide");
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement du contenu:", err);
      
      // En cas d'erreur et si nous n'avons pas déjà basculé vers l'iframe
      if (contentType !== 'iframe') {
        console.log("Tentative de basculement vers l'iframe après erreur");
        setContentType('iframe');
        setError(`Problème de chargement du contenu. Affichage alternatif activé.`);
      } else {
        setError(`Impossible de charger le contenu de la leçon: ${err.message || 'Erreur inconnue'}`);
      }
      setIsLoading(false);
    }
  };

  // Charger le contenu au montage du composant et à chaque changement de leçon
  useEffect(() => {
    console.log(`Initialisation du chargement pour la leçon ID ${lesson.id}`);
    // Réinitialiser le contenu et le type à chaque changement de leçon
    setContent('');
    setContentType('inline');
    setRetryCount(0);
    loadContent();
    
    // Fonction de nettoyage pour éviter les mises à jour sur un composant démonté
    return () => {
      console.log("Nettoyage du composant LessonView");
      setIsLoading(false);
    };
  }, [lesson.id, courseId]);

  // Fonction pour réessayer le chargement
  const handleRetry = () => {
    console.log(`Tentative de rechargement #${retryCount + 1}`);
    setRetryCount(retryCount + 1);
    
    // Si déjà essayé plus de 2 fois, passer directement à l'iframe
    if (retryCount >= 2) {
      loadContent(true);
    } else {
      loadContent(contentType === 'iframe');
    }
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">{lesson.title}</h3>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          <p className="ml-3">Chargement du contenu...</p>
        </div>
        <div className="mt-4">
          <button 
            onClick={onBackClick}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition duration-150"
          >
            Retour au cours
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">{lesson.title}</h3>
      
      {/* Vidéo si disponible */}
      {/* {lesson.video_url && (
        <div className="mb-6">
          <iframe 
            src={lesson.video_url} 
            className="w-full h-96 rounded-lg"
            allowFullScreen
            title={`Vidéo: ${lesson.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          ></iframe>
        </div>
      )} */}
      
      {/* Affichage d'un message d'erreur si nécessaire */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-2 text-sm flex items-center font-medium text-yellow-700 hover:text-yellow-900"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Réessayer
            </button>
          </div>
        </div>
      )}
      
      {/* Contenu de la leçon - choix entre méthode inline et iframe */}
      <div className="mb-8">
        {contentType === 'inline' && content ? (
          // Méthode 1: Rendu HTML direct dans le composant avec nettoyage
          <div 
            className="prose max-w-none bg-white p-4 rounded-lg border"
            dangerouslySetInnerHTML={{ __html: cleanHtmlContent(content) }}
          />
          
        ) : contentType === 'iframe' ? (
          // Méthode 2: Iframe pour le contenu HTML complet
          <iframe
            src={`${contentHtmlUrl}?_=${new Date().getTime()}`}
            className="w-full min-h-[500px] rounded-lg border"
            title={lesson.title}
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          // Fallback si aucun contenu n'est disponible
          <div className="bg-gray-50 p-4 rounded-lg border text-center">
            <p>Le contenu n'est pas disponible actuellement.</p>
            <button
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              <RefreshCw className="h-4 w-4 inline mr-1" /> Réessayer le chargement
            </button>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex justify-between">
        <button 
          onClick={onBackClick}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition duration-150"
        >
          <ChevronLeft className="h-4 w-4 inline mr-1" />
          Retour au cours
        </button>
        
        {isCompleted ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Leçon terminée</span>
          </div>
        ) : (
          <button 
            onClick={onMarkComplete}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
          >
            Marquer comme terminé
          </button>
        )}
      </div>
    </div>
  );
}

export default LessonView;