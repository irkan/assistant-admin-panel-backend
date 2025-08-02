# Admin Panel Backend

A modern Node.js/Express backend for admin panel applications with a health endpoint and best practices.

## Features

- ✅ Health check endpoint
- ✅ Security middleware (Helmet, CORS)
- ✅ Request logging (Morgan)
- ✅ Environment configuration
- ✅ Error handling
- ✅ Development and production ready

## Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-panel-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Database Setup with Prisma

### Prerequisites
- PostgreSQL database running (see Docker Setup below)
- Node.js dependencies installed

### Quick Start with Prisma

1. **Set up the database:**
   ```bash
   # Start PostgreSQL (if using Docker)
   ./scripts/docker-setup.sh setup
   
   # Copy environment file
   cp env.example .env
   ```

2. **Initialize Prisma:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

3. **Development workflow:**
   ```bash
   # Make schema changes, then:
   npm run db:migrate    # Create migration
   npm run db:generate   # Regenerate client
   npm run db:seed       # Reseed if needed
   ```

### Database Management

```bash
# View database in Prisma Studio
npm run db:studio

# Reset database
npm run db:push --force-reset

# Create new migration
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy
```

## Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Quick Start with Docker

1. **Set up the database:**
   ```bash
   # Make the setup script executable
   chmod +x scripts/docker-setup.sh
   
   # Run the setup (creates data directories and starts services)
   ./scripts/docker-setup.sh setup
   ```

2. **Manage the database:**
   ```bash
   # Start services
   ./scripts/docker-setup.sh start
   
   # Stop services
   ./scripts/docker-setup.sh stop
   
   # View logs
   ./scripts/docker-setup.sh logs
   
   # Reset database (deletes all data)
   ./scripts/docker-setup.sh reset
   ```

3. **Access the services:**
   - **PostgreSQL**: `localhost:5432`
     - Database: `admin_panel`
     - Username: `postgres`
     - Password: `postgres`
   
   - **pgAdmin**: `http://localhost:8080`
     - Email: `admin@adminpanel.com`
     - Password: `admin`

### Manual Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Database Scripts (Prisma)
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:migrate:deploy` - Deploy migrations in production
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data

## API Endpoints

### Health Check
```
GET /health
```

Returns server health status:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0"
}
```

### Root Endpoint
```
GET /
```

Returns API information:
```json
{
  "message": "Admin Panel Backend API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "auth": "/api/auth",
    "agents": "/api/agents",
    "organizations": "/api/organizations",
    "users": "/api/users"
  }
}
```

## API Endpoints

### Authentication API

#### User Login
```
POST /api/auth/login
```

Request Body:
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

Returns authentication token and user data:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John",
      "surname": "Doe",
      "email": "john.doe@example.com",
      "active": true,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Error Responses:
- `400` - Invalid email or password format
- `401` - Invalid credentials or deactivated account

### Agents API

#### Get Agent Details
```
GET /api/agents/:id
```

Returns detailed information about a specific agent:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Support Agent",
    "active": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "organization": {
      "id": 1,
      "name": "Main Organization",
      "shortName": "MainOrg",
      "active": true
    },
    "details": {
      "firstMessage": "Hello! How can I help you today?",
      "systemPrompt": "You are a helpful support agent for the main organization.",
      "interactionMode": "agent_speak_first"
    }
  }
}
```

#### Get All Agents
```
GET /api/agents
```

Query Parameters:
- `organizationId` (optional): Filter by organization ID
- `active` (optional): Filter by active status (`true`/`false`)
- `limit` (optional): Number of results per page (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

Returns paginated list of agents:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Support Agent",
      "active": true,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "organization": {
        "id": 1,
        "name": "Main Organization",
        "shortName": "MainOrg"
      },
      "details": {
        "firstMessage": "Hello! How can I help you today?",
        "systemPrompt": "You are a helpful support agent for the main organization.",
        "interactionMode": "agent_speak_first"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### Organizations API

#### Get Organization Details
```
GET /api/organizations/:id
```

Returns detailed information about a specific organization:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Organization",
    "shortName": "MainOrg",
    "parentId": null,
    "active": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "parent": null,
    "children": [
      {
        "id": 2,
        "name": "Sub Organization",
        "shortName": "SubOrg"
      }
    ],
    "agents": [
      {
        "id": 1,
        "name": "Main Support Agent",
        "active": true
      }
    ]
  }
}
```

#### Get All Organizations
```
GET /api/organizations
```

