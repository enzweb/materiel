import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Save, ArrowLeft, MapPin, Calendar, Waves, Clock, Thermometer, Eye, Star, User, Building, Package, FileText } from 'lucide-react';

interface DiveFormData {
  title: string;
  location: string;
  date: string;
  depthMax: number;
  duration: number;
  visibility?: number;
  waterTemperature?: number;
  airTemperature?: number;
  weather?: string;
  buddy?: string;
  diveShop?: string;
  equipment?: string;
  notes?: string;
  rating?: number;
}

function DiveForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<DiveFormData>({
    title: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    depthMax: 0,
    duration: 0,
    visibility: undefined,
    waterTemperature: undefined,
    airTemperature: undefined,
    weather: '',
    buddy: '',
    diveShop: '',
    equipment: '',
    notes: '',
    rating: undefined
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && id) {
      fetchDive();
    }
  }, [isEditing, id]);

  const fetchDive = async () => {
    try {
      const response = await api.get(`/dives/${id}`);
      const dive = response.data;
      
      setFormData({
        title: dive.title || '',
        location: dive.location || '',
        date: dive.date || '',
        depthMax: dive.depth_max || 0,
        duration: dive.duration || 0,
        visibility: dive.visibility || undefined,
        waterTemperature: dive.water_temperature || undefined,
        airTemperature: dive.air_temperature || undefined,
        weather: dive.weather || '',
        buddy: dive.buddy || '',
        diveShop: dive.dive_shop || '',
        equipment: dive.equipment || '',
        notes: dive.notes || '',
        rating: dive.rating || undefined
      });
    } catch (error) {
      console.error('Erreur lors du chargement de la plongée:', error);
      setError('Impossible de charger les données de la plongée');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation des champs obligatoires
    if (!formData.title || !formData.location || !formData.date || !formData.depthMax || !formData.duration) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/dives/${id}`, formData);
      } else {
        await api.post('/dives', formData);
      }
      
      navigate('/dives');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement de la plongée');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : (
        ['depthMax', 'duration', 'visibility', 'waterTemperature', 'airTemperature', 'rating'].includes(name)
          ? Number(value)
          : value
      )
    }));
  };

  const weatherOptions = [
    'Ensoleillé',
    'Partiellement nuageux',
    'Nuageux',
    'Couvert',
    'Pluvieux',
    'Orageux',
    'Venteux',
    'Calme'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dives')}
            className="p-2 text-blue-300 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Modifier la plongée' : 'Enregistrer une nouvelle plongée'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="glass border-red-500/50 bg-red-500/10 p-4 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Informations de base</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Titre de la plongée *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                placeholder="ex: Exploration du récif corallien"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Lieu de plongée *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: Calanque de Cassis"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Profondeur maximale (mètres) *
              </label>
              <div className="relative">
                <Waves className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="number"
                  name="depthMax"
                  value={formData.depthMax || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: 25"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Durée (minutes) *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="number"
                  name="duration"
                  value={formData.duration || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: 45"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Évaluation
              </label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <select
                  name="rating"
                  value={formData.rating || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                >
                  <option value="">Sélectionner une note</option>
                  <option value="1">1 - Décevant</option>
                  <option value="2">2 - Moyen</option>
                  <option value="3">3 - Bien</option>
                  <option value="4">4 - Très bien</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Conditions environnementales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Visibilité (mètres)
              </label>
              <div className="relative">
                <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="number"
                  name="visibility"
                  value={formData.visibility || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: 15"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Température de l'eau (°C)
              </label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="number"
                  name="waterTemperature"
                  value={formData.waterTemperature || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: 24"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Température de l'air (°C)
              </label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="number"
                  name="airTemperature"
                  value={formData.airTemperature || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: 28"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Météo
              </label>
              <select
                name="weather"
                value={formData.weather || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 glass-darker text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              >
                <option value="">Sélectionner la météo</option>
                {weatherOptions.map(weather => (
                  <option key={weather} value={weather}>{weather}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Détails supplémentaires</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Binôme de plongée
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  name="buddy"
                  value={formData.buddy || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: Marie Dubois"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Centre de plongée
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  name="diveShop"
                  value={formData.diveShop || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: Aqua Passion"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Équipement utilisé
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-3 text-blue-300 w-5 h-5" />
                <textarea
                  name="equipment"
                  value={formData.equipment || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 resize-none"
                  placeholder="Listez l'équipement que vous avez utilisé..."
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Notes et observations
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-blue-300 w-5 h-5" />
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 resize-none"
                  placeholder="Partagez votre expérience de plongée, ce que vous avez vu, les moments marquants..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dives')}
            className="px-6 py-3 glass-darker text-white hover:bg-white/10 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer la plongée')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default DiveForm;