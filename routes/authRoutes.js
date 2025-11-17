const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);

// Rotas protegidas
router.get('/me', authMiddleware, authController.me);
router.put('/update-password', authMiddleware, authController.updatePassword);

module.exports = router;