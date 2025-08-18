const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Find organization by ID with related data
 * @param {number} id - Organization ID
 * @returns {Object|null} Organization with parent, children, and assistants
 */
const findById = async (id) => {
  return await prisma.organization.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          shortName: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          shortName: true
        }
      },
      assistants: {
        select: {
          id: true,
          name: true,
          active: true
        }
      }
    }
  });
};

/**
 * Find all organizations with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Organizations and total count
 */
const findAll = async (filters, pagination) => {
  // Build where clause
  const where = {};
  
  if (filters.active !== undefined) {
    where.active = filters.active;
  }
  
  if (filters.parentId !== undefined) {
    where.parentId = filters.parentId;
  }

  // Execute queries in parallel
  const [organizations, totalCount] = await Promise.all([
    prisma.organization.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            shortName: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            shortName: true
          }
        },
        assistants: {
          select: {
            id: true,
            name: true,
            active: true
          }
        }
      },
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.organization.count({ where })
  ]);

  return { organizations, totalCount };
};

/**
 * Create a new organization and link user to it
 * @param {Object} organizationData - Organization data
 * @param {number} userId - User ID to link to the organization
 * @returns {Object} Created organization
 */
const create = async (organizationData, userId) => {
  // Use a transaction to create organization and link user
  return await prisma.$transaction(async (prisma) => {
    // Create the organization
    const organization = await prisma.organization.create({
      data: organizationData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            shortName: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            shortName: true
          }
        },
        assistants: {
          select: {
            id: true,
            name: true,
            active: true
          }
        }
      }
    });

    // Link the user to the organization
    if (userId) {
      await prisma.userOrganization.create({
        data: {
          userId: userId,
          organizationId: organization.id
        }
      });
    }

    return organization;
  });
};

/**
 * Update an organization
 * @param {number} id - Organization ID
 * @param {Object} organizationData - Updated organization data
 * @returns {Object} Updated organization
 */
const update = async (id, organizationData) => {
  return await prisma.organization.update({
    where: { id },
    data: organizationData,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          shortName: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          shortName: true
        }
      },
      assistants: {
        select: {
          id: true,
          name: true,
          active: true
        }
      }
    }
  });
};

/**
 * Delete an organization
 * @param {number} id - Organization ID
 * @returns {Object} Deleted organization
 */
const deleteById = async (id) => {
  try {
    await prisma.organization.delete({
      where: { id }
    });
    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      return false; // Record not found
    }
    throw error;
  }
};

/**
 * Check if organization exists
 * @param {number} id - Organization ID
 * @returns {boolean} True if organization exists
 */
const exists = async (id) => {
  const count = await prisma.organization.count({
    where: { id }
  });
  return count > 0;
};

/**
 * Find organization by short name
 * @param {string} shortName - Organization short name
 * @returns {Object|null} Organization if found
 */
const findByShortName = async (shortName) => {
  return await prisma.organization.findUnique({
    where: { shortName }
  });
};

/**
 * Find organizations by user ID
 * @param {number} userId - User ID
 * @returns {Array} Organizations associated with the user
 */
const findByUserId = async (userId) => {
  return await prisma.organization.findMany({
    where: {
      users: {
        some: {
          userId: userId
        }
      }
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          shortName: true
        }
      },
      children: {
        select: {
          id: true,
          name: true,
          shortName: true
        }
      },
      assistants: {
        select: {
          id: true,
          name: true,
          active: true
        }
      }
    }
  });
};

module.exports = {
  findById,
  findAll,
  create,
  update,
  deleteById,
  exists,
  findByShortName,
  findByUserId
}; 