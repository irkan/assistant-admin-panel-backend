const agentService = require('../services/agentService');

/**
 * Get agent details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAgentById = async (req, res) => {
  const agentId = req.validatedAgentId;
  const agent = await agentService.getAgentById(agentId);

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found',
      message: `Agent with ID ${req.params.id} does not exist`
    });
  }

  res.json({
    success: true,
    data: agent
  });
};

/**
 * Get all agents with optional filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAgents = async (req, res) => {
  const filters = req.validatedFilters;
  const pagination = req.validatedPagination;

  const result = await agentService.getAllAgents(filters, pagination);

  res.json({
    success: true,
    data: result.agents,
    pagination: result.pagination
  });
};

/**
 * Create a new agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createAgent = async (req, res) => {
  const agentData = req.validatedAgentData;
  const agent = await agentService.createAgent(agentData);

  res.status(201).json({
    success: true,
    data: agent
  });
};

/**
 * Update an agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAgent = async (req, res) => {
  const agentId = req.validatedAgentId;
  const agentData = req.validatedAgentData;
  
  const agent = await agentService.updateAgent(agentId, agentData);
  
  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found',
      message: `Agent with ID ${agentId} does not exist`
    });
  }

  res.json({
    success: true,
    data: agent
  });
};

/**
 * Delete an agent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteAgent = async (req, res) => {
  const agentId = req.validatedAgentId;
  
  const deleted = await agentService.deleteAgent(agentId);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found',
      message: `Agent with ID ${agentId} does not exist`
    });
  }

  res.json({
    success: true,
    message: 'Agent deleted successfully'
  });
};

module.exports = {
  getAgentById,
  getAllAgents,
  createAgent,
  updateAgent,
  deleteAgent
}; 