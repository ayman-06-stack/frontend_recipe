import React, { useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

// Composant d'utilitaire pour déboguer l'affichage du contenu des leçons
function ContentDebugger({ courseId, lessonId }) {
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRawContent, setShowRawContent] = useState(false);

  // Fonction pour récupérer les informations de débogage
  const fetchDebugInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les informations sur la leçon
      const lessonResponse = await fetch(`/api/ai-courses/${courseId}/lessons/${lessonId}/content`);
      
      if (!lessonResponse.ok) {
        throw new Error(`Erreur HTTP: ${lessonResponse.status}`);
      }
      
      const lessonData = await lessonResponse.json();
      
      // Analyser le contenu
      const contentInfo = {
        contentLength: lessonData.content ? lessonData.content.length : 0,
        isEmpty: !lessonData.content || lessonData.content.length === 0,
        hasHtmlTags: lessonData.content ? 
          (lessonData.content.includes('<') && lessonData.content.includes('>')) : false,
        firstChars: lessonData.content ? lessonData.content.substring(0, 100) : '',
        isJSON: lessonData.content ? 
          (lessonData.content.startsWith('{') || lessonData.content.startsWith('[')) : false
      };
      
      setDebugInfo({
        lessonData,
        contentInfo
      });
      
    } catch (err) {
      console.error("Erreur lors du débogage:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Rendu de l'aperçu du contenu
  const renderContentPreview = () => {
    if (!debugInfo || !debugInfo.lessonData.content) return null;
    
    if (showRawContent) {
      return (
        <pre className="bg-gray-50 p-4 rounded border overflow-auto max-h-96 text-xs">
          {debugInfo.lessonData.content}
        </pre>
      );
    }
    
    return (
      <div 
        className="bg-gray-50 p-4 rounded border overflow-auto max-h-96"
        dangerouslySetInnerHTML={{ __html: debugInfo.lessonData.content }}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 my-4">
      <h3 className="text-lg font-semibold mb-4">Outil de débogage du contenu</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Cet outil vous aide à vérifier le contenu de la leçon et à diagnostiquer les problèmes d'affichage.
        </p>
        
        <button
          onClick={fetchDebugInfo}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-blue-300"
        >
          {isLoading ? "Chargement..." : "Analyser le contenu"}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 inline-block mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {debugInfo && (
        <div className="mt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-4">
            <CheckCircle className="h-5 w-5 inline-block mr-2" />
            <span>Analyse terminée</span>
          </div>
          
          <h4 className="font-medium mb-2">Informations sur le contenu</h4>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>ID de la leçon: {debugInfo.lessonData.id}</li>
            <li>Longueur du contenu: {debugInfo.contentInfo.contentLength} caractères</li>
            <li>
              Contenu vide: {debugInfo.contentInfo.isEmpty ? 
                <span className="text-red-600 font-medium">Oui</span> : 
                <span className="text-green-600 font-medium">Non</span>
              }
            </li>
            <li>
              Contient des balises HTML: {debugInfo.contentInfo.hasHtmlTags ? 
                <span className="text-green-600 font-medium">Oui</span> : 
                <span className="text-red-600 font-medium">Non</span>
              }
            </li>
            <li>
              Format JSON: {debugInfo.contentInfo.isJSON ? 
                <span className="text-yellow-600 font-medium">Oui (nécessite un traitement)</span> : 
                <span className="text-green-600 font-medium">Non</span>
              }
            </li>
          </ul>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Aperçu du contenu</h4>
              <button 
                onClick={() => setShowRawContent(!showRawContent)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showRawContent ? "Afficher le rendu" : "Afficher brut"}
              </button>
            </div>
            {renderContentPreview()}
          </div>
          
          <h4 className="font-medium mb-2">Suggestions</h4>
          <ul className="list-disc pl-5 space-y-1">
            {debugInfo.contentInfo.isEmpty && (
              <li className="text-red-600">Le contenu est vide. Vérifiez la récupération des données depuis la base de données.</li>
            )}
            {debugInfo.contentInfo.isJSON && (
              <li className="text-yellow-600">Le contenu est au format JSON. Assurez-vous que la méthode formatLessonContent le traite correctement.</li>
            )}
            {!debugInfo.contentInfo.hasHtmlTags && !debugInfo.contentInfo.isEmpty && (
              <li className="text-yellow-600">Le contenu ne contient pas de balises HTML. Il pourrait s'agir de texte brut nécessitant une conversion.</li>
            )}
            {debugInfo.contentInfo.contentLength > 0 && debugInfo.contentInfo.hasHtmlTags && (
              <li className="text-green-600">Le contenu semble correctement formaté. Vérifiez les problèmes de style CSS.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ContentDebugger;