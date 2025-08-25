const apiKeyService = require('../services/apiKeyService');

/**
 * Middleware to authenticate API key from headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'API key is required. Provide it in x-api-key header or Authorization header.'
      });
    }
    
    // Validate API key
    const validatedKey = await apiKeyService.validateApiKey(apiKey);
    
    if (!validatedKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired API key'
      });
    }
    
    // Add API key data to request object
    req.apiKey = validatedKey;
    req.organization = validatedKey.organization;
    
    next();
    
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if assistant is allowed for the API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkAssistantAccess = async (req, res, next) => {
  try {
    const assistantId = parseInt(req.params.assistantId || req.body.assistantId || req.query.assistantId);
    
    if (!assistantId) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Assistant ID is required'
      });
    }
    
    // Check if assistant is allowed
    const isAllowed = apiKeyService.isAssistantAllowed(req.apiKey, assistantId);
    
    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied: Assistant not allowed for this API key'
      });
    }
    
    // Add assistant ID to request for convenience
    req.assistantId = assistantId;
    
    next();
    
  } catch (error) {
    console.error('Assistant access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Access check failed'
    });
  }
};

/**
 * Middleware to check if request is for the same organization as API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkOrganizationAccess = async (req, res, next) => {
  try {
    const organizationId = parseInt(req.params.organizationId || req.body.organizationId || req.query.organizationId);
    
    // If no organization ID in request, allow (might be listing user's own resources)
    if (!organizationId) {
      return next();
    }
    
    // Check if organization matches API key's organization
    if (organizationId !== req.apiKey.organizationId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Access denied: Organization mismatch'
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Organization access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Access check failed'
    });
  }
};

module.exports = {
  authenticateApiKey,
  checkAssistantAccess,
  checkOrganizationAccess
};