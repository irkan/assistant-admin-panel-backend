const express = require('express');
const agentController = require('../controllers/agentController');
const { 
  validateAgentId, 
  validatePagination, 
  validateFilters,
  validateAgentData 
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/agents/:id
 * @desc Get agent details by ID
 * @access Public
 */
router.get('/:id', validateAgentId, agentController.getAgentById);

/**
 * @route GET /api/agents
 * @desc Get all agents with optional filtering
 * @access Private
 */
router.get('/', authenticateToken, validatePagination, validateFilters, agentController.getAllAgents);

/**
 * @route POST /api/agents
 * @desc Create a new agent
 * @access Private
 */
router.post('/', authenticateToken, validateAgentData, agentController.createAgent);

/**
 * @route PUT /api/agents/:id
 * @desc Update an agent
 * @access Private
 */
router.put('/:id', authenticateToken, validateAgentId, validateAgentData, agentController.updateAgent);

/**
 * @route DELETE /api/agents/:id
 * @desc Delete an agent
 * @access Private
 */
router.delete('/:id', authenticateToken, validateAgentId, agentController.deleteAgent);

module.exports = router; 