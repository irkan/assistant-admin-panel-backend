const assistantApiService = require('../services/assistantApiService');

/**
 * Get all assistants accessible by API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAssistants = async (req, res) => {
  try {
    const assistants = await assistantApiService.getAllAssistants(req.apiKey);
    
    res.json({
      success: true,
      data: assistants,
      total: assistants.length,
      apiKey: {
        name: req.apiKey.name,
        organizationId: req.apiKey.organizationId,
        hasRestrictions: req.apiKey.allowedAssistants && req.apiKey.allowedAssistants.length > 0
      }
    });
    
  } catch (error) {
    console.error('Error in getAllAssistants API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch assistants'
    });
  }
};

/**
 * Get assistant by UUID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssistantByUUID = async (req, res) => {
  try {
    const { uuid } = req.params;
    
    if (!uuid) {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Assistant UUID is required'
      });
    }

    const assistant = await assistantApiService.getAssistantByUUID(uuid, req.apiKey);
    
    if (!assistant) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Assistant not found or access denied'
      });
    }

    res.json({
      success: true,
      data: assistant,
      apiKey: {
        name: req.apiKey.name,
        organizationId: req.apiKey.organizationId,
        hasRestrictions: req.apiKey.allowedAssistants && req.apiKey.allowedAssistants.length > 0
      }
    });
    
  } catch (error) {
    console.error('Error in getAssistantByUUID API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch assistant'
    });
  }
};

/**
 * Get API key info and permissions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getApiKeyInfo = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        name: req.apiKey.name,
        organizationId: req.apiKey.organizationId,
        allowedAssistants: req.apiKey.allowedAssistants,
        hasRestrictions: req.apiKey.allowedAssistants && req.apiKey.allowedAssistants.length > 0,
        expiresAt: req.apiKey.expiresAt,
        active: req.apiKey.active
      }
    });
    
  } catch (error) {
    console.error('Error in getApiKeyInfo:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch API key info'
    });
  }
};

module.exports = {
  getAllAssistants,
  getAssistantByUUID,
  getApiKeyInfo
};