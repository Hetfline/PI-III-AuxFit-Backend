const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/exercicioController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', exercicioController.create);
router.get('/', exercicioController.getAll);
router.get('/:id', exercicioController.getById);
router.put('/:id', exercicioController.update);
router.delete('/:id', exercicioController.delete);

module.exports = router;