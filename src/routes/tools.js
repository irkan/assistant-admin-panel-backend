const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock data for tools - in real app this would come from database
const mockTools = [
  {
    id: 1,
    name: "Web Search",
    type: "api",
    description: "Search the web for current information",
    endpoint: "https://api.web-search.com/v1/search",
    active: true,
    createdAt: new Date(),
    updatedAt: null
  },
  {
    id: 2,
    name: "Calculator",
    type: "function",
    description: "Perform mathematical calculations",
    endpoint: null,
    active: true,
    createdAt: new Date(),
    updatedAt: null
  },
  {
    id: 3,
    name: "Weather API",
    type: "api",
    description: "Get current weather information",
    endpoint: "https://api.weather.com/v1/current",
    active: false,
    createdAt: new Date(),
    updatedAt: null
  }
];

/**
 * @route GET /api/tools
 * @desc Get all tools with optional filtering
 * @access Private
 */
router.get('/', authenticateToken, (req, res) => {
  const { limit = 100, offset = 0, active } = req.query;
  
  let filteredTools = [...mockTools];
  
  // Filter by active status if provided
  if (active !== undefined) {
    const isActive = active === 'true';
    filteredTools = filteredTools.filter(tool => tool.active === isActive);
  }
  
  // Apply pagination
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);
  const paginatedTools = filteredTools.slice(offsetNum, offsetNum + limitNum);
  
  res.json({
    success: true,
    data: paginatedTools,
    pagination: {
      total: filteredTools.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < filteredTools.length
    }
  });
});

/**
 * @route GET /api/tools/:id
 * @desc Get tool details by ID
 * @access Private
 */
router.get('/:id', authenticateToken, (req, res) => {
  const toolId = parseInt(req.params.id);
  const tool = mockTools.find(t => t.id === toolId);
  
  if (!tool) {
    return res.status(404).json({
      success: false,
      error: 'Tool not found',
      message: `Tool with ID ${toolId} does not exist`
    });
  }
  
  res.json({
    success: true,
    data: tool
  });
});

/**
 * @route POST /api/tools
 * @desc Create a new tool
 * @access Private
 */
router.post('/', authenticateToken, (req, res) => {
  const { name, type, description, endpoint, active = true } = req.body;
  
  // Simple validation
  if (!name || !type || !description) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Name, type, and description are required'
    });
  }
  
  const newTool = {
    id: Math.max(...mockTools.map(t => t.id)) + 1,
    name,
    type,
    description,
    endpoint: endpoint || null,
    active,
    createdAt: new Date(),
    updatedAt: null
  };
  
  mockTools.push(newTool);
  
  res.status(201).json({
    success: true,
    data: newTool
  });
});

/**
 * @route PUT /api/tools/:id
 * @desc Update a tool
 * @access Private
 */
router.put('/:id', authenticateToken, (req, res) => {
  const toolId = parseInt(req.params.id);
  const toolIndex = mockTools.findIndex(t => t.id === toolId);
  
  if (toolIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Tool not found',
      message: `Tool with ID ${toolId} does not exist`
    });
  }
  
  const { name, type, description, endpoint, active } = req.body;
  
  // Update tool
  mockTools[toolIndex] = {
    ...mockTools[toolIndex],
    ...(name && { name }),
    ...(type && { type }),
    ...(description && { description }),
    ...(endpoint !== undefined && { endpoint }),
    ...(active !== undefined && { active }),
    updatedAt: new Date()
  };
  
  res.json({
    success: true,
    data: mockTools[toolIndex]
  });
});

/**
 * @route DELETE /api/tools/:id
 * @desc Delete a tool
 * @access Private
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const toolId = parseInt(req.params.id);
  const toolIndex = mockTools.findIndex(t => t.id === toolId);
  
  if (toolIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Tool not found',
      message: `Tool with ID ${toolId} does not exist`
    });
  }
  
  mockTools.splice(toolIndex, 1);
  
  res.json({
    success: true,
    message: 'Tool deleted successfully'
  });
});

module.exports = router;
