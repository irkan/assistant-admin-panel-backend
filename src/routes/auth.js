const express = require('express');
const authController = require('../controllers/authController');
const { validateLoginData, validateRegisterData } = require('../middleware/validation');

const router = express.Router();

// Signin endpoint
router.post('/signin', validateLoginData, authController.login);

// Signup endpoint
router.post('/signup', validateRegisterData, authController.register);

module.exports = router; 