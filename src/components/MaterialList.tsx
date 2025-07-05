import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Package, Edit, Trash2, Plus, Search, Filter, QrCode, MapPin, Calendar } from 'lucide-react';

interface Material {
  id: number;
  name: string;
  description?: string;
  category?: string;
  serial_number?: string;
  qr_code: string;
  status: 'available' | 'borrowed' | 'maintenance' | 'lost';
  location?: string;
  purchase_date?: string;
  purchase_price?: number;
  created_by_username?: string;
}

function MaterialList() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials', {
        params: {
          search: searchTerm,
          status: statusFilter,
          category: categoryFilter
        }
      });
      setMaterials(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du matériel:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleDeleteMaterial = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce matériel ?')) {
      try {
        await api.delete(`/materials/${id}`);
        setMaterials(materials.filter(material => material.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-300 bg-green-500/20';
      case 'borrowed': return 'text-orange-300 bg-orange-500/20';
      case 'maintenance': return 'text-yellow-300 bg-yellow-500/20';
      case 'lost': return 'text-red-300 bg-red-500/20';
      default: return 'text-gray-300 bg-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'borrowed': return 'Emprunté';
      case 'maintenance': return 'Maintenance';
      case 'lost': return 'Perdu';
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non renseigné';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-xl">Chargement du matériel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestion du matériel</h1>
        <Link
          to="/materials/new"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Nouveau matériel</span>
        </Link>
      </div>

      {/* Filtres et recherche */}
      <div className="glass p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, description ou numéro de série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 glass-darker text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          >
            <option value="">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="borrowed">Emprunté</option>
            <option value="maintenance">Maintenance</option>
            <option value="lost">Perdu</option>
          </select>
          <input
            type="text"
            placeholder="Filtrer par catégorie..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
        </div>
      </div>

      {/* Liste du matériel */}
      {materials.length === 0 ? (
        <div className="glass p-12 text-center">
          <Package className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-white mb-4">
            {searchTerm || statusFilter || categoryFilter ? 'Aucun matériel trouvé' : 'Aucun matériel enregistré'}
          </h2>
          <p className="text-blue-200 mb-6">
            {searchTerm || statusFilter || categoryFilter 
              ? 'Essayez d\'ajuster vos filtres de recherche'
              : 'Commencez par ajouter votre premier équipement !'
            }
          </p>
          {!searchTerm && !statusFilter && !categoryFilter && (
            <Link
              to="/materials/new"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter le premier matériel</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div key={material.id} className="glass p-6 hover:bg-white/10 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                  {material.name}
                </h3>
                <div className="flex space-x-2">
                  <Link
                    to={`/materials/edit/${material.id}`}
                    className="p-2 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="p-2 text-red-300 hover:text-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {material.description && (
                  <p className="text-blue-200 text-sm">{material.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(material.status)}`}>
                    {getStatusText(material.status)}
                  </span>
                  {material.category && (
                    <span className="text-blue-300 text-sm">{material.category}</span>
                  )}
                </div>

                {material.serial_number && (
                  <div className="text-blue-200 text-sm">
                    <strong>N° série:</strong> {material.serial_number}
                  </div>
                )}

                {material.location && (
                  <div className="flex items-center text-blue-200 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{material.location}</span>
                  </div>
                )}

                {material.purchase_date && (
                  <div className="flex items-center text-blue-200 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Acheté le {formatDate(material.purchase_date)}</span>
                  </div>
                )}

                {material.purchase_price && (
                  <div className="text-blue-200 text-sm">
                    <strong>Prix:</strong> {material.purchase_price}€
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-blue-300 text-xs">
                    Par: {material.created_by_username || 'Inconnu'}
                  </span>
                  <button
                    onClick={() => {/* TODO: Afficher QR code */}}
                    className="p-2 text-blue-300 hover:text-blue-200 transition-colors"
                    title="Voir le QR code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MaterialList;