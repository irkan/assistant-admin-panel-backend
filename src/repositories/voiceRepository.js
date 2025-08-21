const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Find all voices with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Voices and total count
 */
const findAll = async (filters = {}, pagination = {}) => {
  const {
    limit = 100,
    offset = 0
  } = pagination;

  // Build where clause
  const where = {
    isDeleted: false, // Only show non-deleted voices
    // Note: We're showing all voices (public and private) for demo purposes
    // In production, you might want to filter by isPublic: true
  };

  // Add provider filter if specified
  if (filters.provider) {
    where.provider = filters.provider;
  }

  // Add gender filter if specified
  if (filters.gender) {
    where.gender = filters.gender;
  }

  // Add accent filter if specified
  if (filters.accent) {
    where.accent = filters.accent;
  }

  // Add search filter if specified - search across multiple fields
  if (filters.search) {
    const searchTerm = filters.search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { bestFor: { contains: searchTerm, mode: 'insensitive' } },
      { provider: { contains: searchTerm, mode: 'insensitive' } },
      { providerId: { contains: searchTerm, mode: 'insensitive' } },
      { accent: { contains: searchTerm, mode: 'insensitive' } },
      { gender: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  // Execute queries
  const [voices, total] = await Promise.all([
    prisma.voice.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    }),
    prisma.voice.count({ where })
  ]);

  return { voices, total };
};

/**
 * Find featured voices
 * @returns {Array} Featured voices
 */
const findFeatured = async () => {
  return await prisma.voice.findMany({
    where: {
      isFeatured: true,
      isDeleted: false
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 12 // Limit to 12 featured voices
  });
};

/**
 * Find voice by ID
 * @param {string} id - Voice ID
 * @returns {Object|null} Voice data
 */
const findById = async (id) => {
  return await prisma.voice.findUnique({
    where: { id }
  });
};

/**
 * Find voice by slug
 * @param {string} slug - Voice slug
 * @returns {Object|null} Voice data
 */
const findBySlug = async (slug) => {
  return await prisma.voice.findUnique({
    where: { slug }
  });
};

/**
 * Create a new voice
 * @param {Object} voiceData - Voice data
 * @returns {Object} Created voice
 */
const create = async (voiceData) => {
  return await prisma.voice.create({
    data: voiceData
  });
};

/**
 * Create multiple voices (bulk insert)
 * @param {Array} voicesData - Array of voice data
 * @returns {Object} Creation result
 */
const createMany = async (voicesData) => {
  return await prisma.voice.createMany({
    data: voicesData,
    skipDuplicates: true // Skip if voice with same ID already exists
  });
};

/**
 * Update voice by ID
 * @param {string} id - Voice ID
 * @param {Object} voiceData - Updated voice data
 * @returns {Object} Updated voice
 */
const updateById = async (id, voiceData) => {
  return await prisma.voice.update({
    where: { id },
    data: voiceData
  });
};

/**
 * Delete voice by ID (soft delete)
 * @param {string} id - Voice ID
 * @returns {Object} Updated voice
 */
const deleteById = async (id) => {
  return await prisma.voice.update({
    where: { id },
    data: { isDeleted: true }
  });
};

/**
 * Get distinct providers
 * @returns {Array} List of providers
 */
const getProviders = async () => {
  const result = await prisma.voice.findMany({
    where: {
      isDeleted: false
    },
    select: {
      provider: true
    },
    distinct: ['provider']
  });
  
  return result.map(r => r.provider);
};

/**
 * Get distinct genders
 * @returns {Array} List of genders
 */
const getGenders = async () => {
  const result = await prisma.voice.findMany({
    where: {
      isDeleted: false
    },
    select: {
      gender: true
    },
    distinct: ['gender']
  });
  
  return result.map(r => r.gender);
};

/**
 * Get distinct accents
 * @returns {Array} List of accents
 */
const getAccents = async () => {
  const result = await prisma.voice.findMany({
    where: {
      isDeleted: false,
      accent: {
        not: null
      }
    },
    select: {
      accent: true
    },
    distinct: ['accent']
  });
  
  return result.map(r => r.accent).filter(Boolean);
};

module.exports = {
  findAll,
  findFeatured,
  findById,
  findBySlug,
  create,
  createMany,
  updateById,
  deleteById,
  getProviders,
  getGenders,
  getAccents
};
