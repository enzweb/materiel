import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Save, ArrowLeft, Package, FileText, Hash, MapPin, Calendar, Euro } from 'lucide-react';

interface MaterialFormData {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  location: string;
  purchaseDate: string;
  purchasePrice: number | '';
}

function MaterialForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    description: '',
    category: '',
    serialNumber: '',
    location: '',
    purchaseDate: '',
    purchasePrice: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (isEditing && id) {
      fetchMaterial();
    }
  }, [isEditing, id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/materials/categories/list');
      setCategories(response.data.map((cat: any) => cat.name));
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const fetchMaterial = async () => {
    try {
      const response = await api.get(`/materials/${id}`);
      const material = response.data;
      
      setFormData({
        name: material.name || '',
        description: material.description || '',
        category: material.category || '',
        serialNumber: material.serial_number || '',
        location: material.location || '',
        purchaseDate: material.purchase_date || '',
        purchasePrice: material.purchase_price || ''
      });
    } catch (error) {
      console.error('Erreur lors du chargement du matériel:', error);
      setError('Impossible de charger les données du matériel');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name) {
      setError('Le nom du matériel est requis');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        purchasePrice: formData.purchasePrice === '' ? null : formData.purchasePrice
      };

      if (isEditing) {
        await api.put(`/materials/${id}`, submitData);
      } else {
        await api.post('/materials', submitData);
      }
      
      navigate('/materials');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement du matériel');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'purchasePrice' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/materials')}
            className="p-2 text-blue-300 hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Modifier le matériel' : 'Ajouter du matériel'}
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
          <h2 className="text-xl font-semibold text-white mb-6">Informations générales</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Nom du matériel *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: Ordinateur portable Dell"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-blue-300 w-5 h-5" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 resize-none"
                  placeholder="Description détaillée du matériel..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Catégorie
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 glass-darker text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Numéro de série
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    placeholder="ex: ABC123456"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Emplacement
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  placeholder="ex: Bureau 201, Armoire A"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Date d'achat
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 glass-darker text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Prix d'achat (€)
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                    placeholder="ex: 1200"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/materials')}
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
            <span>{loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default MaterialForm;