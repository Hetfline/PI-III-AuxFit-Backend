const express = require('express');
const router = express.Router();
const perfilAlimentarController = require('../controllers/perfilAlimentarController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Obter meu perfil
router.get('/', perfilAlimentarController.get);

// Criar ou atualizar meu perfil
router.post('/', perfilAlimentarController.createOrUpdate);

module.exports = router;