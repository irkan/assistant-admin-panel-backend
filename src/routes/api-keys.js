const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Mock data for API keys - in real app this would come from database
const mockApiKeys = [
  {
    id: 1,
    name: "Production API Key",
    type: "private",
    key: "sk-proj-" + crypto.randomBytes(32).toString('hex'),
    maskedKey: "sk-proj-************************************",
    active: true,
    allowedOrigins: [],
    allowedAssistants: [],
    transientAssistants: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: null
  },
  {
    id: 2,
    name: "Development Key",
    type: "public",
    key: "pk-dev-" + crypto.randomBytes(24).toString('hex'),
    maskedKey: "pk-dev-****************************",
    active: true,
    allowedOrigins: ["localhost:3000", "localhost:5173"],
    allowedAssistants: [1, 2],
    transientAssistants: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    updatedAt: null
  }
];

/**
 * @route GET /api/api-keys
 * @desc Get all API keys with optional filtering
 * @access Private
 */
router.get('/', authenticateToken, (req, res) => {
  const { limit = 10, offset = 0, type, active } = req.query;
  
  let filteredKeys = [...mockApiKeys];
  
  // Filter by type if provided
  if (type) {
    filteredKeys = filteredKeys.filter(key => key.type === type);
  }
  
  // Filter by active status if provided
  if (active !== undefined) {
    const isActive = active === 'true';
    filteredKeys = filteredKeys.filter(key => key.active === isActive);
  }
  
  // Apply pagination
  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);
  const paginatedKeys = filteredKeys.slice(offsetNum, offsetNum + limitNum);
  
  // Return keys without the actual key value for security
  const safeKeys = paginatedKeys.map(key => ({
    ...key,
    key: undefined, // Don't expose the actual key
  }));
  
  res.json({
    success: true,
    data: safeKeys,
    pagination: {
      total: filteredKeys.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < filteredKeys.length
    }
  });
});

/**
 * @route GET /api/api-keys/:id
 * @desc Get API key details by ID
 * @access Private
 */
router.get('/:id', authenticateToken, (req, res) => {
  const keyId = parseInt(req.params.id);
  const apiKey = mockApiKeys.find(k => k.id === keyId);
  
  if (!apiKey) {
    return res.status(404).json({
      success: false,
      error: 'API key not found',
      message: `API key with ID ${keyId} does not exist`
    });
  }
  
  // Return key without the actual key value for security
  const safeKey = {
    ...apiKey,
    key: undefined
  };
  
  res.json({
    success: true,
    data: safeKey
  });
});

/**
 * @route POST /api/api-keys
 * @desc Create a new API key
 * @access Private
 */
router.post('/', authenticateToken, (req, res) => {
  const { 
    name, 
    type = 'private',
    allowedOrigins = [],
    allowedAssistants = [],
    transientAssistants = true,
    active = true 
  } = req.body;
  
  // Simple validation
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Name is required'
    });
  }
  
  if (!['private', 'public'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      message: 'Type must be either "private" or "public"'
    });
  }
  
  // Generate new API key
  const keyPrefix = type === 'private' ? 'sk-proj-' : 'pk-dev-';
  const keyLength = type === 'private' ? 32 : 24;
  const newKeyValue = keyPrefix + crypto.randomBytes(keyLength).toString('hex');
  const maskedKey = keyPrefix + '*'.repeat(keyLength * 2);
  
  const newApiKey = {
    id: Math.max(...mockApiKeys.map(k => k.id)) + 1,
    name: name.trim(),
    type,
    key: newKeyValue,
    maskedKey,
    active,
    allowedOrigins: type === 'public' ? allowedOrigins : [],
    allowedAssistants: type === 'public' ? allowedAssistants : [],
    transientAssistants: type === 'public' ? transientAssistants : true,
    createdAt: new Date(),
    lastUsed: null,
    updatedAt: null
  };
  
  mockApiKeys.push(newApiKey);
  
  // Return the new key (only time the actual key is returned)
  res.status(201).json({
    success: true,
    data: {
      ...newApiKey,
      message: 'API key created successfully. Save this key as it will not be shown again.'
    }
  });
});

/**
 * @route PUT /api/api-keys/:id
 * @desc Update an API key
 * @access Private
 */
router.put('/:id', authenticateToken, (req, res) => {
  const keyId = parseInt(req.params.id);
  const keyIndex = mockApiKeys.findIndex(k => k.id === keyId);
  
  if (keyIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'API key not found',
      message: `API key with ID ${keyId} does not exist`
    });
  }
  
  const { name, active, allowedOrigins, allowedAssistants, transientAssistants } = req.body;
  
  // Update API key
  mockApiKeys[keyIndex] = {
    ...mockApiKeys[keyIndex],
    ...(name && { name: name.trim() }),
    ...(active !== undefined && { active }),
    ...(allowedOrigins !== undefined && { allowedOrigins }),
    ...(allowedAssistants !== undefined && { allowedAssistants }),
    ...(transientAssistants !== undefined && { transientAssistants }),
    updatedAt: new Date()
  };
  
  // Return updated key without the actual key value
  const safeKey = {
    ...mockApiKeys[keyIndex],
    key: undefined
  };
  
  res.json({
    success: true,
    data: safeKey
  });
});

/**
 * @route DELETE /api/api-keys/:id
 * @desc Delete an API key
 * @access Private
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const keyId = parseInt(req.params.id);
  const keyIndex = mockApiKeys.findIndex(k => k.id === keyId);
  
  if (keyIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'API key not found',
      message: `API key with ID ${keyId} does not exist`
    });
  }
  
  mockApiKeys.splice(keyIndex, 1);
  
  res.json({
    success: true,
    message: 'API key deleted successfully'
  });
});

module.exports = router;
