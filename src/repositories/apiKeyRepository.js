const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Find API key by hash
 * @param {string} keyHash - Hashed API key
 * @returns {Object|null} API key data or null
 */
const findByHash = async (keyHash) => {
  try {
    return await prisma.apiKey.findUnique({
      where: { keyHash },
      include: {
        organization: true
      }
    });
  } catch (error) {
    console.error('Error finding API key by hash:', error);
    throw error;
  }
};

/**
 * Find all API keys for organization
 * @param {number} organizationId - Organization ID
 * @returns {Array} Array of API keys
 */
const findByOrganization = async (organizationId) => {
  try {
    return await prisma.apiKey.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error finding API keys by organization:', error);
    throw error;
  }
};

/**
 * Find API key by ID
 * @param {number} id - API key ID
 * @returns {Object|null} API key data or null
 */
const findById = async (id) => {
  try {
    return await prisma.apiKey.findUnique({
      where: { id },
      include: {
        organization: true
      }
    });
  } catch (error) {
    console.error('Error finding API key by ID:', error);
    throw error;
  }
};

/**
 * Create new API key
 * @param {Object} data - API key data
 * @returns {Object} Created API key
 */
const create = async (data) => {
  try {
    return await prisma.apiKey.create({
      data,
      include: {
        organization: true
      }
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
};

/**
 * Update API key
 * @param {number} id - API key ID
 * @param {Object} data - Update data
 * @returns {Object} Updated API key
 */
const update = async (id, data) => {
  try {
    return await prisma.apiKey.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        organization: true
      }
    });
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
const deleteById = async (id) => {
  try {
    return await prisma.apiKey.delete({
      where: { id }
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};

/**
 * Update last used timestamp
 * @param {number} id - API key ID
 * @returns {Object} Updated API key
 */
const updateLastUsed = async (id) => {
  try {
    return await prisma.apiKey.update({
      where: { id },
      data: {
        lastUsedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating last used:', error);
    throw error;
  }
};

/**
 * Check if API key exists by prefix
 * @param {string} keyPrefix - API key prefix
 * @returns {boolean} True if exists
 */
const existsByPrefix = async (keyPrefix) => {
  try {
    const count = await prisma.apiKey.count({
      where: { keyPrefix }
    });
    return count > 0;
  } catch (error) {
    console.error('Error checking API key prefix:', error);
    throw error;
  }
};

module.exports = {
  findByHash,
  findByOrganization,
  findById,
  create,
  update,
  deleteById,
  updateLastUsed,
  existsByPrefix
};