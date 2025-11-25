import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateExperience from './pages/CreateExperience';
import ViewExperience from './pages/ViewExperience';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/create" element={<Layout><CreateExperience /></Layout>} />
        {/* The viewer is standalone, outside the main layout for full screen AR */}
        <Route path="/view/:id" element={<ViewExperience />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;