const express = require('express');
const router = express.Router();
const perfilTreinoController = require('../controllers/perfilTreinoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', perfilTreinoController.get);
router.post('/', perfilTreinoController.createOrUpdate);

module.exports = router;