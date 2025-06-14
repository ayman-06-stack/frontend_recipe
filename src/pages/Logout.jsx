import { useEffect } from 'react';
import api from '../services/api'; // votre instance axios
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } finally {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
      }
    };

    logout();
  }, [navigate]);

  return <div>Déconnexion en cours...</div>;
};

export default Logout;