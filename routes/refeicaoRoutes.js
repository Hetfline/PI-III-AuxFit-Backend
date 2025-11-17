const express = require('express');
const router = express.Router();
const refeicaoController = require('../controllers/refeicaoController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de refeições são protegidas
router.use(authMiddleware);

router.post('/', refeicaoController.create);
router.get('/', refeicaoController.getAllByUser); // Pega todas do usuário
router.get('/:id', refeicaoController.getById);
router.put('/:id', refeicaoController.update);
router.delete('/:id', refeicaoController.delete);

module.exports = router;