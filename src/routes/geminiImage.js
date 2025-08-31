const express = require('express');
const geminiImageController = require('../controllers/geminiImageController');
const avatarImageService = require('../services/avatarImageService');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

/**
 * Validation middleware for image generation
 */
const validateImageGeneration = [
  body('prompt')
    .isString()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Prompt must be between 3 and 500 characters'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * @route POST /api/gemini/generate-avatar-background
 * @desc Generate avatar background image using Gemini
 * @access Private
 */
router.post(
  '/generate-avatar-background',
  authenticateToken,
  validateImageGeneration,
  geminiImageController.generateAvatarBackground
);

/**
 * @route GET /api/gemini/info
 * @desc Get image generation service information
 * @access Private
 */
router.get('/info', authenticateToken, geminiImageController.getGenerationInfo);

/**
 * @route POST /api/gemini/upload-avatar-image
 * @desc Upload and save custom avatar background image
 * @access Private
 */
router.post('/upload-avatar-image', authenticateToken, [
  body('assistantId').isInt().withMessage('Assistant ID must be an integer'),
  body('imageData').isString().withMessage('Image data is required'),
  body('mimeType').isString().withMessage('MIME type is required'),
  body('fileName').isString().withMessage('File name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { assistantId, imageData, mimeType, fileName } = req.body;
    
    const savedImage = await avatarImageService.saveUploadedAvatarImage({
      assistantId: parseInt(assistantId),
      imageData,
      mimeType,
      fileName,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: {
        id: savedImage.id,
        assistantId: savedImage.assistantId,
        isActive: savedImage.isActive,
        createdAt: savedImage.createdAt
      }
    });

  } catch (error) {
    console.error('Error uploading avatar image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/gemini/save-avatar-image
 * @desc Save generated avatar image
 * @access Private
 */
router.post('/save-avatar-image', authenticateToken, [
  body('assistantId').isInt().withMessage('Assistant ID must be an integer'),
  body('imageData').isString().withMessage('Image data is required'),
  body('mimeType').isString().withMessage('MIME type is required'),
  body('prompt').isString().withMessage('Prompt is required'),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors.array()
      });
    }

    const { assistantId, imageData, mimeType, prompt, description } = req.body;
    
    const savedImage = await avatarImageService.saveAvatarImage({
      assistantId: parseInt(assistantId),
      imageData,
      mimeType,
      prompt,
      description,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: {
        id: savedImage.id,
        assistantId: savedImage.assistantId,
        isActive: savedImage.isActive,
        createdAt: savedImage.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving avatar image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/gemini/avatar-images/:assistantId
 * @desc Get all avatar images for assistant
 * @access Private
 */
router.get('/avatar-images/:assistantId', authenticateToken, async (req, res) => {
  try {
    const assistantId = parseInt(req.params.assistantId);
    
    if (isNaN(assistantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assistant ID'
      });
    }

    const images = await avatarImageService.getAvatarImages(assistantId, req.user.id);

    res.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error('Error getting avatar images:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/gemini/avatar-images/:imageId/activate
 * @desc Set active avatar image
 * @access Private
 */
router.put('/avatar-images/:imageId/activate', authenticateToken, async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    
    if (isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image ID'
      });
    }

    const updatedImage = await avatarImageService.setActiveAvatarImage(imageId, req.user.id);

    res.json({
      success: true,
      data: {
        id: updatedImage.id,
        assistantId: updatedImage.assistantId,
        isActive: updatedImage.isActive
      }
    });

  } catch (error) {
    console.error('Error activating avatar image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/gemini/avatar-images/:imageId
 * @desc Delete avatar image
 * @access Private
 */
router.delete('/avatar-images/:imageId', authenticateToken, async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    
    if (isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image ID'
      });
    }

    await avatarImageService.deleteAvatarImage(imageId, req.user.id);

    res.json({
      success: true,
      message: 'Avatar image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting avatar image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;