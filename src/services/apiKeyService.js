const crypto = require('crypto');
const bcrypt = require('bcrypt');
const apiKeyRepository = require('../repositories/apiKeyRepository');
const encryptionService = require('./encryptionService');

/**
 * Generate a new API key
 * @returns {Object} { key, hash, prefix }
 */
const generateApiKey = () => {
  // Generate random bytes for the key
  const randomBytes = crypto.randomBytes(32);
  const keyBody = randomBytes.toString('hex');
  
  // Create the full key with prefix
  const fullKey = `ak_${keyBody}`;
  
  // Create hash for storage
  const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');
  
  // Create prefix for identification (first 8 chars after ak_)
  const keyPrefix = `ak_${keyBody.substring(0, 8)}`;
  
  return {
    key: fullKey,
    hash: keyHash,
    prefix: keyPrefix
  };
};

/**
 * Hash an API key for storage
 * @param {string} key - Raw API key
 * @returns {string} Hashed key
 */
const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * Create a new API key
 * @param {Object} data - API key creation data
 * @returns {Object} Created API key with raw key (only returned once)
 */
const createApiKey = async (data) => {
  try {
    const { organizationId, name, allowedAssistants = [], expiresInDays = 90 } = data;
    
    // Generate API key
    const { key, hash, prefix } = generateApiKey();
    
    // Store the full key encrypted for future visibility requests
    const encryptedKey = encryptionService.encrypt(key);
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    // Create API key in database
    const apiKey = await apiKeyRepository.create({
      organizationId,
      name: name.trim(),
      keyHash: hash,
      keyPrefix: prefix,
      encryptedKey, // Store encrypted version
      allowedAssistants,
      expiresAt,
      active: true
    });
    
    // Return with raw key (only time it's exposed)
    return {
      ...apiKey,
      rawKey: key, // Include raw key in response
      keyHash: undefined, // Don't expose hash
      encryptedKey: undefined // Don't expose encrypted version
    };
    
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
};

/**
 * Validate API key and return associated data
 * @param {string} key - Raw API key
 * @returns {Object|null} API key data if valid, null if invalid
 */
const validateApiKey = async (key) => {
  try {
    if (!key || !key.startsWith('ak_')) {
      return null;
    }
    
    // Hash the provided key
    const keyHash = hashApiKey(key);
    
    // Find API key in database
    const apiKey = await apiKeyRepository.findByHash(keyHash);
    
    if (!apiKey) {
      return null;
    }
    
    // Check if key is active
    if (!apiKey.active) {
      return null;
    }
    
    // Check if key has expired
    if (new Date() > apiKey.expiresAt) {
      return null;
    }
    
    // Update last used timestamp (async, don't wait)
    apiKeyRepository.updateLastUsed(apiKey.id).catch(console.error);
    
    return apiKey;
    
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
};

/**
 * Check if assistant is allowed for API key
 * @param {Object} apiKey - API key data
 * @param {number} assistantId - Assistant ID to check
 * @returns {boolean} True if allowed
 */
const isAssistantAllowed = (apiKey, assistantId) => {
  // If no restrictions, allow all assistants in the organization
  if (!apiKey.allowedAssistants || apiKey.allowedAssistants.length === 0) {
    return true;
  }
  
  // Check if assistant ID is in allowed list
  return apiKey.allowedAssistants.includes(assistantId);
};

/**
 * Get API keys for organization
 * @param {number} organizationId - Organization ID
 * @returns {Array} Array of API keys (without raw keys)
 */
const getApiKeysByOrganization = async (organizationId) => {
  try {
    const apiKeys = await apiKeyRepository.findByOrganization(organizationId);
    
    // Remove sensitive data and add masked key for display
    return apiKeys.map(apiKey => ({
      ...apiKey,
      keyHash: undefined,
      maskedKey: `${apiKey.keyPrefix}${'*'.repeat(56)}`, // Mask the key for display
      isExpired: new Date() > apiKey.expiresAt
    }));
    
  } catch (error) {
    console.error('Error getting API keys:', error);
    throw error;
  }
};

/**
 * Update API key
 * @param {number} id - API key ID
 * @param {Object} data - Update data
 * @returns {Object} Updated API key
 */
const updateApiKey = async (id, data) => {
  try {
    const { name, active, allowedAssistants, expiresInDays } = data;
    
    const updateData = {};
    
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    
    if (active !== undefined) {
      updateData.active = active;
    }
    
    if (allowedAssistants !== undefined) {
      updateData.allowedAssistants = allowedAssistants;
    }
    
    if (expiresInDays !== undefined) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      updateData.expiresAt = expiresAt;
    }
    
    const apiKey = await apiKeyRepository.update(id, updateData);
    
    // Remove sensitive data
    return {
      ...apiKey,
      keyHash: undefined,
      maskedKey: `${apiKey.keyPrefix}${'*'.repeat(56)}`,
      isExpired: new Date() > apiKey.expiresAt
    };
    
  } catch (error) {
    console.error('Error updating API key:', error);
    throw error;
  }
};

/**
 * Delete API key
 * @param {number} id - API key ID
 * @returns {Object} Deleted API key
 */
const deleteApiKey = async (id) => {
  try {
    return await apiKeyRepository.deleteById(id);
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};

/**
 * Get API key by ID
 * @param {number} id - API key ID
 * @returns {Object|null} API key data
 */
const getApiKeyById = async (id) => {
  try {
    const apiKey = await apiKeyRepository.findById(id);
    
    if (!apiKey) {
      return null;
    }
    
    // Remove sensitive data
    return {
      ...apiKey,
      keyHash: undefined,
      maskedKey: `${apiKey.keyPrefix}${'*'.repeat(56)}`,
      isExpired: new Date() > apiKey.expiresAt
    };
    
  } catch (error) {
    console.error('Error getting API key by ID:', error);
    throw error;
  }
};

/**
 * Get full API key by ID (decrypted)
 * @param {number} id - API key ID
 * @returns {Object|null} API key data with full key
 */
const getFullApiKeyById = async (id) => {
  try {
    const apiKey = await apiKeyRepository.findById(id);
    
    if (!apiKey) {
      return null;
    }
    
    // Decrypt the full key if it exists
    let fullKey = null;
    if (apiKey.encryptedKey) {
      try {
        fullKey = encryptionService.decrypt(apiKey.encryptedKey);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        // If decryption fails, we'll return without the full key
      }
    }
    
    // Remove sensitive data
    return {
      ...apiKey,
      keyHash: undefined,
      encryptedKey: undefined,
      fullKey: fullKey, // Only include if successfully decrypted
      maskedKey: `${apiKey.keyPrefix}${'*'.repeat(56)}`,
      isExpired: new Date() > apiKey.expiresAt
    };
    
  } catch (error) {
    console.error('Error getting full API key by ID:', error);
    throw error;
  }
};

module.exports = {
  generateApiKey,
  hashApiKey,
  createApiKey,
  validateApiKey,
  isAssistantAllowed,
  getApiKeysByOrganization,
  updateApiKey,
  deleteApiKey,
  getApiKeyById,
  getFullApiKeyById
};