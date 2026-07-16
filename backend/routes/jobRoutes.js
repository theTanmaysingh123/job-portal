const express = require('express');
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
} = require('../controllers/jobController');

const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllJobs);

// Recruiter routes
router.get('/my-jobs', authMiddleware, getMyJobs);

// Public route
router.get('/:id', getJobById);

// Protected routes
router.post('/', authMiddleware, createJob);
router.put('/:id', authMiddleware, updateJob);
router.delete('/:id', authMiddleware, deleteJob);

module.exports = router;