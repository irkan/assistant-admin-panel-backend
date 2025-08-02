const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Find user by ID with related data
 * @param {number} id - User ID
 * @returns {Object|null} User with organizations
 */
const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      organizations: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              shortName: true,
              active: true
            }
          }
        }
      }
    }
  });
};

/**
 * Find all users with filtering and pagination
 * @param {Object} filters - Filter criteria
 * @param {Object} pagination - Pagination parameters
 * @returns {Object} Users and total count
 */
const findAll = async (filters, pagination) => {
  // Build where clause
  const where = {};
  
  if (filters.active !== undefined) {
    where.active = filters.active;
  }
  
  if (filters.email) {
    where.email = {
      contains: filters.email,
      mode: 'insensitive'
    };
  }

  // Execute queries in parallel
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                shortName: true,
                active: true
              }
            }
          }
        }
      },
      take: pagination.limit,
      skip: pagination.offset,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  return { users, totalCount };
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
const create = async (userData) => {
  return await prisma.user.create({
    data: userData,
    include: {
      organizations: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              shortName: true,
              active: true
            }
          }
        }
      }
    }
  });
};

/**
 * Update a user
 * @param {number} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Object} Updated user
 */
const update = async (id, userData) => {
  return await prisma.user.update({
    where: { id },
    data: userData,
    include: {
      organizations: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              shortName: true,
              active: true
            }
          }
        }
      }
    }
  });
};

/**
 * Delete a user
 * @param {number} id - User ID
 * @returns {boolean} True if deleted successfully
 */
const deleteById = async (id) => {
  try {
    await prisma.user.delete({
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
 * Check if user exists
 * @param {number} id - User ID
 * @returns {boolean} True if user exists
 */
const exists = async (id) => {
  const count = await prisma.user.count({
    where: { id }
  });
  return count > 0;
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Object|null} User with organizations
 */
const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      organizations: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              shortName: true,
              active: true
            }
          }
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
  findByEmail
}; 