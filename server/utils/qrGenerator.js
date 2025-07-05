import QRCode from 'qrcode';

export const generateQRCode = async (data, options = {}) => {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  };

  try {
    return await QRCode.toDataURL(data, defaultOptions);
  } catch (error) {
    throw new Error('Erreur lors de la génération du QR code: ' + error.message);
  }
};

export const generateMaterialQRData = (material) => {
  return JSON.stringify({
    type: 'material',
    id: material.id,
    qrCode: material.qr_code,
    name: material.name
  });
};

export const generateUserQRData = (user) => {
  return JSON.stringify({
    type: 'user',
    id: user.id,
    qrCode: user.qr_code,
    username: user.username
  });
};