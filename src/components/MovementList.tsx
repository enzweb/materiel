import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUp, TrendingDown, Search, Filter, Calendar, User, Package } from 'lucide-react';

interface Movement {
  id: number;
  material_name: string;
  user_username: string;
  first_name?: string;
  last_name?: string;
  movement_type: 'in' | 'out';
  movement_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  notes?: string;
  processed_by_username?: string;
}

function MovementList() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      const response = await api.get('/movements', {
        params: {
          type: typeFilter,
          limit: 100
        }
      });
      setMovements(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [typeFilter]);

  const filteredMovements = movements.filter(movement =>
    movement.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.user_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (movement.first_name && movement.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (movement.last_name && movement.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementIcon = (type: string) => {
    return type === 'out' ? (
      <TrendingDown className="w-5 h-5 text-red-300" />
    ) : (
      <TrendingUp className="w-5 h-5 text-green-300" />
    );
  };

  const getMovementText = (type: string) => {
    return type === 'out' ? 'Sortie' : 'Retour';
  };

  const getMovementColor = (type: string) => {
    return type === 'out' 
      ? 'bg-red-500/20 border-red-500/50 text-red-300'
      : 'bg-green-500/20 border-green-500/50 text-green-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Chargement des mouvements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Historique des mouvements</h1>
      </div>

      {/* Filtres et recherche */}
      <div className="glass p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par matériel ou utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 glass-darker text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          >
            <option value="">Tous les mouvements</option>
            <option value="out">Sorties uniquement</option>
            <option value="in">Retours uniquement</option>
          </select>
        </div>
      </div>

      {/* Liste des mouvements */}
      {filteredMovements.length === 0 ? (
        <div className="glass p-12 text-center">
          <TrendingUp className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {searchTerm || typeFilter ? 'Aucun mouvement trouvé' : 'Aucun mouvement enregistré'}
          </h2>
          <p className="text-blue-200">
            {searchTerm || typeFilter 
              ? 'Essayez d\'ajuster vos filtres de recherche'
              : 'Les mouvements d\'entrée et de sortie apparaîtront ici'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMovements.map((movement) => (
            <div key={movement.id} className="glass p-6 hover:bg-white/5 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg border ${getMovementColor(movement.movement_type)}`}>
                    {getMovementIcon(movement.movement_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {getMovementText(movement.movement_type)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMovementColor(movement.movement_type)}`}>
                        {getMovementText(movement.movement_type)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center text-blue-200">
                          <Package className="w-4 h-4 mr-2" />
                          <span><strong>Matériel:</strong> {movement.material_name}</span>
                        </div>
                        <div className="flex items-center text-blue-200">
                          <User className="w-4 h-4 mr-2" />
                          <span>
                            <strong>Utilisateur:</strong> {movement.user_username}
                            {(movement.first_name || movement.last_name) && (
                              <span className="text-blue-300">
                                {' '}({movement.first_name} {movement.last_name})
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-blue-200">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span><strong>Date:</strong> {formatDate(movement.movement_date)}</span>
                        </div>
                        {movement.expected_return_date && (
                          <div className="text-blue-200">
                            <strong>Retour prévu:</strong> {formatDate(movement.expected_return_date)}
                          </div>
                        )}
                        {movement.actual_return_date && (
                          <div className="text-green-300">
                            <strong>Retour effectif:</strong> {formatDate(movement.actual_return_date)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {movement.notes && (
                      <div className="mt-3 p-3 glass-darker rounded-lg">
                        <p className="text-blue-200 text-sm">
                          <strong>Notes:</strong> {movement.notes}
                        </p>
                      </div>
                    )}
                    
                    {movement.processed_by_username && (
                      <div className="mt-2 text-xs text-blue-300">
                        Traité par: {movement.processed_by_username}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovementList;