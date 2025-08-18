const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

/**
 * Authenticate user login
 * @param {Object} loginData - Login data (email, password, googleId, provider)
 * @returns {Object} Login result with user data and token
 */
const login = async (loginData) => {
  const { email, password, googleId, provider } = loginData;
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
    
    // Verify authentication method
    if (provider === 'google') {
      // For Google login, verify googleId matches
      if (!user.googleId || user.googleId !== googleId) {
        return {
          success: false,
          message: 'Google authentication failed'
        };
      }
    } else {
      // For regular login, verify password
      if (!password) {
        return {
          success: false,
          message: 'Password is required'
        };
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }
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
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Registration result with user data and token
 */
const register = async (userData) => {
  try {
    const { email, password, name, surname, googleId, provider } = userData;
    
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists'
      };
    }
    
    // Prepare user data for creation
    const newUserData = {
      email,
      name,
      surname,
      active: true
    };
    
    // Handle different registration types
    if (provider === 'google' && googleId) {
      // Google registration - no password needed
      newUserData.googleId = googleId;
      newUserData.provider = 'google';
      // Generate a random password for Google users (won't be used for login)
      newUserData.password = await bcrypt.hash(Math.random().toString(36), 10);
    } else {
      // Regular email/password registration
      if (!password) {
        return {
          success: false,
          message: 'Password is required for email registration'
        };
      }
      newUserData.password = await bcrypt.hash(password, 10);
      newUserData.provider = 'email';
    }
    
    // Create user
    const user = await userRepository.create(newUserData);
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Format user data (exclude password)
    const userResponse = formatUserForResponse(user);
    
    return {
      success: true,
      user: userResponse,
      token
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'Registration failed. Please try again.'
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
  register,
  generateToken
};