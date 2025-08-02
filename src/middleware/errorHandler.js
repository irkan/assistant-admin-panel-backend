/**
 * Centralized error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  const errorResponse = {
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    // Handle Prisma-specific errors
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          success: false,
          error: 'Duplicate Entry',
          message: 'A record with this information already exists'
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Record Not Found',
          message: 'The requested record was not found'
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'Database Error',
          message: 'An error occurred while processing your request'
        });
    }
  }

  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid data provided'
    });
  }

  // Handle network/database connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'Database connection failed'
    });
  }

  // Return appropriate status code
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler
}; 