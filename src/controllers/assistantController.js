const assistantService = require('../services/assistantService');

/**
 * Get assistant details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAssistantById = async (req, res) => {
  const assistantId = req.validatedAssistantId;
  const assistant = await assistantService.getAssistantById(assistantId);

  if (!assistant) {
    return res.status(404).json({
      success: false,
      error: 'Assistant not found',
      message: `Assistant with ID ${req.params.id} does not exist`
    });
  }

  res.json({
    success: true,
    data: assistant
  });
};

/**
 * Get all assistants with optional filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAssistants = async (req, res) => {
  const filters = req.validatedFilters;
  const pagination = req.validatedPagination;
  
  // Add userId to filters to show only assistants from user's organizations
  if (req.user && req.user.userId) {
    filters.userId = req.user.userId;
  }

  const result = await assistantService.getAllAssistants(filters, pagination);

  res.json({
    success: true,
    data: result.assistants,
    pagination: result.pagination
  });
};

/**
 * Create a new assistant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAssistant = async (req, res) => {
  const assistantData = req.validatedAssistantData;
  const assistant = await assistantService.createAssistant(assistantData);

  res.status(201).json({
    success: true,
    data: assistant
  });
};

/**
 * Update an assistant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAssistant = async (req, res) => {
  const assistantId = req.validatedAssistantId;
  const assistantData = req.validatedAssistantData;
  
  const assistant = await assistantService.updateAssistant(assistantId, assistantData);
  
  if (!assistant) {
    return res.status(404).json({
      success: false,
      error: 'Assistant not found',
      message: `Assistant with ID ${assistantId} does not exist`
    });
  }

  res.json({
    success: true,
    data: assistant
  });
};

/**
 * Publish an assistant with all configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const publishAssistant = async (req, res) => {
  console.log('📢 Publish request received for assistant:', req.params.id);
  console.log('📢 Request body:', JSON.stringify(req.body, null, 2));
  
  const assistantId = req.validatedAssistantId;
  const assistantData = req.validatedAssistantData;
  
  console.log('📢 Validated assistant ID:', assistantId);
  console.log('📢 Validated assistant data:', JSON.stringify(assistantData, null, 2));
  
  try {
    const result = await assistantService.publishAssistant(assistantId, assistantData);
    
    console.log('📢 Service result:', result);
    
    if (!result.success) {
      console.log('❌ Publish failed:', result.message);
      return res.status(400).json({
        success: false,
        error: 'Publication failed',
        message: result.message
      });
    }

    console.log('✅ Assistant published successfully');
    res.json({
      success: true,
      message: 'Assistant published successfully',
      data: result.assistant
    });
  } catch (error) {
    console.error('💥 Publish error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Delete an assistant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAssistant = async (req, res) => {
  const assistantId = req.validatedAssistantId;
  
  const deleted = await assistantService.deleteAssistant(assistantId);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Assistant not found',
      message: `Assistant with ID ${assistantId} does not exist`
    });
  }

  res.json({
    success: true,
    message: 'Assistant deleted successfully'
  });
};

module.exports = {
  getAssistantById,
  getAllAssistants,
  createAssistant,
  updateAssistant,
  publishAssistant,
  deleteAssistant
};
