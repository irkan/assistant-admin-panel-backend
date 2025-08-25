const express = require('express');
const assistantController = require('../controllers/assistantController');
const { 
  validateAssistantId, 
  validatePagination, 
  validateFilters,
  validateAssistantData 
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { authenticateApiKey, checkAssistantAccess, checkOrganizationAccess } = require('../middleware/apiKeyAuth');

const router = express.Router();

/**
 * Combined authentication middleware - supports both JWT and API key
 */
const combinedAuth = (req, res, next) => {
  // Check if API key is provided
  const apiKey = req.headers['x-api-key'] || (req.headers['authorization']?.startsWith('ak_') ? req.headers['authorization'].replace('Bearer ', '') : null);
  
  if (apiKey) {
    // Use API key authentication
    return authenticateApiKey(req, res, next);
  } else {
    // Use JWT authentication
    return authenticateToken(req, res, next);
  }
};

/**
 * @route GET /api/assistants/:id
 * @desc Get assistant details by ID
 * @access Public (with API key) / Private (with JWT)
 */
router.get('/:id', combinedAuth, validateAssistantId, checkAssistantAccess, assistantController.getAssistantById);

/**
 * @route GET /api/assistants
 * @desc Get all assistants with optional filtering
 * @access Private
 */
router.get('/', combinedAuth, validatePagination, validateFilters, checkOrganizationAccess, assistantController.getAllAssistants);

/**
 * @route POST /api/assistants
 * @desc Create a new assistant
 * @access Private
 */
router.post('/', authenticateToken, validateAssistantData, assistantController.createAssistant);

/**
 * @route PUT /api/assistants/:id
 * @desc Update an assistant
 * @access Private
 */
router.put('/:id', authenticateToken, validateAssistantId, validateAssistantData, assistantController.updateAssistant);

/**
 * @route POST /api/assistants/:id/publish
 * @desc Publish an assistant with all configuration
 * @access Private
 */
router.post('/:id/publish', authenticateToken, validateAssistantId, validateAssistantData, assistantController.publishAssistant);

/**
 * @route DELETE /api/assistants/:id
 * @desc Delete an assistant
 * @access Private
 */
router.delete('/:id', authenticateToken, validateAssistantId, assistantController.deleteAssistant);

module.exports = router;
