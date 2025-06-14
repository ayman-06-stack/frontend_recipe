import { useState } from 'react';
import api from '../services/api';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, Mail, User, Lock, AlertTriangle, Check } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Validation de la force du mot de passe
  const getPasswordStrength = () => {
    if (!password) return 0;
    
    let score = 0;
    // Au moins 8 caractères
    if (password.length >= 8) score += 1;
    // Contient des chiffres
    if (/\d/.test(password)) score += 1;
    // Contient des caractères spéciaux
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    // Contient des majuscules et minuscules
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    
    return score;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      // Récupérer le CSRF token
      await api.get('/sanctum/csrf-cookie');
      
      const res = await api.post('/api/auth/register', {
        name,
        email,
        password
      });

      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Styles pour la barre de force du mot de passe
  const strengthColors = [
    'bg-gray-200', // vide
    'bg-red-500',  // faible
    'bg-orange-500', // moyen
    'bg-yellow-500', // bon
    'bg-green-500'  // excellent
  ];
  
  const strengthLabels = [
    '',
    'Faible',
    'Moyen',
    'Bon',
    'Excellent'
  ];
  
  const passwordStrength = getPasswordStrength();

  // Vérifier si les mots de passe correspondent
  const passwordsMatch = password && passwordConfirm && password === passwordConfirm;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      <div className="w-full max-w-4xl">
        {/* Card container with glassmorphism effect */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left side - Registration form */}
          <div className="w-full lg:w-7/12 p-8 md:p-12">
            <div className="max-w-md mx-auto">
              {/* Mobile only logo */}
              <div className="flex items-center space-x-3 mb-8 lg:hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                  <ChefHat size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Today's Menu</span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Inscription</h2>
              <p className="text-gray-600 mb-8">Rejoignez notre communauté de passionnés de cuisine et découvrez des milliers de recettes.</p>
              
              {error && (
                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Name field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-12 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
                
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
                
                {/* Password field with strength indicator */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
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
                  
                  {/* Password strength indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div 
                              key={level}
                              className={`h-2 w-6 rounded-full ${level <= passwordStrength ? strengthColors[level] : 'bg-gray-200'}`}
                            />
                          ))}
                        </div>
                        <span className={`text-xs font-medium ${passwordStrength >= 3 ? 'text-green-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {strengthLabels[passwordStrength]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Utilisez au moins 8 caractères avec des majuscules, des chiffres et des caractères spéciaux.
                      </p>
                    </div>
                  )}
                </div>

                {/* Password Confirmation field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordConfirm}
                      onChange={e => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="pl-12 w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    
                    {/* Check mark if passwords match */}
                    {passwordsMatch && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Terms and conditions checkbox */}
                
                
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
                    "Créer mon compte"
                  )}
                </button>
                
                {/* Login link */}
                <div className="text-center">
                  <p className="text-gray-600">
                    Vous avez déjà un compte ?{" "}
                    <NavLink to="/login" className="font-semibold text-blue-600 hover:text-blue-800 transition">
                      Se connecter
                    </NavLink>
                  </p>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right side - Brand section */}
          <div className="w-full lg:w-5/12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3"></div>
            
            {/* Brand content */}
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-12">
                <div className="bg-white p-2 rounded-xl">
                  <ChefHat size={28} className="text-blue-600" />
                </div>
                <span className="text-2xl font-bold">Today's Menu</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-6">Devenez un chef à la maison</h1>
              
              {/* Features list */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Des milliers de recettes</h3>
                    <p className="text-blue-100 text-sm">Accédez à notre vaste bibliothèque de recettes du monde entier</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Planificateur de repas</h3>
                    <p className="text-blue-100 text-sm">Organisez vos repas pour la semaine en quelques clics</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Check size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Communauté active</h3>
                    <p className="text-blue-100 text-sm">Partagez vos créations et inspirez-vous des autres membres</p>
                  </div>
                </div>
              </div>
              
              {/* Food image grid - using placeholder images */}
              <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden mb-8">
              <div className="h-24 bg-white/20 rounded-lg">
                <img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Cuisine moderne avec plan de travail" className="w-full h-full object-cover" />
              </div>
              <div className="h-24 bg-white/20 rounded-lg">
                <img src="https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Préparation de repas avec légumes" className="w-full h-full object-cover" />
              </div>
              <div className="h-24 bg-white/20 rounded-lg">
                <img src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="Dessert gastronomique" className="w-full h-full object-cover" />
              </div>
            </div>
            </div>
            
            {/* Quote */}
            <div className="relative z-10">
              <blockquote className="italic text-blue-100 border-l-4 border-blue-300 pl-4 py-1">
                "La cuisine est le plus ancien des arts, car Adam est né à jeun."
              </blockquote>
              <p className="text-blue-200 text-sm mt-2">- Marie-Antoine Carême</p>
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