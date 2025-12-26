const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload de imagem
const uploadImage = async (filePath, folder = 'provador_ia') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image'
    });
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    throw new Error('Erro ao fazer upload da imagem');
  }
};

// Deletar imagem
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Erro ao deletar imagem');
  }
};

module.exports = { cloudinary, uploadImage, deleteImage };
