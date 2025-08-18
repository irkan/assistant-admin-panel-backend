const authService = require('../services/authService');

/**
 * Handle user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  const loginData = req.validatedLoginData;
  
  const result = await authService.login(loginData);
  
  if (!result.success) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: result.message
    });
  }
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      token: result.token
    }
  });
};

/**
 * Handle user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  const userData = req.validatedRegisterData;
  
  const result = await authService.register(userData);
  
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: 'Registration failed',
      message: result.message
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: result.user,
      token: result.token
    }
  });
};



module.exports = {
  login,
  register
};