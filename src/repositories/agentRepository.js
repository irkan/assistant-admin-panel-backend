const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Find agent by ID with related data
 * @param {number} id - Agent ID
 * @returns {Object|null} Agent with organization and details
 */
const findById = async (id) => {
  return await prisma.agent.findUnique({
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
 * Find all agents with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Agents and total count
 */
const findAll = async (filters, pagination) => {
  // Build where clause
  const where = {};
  
  if (filters.organizationId) {
    where.organizationId = filters.organizationId;
  }
  
  if (filters.active !== undefined) {
    where.active = filters.active;
  }

  // Execute queries in parallel
  const [agents, totalCount] = await Promise.all([
    prisma.agent.findMany({
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
            systemPrompt: true,
            interactionMode: true
          }
        }
      },
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.agent.count({ where })
  ]);

  return { agents, totalCount };
};

/**
 * Create a new agent
 * @param {Object} agentData - Agent data
 * @returns {Object} Created agent
 */
const create = async (agentData) => {
  const { details, ...agentFields } = agentData;
  
  // Create the agent first
  const agent = await prisma.agent.create({
    data: agentFields,
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
    await prisma.agentDetails.create({
      data: {
        agentId: agent.id,
        firstMessage: details.firstMessage,
        systemPrompt: details.systemPrompt,
        interactionMode: details.interactionMode
      }
    });
  }

  // Return the agent with details (refetch to get the created details)
  return await prisma.agent.findUnique({
    where: { id: agent.id },
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
 * Update an agent
 * @param {number} id - Agent ID
 * @param {Object} agentData - Updated agent data
 * @returns {Object} Updated agent
 */
const update = async (id, agentData) => {
  const { details, ...agentFields } = agentData;
  
  // Update the agent first
  const agent = await prisma.agent.update({
    where: { id },
    data: agentFields,
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
    await prisma.agentDetails.upsert({
      where: { agentId: id },
      update: {
        firstMessage: details.firstMessage,
        systemPrompt: details.systemPrompt,
        interactionMode: details.interactionMode
      },
      create: {
        agentId: id,
        firstMessage: details.firstMessage,
        systemPrompt: details.systemPrompt,
        interactionMode: details.interactionMode
      }
    });
  }

  // Return the agent with details (refetch to get the updated details)
  return await prisma.agent.findUnique({
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
 * Delete an agent
 * @param {number} id - Agent ID
 * @returns {Object} Deleted agent
 */
const deleteById = async (id) => {
  return await prisma.agent.delete({
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
 * Check if agent exists
 * @param {number} id - Agent ID
 * @returns {boolean} True if agent exists
 */
const exists = async (id) => {
  const count = await prisma.agent.count({
    where: { id }
  });
  return count > 0;
};

module.exports = {
  findById,
  findAll,
  create,
  update,
  deleteById,
  exists
}; 