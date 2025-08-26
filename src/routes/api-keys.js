const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const apiKeyService = require('../services/apiKeyService');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * @route GET /api/api-keys
 * @desc Get all API keys for user's organization
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, search = '' } = req.query;
    
    // Get user's organization (assuming user belongs to one organization)
    const organizationId = req.user.organizationId;
    
    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'User is not associated with any organization'
      });
    }
    
    let apiKeys = await apiKeyService.getApiKeysByOrganization(organizationId);
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase();
      apiKeys = apiKeys.filter(key => 
        key.name.toLowerCase().includes(searchLower) ||
        key.keyPrefix.toLowerCase().includes(searchLower)
      );
    }
    
    const limitNum = Math.min(parseInt(limit), 100);
    const offsetNum = parseInt(offset);
    const paginatedKeys = apiKeys.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      success: true,
      data: paginatedKeys,
      pagination: {
        total: apiKeys.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < apiKeys.length
      }
    });
    
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch API keys'
    });
  }
});

/**
 * @route GET /api/api-keys/:id/full
 * @desc Get full API key (decrypted) by ID
 * @access Private
 */
router.get('/:id/full', authenticateToken, async (req, res) => {
  try {
    const keyId = parseInt(req.params.id);
    
    if (isNaN(keyId)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid API key ID'
      });
    }
    
    const apiKey = await apiKeyService.getFullApiKeyById(keyId);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found',
        message: `API key with ID ${keyId} does not exist`
      });
    }
    
    // Check if user has access to this API key's organization
    const userOrganizationId = req.user.organizationId;
    
    if (!userOrganizationId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'User is not associated with any organization'
      });
    }
    
    if (apiKey.organizationId !== userOrganizationId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: apiKey.id,
        fullKey: apiKey.fullKey,
        name: apiKey.name
      }
    });
    
  } catch (error) {
    console.error('Error fetching full API key:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch full API key'
    });
  }
});

/**
 * @route GET /api/api-keys/:id
 * @desc Get API key details by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const keyId = parseInt(req.params.id);
    
    if (isNaN(keyId)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid API key ID'
      });
    }
    
    const apiKey = await apiKeyService.getApiKeyById(keyId);
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found',
        message: `API key with ID ${keyId} does not exist`
      });
    }
    
    // Check if user has access to this API key's organization
    const userOrganizationId = req.user.organizationId;
    
    if (!userOrganizationId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'User is not associated with any organization'
      });
    }
    if (apiKey.organizationId !== userOrganizationId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: apiKey
    });
    
  } catch (error) {
    console.error('Error fetching API key:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch API key'
    });
  }
});

/**
 * @route POST /api/api-keys
 * @desc Create a new API key
 * @access Private
 */
router.post('/', 
  authenticateToken,
  [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('allowedAssistants')
      .optional()
      .isArray()
      .withMessage('Allowed assistants must be an array'),
    body('expiresInDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Expires in days must be between 1 and 365')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid input data',
          details: errors.array()
        });
      }
      
      const { name, allowedAssistants = [], expiresInDays = 90 } = req.body;
      
      // Get user's organization
      const organizationId = req.user.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'User is not associated with any organization'
        });
      }
      
      // Create API key
      const newApiKey = await apiKeyService.createApiKey({
        organizationId,
        name,
        allowedAssistants,
        expiresInDays
      });
      
      res.status(201).json({
        success: true,
        data: {
          ...newApiKey,
          message: 'API key created successfully. Save this key as it will not be shown again.'
        }
      });
      
    } catch (error) {
      console.error('Error creating API key:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create API key'
      });
    }
  }
);

/**
 * @route PUT /api/api-keys/:id
 * @desc Update an API key
 * @access Private
 */
router.put('/:id',
  authenticateToken,
  [
    body('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean'),
    body('allowedAssistants')
      .optional()
      .isArray()
      .withMessage('Allowed assistants must be an array'),
    body('expiresInDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Expires in days must be between 1 and 365')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          message: 'Invalid input data',
          details: errors.array()
        });
      }
      
      const keyId = parseInt(req.params.id);
      
      if (isNaN(keyId)) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid API key ID'
        });
      }
      
      // Check if API key exists and user has access
      const existingKey = await apiKeyService.getApiKeyById(keyId);
      
      if (!existingKey) {
        return res.status(404).json({
          success: false,
          error: 'API key not found',
          message: `API key with ID ${keyId} does not exist`
        });
      }
      
      // Check authorization
      const userOrganizationId = req.user.organizationId;
      
      if (!userOrganizationId) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'User is not associated with any organization'
        });
      }
      if (existingKey.organizationId !== userOrganizationId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied'
        });
      }
      
      // Update API key
      const updatedKey = await apiKeyService.updateApiKey(keyId, req.body);
      
      res.json({
        success: true,
        data: updatedKey
      });
      
    } catch (error) {
      console.error('Error updating API key:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update API key'
      });
    }
  }
);

/**
 * @route DELETE /api/api-keys/:id
 * @desc Delete an API key
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const keyId = parseInt(req.params.id);
    
    if (isNaN(keyId)) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Invalid API key ID'
      });
    }
    
    // Check if API key exists and user has access
    const existingKey = await apiKeyService.getApiKeyById(keyId);
    
    if (!existingKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found',
        message: `API key with ID ${keyId} does not exist`
      });
    }
    
    // Check authorization
    const userOrganizationId = req.user.organizationId;
    
    if (!userOrganizationId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'User is not associated with any organization'
      });
    }
    if (existingKey.organizationId !== userOrganizationId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied'
      });
    }
    
    // Delete API key
    await apiKeyService.deleteApiKey(keyId);
    
    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete API key'
    });
  }
});

module.exports = router;