const express = require('express');
const organizationController = require('../controllers/organizationController');
const { 
  validateOrganizationId, 
  validatePagination, 
  validateFilters,
  validateOrganizationData 
} = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/organizations/:id
 * @desc Get organization details by ID
 * @access Private
 */
router.get('/:id', authenticateToken, validateOrganizationId, organizationController.getOrganizationById);

/**
 * @route GET /api/organizations
 * @desc Get all organizations with optional filtering
 * @access Private
 */
router.get('/', authenticateToken, validatePagination, validateFilters, organizationController.getAllOrganizations);

/**
 * @route POST /api/organizations
 * @desc Create a new organization
 * @access Private
 */
router.post('/', authenticateToken, validateOrganizationData, organizationController.createOrganization);

/**
 * @route PUT /api/organizations/:id
 * @desc Update an organization
 * @access Private
 */
router.put('/:id', authenticateToken, validateOrganizationId, validateOrganizationData, organizationController.updateOrganization);

/**
 * @route DELETE /api/organizations/:id
 * @desc Delete an organization
 * @access Private
 */
router.delete('/:id', authenticateToken, validateOrganizationId, organizationController.deleteOrganization);

module.exports = router; 