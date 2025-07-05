import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MapPin, Calendar, Waves, Clock, Star, Edit, Trash2, Plus, Search } from 'lucide-react';

interface Dive {
  id: number;
  title: string;
  location: string;
  date: string;
  depth_max: number;
  duration: number;
  rating?: number;
  notes?: string;
  water_temperature?: number;
  visibility?: number;
}

function DiveList() {
  const [dives, setDives] = useState<Dive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchDives();
  }, []);

  const fetchDives = async () => {
    try {
      const response = await api.get('/dives');
      setDives(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des plongées:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDive = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette plongée ?')) {
      try {
        await api.delete(`/dives/${id}`);
        setDives(dives.filter(dive => dive.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const filteredAndSortedDives = dives
    .filter(dive => 
      dive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dive.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'depth':
          aValue = a.depth_max;
          bValue = b.depth_max;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Chargement des plongées...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Mon carnet de plongée</h1>
        <Link
          to="/dives/new"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle plongée</span>
        </Link>
      </div>

      {/* Recherche et filtres */}
      <div className="glass p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par titre ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 glass-darker text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            >
              <option value="date">Trier par date</option>
              <option value="depth">Trier par profondeur</option>
              <option value="duration">Trier par durée</option>
              <option value="rating">Trier par note</option>
              <option value="title">Trier par titre</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 glass-darker text-white hover:bg-white/10 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des plongées */}
      {filteredAndSortedDives.length === 0 ? (
        <div className="glass p-12 text-center">
          <Waves className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {searchTerm ? 'Aucune plongée trouvée' : 'Aucune plongée enregistrée'}
          </h2>
          <p className="text-blue-200 mb-6">
            {searchTerm 
              ? 'Essayez d\'ajuster vos termes de recherche'
              : 'Commencez à enregistrer vos aventures sous-marines !'
            }
          </p>
          {!searchTerm && (
            <Link
              to="/dives/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Enregistrer ma première plongée</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedDives.map((dive) => (
            <div key={dive.id} className="glass p-6 hover:bg-white/10 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {dive.title}
                </h3>
                <div className="flex space-x-2">
                  <Link
                    to={`/dives/edit/${dive.id}`}
                    className="p-2 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteDive(dive.id)}
                    className="p-2 text-red-300 hover:text-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-blue-200">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{dive.location}</span>
                </div>
                
                <div className="flex items-center text-blue-200">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(dive.date)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-blue-200">
                    <Waves className="w-4 h-4 mr-2" />
                    <span>{dive.depth_max}m</span>
                  </div>
                  <div className="flex items-center text-blue-200">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatDuration(dive.duration)}</span>
                  </div>
                </div>

                {dive.rating && (
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 mr-2 fill-current" />
                    <span>{dive.rating}/5</span>
                  </div>
                )}

                {dive.notes && (
                  <p className="text-blue-200 text-sm line-clamp-2">
                    {dive.notes}
                  </p>
                )}

                <div className="flex justify-between text-sm text-blue-300">
                  {dive.water_temperature && (
                    <span>Eau: {dive.water_temperature}°C</span>
                  )}
                  {dive.visibility && (
                    <span>Visibilité: {dive.visibility}m</span>
                  )}
                </div>
              </div>

              {/* Indicateur de profondeur */}
              <div className="mt-4 h-2 depth-indicator">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((dive.depth_max / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DiveList;