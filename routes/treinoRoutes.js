const express = require('express');
const router = express.Router();
const treinoController = require('../controllers/treinoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', treinoController.create);
router.get('/', treinoController.getAllByUser);
router.get('/:id', treinoController.getById);
router.put('/:id', treinoController.update);
router.delete('/:id', treinoController.delete);

module.exports = router;