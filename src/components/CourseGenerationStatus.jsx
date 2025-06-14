// components/CourseGenerationStatus.jsx
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function CourseGenerationStatus({ courseId, onCompleted }) {
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Vérifier le statut toutes les 5 secondes
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/ai-courses/status/${courseId}`);
        setStatus(response.data.status);
        
        // Si le cours est prêt, arrêter de vérifier et notifier le parent
        if (response.data.is_ready) {
          clearInterval(interval);
          if (onCompleted) {
            onCompleted(courseId);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        setError('Impossible de vérifier le statut du cours');
        clearInterval(interval);
      }
    }, 5000);
    
    // Nettoyer l'intervalle quand le composant est démonté
    return () => clearInterval(interval);
  }, [courseId, onCompleted]);
  
  const getStatusDisplay = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center text-amber-600">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>En attente de traitement...</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center text-blue-600">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            <span>Génération en cours...</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Cours prêt !</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Échec de la génération</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <span>Statut inconnu</span>
          </div>
        );
    }
  };
  
  if (error) {
    return (
      <div className="flex items-center text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-medium mb-2">Statut de la génération</h3>
      {getStatusDisplay()}
      
      {status === 'pending' || status === 'processing' ? (
        <div className="mt-2 text-sm text-gray-500">
          Cela peut prendre jusqu'à quelques minutes. Vous recevrez une notification lorsque le cours sera prêt.
        </div>
      ) : null}
      
      {status === 'failed' ? (
        <div className="mt-2">
          <button 
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            onClick={() => {/* Implémenter la logique pour réessayer */}}
          >
            Réessayer
          </button>
        </div>
      ) : null}
    </div>
  );
}