Query Parameters:
- `active` (optional): Filter by active status (`true`/`false`)
- `parentId` (optional): Filter by parent organization ID
- `limit` (optional): Number of results per page (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

#### Create Organization
```
POST /api/organizations
```

Request Body:
```json
{
  "name": "New Organization",
  "shortName": "NewOrg",
  "parentId": 1,
  "active": true
}
```

#### Update Organization
```
PUT /api/organizations/:id
```

Request Body:
```json
{
  "name": "Updated Organization",
  "shortName": "UpdatedOrg",
  "active": false
}
```

#### Delete Organization
```
DELETE /api/organizations/:id
```

### Users API

#### Get User Details
```
GET /api/users/:id
```

Returns detailed information about a specific user:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "active": true,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z",
    "organizations": [
      {
        "id": 1,
        "name": "Main Organization",
        "shortName": "MainOrg",
        "active": true
      }
    ]
  }
}
```

#### Get All Users
```
GET /api/users
```

Query Parameters:
- `active` (optional): Filter by active status (`true`/`false`)
- `email` (optional): Filter by email (partial match)
- `limit` (optional): Number of results per page (default: 50, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

#### Create User
```
POST /api/users
```

Request Body:
```json
{
  "name": "Jane",
  "surname": "Smith",
  "email": "jane.smith@example.com",
  "password": "securepassword123",
  "active": true
}
```

#### Update User
```
PUT /api/users/:id
```

Request Body:
```json
{
  "name": "Jane",
  "surname": "Johnson",
  "email": "jane.johnson@example.com",
  "password": "newpassword123",
  "active": false
}
```

#### Delete User
```
DELETE /api/users/:id
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment mode |
| `DATABASE_URL` | postgresql://postgres:postgres@localhost:5432/admin_panel | Database connection string |

## Database Schema

The application uses a PostgreSQL database with the following structure:

### Core Tables
- **Users** - User accounts and authentication
- **Organizations** - Hierarchical organization structure
- **User_Organizations** - Many-to-many user-organization relationships
- **Agents** - AI agents associated with organizations
- **Agent_Details** - Detailed agent configuration and prompts

### Key Features
- **Hierarchical Organizations** - Organizations can have parent-child relationships
- **Multi-Organization Users** - Users can belong to multiple organizations
- **Agent Management** - Each organization can have multiple agents with unique configurations
- **Interaction Modes** - Agents can be configured to speak first or wait for user input

## Project Structure

```
admin-panel-backend/
├── src/
│   ├── server.js              # Main server file
│   ├── controllers/           # Request/response handlers
│   │   └── agentController.js
│   ├── services/             # Business logic layer
│   │   └── agentService.js
│   ├── repositories/         # Data access layer
│   │   └── agentRepository.js
│   ├── middleware/           # Express middleware
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── routes/              # Route definitions
│   │   └── agents.js
│   └── lib/
│       └── prisma.js        # Prisma client instance
├── tests/
│   ├── server.test.js       # Server endpoint tests
│   └── agents.test.js       # Agent API tests
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   └── seed.js             # Database seeding script
├── scripts/
│   └── docker-setup.sh      # Docker management script
├── data/                    # Persistent data volumes
│   ├── postgres/           # PostgreSQL data
│   └── pgadmin/            # pgAdmin data
├── docker-compose.yml       # Docker Compose configuration
├── docker-compose.dev.yml   # Development override
├── package.json             # Dependencies and scripts
├── env.example             # Environment variables template
└── README.md              # This file
```

## Clean Architecture

This project follows clean architecture principles with clear separation of concerns:

### Layer Responsibilities

1. **Routes** (`src/routes/`) - Define API endpoints and HTTP methods
2. **Controllers** (`src/controllers/`) - Handle HTTP requests/responses, input validation
3. **Services** (`src/services/`) - Business logic, data processing, orchestration
4. **Repositories** (`src/repositories/`) - Data access, database operations
5. **Middleware** (`src/middleware/`) - Cross-cutting concerns (validation, error handling)

### Benefits

- ✅ **Separation of Concerns** - Each layer has a single responsibility
- ✅ **Testability** - Each layer can be tested independently
- ✅ **Maintainability** - Changes in one layer don't affect others
- ✅ **Scalability** - Easy to add new features and endpoints
- ✅ **Reusability** - Business logic can be reused across different endpoints

### Data Flow

```
HTTP Request → Routes → Validation → Controllers → Services → Repositories → Database
Database → Repositories → Services → Controllers → HTTP Response
```

## Development

### Adding New Endpoints

1. Create route files in `src/routes/`
2. Create controllers in `src/controllers/`
3. Create services in `src/services/`
4. Create repositories in `src/repositories/`
5. Add validation middleware in `src/middleware/validation.js`
6. Import and use routes in `src/server.js`

### Testing

The project includes Jest for testing. Add test files with the `.test.js` extension in the `tests/` directory.

Available test commands:
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Security

- Helmet.js for security headers
- CORS enabled for cross-origin requests
- Input validation (to be implemented)
- Rate limiting (to be implemented)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 