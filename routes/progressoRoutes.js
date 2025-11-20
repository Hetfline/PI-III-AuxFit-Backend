const express = require('express');
const router = express.Router();
const progressoController = require('../controllers/progressoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Rotas Genéricas (CRUD)
router.post('/', progressoController.create);
router.get('/', progressoController.getAllByUser);
router.put('/:id', progressoController.update);
router.delete('/:id', progressoController.delete);

// Rotas Específicas (Água / Hoje)
router.get('/today', progressoController.getToday);
router.post('/water', progressoController.addWater);

module.exports = router;