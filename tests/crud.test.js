const request = require('supertest');
const app = require('../src/server');

describe('CRUD API Tests', () => {
  describe('Organizations API', () => {
    it('should return 400 for invalid organization ID', async () => {
      const response = await request(app).get('/api/organizations/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid organization ID');
    });

    it('should return 400 for invalid organization data on create', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({ name: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid organization name');
    });

    it('should return 400 for invalid parent ID', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({ 
          name: 'Test Org',
          parentId: 'invalid'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid parent ID');
    });

    it('should allow creating organization without parent ID', async () => {
      // First, login to get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gmail.com',
          password: 'test'
        });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();
      
      const token = loginResponse.body.data.token;
      
      // Test that the validation accepts organization data without parent ID
      const response = await request(app)
        .post('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          name: 'Test Root Organization',
          shortName: 'TRO'
          // Note: parentId is intentionally omitted to test that it's optional
        });
      
      // The response should not be a validation error (400) for missing parent ID
      // It might be a database error or 201 success, but not a validation error
      expect(response.status).not.toBe(400);
      expect(response.body.error).not.toBe('Invalid parent ID');
    });

    it('should return 400 for invalid active status', async () => {
      const response = await request(app)
        .post('/api/organizations')
        .send({ 
          name: 'Test Org',
          active: 'maybe'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid active status');
    });
  });

  describe('Users API', () => {
    it('should return 401 for accessing protected route without authentication', async () => {
      const response = await request(app).get('/api/users/invalid');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 401 for creating user without authentication', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: '' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('No token provided');
    });
  });

  describe('Pagination Tests', () => {
    it('should return 400 for invalid limit parameter', async () => {
      const response = await request(app)
        .get('/api/organizations')
        .query({ limit: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid limit parameter');
    });

    it('should return 401 for accessing users without authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ offset: '-1' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 400 for limit out of range', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ limit: '150' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid limit parameter');
    });
  });

  describe('Filter Tests', () => {
    it('should return 400 for invalid active filter', async () => {
      const response = await request(app)
        .get('/api/organizations')
        .query({ active: 'maybe' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid active parameter');
    });

    it('should return 400 for invalid parent ID filter', async () => {
      const response = await request(app)
        .get('/api/organizations')
        .query({ parentId: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid parent ID');
    });
  });

  describe('404 Tests', () => {
    it('should return 404 for non-existent organization', async () => {
      const response = await request(app).get('/api/organizations/99999');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Organization not found');
    });

    it('should return 401 for accessing non-existent user without authentication', async () => {
      const response = await request(app).get('/api/users/99999');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app).get('/api/agents/99999');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Agent not found');
    });
  });
}); 