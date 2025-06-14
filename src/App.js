import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FavoriteRecipesPage from './pages/FavoriteRecipesPage';
import GenerateRecipePage from './pages/GenerateRecipePage';
import ProfilePage from './pages/ProfilePage';
import IngredientsPage from './pages/IngredientsPage';
import ShoppingListPage from './pages/ShoppingListPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetail from './components/CourseDetail';
import ProtectedRoute from './components/ProtectedRoute';
import WelcomePage from './pages/WelcomePage';
import Logout from './pages/Logout';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Use individual protected routes for each path */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoriteRecipesPage />
          </ProtectedRoute>
        } />
        <Route path="/generate" element={
          <ProtectedRoute>
            <GenerateRecipePage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/ingredients" element={
          <ProtectedRoute>
            <IngredientsPage />
          </ProtectedRoute>
        } />
        <Route path="/shopping-list" element={
          <ProtectedRoute>
            <ShoppingListPage />
          </ProtectedRoute>
        } />
        
        <Route path="/courses" element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        } />     

      <Route path="/courses/:courseId" element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={<WelcomePage />} />
        
        <Route path="/login" element={<Logout />} />


        {/* Catch-all route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;