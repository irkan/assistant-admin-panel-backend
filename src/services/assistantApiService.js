const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all assistants accessible by API key
 * @param {Object} apiKeyData - API key data with permissions
 * @returns {Array} Array of accessible assistants
 */
const getAllAssistants = async (apiKeyData) => {
  try {
    const { organizationId, allowedAssistants } = apiKeyData;
    
    // Build where clause based on permissions
    const whereClause = {
      organizationId: organizationId,
      active: true,
      status: 'published' // Only return published assistants via API
    };

    // If allowedAssistants is specified and not empty, filter by those IDs
    if (allowedAssistants && allowedAssistants.length > 0) {
      whereClause.id = {
        in: allowedAssistants
      };
    }

    const assistants = await prisma.assistant.findMany({
      where: whereClause,
      select: {
        id: true,
        uuid: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        details: {
          select: {
            firstMessage: true,
            systemPrompt: true,
            interactionMode: true,
            provider: true,
            model: true,
            selectedVoice: true,
            temperature: true,
            silenceTimeout: true,
            maximumDuration: true,
            avatarName: true
          }
        },
        avatarImages: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            imageData: true,
            mimeType: true,
            prompt: true,
            description: true
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format assistants with background data
    const formattedAssistants = assistants.map(assistant => ({
      ...assistant,
      background: assistant.avatarImages && assistant.avatarImages.length > 0 ? {
        id: assistant.avatarImages[0].id,
        imageData: assistant.avatarImages[0].imageData,
        mimeType: assistant.avatarImages[0].mimeType,
        prompt: assistant.avatarImages[0].prompt,
        description: assistant.avatarImages[0].description
      } : null,
      avatarImages: undefined // Remove this field from response
    }));

    return formattedAssistants;
    
  } catch (error) {
    console.error('Error getting assistants via API:', error);
    throw error;
  }
};

/**
 * Get assistant by UUID with API key permissions
 * @param {string} uuid - Assistant UUID
 * @param {Object} apiKeyData - API key data with permissions
 * @returns {Object|null} Assistant data or null if not found/not accessible
 */
const getAssistantByUUID = async (uuid, apiKeyData) => {
  try {
    const { organizationId, allowedAssistants } = apiKeyData;
    
    // Build where clause
    const whereClause = {
      uuid: uuid,
      organizationId: organizationId,
      active: true,
      status: 'published' // Only return published assistants via API
    };

    // First check if assistant exists and belongs to organization
    const assistant = await prisma.assistant.findFirst({
      where: whereClause,
      select: {
        id: true,
        uuid: true,
        name: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        details: {
          select: {
            firstMessage: true,
            systemPrompt: true,
            interactionMode: true,
            provider: true,
            model: true,
            selectedVoice: true,
            temperature: true,
            silenceTimeout: true,
            maximumDuration: true,
            avatarName: true
          }
        },
        tools: {
          select: {
            toolId: true,
            toolName: true
          }
        },
        avatarImages: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            imageData: true,
            mimeType: true,
            prompt: true,
            description: true
          },
          take: 1
        }
      }
    });

    if (!assistant) {
      return null;
    }

    // Check if API key has permission to access this assistant
    if (allowedAssistants && allowedAssistants.length > 0) {
      if (!allowedAssistants.includes(assistant.id)) {
        return null; // API key doesn't have permission for this assistant
      }
    }

    // Format the response with background data
    const response = {
      ...assistant,
      background: assistant.avatarImages && assistant.avatarImages.length > 0 ? {
        id: assistant.avatarImages[0].id,
        imageData: assistant.avatarImages[0].imageData,
        mimeType: assistant.avatarImages[0].mimeType,
        prompt: assistant.avatarImages[0].prompt,
        description: assistant.avatarImages[0].description
      } : null
    };

    // Remove avatarImages from response as it's now in background field
    delete response.avatarImages;

    return response;
    
  } catch (error) {
    console.error('Error getting assistant by UUID via API:', error);
    throw error;
  }
};

/**
 * Check if API key has access to specific assistant
 * @param {number} assistantId - Assistant ID
 * @param {Object} apiKeyData - API key data with permissions
 * @returns {boolean} True if access is allowed
 */
const hasAssistantAccess = (assistantId, apiKeyData) => {
  const { allowedAssistants } = apiKeyData;
  
  // If no restrictions, allow all assistants in the organization
  if (!allowedAssistants || allowedAssistants.length === 0) {
    return true;
  }
  
  // Check if assistant ID is in allowed list
  return allowedAssistants.includes(assistantId);
};

module.exports = {
  getAllAssistants,
  getAssistantByUUID,
  hasAssistantAccess
};