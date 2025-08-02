const agentRepository = require('../repositories/agentRepository');

/**
 * Get agent details by ID with related data
 * @param {number} agentId - The agent ID
 * @returns {Object|null} Agent data with organization and details
 */
const getAgentById = async (agentId) => {
  const agent = await agentRepository.findById(agentId);
  
  if (!agent) {
    return null;
  }

  return formatAgentResponse(agent);
};

/**
 * Get all agents with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Agents data with pagination info
 */
const getAllAgents = async (filters, pagination) => {
  const { agents, totalCount } = await agentRepository.findAll(filters, pagination);
  
  const formattedAgents = agents.map(formatAgentResponse);
  
  return {
    agents: formattedAgents,
    pagination: {
      total: totalCount,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore: pagination.offset + pagination.limit < totalCount
    }
  };
};

/**
 * Create a new agent
 * @param {Object} agentData - Agent data
 * @returns {Object} Created agent
 */
const createAgent = async (agentData) => {
  const agent = await agentRepository.create(agentData);
  return formatAgentResponse(agent);
};

/**
 * Update an agent
 * @param {number} agentId - Agent ID
 * @param {Object} agentData - Updated agent data
 * @returns {Object|null} Updated agent
 */
const updateAgent = async (agentId, agentData) => {
  const agent = await agentRepository.update(agentId, agentData);
  
  if (!agent) {
    return null;
  }

  return formatAgentResponse(agent);
};

/**
 * Delete an agent
 * @param {number} agentId - Agent ID
 * @returns {boolean} True if deleted successfully
 */
const deleteAgent = async (agentId) => {
  return await agentRepository.deleteById(agentId);
};

/**
 * Format agent data for API response
 * @param {Object} agent - Raw agent data from database
 * @returns {Object} Formatted agent data
 */
const formatAgentResponse = (agent) => {
  return {
    id: agent.id,
    name: agent.name,
    active: agent.active,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
    organization: agent.organization,
    details: agent.details ? {
      firstMessage: agent.details.firstMessage,
      systemPrompt: agent.details.systemPrompt,
      interactionMode: agent.details.interactionMode
    } : null
  };
};

module.exports = {
  getAgentById,
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent
}; 