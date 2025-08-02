const authService = require('../services/authService');

/**
 * Handle user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  const { email, password } = req.validatedLoginData;
  
  const result = await authService.login(email, password);
  
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

module.exports = {
  login
}; 