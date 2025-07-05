import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Package, Users, TrendingUp, AlertTriangle, Plus, QrCode, BarChart3, Clock } from 'lucide-react';

interface MaterialStats {
  total: number;
  available: number;
  borrowed: number;
  maintenance: number;
  lost: number;
}

interface RecentMovement {
  id: number;
  material_name: string;
  user_username: string;
  movement_type: string;
  movement_date: string;
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MaterialStats>({
    total: 0,
    available: 0,
    borrowed: 0,
    maintenance: 0,
    lost: 0
  });
  const [recentMovements, setRecentMovements] = useState<RecentMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, movementsResponse] = await Promise.all([
        api.get('/materials/stats/overview'),
        api.get('/movements?limit=5')
      ]);

      // Traiter les statistiques
      const statsData = statsResponse.data.find((item: any) => item.category === 'TOTAL');
      if (statsData) {
        setStats({
          total: statsData.total,
          available: statsData.available,
          borrowed: statsData.borrowed,
          maintenance: statsData.maintenance,
          lost: statsData.lost
        });
      }

      setRecentMovements(movementsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementTypeText = (type: string) => {
    return type === 'out' ? 'Sortie' : 'Retour';
  };

  const getMovementTypeColor = (type: string) => {
    return type === 'out' ? 'text-red-300' : 'text-green-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">
          Bienvenue, {user?.firstName || user?.username} !
        </h1>
        <p className="text-blue-200 text-lg">
          Tableau de bord - Gestion de matériel
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass p-6 text-center">
          <div className="flex justify-center mb-4">
            <Package className="w-8 h-8 text-blue-300" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {stats.total}
          </div>
          <div className="text-blue-200">Total matériel</div>
        </div>

        <div className="glass p-6 text-center">
          <div className="flex justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-green-300" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {stats.available}
          </div>
          <div className="text-blue-200">Disponible</div>
        </div>

        <div className="glass p-6 text-center">
          <div className="flex justify-center mb-4">
            <Users className="w-8 h-8 text-orange-300" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {stats.borrowed}
          </div>
          <div className="text-blue-200">Emprunté</div>
        </div>

        <div className="glass p-6 text-center">
          <div className="flex justify-center mb-4">
            <Clock className="w-8 h-8 text-yellow-300" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {stats.maintenance}
          </div>
          <div className="text-blue-200">Maintenance</div>
        </div>

        <div className="glass p-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-300" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {stats.lost}
          </div>
          <div className="text-blue-200">Perdu</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mouvements récents */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Mouvements récents</h2>
            <Link
              to="/movements"
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              Voir tout
            </Link>
          </div>

          {recentMovements.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
              <p className="text-blue-200 mb-4">Aucun mouvement récent</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="glass-darker p-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">{movement.material_name}</h3>
                    <span className={`text-sm font-medium ${getMovementTypeColor(movement.movement_type)}`}>
                      {getMovementTypeText(movement.movement_type)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-blue-200">
                    <span>Par: {movement.user_username}</span>
                    <span>{formatDate(movement.movement_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="glass p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              to="/materials/new"
              className="glass-darker p-6 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <Plus className="w-8 h-8 text-blue-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-white font-medium text-center">Ajouter du matériel</div>
              <div className="text-blue-200 text-sm text-center">Enregistrer un nouvel équipement</div>
            </Link>
            
            <Link
              to="/scanner"
              className="glass-darker p-6 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <QrCode className="w-8 h-8 text-teal-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-white font-medium text-center">Scanner QR Code</div>
              <div className="text-blue-200 text-sm text-center">Entrée/Sortie rapide</div>
            </Link>
            
            <Link
              to="/materials"
              className="glass-darker p-6 rounded-lg hover:bg-white/10 transition-colors group"
            >
              <Package className="w-8 h-8 text-purple-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-white font-medium text-center">Gérer le matériel</div>
              <div className="text-blue-200 text-sm text-center">Voir et modifier les équipements</div>
            </Link>

            {(user?.role === 'manager' || user?.role === 'admin') && (
              <Link
                to="/users"
                className="glass-darker p-6 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <Users className="w-8 h-8 text-orange-300 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-white font-medium text-center">Gérer les utilisateurs</div>
                <div className="text-blue-200 text-sm text-center">Administration des comptes</div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;