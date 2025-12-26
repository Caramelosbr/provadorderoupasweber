const User = require('../models/User');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, cpf } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, cpf },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Perfil atualizado', user });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    // Upload para Cloudinary
    const result = await uploadImage(req.file.path, 'avatars');

    // Remover arquivo local
    fs.unlinkSync(req.file.path);

    // Atualizar usuário
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.url },
      { new: true }
    );

    res.json({ message: 'Avatar atualizado', avatar: user.avatar });
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar medidas do corpo
// @route   PUT /api/users/measurements
// @access  Private
exports.updateMeasurements = async (req, res) => {
  try {
    const { height, weight, chest, waist, hip, shoulder, preferredSize } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        measurements: { 
          height, weight, chest, waist, hip, shoulder, preferredSize 
        } 
      },
      { new: true }
    );

    res.json({ message: 'Medidas atualizadas', measurements: user.measurements });
  } catch (error) {
    console.error('Erro ao atualizar medidas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Upload de foto do corpo para provador virtual
// @route   PUT /api/users/body-photo
// @access  Private
exports.uploadBodyPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    // Deletar foto anterior se existir
    const user = await User.findById(req.user._id);
    if (user.bodyPhoto?.publicId) {
      await deleteImage(user.bodyPhoto.publicId);
    }

    // Upload para Cloudinary
    const result = await uploadImage(req.file.path, 'body_photos');

    // Remover arquivo local
    fs.unlinkSync(req.file.path);

    // Atualizar usuário
    user.bodyPhoto = {
      url: result.url,
      publicId: result.publicId
    };
    await user.save();

    res.json({ message: 'Foto do corpo salva', bodyPhoto: user.bodyPhoto });
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Gerenciar endereços
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const address = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Se é o primeiro endereço, tornar padrão
    if (user.addresses.length === 0) {
      address.isDefault = true;
    }
    
    // Se marcado como padrão, remover padrão dos outros
    if (address.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    user.addresses.push(address);
    await user.save();

    res.status(201).json({ 
      message: 'Endereço adicionado', 
      addresses: user.addresses 
    });
  } catch (error) {
    console.error('Erro ao adicionar endereço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar endereço
// @route   PUT /api/users/addresses/:addressId
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;
    
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ message: 'Endereço não encontrado' });
    }
    
    // Se marcado como padrão, remover padrão dos outros
    if (updates.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    Object.assign(address, updates);
    await user.save();

    res.json({ message: 'Endereço atualizado', addresses: user.addresses });
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Remover endereço
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.user._id);
    user.addresses.pull(addressId);
    await user.save();

    res.json({ message: 'Endereço removido', addresses: user.addresses });
  } catch (error) {
    console.error('Erro ao remover endereço:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Adicionar/Remover favorito
// @route   POST /api/users/favorites/:productId
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user._id);
    const index = user.favorites.indexOf(productId);
    
    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
      res.json({ message: 'Removido dos favoritos', isFavorite: false });
    } else {
      user.favorites.push(productId);
      await user.save();
      res.json({ message: 'Adicionado aos favoritos', isFavorite: true });
    }
  } catch (error) {
    console.error('Erro ao gerenciar favorito:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter favoritos
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites');
    
    res.json({ favorites: user.favorites });
  } catch (error) {
    console.error('Erro ao obter favoritos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Alterar senha
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    // Verificar senha atual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }
    
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};