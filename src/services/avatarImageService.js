const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Avatar Image Service
 */
class AvatarImageService {
  /**
   * Save uploaded avatar image to database
   * @param {Object} data - Avatar image data from upload
   * @returns {Promise<Object>} Saved avatar image
   */
  async saveUploadedAvatarImage(data) {
    try {
      const { assistantId, imageData, mimeType, fileName, userId } = data;

      // Verify that the assistant exists and user has access
      const assistant = await prisma.assistant.findFirst({
        where: {
          id: assistantId,
          organization: {
            users: {
              some: {
                userId: userId
              }
            }
          }
        }
      });

      if (!assistant) {
        throw new Error('Assistant not found or access denied');
      }

      // Deactivate all previous avatar images for this assistant
      await prisma.avatarImage.updateMany({
        where: { assistantId },
        data: { isActive: false }
      });

      // Save the new uploaded avatar image as active
      const avatarImage = await prisma.avatarImage.create({
        data: {
          assistantId,
          imageData,
          mimeType,
          prompt: `Uploaded: ${fileName}`,
          description: `User uploaded background: ${fileName}`,
          isActive: true
        }
      });

      return avatarImage;

    } catch (error) {
      console.error('Error saving uploaded avatar image:', error);
      throw error;
    }
  }

  /**
   * Save avatar image to database
   * @param {Object} data - Avatar image data
   * @returns {Promise<Object>} Saved avatar image
   */
  async saveAvatarImage(data) {
    try {
      const { assistantId, imageData, mimeType, prompt, description, userId } = data;

      // Verify that the assistant exists and user has access
      const assistant = await prisma.assistant.findFirst({
        where: {
          id: assistantId,
          organization: {
            users: {
              some: {
                userId: userId
              }
            }
          }
        }
      });

      if (!assistant) {
        throw new Error('Assistant not found or access denied');
      }

      // Deactivate all previous avatar images for this assistant
      await prisma.avatarImage.updateMany({
        where: { assistantId },
        data: { isActive: false }
      });

      // Save the new avatar image as active
      const avatarImage = await prisma.avatarImage.create({
        data: {
          assistantId,
          imageData,
          mimeType,
          prompt,
          description,
          isActive: true
        }
      });

      return avatarImage;

    } catch (error) {
      console.error('Error saving avatar image:', error);
      throw error;
    }
  }

  /**
   * Get active avatar image for assistant
   * @param {number} assistantId - Assistant ID
   * @returns {Promise<Object|null>} Active avatar image or null
   */
  async getActiveAvatarImage(assistantId) {
    try {
      return await prisma.avatarImage.findFirst({
        where: {
          assistantId,
          isActive: true
        },
        select: {
          id: true,
          imageData: true,
          mimeType: true,
          prompt: true,
          description: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error('Error getting active avatar image:', error);
      throw error;
    }
  }

  /**
   * Get all avatar images for assistant
   * @param {number} assistantId - Assistant ID
   * @param {number} userId - User ID for access control
   * @returns {Promise<Array>} Array of avatar images
   */
  async getAvatarImages(assistantId, userId) {
    try {
      // Verify access first
      const assistant = await prisma.assistant.findFirst({
        where: {
          id: assistantId,
          organization: {
            users: {
              some: {
                userId: userId
              }
            }
          }
        }
      });

      if (!assistant) {
        throw new Error('Assistant not found or access denied');
      }

      return await prisma.avatarImage.findMany({
        where: { assistantId },
        select: {
          id: true,
          imageData: true,
          mimeType: true,
          prompt: true,
          description: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

    } catch (error) {
      console.error('Error getting avatar images:', error);
      throw error;
    }
  }

  /**
   * Set active avatar image
   * @param {number} imageId - Image ID to activate
   * @param {number} userId - User ID for access control
   * @returns {Promise<Object>} Updated avatar image
   */
  async setActiveAvatarImage(imageId, userId) {
    try {
      // Get the image and verify access
      const image = await prisma.avatarImage.findFirst({
        where: {
          id: imageId,
          assistant: {
            organization: {
              users: {
                some: {
                  userId: userId
                }
              }
            }
          }
        },
        include: {
          assistant: true
        }
      });

      if (!image) {
        throw new Error('Avatar image not found or access denied');
      }

      // Deactivate all images for this assistant
      await prisma.avatarImage.updateMany({
        where: { assistantId: image.assistantId },
        data: { isActive: false }
      });

      // Activate the selected image
      const updatedImage = await prisma.avatarImage.update({
        where: { id: imageId },
        data: { isActive: true }
      });

      return updatedImage;

    } catch (error) {
      console.error('Error setting active avatar image:', error);
      throw error;
    }
  }

  /**
   * Delete avatar image
   * @param {number} imageId - Image ID to delete
   * @param {number} userId - User ID for access control
   * @returns {Promise<boolean>} Success status
   */
  async deleteAvatarImage(imageId, userId) {
    try {
      // Verify access
      const image = await prisma.avatarImage.findFirst({
        where: {
          id: imageId,
          assistant: {
            organization: {
              users: {
                some: {
                  userId: userId
                }
              }
            }
          }
        }
      });

      if (!image) {
        throw new Error('Avatar image not found or access denied');
      }

      await prisma.avatarImage.delete({
        where: { id: imageId }
      });

      return true;

    } catch (error) {
      console.error('Error deleting avatar image:', error);
      throw error;
    }
  }
}

module.exports = new AvatarImageService();