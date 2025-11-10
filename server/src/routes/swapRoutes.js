const express = require('express');
const router = express.Router();
const {
  createSwapRequest,
  getSwapRequests,
  getSwapRequestById,
  updateSwapRequest,
  deleteSwapRequest
} = require('../controllers/swapController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

router.route('/')
  .get(getSwapRequests)
  .post(createSwapRequest);

router.route('/:id')
  .get(getSwapRequestById)
  .put(updateSwapRequest)
  .delete(deleteSwapRequest);

module.exports = router;