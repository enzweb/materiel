import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Users, Search, Shield, Edit, Trash2, QrCode, Calendar } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'manager' | 'admin';
  qr_code: string;
  created_at: string;
}

function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir changer le rôle de cet utilisateur ?`)) {
      try {
        await api.put(`/users/${userId}/role`, { role: newRole });
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole as any } : user
        ));
      } catch (error: any) {
        alert(error.response?.data?.error || 'Erreur lors de la modification du rôle');
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (error: any) {
        alert(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-300 bg-red-500/20';
      case 'manager': return 'text-orange-300 bg-orange-500/20';
      case 'user': return 'text-green-300 bg-green-500/20';
      default: return 'text-gray-300 bg-gray-500/20';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Gestionnaire';
      case 'user': return 'Utilisateur';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Chargement des utilisateurs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestion des utilisateurs</h1>
      </div>

      {/* Recherche */}
      <div className="glass p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou nom d'utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {filteredUsers.length === 0 ? (
        <div className="glass p-12 text-center">
          <Users className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
          </h2>
          <p className="text-blue-200">
            {searchTerm 
              ? 'Essayez d\'ajuster votre recherche'
              : 'Les utilisateurs apparaîtront ici'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="glass p-6 hover:bg-white/10 transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {user.first_name || user.last_name 
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : user.username
                    }
                  </h3>
                  <p className="text-blue-200 text-sm">@{user.username}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {/* TODO: Afficher QR code */}}
                    className="p-2 text-blue-300 hover:text-blue-200 transition-colors"
                    title="Voir le QR code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  {currentUser?.role === 'admin' && user.id !== currentUser.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-300 hover:text-red-200 transition-colors"
                      title="Supprimer l'utilisateur"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-blue-200 text-sm">
                  <strong>Email:</strong> {user.email}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                    {getRoleText(user.role)}
                  </span>
                </div>

                <div className="flex items-center text-blue-200 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Inscrit le {formatDate(user.created_at)}</span>
                </div>

                {currentUser?.role === 'admin' && user.id !== currentUser.id && (
                  <div className="pt-3 border-t border-white/10">
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Modifier le rôle:
                    </label>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="w-full px-3 py-2 glass-darker text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="manager">Gestionnaire</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;