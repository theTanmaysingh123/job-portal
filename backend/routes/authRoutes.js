const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, googleAuth, uploadProfilePhoto, verifyEmail, resendOtp } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const uploadPhoto = require('../middleware/uploadPhotoMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOtp);

// Profile routes (require login)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/profile/photo', authMiddleware, uploadPhoto.single('photo'), uploadProfilePhoto);

module.exports = router;
