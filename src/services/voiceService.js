const voiceRepository = require('../repositories/voiceRepository');

/**
 * Get all voices with pagination and filtering
 * @param {Object} filters - Filter options
 * @param {Object} pagination - Pagination options
 * @returns {Object} Result with voices and metadata
 */
const getAllVoices = async (filters, pagination) => {
  const result = await voiceRepository.findAll(filters, pagination);
  
  const { limit, offset } = pagination;
  const { voices, total } = result;
  
  return {
    success: true,
    data: voices.map(formatVoiceResponse),
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
      hasNext: offset + limit < total,
      hasPrev: offset > 0
    }
  };
};

/**
 * Get featured voices
 * @returns {Object} Result with featured voices
 */
const getFeaturedVoices = async () => {
  const voices = await voiceRepository.findFeatured();
  
  return {
    success: true,
    data: voices.map(formatVoiceResponse)
  };
};

/**
 * Get voice by ID
 * @param {string} voiceId - Voice ID
 * @returns {Object} Result with voice data
 */
const getVoiceById = async (voiceId) => {
  const voice = await voiceRepository.findById(voiceId);
  
  if (!voice) {
    return {
      success: false,
      message: 'Voice not found'
    };
  }
  
  return {
    success: true,
    data: formatVoiceResponse(voice)
  };
};

/**
 * Get voice by slug
 * @param {string} slug - Voice slug
 * @returns {Object} Result with voice data
 */
const getVoiceBySlug = async (slug) => {
  const voice = await voiceRepository.findBySlug(slug);
  
  if (!voice) {
    return {
      success: false,
      message: 'Voice not found'
    };
  }
  
  return {
    success: true,
    data: formatVoiceResponse(voice)
  };
};

/**
 * Get filter options
 * @returns {Object} Available filter options
 */
const getFilterOptions = async () => {
  const [providers, genders, accents] = await Promise.all([
    voiceRepository.getProviders(),
    voiceRepository.getGenders(),
    voiceRepository.getAccents()
  ]);
  
  return {
    success: true,
    data: {
      providers: providers.sort(),
      genders: genders.sort(),
      accents: accents.sort()
    }
  };
};

/**
 * Create voice
 * @param {Object} voiceData - Voice data
 * @returns {Object} Result with created voice
 */
const createVoice = async (voiceData) => {
  const voice = await voiceRepository.create(voiceData);
  
  return {
    success: true,
    data: formatVoiceResponse(voice)
  };
};

/**
 * Update voice
 * @param {string} voiceId - Voice ID
 * @param {Object} voiceData - Updated voice data
 * @returns {Object} Result with updated voice
 */
const updateVoice = async (voiceId, voiceData) => {
  const voice = await voiceRepository.updateById(voiceId, voiceData);
  
  return {
    success: true,
    data: formatVoiceResponse(voice)
  };
};

/**
 * Delete voice
 * @param {string} voiceId - Voice ID
 * @returns {Object} Result
 */
const deleteVoice = async (voiceId) => {
  await voiceRepository.deleteById(voiceId);
  
  return {
    success: true,
    message: 'Voice deleted successfully'
  };
};

/**
 * Format voice data for API response
 * @param {Object} voice - Raw voice data from database
 * @returns {Object} Formatted voice data
 */
const formatVoiceResponse = (voice) => {
  return {
    id: voice.id,
    provider: voice.provider,
    providerId: voice.providerId,
    slug: voice.slug,
    name: voice.name,
    gender: voice.gender,
    accent: voice.accent,
    previewUrl: voice.previewUrl,
    description: voice.description,
    isPublic: voice.isPublic,
    isFeatured: voice.isFeatured,
    imageUrl: voice.imageUrl,
    bestFor: voice.bestFor,
    createdAt: voice.createdAt,
    updatedAt: voice.updatedAt
  };
};

module.exports = {
  getAllVoices,
  getFeaturedVoices,
  getVoiceById,
  getVoiceBySlug,
  getFilterOptions,
  createVoice,
  updateVoice,
  deleteVoice
};
