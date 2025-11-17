const express = require('express');
const router = express.Router();
const treinoExercicioController = require('../controllers/treinoExercicioController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/treino-exercicios/treino/123
router.get('/treino/:treinoId', treinoExercicioController.getAllByTreino);

router.post('/', treinoExercicioController.create);

router.put('/:id', treinoExercicioController.update);
router.delete('/:id', treinoExercicioController.delete);

module.exports = router;