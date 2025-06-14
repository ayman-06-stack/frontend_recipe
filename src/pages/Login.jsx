import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, Mail, Lock, AlertTriangle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Récupérer le CSRF token
      await api.get('/sanctum/csrf-cookie');
      
      const res = await api.post('/api/auth/login', {
        email,
        password,
        remember: rememberMe
      });
  
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');

    } catch (err) {
      console.error('Login error:', err);
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Afficher la raison de déconnexion si disponible
  const reason = localStorage.getItem('logoutReason');
  useEffect(() => {
    if (reason) {
      setError(reason);
      localStorage.removeItem('logoutReason');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="w-full max-w-4xl">
        {/* Card container with glassmorphism effect */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left side - Brand section */}
          <div className="w-full md:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
            
            {/* Brand content */}
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-12">
                <div className="bg-white p-2 rounded-xl">
                  <ChefHat size={28} className="text-blue-600" />
                </div>
                <span className="text-2xl font-bold">Today's Menu</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-6">Bienvenue sur votre cuisine virtuelle</h1>
              <p className="text-blue-100 mb-8">Découvrez de nouvelles recettes, planifiez vos repas et partagez votre passion culinaire avec notre communauté.</p>
              
              <div className="flex flex-wrap gap-3 mb-12">
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Recettes Faciles</div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Santé & Nutrition</div>
                <div className="bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">Cuisine du Monde</div>
              </div>
            </div>
            
            {/* Quote */}
            <div className="relative z-10">
              <blockquote className="italic text-blue-100 border-l-4 border-blue-300 pl-4 py-1">
                "La cuisine est l'art de transformer des moments ordinaires en souvenirs extraordinaires."
              </blockquote>
              <p className="text-blue-200 text-sm mt-2">- Chef Today's Menu</p>
            </div>
          </div>
          
          {/* Right side - Login form */}
          <div className="w-full md:w-7/12 p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h2>
              <p className="text-gray-600 mb-8">Bon retour parmi nous ! Connectez-vous pour accéder à votre compte.</p>
              
              {error && (
                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Adresse email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="pl-12 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                
                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                    {/* <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition">
                      Mot de passe oublié?
                    </a> */}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/20 transition ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>
             
              {/* Signup link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Pas encore de compte ?{" "}
                  <NavLink to="/register" className="font-semibold text-blue-600 hover:text-blue-800 transition">
                    S'inscrire maintenant
                  </NavLink>
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Today's Menu. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}