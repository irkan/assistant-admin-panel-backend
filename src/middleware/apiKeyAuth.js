const apiKeyService = require('../services/apiKeyService');

/**
 * Verify API Key from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'API key is required'
      });
    }

    // Check if it's Bearer token format or direct API key
    let apiKey;
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      apiKey = authHeader; // Direct API key
    }

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid API key format'
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

    // Attach API key data to request
    req.apiKey = {
      id: validatedKey.id,
      organizationId: validatedKey.organizationId,
      name: validatedKey.name,
      allowedAssistants: validatedKey.allowedAssistants,
      active: validatedKey.active,
      expiresAt: validatedKey.expiresAt
    };

    next();
    
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'API key authentication failed'
    });
  }
};

module.exports = {
  authenticateApiKey
};