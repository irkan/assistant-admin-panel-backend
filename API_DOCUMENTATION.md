# Admin Panel Backend API Documentation

## Base URL
```
http://localhost:3003
```

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Authentication

#### POST `/api/auth/login`
**Description:** Authenticate user and get JWT token  
**Access:** Public  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John",
      "surname": "Doe",
      "email": "user@example.com",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Users Management

#### GET `/api/users`
**Description:** Get all users with pagination and filtering  
**Access:** Private (requires JWT)  
**Query Parameters:**
- `limit` (optional): Number of records per page (1-100, default: 50)
- `offset` (optional): Number of records to skip (default: 0)
- `active` (optional): Filter by active status ("true" or "false")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John",
      "surname": "Doe",
      "email": "john@example.com",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

#### GET `/api/users/:id`
**Description:** Get user by ID  
**Access:** Private (requires JWT)  
**Path Parameters:**
- `id`: User ID (integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

#### POST `/api/users`
**Description:** Create a new user  
**Access:** Private (requires JWT)  
**Request Body:**
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": null
  }
}
```

#### PUT `/api/users/:id`
**Description:** Update user  
**Access:** Private (requires JWT)  
**Path Parameters:**
- `id`: User ID (integer)

**Request Body:**
```json
{
  "name": "John Updated",
  "surname": "Doe Updated",
  "email": "john.updated@example.com",
  "password": "newpassword123",
  "active": false
}
```

#### DELETE `/api/users/:id`
**Description:** Delete user  
**Access:** Private (requires JWT)  
**Path Parameters:**
- `id`: User ID (integer)

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 3. Organizations Management

#### GET `/api/organizations`
**Description:** Get all organizations with pagination and filtering  
**Access:** Private (requires JWT)  
**Query Parameters:**
- `limit` (optional): Number of records per page (1-100, default: 50)
- `offset` (optional): Number of records to skip (default: 0)
- `active` (optional): Filter by active status ("true" or "false")
- `parentId` (optional): Filter by parent organization ID
- `organizationId` (optional): Filter by specific organization ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Organization",
      "shortName": "MainOrg",
      "parentId": null,
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

#### GET `/api/organizations/:id`
**Description:** Get organization by ID  
**Access:** Private (requires JWT)  
**Path Parameters:**
- `id`: Organization ID (integer)

#### POST `/api/organizations`
**Description:** Create a new organization  
**Access:** Private (requires JWT)  
**Request Body:**
```json
{
  "name": "New Organization",
  "shortName": "NewOrg",
  "parentId": 1,
  "active": true
}
```

#### PUT `/api/organizations/:id`
**Description:** Update organization  
**Access:** Private (requires JWT)  
**Path Parameters:**
- `id`: Organization ID (integer)

#### DELETE `/api/organizations/:id`
**Description:** Delete organization  
**Access:** Private (requires JWT)  
**Path Parameters:**
- `id`: Organization ID (integer)

### 4. Agents Management

#### GET `/api/agents`
**Description:** Get all agents with pagination and filtering  
**Access:** Private (requires JWT)  
**Query Parameters:**
- `limit` (optional): Number of records per page (1-100, default: 50)
- `offset` (optional): Number of records to skip (default: 0)
- `active` (optional): Filter by active status ("true" or "false")
- `organizationId` (optional): Filter by organization ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "organizationId": 1,
      "name": "Support Agent",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": null,
      "details": {
        "agentId": 1,
        "firstMessage": "Hello! How can I help you?",
        "systemPrompt": "You are a helpful support agent.",
        "interactionMode": "chat",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": null
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

#### GET `/api/agents/:id`
**Description:** Get agent by ID  
**Access:** Public  
**Path Parameters:**
- `id`: Agent ID (integer)

### 5. Health Check

#### GET `/health`
**Description:** Check API health status  
**Access:** Public  
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "database": "connected"
}
```

## Data Models

### User
```typescript
interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  password?: string; // Only in create/update requests
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}
```

### Organization
```typescript
interface Organization {
  id: number;
  name: string;
  shortName: string | null;
  parentId: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}
```

### Agent
```typescript
interface Agent {
  id: number;
  organizationId: number;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  details?: AgentDetails;
}

interface AgentDetails {
  agentId: number;
  firstMessage: string | null;
  systemPrompt: string | null;
  interactionMode: string | null;
  createdAt: string;
  updatedAt: string | null;
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required or invalid token)
- `404`: Not Found
- `500`: Internal Server Error

## Frontend Development Guidelines

### 1. Authentication Flow
1. Call `/api/auth/login` with user credentials
2. Store the JWT token securely (localStorage, sessionStorage, or secure cookie)
3. Include the token in all subsequent requests via Authorization header

### 2. Error Handling
- Check for `success: false` in responses
- Handle 401 errors by redirecting to login
- Display user-friendly error messages from the `message` field

### 3. Pagination
- Use `limit` and `offset` parameters for paginated endpoints
- Implement pagination controls using the `pagination` object in responses

### 4. Data Validation
- Validate required fields before sending requests
- Email must be valid format
- Password must be at least 6 characters
- IDs must be positive integers

### 5. Real-time Updates
- Consider implementing WebSocket connections for real-time updates
- Poll the health endpoint to monitor API status

## Example Frontend Usage

### JavaScript/TypeScript Example
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};

// Get users with authentication
const getUsers = async (limit = 50, offset = 0) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/users?limit=${limit}&offset=${offset}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message);
};

// Create user
const createUser = async (userData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message);
};
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(endpoint, {
          ...options,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};
```

This API provides a complete CRUD interface for managing users, organizations, and agents in an admin panel system. The authentication system ensures secure access to protected endpoints, while the validation middleware ensures data integrity. 