const express = require('express');
const router = express.Router();
const progressoController = require('../controllers/progressoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', progressoController.create);
router.get('/', progressoController.getAllByUser);
router.put('/:id', progressoController.update);
router.delete('/:id', progressoController.delete);

module.exports = router;