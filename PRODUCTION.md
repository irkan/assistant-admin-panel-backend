# Production Deployment Guide

Simple guide to deploy your Prisma backend application to a Linux VM.

## Prerequisites

- Linux VM with Docker and Docker Compose installed
- Git access to your repository

## Quick Deployment

### 1. Clone and Setup

```bash
# Clone your repository
git clone <your-repo-url>
cd admin-panel-backend

# Make scripts executable
chmod +x deploy.sh setup-env.sh

# Setup environment (generates secure passwords)
./setup-env.sh
```

### 2. Deploy

```bash
# Deploy the application
./deploy.sh
```

## Manual Steps

If you prefer to do it manually:

### 1. Create Environment File

```bash
# Create .env.production with your values
cat > .env.production << EOF
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-secret
EOF
```

### 2. Deploy with Docker Compose

```bash
# Build and start
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check status
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# View logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

## Management Commands

```bash
# Stop application
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Restart application
docker-compose -f docker-compose.prod.yml --env-file .env.production restart

# Update application
git pull
./deploy.sh

# View logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f backend

# Database backup
docker exec admin-panel-postgres pg_dump -U postgres admin_panel > backup.sql
```

## Access Points

- **Application**: http://your-server-ip:3000
- **Health Check**: http://your-server-ip:3000/health
- **Database**: localhost:5432 (internal)

## Security Notes

- Change default passwords in `.env.production`
- Use HTTPS in production
- Set up firewall rules
- Never commit `.env.production` to git 