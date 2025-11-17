const express = require('express');
const router = express.Router();
const refeicaoItemController = require('../controllers/refeicaoItemController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Rota para listar itens de uma refeição específica
// GET /api/refeicao-itens/refeicao/123
router.get('/refeicao/:refeicaoId', refeicaoItemController.getAllByRefeicao);

// Rota para criar um novo item (o 'refeicao_fk' vai no body)
router.post('/', refeicaoItemController.create);

// Rotas para atualizar ou deletar um item específico
router.put('/:id', refeicaoItemController.update);
router.delete('/:id', refeicaoItemController.delete);

module.exports = router;