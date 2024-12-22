import React from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from "./pages/HomePage.jsx"
import Navbar from './components/navbar.jsx';
import UserProfile from "./pages/UserProfile.jsx"
import LandingPage from './pages/LandingPage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import WanderLog from './pages/WanderLog.jsx';
import { AuthProvider } from '../../backend/contexts/authContext/index.jsx';
// import Messages from './pages/Messages.jsx'

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path='/wanderlog' element={<WanderLog />} />
          <Route path="/profile/:uid" element={<UserProfile />} />
          <Route path="/profile/:uid/edit" element={<EditProfilePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;