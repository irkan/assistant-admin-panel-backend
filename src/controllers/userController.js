const userService = require('../services/userService');

/**
 * Get user details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = async (req, res) => {
  const userId = req.validatedUserId;
  const user = await userService.getUserById(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      message: `User with ID ${req.params.id} does not exist`
    });
  }

  res.json({
    success: true,
    data: user
  });
};

/**
 * Get all users with optional filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = async (req, res) => {
  const filters = req.validatedFilters;
  const pagination = req.validatedPagination;

  const result = await userService.getAllUsers(filters, pagination);

  res.json({
    success: true,
    data: result.users,
    pagination: result.pagination
  });
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createUser = async (req, res) => {
  const userData = req.validatedUserData;
  const user = await userService.createUser(userData);

  res.status(201).json({
    success: true,
    data: user
  });
};

/**
 * Update a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = async (req, res) => {
  const userId = req.validatedUserId;
  const userData = req.validatedUserData;
  
  const user = await userService.updateUser(userId, userData);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      message: `User with ID ${userId} does not exist`
    });
  }

  res.json({
    success: true,
    data: user
  });
};

/**
 * Delete a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
  const userId = req.validatedUserId;
  
  const deleted = await userService.deleteUser(userId);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
      message: `User with ID ${userId} does not exist`
    });
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};

module.exports = {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
}; 