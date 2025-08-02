const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

/**
 * Authenticate user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Login result with user data and token
 */
const login = async (email, password) => {
  try {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    // Remove test code - this was likely for debugging
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    // Check if user is active
    if (!user.active) {
      return {
        success: false,
        message: 'Account is deactivated'
      };
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Format user data (exclude password)
    const userData = formatUserForResponse(user);
    
    return {
      success: true,
      user: userData,
      token
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Login failed. Please try again.'
    };
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    surname: user.surname
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

/**
 * Format user data for response (exclude sensitive information)
 * @param {Object} user - User object from database
 * @returns {Object} Formatted user data
 */
const formatUserForResponse = (user) => {
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

module.exports = {
  login,
  generateToken
}; 