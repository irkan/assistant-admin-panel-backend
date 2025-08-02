const request = require('supertest');
const app = require('../src/server');

describe('Authentication Integration Tests', () => {
  describe('Protected Routes', () => {
    it('should return 401 for accessing protected route without token', async () => {
      const response = await request(app)
        .get('/api/users/1');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('No token provided');
    });

    it('should return 401 for accessing protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('Invalid token');
    });

    it('should return 401 for accessing protected route with expired token', async () => {
      // This test would require a properly formatted but expired JWT token
      // For now, we'll just test the structure
      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsImlhdCI6MTYzNTY4OTYwMCwiZXhwIjoxNjM1Njg5NjAwfQ.invalid-signature');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied');
    });
  });

  describe('Public Routes', () => {
    it('should allow access to health endpoint without authentication', async () => {
      const response = await request(app)
        .get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });

    it('should allow access to root endpoint without authentication', async () => {
      const response = await request(app)
        .get('/');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Admin Panel Backend API');
    });
  });
}); 