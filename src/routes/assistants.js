const express = require('express');
const assistantController = require('../controllers/assistantController');
const { 
  validateAssistantId, 
  validatePagination, 
  validateFilters,
  validateAssistantData 
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/assistants/:id
 * @desc Get assistant details by ID
 * @access Public
 */
router.get('/:id', validateAssistantId, assistantController.getAssistantById);

/**
 * @route GET /api/assistants
 * @desc Get all assistants with optional filtering
 * @access Private
 */
router.get('/', authenticateToken, validatePagination, validateFilters, assistantController.getAllAssistants);

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
