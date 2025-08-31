const GeminiImageService = require('../services/geminiImageService');

/**
 * Gemini Image Generation Controller
 */
class GeminiImageController {
  constructor() {
    this.geminiImageService = new GeminiImageService();
  }

  /**
   * Generate avatar background image
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateAvatarBackground = async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Prompt is required'
        });
      }

      // Validate prompt
      let validatedPrompt;
      try {
        validatedPrompt = this.geminiImageService.validatePrompt(prompt);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Prompt',
          message: validationError.message
        });
      }

      console.log(`Generating avatar background for user ${req.user.id} with prompt: "${validatedPrompt}"`);

      // Generate image
      const result = await this.geminiImageService.generateAvatarBackground(validatedPrompt);

      res.json({
        success: true,
        data: {
          image: {
            mimeType: result.image.mimeType,
            base64Data: result.image.data,
            size: Buffer.from(result.image.data, 'base64').length
          },
          description: result.description,
          prompt: result.prompt,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error in generateAvatarBackground controller:', error);
      
      // Handle specific Gemini API errors
      if (error.message.includes('API key')) {
        return res.status(503).json({
          success: false,
          error: 'Service Unavailable',
          message: 'Image generation service is not properly configured'
        });
      }

      if (error.message.includes('quota') || error.message.includes('limit')) {
        return res.status(429).json({
          success: false,
          error: 'Rate Limit Exceeded',
          message: 'Image generation quota exceeded. Please try again later.'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate avatar background'
      });
    }
  };

  /**
   * Get generation limits and info
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getGenerationInfo = async (req, res) => {
    try {
      res.json({
        success: true,
        data: {
          model: 'gemini-2.5-flash-image-preview',
          aspectRatio: '16:9',
          maxPromptLength: 500,
          minPromptLength: 3,
          supportedFormats: ['PNG', 'JPEG'],
          recommendations: [
            'Describe the mood and atmosphere you want',
            'Mention colors, lighting, or style preferences',
            'Be specific but concise',
            'Avoid inappropriate content'
          ]
        }
      });
    } catch (error) {
      console.error('Error in getGenerationInfo:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to get generation info'
      });
    }
  };
}

module.exports = new GeminiImageController();