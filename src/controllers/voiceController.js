const voiceService = require('../services/voiceService');

/**
 * Get all voices with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVoices = async (req, res) => {
  try {
    const filters = {
      provider: req.query.provider,
      gender: req.query.gender,
      accent: req.query.accent,
      search: req.query.search
    };

    const pagination = {
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0
    };

    // Calculate page-based offset if page is provided instead of offset
    if (req.query.page && !req.query.offset) {
      const page = parseInt(req.query.page) || 1;
      pagination.offset = (page - 1) * pagination.limit;
    }

    const result = await voiceService.getAllVoices(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error getting voices:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get voices'
    });
  }
};

/**
 * Get featured voices
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFeaturedVoices = async (req, res) => {
  try {
    const result = await voiceService.getFeaturedVoices();
    res.json(result);
  } catch (error) {
    console.error('Error getting featured voices:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get featured voices'
    });
  }
};

/**
 * Get voice by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await voiceService.getVoiceById(id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting voice by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get voice'
    });
  }
};

/**
 * Get voice by slug
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVoiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await voiceService.getVoiceBySlug(slug);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error getting voice by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get voice'
    });
  }
};

/**
 * Get filter options
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFilterOptions = async (req, res) => {
  try {
    const result = await voiceService.getFilterOptions();
    res.json(result);
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get filter options'
    });
  }
};

/**
 * Create a new voice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVoice = async (req, res) => {
  try {
    const result = await voiceService.createVoice(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating voice:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create voice'
    });
  }
};

/**
 * Update voice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVoice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await voiceService.updateVoice(id, req.body);
    res.json(result);
  } catch (error) {
    console.error('Error updating voice:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update voice'
    });
  }
};

/**
 * Delete voice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVoice = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await voiceService.deleteVoice(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting voice:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete voice'
    });
  }
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
