const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, makeAdmin, forgotPassword, resetPassword, updateCredentials } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/make-admin', makeAdmin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/update-credentials', protect, updateCredentials);

module.exports = router;