const express = require('express');
const authController = require('../controllers/authController');
const { validateLoginData } = require('../middleware/validation');

const router = express.Router();

// Login endpoint
router.post('/login', validateLoginData, authController.login);

module.exports = router; 