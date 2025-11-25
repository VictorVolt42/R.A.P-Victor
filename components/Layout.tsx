import React from 'react';
import { Layers, PlusCircle, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-brand-500 to-purple-600 p-2 rounded-lg">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">WebAR Studio</span>
          </div>
          
          <nav className="flex items-center gap-4">
             {location.pathname !== '/' && (
              <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                Dashboard
              </Link>
             )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} WebAR Studio. Browser-based Augmented Reality.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;