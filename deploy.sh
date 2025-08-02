#!/bin/bash

# Production Deployment Script for Linux VM
set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo "Please create .env.production with the following variables:"
    echo "  POSTGRES_PASSWORD=your-secure-password"
    echo "  JWT_SECRET=your-super-secure-jwt-secret"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose is not installed${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production build

# Start the application
echo -e "${YELLOW}🚀 Starting application...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend npm run db:migrate:deploy

# Check if services are running
echo -e "${YELLOW}📊 Checking service status...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# Test health endpoint
echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
sleep 5
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo -e "${GREEN}🌐 Access your application at: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo -e "${YELLOW}📋 Checking logs...${NC}"
    docker-compose -f docker-compose.prod.yml --env-file .env.production logs backend
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}" 