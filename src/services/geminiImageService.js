const { GoogleGenAI } = require('@google/genai');

/**
 * Gemini Image Generation Service
 */
class GeminiImageService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.ai = new GoogleGenAI({
      apiKey: this.apiKey,
    });
    this.model = 'gemini-2.5-flash-image-preview';
  }

  /**
   * Generate avatar background image using Gemini
   * @param {string} prompt - Text prompt for image generation
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image data
   */
  async generateAvatarBackground(prompt, options = {}) {
    try {
      const config = {
        responseModalities: ['IMAGE', 'TEXT'],
      };

      // Enhance prompt for 16:9 aspect ratio background
      const enhancedPrompt = `Create a beautiful 16:9 aspect ratio background image for an AI assistant avatar. ${prompt}. The image should be suitable as a background, with space for an avatar character to be overlaid. High quality, professional, visually appealing.`;

      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: enhancedPrompt,
            },
          ],
        },
      ];

      console.log('Generating image with prompt:', enhancedPrompt);

      const response = await this.ai.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      let imageData = null;
      let textResponse = '';

      for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          continue;
        }

        // Check for image data
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          imageData = {
            mimeType: inlineData.mimeType || 'image/png',
            data: inlineData.data, // Base64 data
          };
        }
        // Check for text response
        else if (chunk.text) {
          textResponse += chunk.text;
        }
      }

      if (!imageData) {
        throw new Error('No image data received from Gemini');
      }

      return {
        success: true,
        image: imageData,
        description: textResponse.trim() || 'Generated avatar background',
        prompt: enhancedPrompt
      };

    } catch (error) {
      console.error('Error generating image with Gemini:', error);
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  /**
   * Validate and process prompt for safe image generation
   * @param {string} prompt - User input prompt
   * @returns {string} Processed safe prompt
   */
  validatePrompt(prompt) {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Valid prompt is required');
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 3) {
      throw new Error('Prompt must be at least 3 characters long');
    }

    if (trimmedPrompt.length > 500) {
      throw new Error('Prompt must be less than 500 characters');
    }

    // Basic content filtering (you can enhance this)
    const prohibitedWords = ['explicit', 'nsfw', 'violent', 'inappropriate'];
    const lowerPrompt = trimmedPrompt.toLowerCase();
    
    for (const word of prohibitedWords) {
      if (lowerPrompt.includes(word)) {
        throw new Error('Prompt contains inappropriate content');
      }
    }

    return trimmedPrompt;
  }
}

module.exports = GeminiImageService;