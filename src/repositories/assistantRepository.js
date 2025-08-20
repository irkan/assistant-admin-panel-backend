const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Find assistant by ID with related data
 * @param {number} id - Assistant ID
 * @returns {Object|null} Assistant with organization and details
 */
const findById = async (id) => {
  return await prisma.assistant.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          shortName: true,
          active: true
        }
      },
      details: true,
      tools: true
    }
  });
};

/**
 * Find all assistants with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Assistants and total count
 */
const findAll = async (filters, pagination) => {
  // Build where clause
  const where = {};
  
  // Always filter by active unless explicitly specified
  if (filters.active !== undefined) {
    where.active = filters.active;
  } else {
    where.active = true; // Default to only show active assistants
  }
  
  // If user is authenticated, filter by their organizations
  if (filters.userId) {
    where.organization = {
      users: {
        some: {
          userId: filters.userId
        }
      }
    };
  }
  
  if (filters.organizationId) {
    where.organizationId = filters.organizationId;
  }

  // Execute queries in parallel
  const [assistants, totalCount] = await Promise.all([
    prisma.assistant.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            shortName: true
          }
        },
        details: {
          select: {
            firstMessage: true,
            userPrompt: true,
            systemPrompt: true,
            interactionMode: true,
            provider: true,
            model: true,
            selectedVoice: true,
            temperature: true,
            silenceTimeout: true,
            maximumDuration: true
          }
        },
        tools: true
      },
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.assistant.count({ where })
  ]);

  return { assistants, totalCount };
};

/**
 * Create a new assistant
 * @param {Object} assistantData - Assistant data
 * @returns {Object} Created assistant
 */
const create = async (assistantData) => {
  const { details, tools, ...assistantFields } = assistantData;
  
  // Create the assistant first
  const assistant = await prisma.assistant.create({
    data: assistantFields,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          shortName: true,
          active: true
        }
      },
      details: true
    }
  });

  // If details are provided, create them
  if (details) {
    await prisma.assistantDetails.create({
      data: {
        assistantId: assistant.id,
        firstMessage: details.firstMessage,
        systemPrompt: details.systemPrompt,
        interactionMode: details.interactionMode
      }
    });
  }

  // Return the assistant with details (refetch to get the created details)
  return await prisma.assistant.findUnique({
    where: { id: assistant.id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          shortName: true,
          active: true
        }
      },
      details: true
    }
  });
};

/**
 * Update an assistant
 * @param {number} id - Assistant ID
 * @param {Object} assistantData - Updated assistant data
 * @returns {Object} Updated assistant
 */
const update = async (id, assistantData) => {
  const { details, ...assistantFields } = assistantData;
  
  // Update the assistant first
  const assistant = await prisma.assistant.update({
    where: { id },
    data: assistantFields,
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          shortName: true,
          active: true
        }
      },
      details: true
    }
  });

  // If details are provided, update or create them
  if (details) {
    await prisma.assistantDetails.upsert({
      where: { assistantId: id },
      update: {
        firstMessage: details.firstMessage,
        systemPrompt: details.systemPrompt,
        interactionMode: details.interactionMode
      },
      create: {
        assistantId: id,
        firstMessage: details.firstMessage,
        systemPrompt: details.systemPrompt,
        interactionMode: details.interactionMode
      }
    });
  }

  // Return the assistant with details (refetch to get the updated details)
  return await prisma.assistant.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          shortName: true,
          active: true
        }
      },
      details: true
    }
  });
};

/**
 * Soft delete an assistant (set active = false)
 * @param {number} id - Assistant ID
 * @returns {Object} Soft deleted assistant
 */
const deleteById = async (id) => {
  return await prisma.assistant.update({
    where: { id },
    data: { active: false },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          shortName: true,
          active: true
        }
      },
      details: true,
      tools: true
    }
  });
};

/**
 * Check if assistant exists
 * @param {number} id - Assistant ID
 * @returns {boolean} True if assistant exists
 */
const exists = async (id) => {
  const count = await prisma.assistant.count({
    where: { id }
  });
  return count > 0;
};

/**
 * Publish an assistant with all its configuration
 * @param {number} id - Assistant ID
 * @param {Object} assistantData - Complete assistant data including details and tools
 * @returns {Object} Published assistant
 */
const publish = async (id, assistantData) => {
  const { details, tools, ...assistantFields } = assistantData;
  
  return await prisma.$transaction(async (tx) => {
    // Update assistant basic info and set status to published
    const updatedAssistant = await tx.assistant.update({
      where: { id },
      data: {
        ...assistantFields,
        status: 'published',
        updatedAt: new Date()
      }
    });

    // Update or create assistant details
    if (details) {
      await tx.assistantDetails.upsert({
        where: { assistantId: id },
        update: {
          firstMessage: details.firstMessage,
          userPrompt: details.userPrompt,
          systemPrompt: details.systemPrompt,
          interactionMode: details.interactionMode,
          provider: details.provider,
          model: details.model,
          selectedVoice: details.selectedVoice,
          temperature: details.temperature,
          silenceTimeout: details.silenceTimeout,
          maximumDuration: details.maximumDuration,
          updatedAt: new Date()
        },
        create: {
          assistantId: id,
          firstMessage: details.firstMessage,
          userPrompt: details.userPrompt,
          systemPrompt: details.systemPrompt,
          interactionMode: details.interactionMode,
          provider: details.provider,
          model: details.model,
          selectedVoice: details.selectedVoice,
          temperature: details.temperature,
          silenceTimeout: details.silenceTimeout,
          maximumDuration: details.maximumDuration
        }
      });
    }

    // Update tools - first delete existing ones, then create new ones
    if (tools) {
      // Delete existing tools
      await tx.assistantTool.deleteMany({
        where: { assistantId: id }
      });

      // Create new tools if any
      if (tools.length > 0) {
        await tx.assistantTool.createMany({
          data: tools.map(tool => ({
            assistantId: id,
            toolId: tool.id || tool.toolId || tool,
            toolName: tool.name || tool.toolName || tool
          }))
        });
      }
    }

    // Return the complete updated assistant
    return await tx.assistant.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            shortName: true,
            active: true
          }
        },
        details: true,
        tools: true
      }
    });
  });
};

module.exports = {
  findById,
  findAll,
  create,
  update,
  publish,
  deleteById,
  exists
};
