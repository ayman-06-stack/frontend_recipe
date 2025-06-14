import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight, Utensils, BookOpen, ShoppingBag, Heart, ChevronDown } from 'lucide-react';

const WelcomePage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      initial: "A",
      name: "Assia AZIRAR",
      text: "Cette application a complètement changé ma façon de cuisiner ! Je ne jette plus d'ingrédients et j'ai découvert des recettes incroyables que je n'aurais jamais imaginées."
    },
    {
      initial: "A",
      name: "Ayman GUENDOUZ",
      text: "Les cours personnalisés m'ont aidé à passer de débutant à cuisinier confiant en quelques semaines. Les explications sont claires et adaptées à mon niveau."
    },
    {
      initial: "M",
      name: "Maryam RAMDANI",
      text: "Je suis impressionnée par la variété des recettes proposées. Chaque semaine, je teste de nouvelles saveurs et ma famille est ravie de cette diversité culinaire."
    },
    {
      initial: "S",
      name: "Souhaila OMRI",
      text: "La fonction de liste de courses est un vrai gain de temps ! Plus besoin de noter les ingrédients manuellement, tout est généré automatiquement."
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      
      if (position > 100) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Set visible after a short delay even without scroll
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Food images from Unsplash
  const foodImages = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 rounded-lg">
                <ChefHat size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Today's Menu</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition duration-300">Fonctionnalités</a>
              <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition duration-300">Avantages</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition duration-300">Témoignages</a>
            </div>
            
            {/* Auth Buttons */}
            <div className="flex space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition duration-300"
              >
                Connexion
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium rounded-lg hover:shadow-lg transition duration-300"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Animated Background */}
      <div className="relative h-screen pt-20 overflow-hidden">
        {/* Sliding background images */}
        <div className="absolute inset-0 z-0">
          {foodImages.map((img, index) => (
            <div 
              key={index}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
              style={{
                backgroundImage: `url(${img})`,
                opacity: (index === 0) ? 0.8 : 0,
                animation: `slideImages ${foodImages.length * 5}s infinite ${index * 5}s`,
              }}
            />
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-black/50 z-10"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <h1 
              className={`text-5xl md:text-6xl font-bold text-white mb-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              La cuisine intelligente<br/>à portée de main
            </h1>
            <p 
              className={`text-xl text-blue-50 mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
            >
              Transformez votre expérience culinaire avec des recettes personnalisées, 
              des cours sur mesure et des listes de courses générées par intelligence artificielle.
            </p>
            
            <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Link 
                to="/register" 
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium rounded-lg hover:shadow-lg transition duration-300 flex items-center justify-center space-x-2 group"
              >
                <span>Commencer l’expérience</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 border border-white text-white font-medium rounded-lg hover:bg-white/10 transition duration-300 flex items-center justify-center"
              >
                J'ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <a href="#features" className="flex flex-col items-center text-white opacity-80 hover:opacity-100 transition duration-300">
            <span className="text-sm mb-2">Découvrir</span>
            <ChevronDown size={24} />
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Fonctionnalités intelligentes</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une expérience culinaire révolutionnaire alimentée par l'intelligence artificielle
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Feature 1 */}
          <div 
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="text-white mb-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-400">
              <Utensils size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Recettes IA</h3>
            <p className="text-gray-600">
              Générez des recettes personnalisées en fonction des ingrédients disponibles dans votre cuisine et de vos préférences.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div 
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="text-white mb-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-400">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Cours Intelligents</h3>
            <p className="text-gray-600">
              Apprenez à cuisiner avec des cours personnalisés adaptés à votre niveau et à vos objectifs culinaires.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div 
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="text-white mb-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-400">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Liste de Courses</h3>
            <p className="text-gray-600">
              Générez automatiquement des listes de courses à partir de vos recettes favorites ou planifiées.
            </p>
          </div>
          
          {/* Feature 4 */}
          <div 
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col items-center text-center transform hover:-translate-y-2"
          >
            <div className="text-white mb-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-teal-400">
              <Heart size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Favoris Personnalisés</h3>
            <p className="text-gray-600">
              Enregistrez vos recettes préférées générées par l'IA pour y accéder rapidement à tout moment.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section with Images */}
      <div id="benefits" className="bg-gray-50 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Comment ça marche</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expérience simple et intuitive pour révolutionner votre cuisine quotidienne
            </p>
          </div>
          
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center mb-24">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <div className="bg-white p-4 rounded-xl shadow-lg overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1543352634-99a5d50ae78e?q=80&w=1000" 
                    alt="Ingrédients disponibles" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold text-xl">1</div>
                  <h3 className="text-2xl font-bold text-gray-800 ml-4">Indiquez vos ingrédients</h3>
                </div>
                <p className="text-gray-600 text-lg">
                  Entrez simplement les ingrédients que vous avez dans votre cuisine, vos préférences
                  alimentaires et vos contraintes diététiques.
                </p>
              </div>
            </div>
          
          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center mb-24">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pl-10">
              <div className="bg-white p-4 rounded-xl shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1000" 
                  alt="Génération de recettes" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold text-xl">2</div>
                <h3 className="text-2xl font-bold text-gray-800 ml-4">L'IA génère des recettes</h3>
              </div>
              <p className="text-gray-600 text-lg">
                Notre intelligence artificielle analyse vos ingrédients et crée des recettes
                personnalisées adaptées à vos goûts et à vos besoins.
              </p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <div className="bg-white p-4 rounded-xl shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1595257841889-eca2678454e2?q=80&w=1000" 
                  alt="Cuisine avec instructions" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold text-xl">3</div>
                <h3 className="text-2xl font-bold text-gray-800 ml-4">Cuisinez avec confiance</h3>
              </div>
              <p className="text-gray-600 text-lg">
                Suivez les instructions détaillées, accédez à des cours personnalisés et 
                générez automatiquement votre liste de courses pour vos prochaines recettes.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div id="testimonials" className="w-full max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Ce que nos utilisateurs disent</h2>
        
        <div className="relative w-full">
          {/* Testimonial Card */}
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 min-h-64">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                {testimonials[currentIndex].initial}
              </div>
              <div className="ml-4">
                <h4 className="font-bold text-gray-800">{testimonials[currentIndex].name}</h4>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600 italic text-lg">
              "{testimonials[currentIndex].text}"
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex justify-between w-full absolute top-1/2 transform -translate-y-1/2">
            <button 
              onClick={prevTestimonial}
              className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none"
              aria-label="Témoignage précédent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextTestimonial}
              className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 focus:outline-none"
              aria-label="Témoignage suivant"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Indicators */}
          <div className="flex justify-center mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 mx-1 rounded-full ${
                  currentIndex === index ? "bg-blue-500" : "bg-gray-300"
                }`}
                aria-label={`Témoignage ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Prêt à transformer votre cuisine ?</h2>
          <p className="text-xl text-white opacity-90 mb-12 max-w-3xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui ont déjà révolutionné leur façon de cuisiner grâce à Today's Menu.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-white text-blue-600 font-medium rounded-lg hover:shadow-lg transition duration-300"
            >
              Commencer l’expérience
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 border border-white text-white font-medium rounded-lg hover:bg-white/10 transition duration-300"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-teal-400 p-2 rounded-lg">
                  <ChefHat size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">Today's Menu</span>
              </div>
              <p className="text-gray-400 max-w-md">
                La cuisine intelligente à portée de main grâce à l'intelligence artificielle.
                Découvrez une nouvelle façon de cuisiner.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
               
              </div>
              
              <div>
               
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Produit</h3>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-400 hover:text-white transition duration-300">Fonctionnalités</a></li>
                  <li><a href="#benefits" className="text-gray-400 hover:text-white transition duration-300">Comment ça marche</a></li>
                  <li><a href="#testimonials" className="text-gray-400 hover:text-white transition duration-300">Témoignages</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center justify-between items-center">
            <p className="text-gray-400 ">© {new Date().getFullYear()} Today's Menu. Tous droits réservés.</p>
            
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;