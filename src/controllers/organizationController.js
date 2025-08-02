const organizationService = require('../services/organizationService');

/**
 * Get organization details by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getOrganizationById = async (req, res) => {
  const organizationId = req.validatedOrganizationId;
  const organization = await organizationService.getOrganizationById(organizationId);
  
  if (!organization) {
    return res.status(404).json({
      success: false,
      error: 'Organization not found',
      message: `Organization with ID ${req.params.id} does not exist`
    });
  }

  res.json({
    success: true,
    data: organization
  });
};

/**
 * Get all organizations with optional filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllOrganizations = async (req, res) => {
  const filters = req.validatedFilters;
  const pagination = req.validatedPagination;

  const result = await organizationService.getAllOrganizations(filters, pagination);

  res.json({
    success: true,
    data: result.organizations,
    pagination: result.pagination
  });
};

/**
 * Create a new organization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOrganization = async (req, res) => {
  const organizationData = req.validatedOrganizationData;
  const organization = await organizationService.createOrganization(organizationData);

  res.status(201).json({
    success: true,
    data: organization
  });
};

/**
 * Update an organization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateOrganization = async (req, res) => {
  const organizationId = req.validatedOrganizationId;
  const organizationData = req.validatedOrganizationData;
  
  const organization = await organizationService.updateOrganization(organizationId, organizationData);
  
  if (!organization) {
    return res.status(404).json({
      success: false,
      error: 'Organization not found',
      message: `Organization with ID ${organizationId} does not exist`
    });
  }

  res.json({
    success: true,
    data: organization
  });
};

/**
 * Delete an organization
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteOrganization = async (req, res) => {
  const organizationId = req.validatedOrganizationId;
  
  const deleted = await organizationService.deleteOrganization(organizationId);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Organization not found',
      message: `Organization with ID ${organizationId} does not exist`
    });
  }

  res.json({
    success: true,
    message: 'Organization deleted successfully'
  });
};

module.exports = {
  getOrganizationById,
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization
}; 