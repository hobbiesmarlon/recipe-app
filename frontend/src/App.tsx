import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Layout from './layouts/Layout';
import DiscoveryFeed from './pages/DiscoveryFeed';
import Categories from './pages/Categories';
import CategoriesBrowsing from './pages/CategoriesBrowsing';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import MyRecipes from './pages/MyRecipes';
import SignIn from './pages/SignIn';
import AuthCallback from './pages/AuthCallback';
import PublicProfile from './pages/PublicProfile';
import RecipeBasicInfo from './pages/add-recipe/RecipeBasicInfo';
import RecipeIngredients from './pages/add-recipe/RecipeIngredients';
import RecipeInstructions from './pages/add-recipe/RecipeInstructions';
import RecipeCategories from './pages/add-recipe/RecipeCategories';
import RecipeChefsNote from './pages/add-recipe/RecipeChefsNote';
import RecipeDetails from './pages/RecipeDetails';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DiscoveryFeed />} />
          <Route path="recipe/:id" element={<RecipeDetails />} />
          <Route path="categories" element={<Categories />} />
          <Route path="browse" element={<CategoriesBrowsing />} />
          <Route path="u/:username" element={<PublicProfile />} />
          <Route path="signin" element={<SignIn />} />
          <Route path="auth/callback" element={<AuthCallback />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<UserProfile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="my-recipes" element={<MyRecipes />} />
            
            {/* Add Recipe Flow */}
            <Route path="add-recipe">
              <Route path="basic" element={<RecipeBasicInfo />} />
              <Route path="ingredients" element={<RecipeIngredients />} />
              <Route path="instructions" element={<RecipeInstructions />} />
              <Route path="categories" element={<RecipeCategories />} />
              <Route path="chefs-note" element={<RecipeChefsNote />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
