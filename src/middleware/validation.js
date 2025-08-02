/**
 * Validate agent ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateAgentId = (req, res, next) => {
  const { id } = req.params;
  const agentId = parseInt(id);

  if (isNaN(agentId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid agent ID',
      message: 'Agent ID must be a valid number'
    });
  }

  req.validatedAgentId = agentId;
  next();
};

/**
 * Validate pagination parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validatePagination = (req, res, next) => {
  const { limit = 50, offset = 0 } = req.query;

  const limitNum = parseInt(limit);
  const offsetNum = parseInt(offset);

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      error: 'Invalid limit parameter',
      message: 'Limit must be a number between 1 and 100'
    });
  }

  if (isNaN(offsetNum) || offsetNum < 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid offset parameter',
      message: 'Offset must be a non-negative number'
    });
  }

  req.validatedPagination = {
    limit: limitNum,
    offset: offsetNum
  };
  next();
};

/**
 * Validate organization ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateOrganizationId = (req, res, next) => {
  const { id } = req.params;
  const organizationId = parseInt(id);

  if (isNaN(organizationId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid organization ID',
      message: 'Organization ID must be a valid number'
    });
  }

  req.validatedOrganizationId = organizationId;
  next();
};

/**
 * Validate user ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateUserId = (req, res, next) => {
  const { id } = req.params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user ID',
      message: 'User ID must be a valid number'
    });
  }

  req.validatedUserId = userId;
  next();
};

/**
 * Validate user data for create/update operations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateUserData = (req, res, next) => {
  const { name, surname, email, password, active } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user name',
      message: 'User name is required and must be a non-empty string'
    });
  }

  if (!surname || typeof surname !== 'string' || surname.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid user surname',
      message: 'User surname is required and must be a non-empty string'
    });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email',
      message: 'Email is required and must be a valid email address'
    });
  }

  if (password && (typeof password !== 'string' || password.length < 6)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid password',
      message: 'Password must be at least 6 characters long'
    });
  }

  if (active !== undefined && typeof active !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'Invalid active status',
      message: 'Active must be a boolean value'
    });
  }

  req.validatedUserData = {
    name: name.trim(),
    surname: surname.trim(),
    email: email.trim().toLowerCase(),
    password: password || undefined,
    active: active !== undefined ? active : true
  };
  next();
};

/**
 * Validate organization data for create/update operations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateOrganizationData = (req, res, next) => {
  const { name, shortName, parentId, active } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid organization name',
      message: 'Organization name is required and must be a non-empty string'
    });
  }

  if (shortName && typeof shortName !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid short name',
      message: 'Short name must be a string'
    });
  }
  if (parentId && parentId !== undefined && parentId !== null) {
    const parentIdNum = parseInt(parentId);
    if (isNaN(parentIdNum) || parentIdNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parent ID',
        message: 'Parent ID must be a valid positive number'
      });
    }
  }

  if (active !== undefined && typeof active !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'Invalid active status',
      message: 'Active must be a boolean value'
    });
  }

  req.validatedOrganizationData = {
    name: name.trim(),
    shortName: shortName ? shortName.trim() : null,
    parentId: parentId !== undefined && parentId !== null ? parseInt(parentId) : null,
    active: active !== undefined ? active : true
  };
  next();
};

/**
 * Validate and parse query filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateFilters = (req, res, next) => {
  const { organizationId, active, parentId } = req.query;

  const filters = {};

  if (organizationId) {
    const orgId = parseInt(organizationId);
    if (isNaN(orgId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID',
        message: 'Organization ID must be a valid number'
      });
    }
    filters.organizationId = orgId;
  }

  if (parentId !== undefined) {
    const parentIdNum = parseInt(parentId);
    if (isNaN(parentIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parent ID',
        message: 'Parent ID must be a valid number'
      });
    }
    filters.parentId = parentIdNum;
  }

  if (active !== undefined) {
    if (active !== 'true' && active !== 'false') {
      return res.status(400).json({
        success: false,
        error: 'Invalid active parameter',
        message: 'Active must be either "true" or "false"'
      });
    }
    filters.active = active === 'true';
  }

  req.validatedFilters = filters;
  next();
};

/**
 * Validate login data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateLoginData = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email',
      message: 'Email is required and must be a valid email address'
    });
  }
  
  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid password',
      message: 'Password is required'
    });
  }
  
  req.validatedLoginData = {
    email: email.trim().toLowerCase(),
    password: password
  };
  next();
};

/**
 * Validate agent data for create/update operations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateAgentData = (req, res, next) => {
  const { name, organizationId, active, details } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid agent name',
      message: 'Agent name is required and must be a non-empty string'
    });
  }
  
  if (!organizationId || typeof organizationId !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'Invalid organization ID',
      message: 'Organization ID is required and must be a valid number'
    });
  }
  
  if (active !== undefined && typeof active !== 'boolean') {
    return res.status(400).json({
      success: false,
      error: 'Invalid active status',
      message: 'Active must be a boolean value'
    });
  }

  // Validate details if provided
  if (details !== undefined && details !== null) {
    if (typeof details !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid details',
        message: 'Details must be an object'
      });
    }

    // Validate details fields if they are provided
    if (details.firstMessage !== undefined && typeof details.firstMessage !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid first message',
        message: 'First message must be a string'
      });
    }

    if (details.systemPrompt !== undefined && typeof details.systemPrompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid system prompt',
        message: 'System prompt must be a string'
      });
    }

    if (details.interactionMode !== undefined && typeof details.interactionMode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid interaction mode',
        message: 'Interaction mode must be a string'
      });
    }
  }
  
  req.validatedAgentData = {
    name: name.trim(),
    organizationId: organizationId,
    active: active !== undefined ? active : true,
    details: details || null
  };
  next();
};

module.exports = {
  validateAgentId,
  validateUserId,
  validateOrganizationId,
  validatePagination,
  validateFilters,
  validateUserData,
  validateOrganizationData,
  validateLoginData,
  validateAgentData
}; 