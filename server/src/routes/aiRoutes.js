const express = require('express');
const router = express.Router();
const { getRecommendations, getSimpleRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/recommendations', getRecommendations);
router.get('/simple-recommendations', getSimpleRecommendations);

module.exports = router;