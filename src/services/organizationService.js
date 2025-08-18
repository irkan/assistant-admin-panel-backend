const organizationRepository = require('../repositories/organizationRepository');

/**
 * Get organization details by ID with related data
 * @param {number} organizationId - The organization ID
 * @returns {Object|null} Organization data with parent/children and agents
 */
const getOrganizationById = async (organizationId) => {
  const organization = await organizationRepository.findById(organizationId);
  
  if (!organization) {
    return null;
  }

  return formatOrganizationResponse(organization);
};

/**
 * Get all organizations with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Organizations data with pagination info
 */
const getAllOrganizations = async (filters, pagination) => {
  let organizations, totalCount;
  
  // If userId is provided, get user-specific organizations
  if (filters.userId) {
    organizations = await organizationRepository.findByUserId(filters.userId);
    totalCount = organizations.length;
    
    // Apply pagination to user-specific results
    const start = pagination.offset;
    const end = start + pagination.limit;
    organizations = organizations.slice(start, end);
  } else {
    // Get all organizations with regular filtering
    const result = await organizationRepository.findAll(filters, pagination);
    organizations = result.organizations;
    totalCount = result.totalCount;
  }
  
  const formattedOrganizations = organizations.map(formatOrganizationResponse);
  
  return {
    organizations: formattedOrganizations,
    pagination: {
      total: totalCount,
      limit: pagination.limit,
      offset: pagination.offset,
      hasMore: pagination.offset + pagination.limit < totalCount
    }
  };
};

/**
 * Generate unique short name from organization name
 * @param {string} name - Organization name
 * @returns {string} Generated unique short name
 */
const generateUniqueShortName = async (name) => {
  // Remove special characters and split by words
  const words = name
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  // Generate base short name from first letters
  let shortName = words.map(word => word.charAt(0).toUpperCase()).join('');
  
  // If only one word, take first 2-3 letters
  if (words.length === 1 && words[0].length > 1) {
    shortName = words[0].substring(0, Math.min(3, words[0].length)).toUpperCase();
  }
  
  // Check if this short name exists
  let finalShortName = shortName;
  let counter = 0;
  
  while (await organizationRepository.findByShortName(finalShortName)) {
    counter++;
    if (words.length > 1) {
      // For multi-word names, add letters from words
      if (counter <= words.length) {
        const wordIndex = counter - 1;
        if (words[wordIndex] && words[wordIndex].length > 1) {
          finalShortName = shortName + words[wordIndex].charAt(1).toUpperCase();
        } else {
          finalShortName = shortName + counter;
        }
      } else {
        finalShortName = shortName + counter;
      }
    } else {
      // For single word, extend or add number
      if (words[0].length > shortName.length + counter - 1) {
        finalShortName = words[0].substring(0, shortName.length + counter).toUpperCase();
      } else {
        finalShortName = shortName + counter;
      }
    }
  }
  
  return finalShortName;
};

/**
 * Create a new organization
 * @param {Object} organizationData - Organization data
 * @param {number} userId - User ID to link to the organization
 * @returns {Object} Created organization
 */
const createOrganization = async (organizationData, userId) => {
  // Generate unique short name if not provided
  if (!organizationData.shortName) {
    organizationData.shortName = await generateUniqueShortName(organizationData.name);
  }
  
  const organization = await organizationRepository.create(organizationData, userId);
  return formatOrganizationResponse(organization);
};

/**
 * Update an organization
 * @param {number} organizationId - Organization ID
 * @param {Object} organizationData - Updated organization data
 * @returns {Object|null} Updated organization
 */
const updateOrganization = async (organizationId, organizationData) => {
  const organization = await organizationRepository.update(organizationId, organizationData);
  
  if (!organization) {
    return null;
  }

  return formatOrganizationResponse(organization);
};

/**
 * Delete an organization
 * @param {number} organizationId - Organization ID
 * @returns {boolean} True if deleted successfully
 */
const deleteOrganization = async (organizationId) => {
  return await organizationRepository.deleteById(organizationId);
};

/**
 * Format organization data for API response
 * @param {Object} organization - Raw organization data from database
 * @returns {Object} Formatted organization data
 */
const formatOrganizationResponse = (organization) => {
  return {
    id: organization.id,
    name: organization.name,
    shortName: organization.shortName,
    parentId: organization.parentId,
    active: organization.active,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
    parent: organization.parent ? {
      id: organization.parent.id,
      name: organization.parent.name,
      shortName: organization.parent.shortName
    } : null,
    children: organization.children ? organization.children.map(child => ({
      id: child.id,
      name: child.name,
      shortName: child.shortName
    })) : [],
    agents: organization.agents ? organization.agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      active: agent.active
    })) : []
  };
};

module.exports = {
  getOrganizationById,
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization
}; 