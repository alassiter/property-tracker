import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useApp } from './contexts/AppContext';

// Pages
import Home from './pages/Home';
import Upload from './pages/Upload';
import Results from './pages/Results';
import Database from './pages/Database';

// Components
import Layout from './components/Layout/Layout';
import Auth from './components/Auth/Auth';

// Context
import { AppProvider } from './contexts/AppContext';

function AppContent() {
  const { user } = useApp();

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/results" element={<Results />} />
        <Route path="/database" element={<Database />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1E3A8A',
              color: '#fff',
            },
            success: {
              style: {
                background: '#0D9488',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </Router>
    </AppProvider>
  );
}

export default App;