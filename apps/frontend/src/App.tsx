'use client';

import type React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import MyPollsPage from './pages/MyPollsPage';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/post/:id/edit" element={<EditPostPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/my-polls" element={<MyPollsPage />} />
      </Routes>
    </div>
  );
};

export default App;
