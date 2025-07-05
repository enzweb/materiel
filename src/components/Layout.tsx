import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, BarChart3, QrCode, Users, User, LogOut, Plus, TrendingUp } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen">
      <nav className="glass-darker border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Package className="w-8 h-8 text-blue-300" />
                <span className="text-xl font-bold text-white">GestionMatos</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'text-white hover:text-blue-300'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Tableau de bord</span>
              </Link>
              <Link
                to="/materials"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/materials') 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'text-white hover:text-blue-300'
                }`}
              >
                <Package className="w-5 h-5" />
                <span>Matériel</span>
              </Link>
              <Link
                to="/movements"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/movements') 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'text-white hover:text-blue-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Mouvements</span>
              </Link>
              <Link
                to="/scanner"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/scanner') 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'text-white hover:text-blue-300'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>Scanner</span>
              </Link>
              {(user?.role === 'manager' || user?.role === 'admin') && (
                <Link
                  to="/users"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/users') 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-white hover:text-blue-300'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Utilisateurs</span>
                </Link>
              )}
              <Link
                to="/materials/new"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Ajouter</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/profile') 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'text-white hover:text-blue-300'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {user?.firstName || user?.username}
                </span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-red-300 hover:text-red-200 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;