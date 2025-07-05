import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MaterialList from './components/MaterialList';
import MaterialForm from './components/MaterialForm';
import MovementList from './components/MovementList';
import QRScanner from './components/QRScanner';
import UserList from './components/UserList';
import Profile from './components/Profile';
import Layout from './components/Layout';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" /> : <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-teal-900">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/materials" element={
              <PrivateRoute>
                <Layout>
                  <MaterialList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/materials/new" element={
              <PrivateRoute>
                <Layout>
                  <MaterialForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/materials/edit/:id" element={
              <PrivateRoute>
                <Layout>
                  <MaterialForm />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/movements" element={
              <PrivateRoute>
                <Layout>
                  <MovementList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/scanner" element={
              <PrivateRoute>
                <Layout>
                  <QRScanner />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <Layout>
                  <UserList />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;