import { useEffect, useState } from 'react';

import { 
  Home, 
  Book, 
  ChefHat, 
  Settings, 
  LogOut, 
  Menu,
  Rocket,
  User,
  Search,
  Bell,
  ShoppingCart,
  Heart,
  X
} from 'lucide-react';
import PropTypes from 'prop-types';
import api from '../services/api'; // Importez votre service API

export default function Layout({ children, navigate, onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // État pour la recherche
  
  // Récupération des données de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('/api/user');
        setUser(res.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur', error);
      }
    };
    
    fetchUserData();
  }, []);

  // Détection du défilement pour l'effet d'ombre sur l'en-tête
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    if (typeof navigate === 'function') {
      navigate(path);
    } else {
      console.error('Navigation function is not available');
      window.location.href = path;
    }
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    handleNavigation('/login');
  };

  const sidebarItems = [
    { icon: <Home size={20} />, text: 'Tableau de Bord', path: '/dashboard' },
    { icon: <ShoppingCart size={20} />, text: 'Ingrédients', path: '/ingredients' },
    { icon: <Rocket size={20} />, text: 'IA Recettes', path: '/generate' },
    { icon: <Heart size={20} />, text: 'Favoris', path: '/favorites' },
    { icon: <ShoppingCart size={20} />, text: 'Liste de courses', path: '/shopping-list' },
    { icon: <Book size={20} />, text: 'Cours culinaires', path: '/courses' },
    { icon: <User size={20} />, text: 'Profil', path: '/profile' },
    { icon: <Settings size={20} />, text: 'Paramètres', path: '/settings' }
  ];

  // Filtrer les éléments du menu en fonction du terme de recherche
  const filteredSidebarItems = sidebarItems.filter(item =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gérer le changement dans l'input de recherche
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Effacer la recherche
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:border-r lg:border-gray-200
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 rounded-lg">
              <ChefHat size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Today's Menu</span>
          </div>
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
            type="button"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher dans le menu..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-8 py-2 bg-gray-100 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 transition-colors"
                type="button"
                aria-label="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <nav className="px-2 py-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Menu principal
            {searchTerm && (
              <span className="ml-2 text-blue-600">
                ({filteredSidebarItems.length} résultat{filteredSidebarItems.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          
          {filteredSidebarItems.length > 0 ? (
            filteredSidebarItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center px-3 py-2.5 my-1 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
                type="button"
                aria-label={`Aller à ${item.text}`}
              >
                <span className="p-1.5 rounded-md bg-gray-100 mr-3">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </button>
            ))
          ) : searchTerm ? (
            <div className="px-3 py-4 text-center text-gray-500 text-sm">
              Aucun résultat trouvé pour "{searchTerm}"
            </div>
          ) : null}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm"
            type="button"
            aria-label="Déconnexion"
          >
            <LogOut size={18} className="mr-2" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Unified Header for Mobile and Desktop */}
        <header className={`sticky top-0 z-30 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
          <div className="flex items-center justify-between p-4 lg:px-6">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-blue-600 mr-4 lg:hidden"
                type="button"
                aria-label="Ouvrir le menu"
              >
                <Menu size={24} />
              </button>
              <div className="hidden lg:block lg:text-lg lg:font-semibold text-gray-800">
                Bienvenue sur Today's Menu
              </div>
            </div>
            
            <div className="lg:hidden">
              <div className="flex items-center">
                <ChefHat size={20} className="text-blue-600 mr-1" />
                <span className="font-bold text-gray-800">Today's Menu</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div 
                onClick={() => handleNavigation('/profile')}
                className="hidden lg:flex items-center space-x-1 cursor-pointer rounded-full bg-gray-100 p-1 pr-3 hover:bg-gray-200 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {user?.name || 'Profile'}
                </span>
              </div>
              
              {/* Mobile Profile Button */}
              <button 
                onClick={() => handleNavigation('/profile')}
                className="lg:hidden w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"
                aria-label="Profil"
              >
                <User size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Validation des props
Layout.propTypes = {
  children: PropTypes.node.isRequired,
  navigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func
};