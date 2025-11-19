const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Verifica se o caminho está certo
const authMiddleware = require('../middleware/auth');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);

// Rotas protegidas
router.get('/me', authMiddleware, authController.me);
router.put('/update-password', authMiddleware, authController.updatePassword);

// Rota Nova de Onboarding
router.put('/complete-profile', authMiddleware, authController.completeProfile);

module.exports = router;