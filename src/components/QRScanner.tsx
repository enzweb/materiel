import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { QrCode, Camera, Package, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ScanResult {
  type: 'material' | 'user';
  data: any;
}

function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setError('');
      }
    } catch (err) {
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleManualScan = async () => {
    if (!manualInput.trim()) {
      setError('Veuillez saisir des données QR');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/qr/scan', { qrData: manualInput });
      setScanResult(response.data);
      setManualInput('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors du scan');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (materialId: number, userId: number) => {
    setLoading(true);
    try {
      await api.post('/movements/checkout', {
        materialId,
        userId,
        notes: 'Sortie via scanner QR'
      });
      setScanResult(null);
      setError('');
      alert('Sortie enregistrée avec succès !');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement de la sortie');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (materialId: number, userId: number) => {
    setLoading(true);
    try {
      await api.post('/movements/checkin', {
        materialId,
        userId,
        notes: 'Retour via scanner QR'
      });
      setScanResult(null);
      setError('');
      alert('Retour enregistré avec succès !');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erreur lors de l\'enregistrement du retour');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Scanner QR Code</h1>
        <p className="text-blue-200">Scannez les QR codes pour les entrées/sorties rapides</p>
      </div>

      {error && (
        <div className="glass border-red-500/50 bg-red-500/10 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-300 mr-2" />
          <span className="text-red-300">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner caméra */}
        <div className="glass p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Camera className="w-6 h-6 mr-2" />
            Scanner avec caméra
          </h2>
          
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ display: isScanning ? 'block' : 'none' }}
              />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                    <p className="text-blue-200">Caméra non active</p>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex space-x-4">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
                >
                  Démarrer le scan
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-all duration-200"
                >
                  Arrêter le scan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Saisie manuelle */}
        <div className="glass p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <QrCode className="w-6 h-6 mr-2" />
            Saisie manuelle
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Données QR Code
              </label>
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 glass-darker text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 resize-none"
                placeholder="Collez ici les données du QR code..."
              />
            </div>
            
            <button
              onClick={handleManualScan}
              disabled={loading || !manualInput.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Traitement...' : 'Scanner manuellement'}
            </button>
          </div>
        </div>
      </div>

      {/* Résultat du scan */}
      {scanResult && (
        <div className="glass p-6">
          <h2 className="text-xl font-bold text-white mb-4">Résultat du scan</h2>
          
          {scanResult.type === 'material' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-blue-300" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{scanResult.data.name}</h3>
                  <p className="text-blue-200">Matériel scanné</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-blue-200">Statut:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    scanResult.data.status === 'available' 
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-orange-500/20 text-orange-300'
                  }`}>
                    {scanResult.data.status === 'available' ? 'Disponible' : 'Emprunté'}
                  </span>
                </div>
                {scanResult.data.category && (
                  <div>
                    <strong className="text-blue-200">Catégorie:</strong>
                    <span className="text-white ml-2">{scanResult.data.category}</span>
                  </div>
                )}
                {scanResult.data.location && (
                  <div>
                    <strong className="text-blue-200">Emplacement:</strong>
                    <span className="text-white ml-2">{scanResult.data.location}</span>
                  </div>
                )}
                {scanResult.data.serial_number && (
                  <div>
                    <strong className="text-blue-200">N° série:</strong>
                    <span className="text-white ml-2">{scanResult.data.serial_number}</span>
                  </div>
                )}
              </div>
              
              <p className="text-blue-200 text-sm">
                Pour effectuer une sortie ou un retour, scannez également le QR code de l'utilisateur.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-green-300" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{scanResult.data.username}</h3>
                  <p className="text-blue-200">
                    {scanResult.data.first_name || scanResult.data.last_name 
                      ? `${scanResult.data.first_name || ''} ${scanResult.data.last_name || ''}`.trim()
                      : 'Utilisateur scanné'
                    }
                  </p>
                </div>
              </div>
              
              <p className="text-blue-200 text-sm">
                Pour effectuer une sortie ou un retour, scannez également le QR code du matériel.
              </p>
            </div>
          )}
          
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setScanResult(null)}
              className="px-6 py-2 glass-darker text-white hover:bg-white/10 transition-colors"
            >
              Nouveau scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;