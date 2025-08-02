const express = require('express');
const userController = require('../controllers/userController');
const { 
  validateUserId, 
  validatePagination, 
  validateFilters,
  validateUserData 
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/users/:id
 * @desc Get user details by ID
 * @access Private
 */
router.get('/:id', authenticateToken, validateUserId, userController.getUserById);

/**
 * @route GET /api/users
 * @desc Get all users with optional filtering
 * @access Private
 */
router.get('/', authenticateToken, validatePagination, validateFilters, userController.getAllUsers);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private
 */
router.post('/', authenticateToken, validateUserData, userController.createUser);

/**
 * @route PUT /api/users/:id
 * @desc Update a user
 * @access Private
 */
router.put('/:id', authenticateToken, validateUserId, validateUserData, userController.updateUser);

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user
 * @access Private
 */
router.delete('/:id', authenticateToken, validateUserId, userController.deleteUser);

module.exports = router; 