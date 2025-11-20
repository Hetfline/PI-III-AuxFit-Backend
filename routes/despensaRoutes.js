const express = require('express');
const router = express.Router();
const despensaController = require('../controllers/despensaController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', despensaController.get);
router.post('/', despensaController.add);
router.put('/:id', despensaController.update);
router.delete('/:id', despensaController.delete);

// Rota para verificar status de um alimento específico
router.get('/check/:alimentoId', despensaController.checkItem);

module.exports = router;