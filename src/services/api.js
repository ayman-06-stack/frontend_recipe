import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // change selon ton backend
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
});

// ✅ Injecter le token dans toutes les requêtes
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter un timestamp aux requêtes GET pour éviter la mise en cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _: new Date().getTime()
      };
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// ❌ Intercepter les erreurs 401 pour logout automatique
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.setItem('logoutReason', 'Votre session a expiré. Veuillez vous reconnecter.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
