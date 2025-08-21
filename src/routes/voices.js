const express = require('express');
const voiceController = require('../controllers/voiceController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/voices
 * @desc Get all voices with pagination and filtering
 * @access Public
 * @query {string} provider - Filter by provider (11labs, playht, neets, etc.)
 * @query {string} gender - Filter by gender (male, female)
 * @query {string} accent - Filter by accent (british, australian, etc.)
 * @query {string} search - Search in name, description, bestFor
 * @query {number} limit - Number of items per page (default: 150, max: 150)
 * @query {number} offset - Number of items to skip (default: 0)
 * @query {number} page - Page number (alternative to offset)
 */
router.get('/', voiceController.getAllVoices);

/**
 * @route GET /api/voices/featured
 * @desc Get featured voices
 * @access Public
 */
router.get('/featured', voiceController.getFeaturedVoices);

/**
 * @route GET /api/voices/filters
 * @desc Get available filter options
 * @access Public
 */
router.get('/filters', voiceController.getFilterOptions);

/**
 * @route GET /api/voices/:id
 * @desc Get voice by ID
 * @access Public
 */
router.get('/:id', voiceController.getVoiceById);

/**
 * @route GET /api/voices/slug/:slug
 * @desc Get voice by slug
 * @access Public
 */
router.get('/slug/:slug', voiceController.getVoiceBySlug);

/**
 * @route POST /api/voices
 * @desc Create a new voice
 * @access Private
 */
router.post('/', authenticateToken, voiceController.createVoice);

/**
 * @route PUT /api/voices/:id
 * @desc Update voice
 * @access Private
 */
router.put('/:id', authenticateToken, voiceController.updateVoice);

/**
 * @route DELETE /api/voices/:id
 * @desc Delete voice
 * @access Private
 */
router.delete('/:id', authenticateToken, voiceController.deleteVoice);

module.exports = router;
