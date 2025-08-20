const assistantRepository = require('../repositories/assistantRepository');

/**
 * Get assistant details by ID with related data
 * @param {number} assistantId - The assistant ID
 * @returns {Object|null} Assistant data with organization and details
 */
const getAssistantById = async (assistantId) => {
  const assistant = await assistantRepository.findById(assistantId);
  
  if (!assistant) {
    return null;
  }

  return formatAssistantResponse(assistant);
};

/**
 * Get all assistants with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Assistants data with pagination info
 */
const getAllAssistants = async (filters, pagination) => {
  const { assistants, totalCount } = await assistantRepository.findAll(filters, pagination);
  
  const formattedAssistants = assistants.map(formatAssistantResponse);
  
  return {
    assistants: formattedAssistants,
    pagination: {
      total: totalCount,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore: pagination.offset + pagination.limit < totalCount
    }
  };
};

/**
 * Create a new assistant
 * @param {Object} assistantData - Assistant data
 * @returns {Object} Created assistant
 */
const createAssistant = async (assistantData) => {
  const assistant = await assistantRepository.create(assistantData);
  return formatAssistantResponse(assistant);
};

/**
 * Update an assistant
 * @param {number} assistantId - Assistant ID
 * @param {Object} assistantData - Updated assistant data
 * @returns {Object|null} Updated assistant
 */
const updateAssistant = async (assistantId, assistantData) => {
  const assistant = await assistantRepository.update(assistantId, assistantData);
  
  if (!assistant) {
    return null;
  }

  return formatAssistantResponse(assistant);
};

/**
 * Delete an assistant
 * @param {number} assistantId - Assistant ID
 * @returns {boolean} True if deleted successfully
 */
const deleteAssistant = async (assistantId) => {
  return await assistantRepository.deleteById(assistantId);
};

/**
 * Format assistant data for API response
 * @param {Object} assistant - Raw assistant data from database
 * @returns {Object} Formatted assistant data
 */
const formatAssistantResponse = (assistant) => {
  return {
    id: assistant.id,
    uuid: assistant.uuid, // Add UUID field
    name: assistant.name,
    organizationId: assistant.organizationId,
    active: assistant.active,
    status: assistant.status,
    createdAt: assistant.createdAt,
    updatedAt: assistant.updatedAt,
    organization: assistant.organization,
    details: assistant.details ? {
      firstMessage: assistant.details.firstMessage,
      userPrompt: assistant.details.userPrompt,
      systemPrompt: assistant.details.systemPrompt,
      interactionMode: assistant.details.interactionMode,
      provider: assistant.details.provider,
      model: assistant.details.model,
      selectedVoice: assistant.details.selectedVoice,
      temperature: assistant.details.temperature,
      silenceTimeout: assistant.details.silenceTimeout,
      maximumDuration: assistant.details.maximumDuration
    } : null,
    tools: assistant.tools || []
  };
};

/**
 * Publish assistant with all configuration
 * @param {number} assistantId - The assistant ID
 * @param {Object} assistantData - Complete assistant data including details and tools
 * @returns {Object} Success response with updated assistant data
 */
const publishAssistant = async (assistantId, assistantData) => {
  try {
    // Update assistant status to published
    const publishedAssistant = await assistantRepository.publish(assistantId, assistantData);
    
    if (!publishedAssistant) {
      return { success: false, message: 'Assistant not found' };
    }

    return {
      success: true,
      assistant: formatAssistantResponse(publishedAssistant)
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to publish assistant',
      error: error.message
    };
  }
};

module.exports = {
  getAssistantById,
  getAllAssistants,
  createAssistant,
  updateAssistant,
  publishAssistant,
  deleteAssistant
};
