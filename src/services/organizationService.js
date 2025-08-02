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
  const { organizations, totalCount } = await organizationRepository.findAll(filters, pagination);
  
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
 * Create a new organization
 * @param {Object} organizationData - Organization data
 * @returns {Object} Created organization
 */
const createOrganization = async (organizationData) => {
  const organization = await organizationRepository.create(organizationData);
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