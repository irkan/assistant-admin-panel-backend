const express = require('express');
const assistantApiController = require('../controllers/assistantApiController');
const { authenticateApiKey } = require('../middleware/apiKeyAuth');

const router = express.Router();

/**
 * @route GET /api/v1/assistants
 * @desc Get all assistants accessible by API key
 * @access API Key Required
 */
router.get('/assistants', authenticateApiKey, assistantApiController.getAllAssistants);

/**
 * @route GET /api/v1/assistants/:uuid
 * @desc Get assistant by UUID
 * @access API Key Required
 */
router.get('/assistants/:uuid', authenticateApiKey, assistantApiController.getAssistantByUUID);

/**
 * @route GET /api/v1/auth/info
 * @desc Get API key information and permissions
 * @access API Key Required
 */
router.get('/auth/info', authenticateApiKey, assistantApiController.getApiKeyInfo);

module.exports = router;