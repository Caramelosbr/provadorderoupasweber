const express = require('express');
const router = express.Router();

const tryonController = require('../controllers/tryon.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSeller } = require('../middlewares/role.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

// Rotas do cliente
router.use(authenticate);

router.get('/', tryonController.getMyTryOns);
router.post('/', tryonController.createTryOn);
router.post('/with-photo', uploadSingle('photo'), handleUploadError, tryonController.createTryOnWithPhoto);
router.get('/:id', tryonController.getTryOn);
router.put('/:id/save', tryonController.saveTryOn);
router.put('/:id/feedback', tryonController.submitFeedback);
router.delete('/:id', tryonController.deleteTryOn);

// Rotas do vendedor
router.get('/store/stats', isSeller, tryonController.getStoreTryOnStats);

module.exports = router;