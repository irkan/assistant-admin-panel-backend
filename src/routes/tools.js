const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock data for tools - in real app this would come from database
// EMPTY on restart - user will create their own tools
const mockTools = [];

/**
 * @route GET /api/tools
 * @desc Get all tools with optional filtering
 * @access Private
 */
router.get('/', authenticateToken, (req, res) => {
  const { limit = 100, offset = 0, active, organizationId } = req.query;
  
  console.log('🔍 Tools GET request:', { organizationId, activeParam: active, totalTools: mockTools.length });
  console.log('📋 All tools in database:', mockTools.map(t => ({ id: t.id, name: t.name, organizationId: t.organizationId, status: t.status })));
  
  let filteredTools = [...mockTools];
  
  // Filter by organization if provided
  if (organizationId !== undefined) {
    const orgId = parseInt(organizationId);
    console.log('🏢 Filtering by organizationId:', orgId);
    filteredTools = filteredTools.filter(tool => tool.organizationId === orgId);
    console.log('📋 Filtered tools count:', filteredTools.length);
  }
  
  // Filter by active status if provided
  if (active !== undefined) {
    const isActive = active === 'true';
    filteredTools = filteredTools.filter(tool => tool.active === isActive);
  }
  
  // Apply pagination
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);
  const paginatedTools = filteredTools.slice(offsetNum, offsetNum + limitNum);
  
  console.log('📤 Returning tools:', paginatedTools.map(t => ({ id: t.id, name: t.name, organizationId: t.organizationId })));
  
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
  const { name, type, description, endpoint, parameters, status = "draft", organizationId, active = true } = req.body;
  
  console.log('🔧 Creating tool:', { name, type, organizationId, status });
  
  // No validation for create - allow draft tools with minimal info
  // Validation will happen only when publishing (status = "published")
  
  const newTool = {
    id: mockTools.length > 0 ? Math.max(...mockTools.map(t => t.id)) + 1 : 1,
    name: name || "",
    type: type || "custom_tool",
    description: description || "",
    endpoint: endpoint || null,
    parameters: parameters || {},
    status: status,
    organizationId: organizationId || 1, // Default to organization 1 if not provided
    active,
    createdAt: new Date(),
    updatedAt: null
  };
  
  console.log('✅ Tool created:', { id: newTool.id, name: newTool.name, organizationId: newTool.organizationId });
  
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
  
  const { name, type, description, endpoint, parameters, status, active } = req.body;
  
  // Validate required fields only when publishing (status = "published")
  if (status === "published") {
    // Use existing values if not provided in update
    const currentTool = mockTools[toolIndex];
    const finalName = name !== undefined ? name : currentTool.name;
    const finalType = type !== undefined ? type : currentTool.type;
    const finalDescription = description !== undefined ? description : currentTool.description;
    
    if (!finalName || !finalName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Tool name is required for publishing'
      });
    }
    
    if (!finalType || !finalType.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Tool type is required for publishing'
      });
    }
    
    if (!finalDescription || !finalDescription.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Tool description is required for publishing'
      });
    }
  }
  
  // Update tool
  mockTools[toolIndex] = {
    ...mockTools[toolIndex],
    ...(name !== undefined && { name }),
    ...(type !== undefined && { type }),
    ...(description !== undefined && { description }),
    ...(endpoint !== undefined && { endpoint }),
    ...(parameters !== undefined && { parameters }),
    ...(status !== undefined && { status }),
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
