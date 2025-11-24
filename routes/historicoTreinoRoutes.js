const express = require('express');
const router = express.Router();
const historicoTreinoController = require('../controllers/historicoTreinoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Salvar treino finalizado
router.post('/finalizar', historicoTreinoController.finishWorkout);

// Obter histórico
router.get('/', historicoTreinoController.getHistory);

module.exports = router;