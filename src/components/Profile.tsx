import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { User, Mail, Save, Shield } from 'lucide-react';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  qr_code: string;
  created_at: string;
}

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const profileData = response.data;
      setProfile(profileData);
      setFormData({
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.put('/users/profile', formData);
      setMessage('Profil mis à jour avec succès !');
      fetchProfile();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Gestionnaire';
      case 'user': return 'Utilisateur';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-300 bg-red-500/20';
      case 'manager': return 'text-orange-300 bg-orange-500/20';
      case 'user': return 'text-green-300 bg-green-500/20';
      default: return 'text-gray-300 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mon profil</h1>
        <p className="text-blue-200">Gérez vos informations personnelles</p>
      </div>

      {message && (
        <div className={`glass p-4 rounded-lg ${
          message.includes('succès') 
            ? 'border-green-500/50 bg-green-500/10' 
            : 'border-red-500/50 bg-red-500/10'
        }`}>
          <p className={message.includes('succès') ? 'text-green-300' : 'text-red-300'}>
            {message}
          </p>
        </div>
      )}

      <div className="glass p-6">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {profile?.first_name || profile?.last_name 
                ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                : profile?.username
              }
            </h2>
            <p className="text-blue-200">@{profile?.username}</p>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profile?.role || '')}`}>
                <Shield className="w-4 h-4 inline mr-1" />
                {getRoleText(profile?.role || '')}
              </span>
            </div>
            <p className="text-blue-300 text-sm mt-1">
              Membre depuis le {profile?.created_at ? formatDate(profile.created_at) : 'Inconnu'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  value={profile?.username || ''}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white bg-gray-800/50 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white bg-gray-800/50 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Informations système */}
      <div className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informations système</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-blue-200">ID utilisateur:</strong>
            <span className="text-white ml-2">{profile?.id}</span>
          </div>
          <div>
            <strong className="text-blue-200">QR Code:</strong>
            <span className="text-white ml-2 font-mono text-xs">{profile?.qr_code}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;