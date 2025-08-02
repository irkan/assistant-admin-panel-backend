const request = require('supertest');
const app = require('../src/server');

describe('Agents API', () => {
  describe('GET /api/agents/:id', () => {
    it('should return 400 for invalid agent ID', async () => {
      const response = await request(app).get('/api/agents/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid agent ID');
    });

    it('should return 404 for non-existent agent', async () => {
      const response = await request(app).get('/api/agents/99999');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Agent not found');
    });
  });

  describe('GET /api/agents', () => {
    it('should return 400 for invalid limit parameter', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ limit: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid limit parameter');
    });

    it('should return 400 for invalid offset parameter', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ offset: '-1' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid offset parameter');
    });

    it('should return 400 for invalid organization ID', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ organizationId: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid organization ID');
    });

    it('should return 400 for invalid active parameter', async () => {
      const response = await request(app)
        .get('/api/agents')
        .query({ active: 'maybe' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid active parameter');
    });
  });
}); 