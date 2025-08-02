const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');

/**
 * Get user details by ID with related data
 * @param {number} userId - The user ID
 * @returns {Object|null} User data with organizations
 */
const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  
  if (!user) {
    return null;
  }

  return formatUserResponse(user);
};

/**
 * Get all users with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Users data with pagination info
 */
const getAllUsers = async (filters, pagination) => {
  const { users, totalCount } = await userRepository.findAll(filters, pagination);
  
  const formattedUsers = users.map(formatUserResponse);
  
  return {
    users: formattedUsers,
    pagination: {
      total: totalCount,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore: pagination.offset + pagination.limit < totalCount
    }
  };
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
const createUser = async (userData) => {
  // Hash password if provided
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  
  const user = await userRepository.create(userData);
  return formatUserResponse(user);
};

/**
 * Update a user
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Object|null} Updated user
 */
const updateUser = async (userId, userData) => {
  // Hash password if provided
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  
  const user = await userRepository.update(userId, userData);
  
  if (!user) {
    return null;
  }

  return formatUserResponse(user);
};

/**
 * Delete a user
 * @param {number} userId - User ID
 * @returns {boolean} True if deleted successfully
 */
const deleteUser = async (userId) => {
  return await userRepository.deleteById(userId);
};

/**
 * Format user data for API response
 * @param {Object} user - Raw user data from database
 * @returns {Object} Formatted user data
 */
const formatUserResponse = (user) => {
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    organizations: user.organizations ? user.organizations.map(org => ({
      id: org.organization.id,
      name: org.organization.name,
      shortName: org.organization.shortName,
      active: org.organization.active
    })) : []
  };
};

module.exports = {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
}; 