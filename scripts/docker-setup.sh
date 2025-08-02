#!/bin/bash

# Docker Compose setup script for Admin Panel Backend
# This script helps manage the PostgreSQL database setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create data directories
create_data_dirs() {
    print_status "Creating data directories..."
    mkdir -p data/postgres
    mkdir -p data/pgadmin
    print_status "Data directories created successfully"
}

# Function to start services
start_services() {
    print_status "Starting PostgreSQL and pgAdmin services..."
    docker-compose up -d
    print_status "Services started successfully"
    print_status "PostgreSQL is available at localhost:5432"
    print_status "pgAdmin is available at http://localhost:8080"
    print_status "pgAdmin credentials: admin@adminpanel.com / admin"
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_status "Services stopped successfully"
}

# Function to restart services
restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    print_status "Services restarted successfully"
}

# Function to view logs
view_logs() {
    print_status "Showing logs..."
    docker-compose logs -f
}

# Function to reset database
reset_database() {
    print_warning "This will delete all data in the database. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Stopping services..."
        docker-compose down
        print_status "Removing data volumes..."
        docker volume rm admin-panel-backend_postgres_data admin-panel-backend_pgadmin_data 2>/dev/null || true
        print_status "Creating fresh data directories..."
        create_data_dirs
        print_status "Starting services with fresh database..."
        docker-compose up -d
        print_status "Database reset completed"
    else
        print_status "Database reset cancelled"
    fi
}

# Function to show status
show_status() {
    print_status "Checking service status..."
    docker-compose ps
}

# Function to show help
show_help() {
    echo "Docker Compose Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup     - Create data directories and start services"
    echo "  start     - Start services"
    echo "  stop      - Stop services"
    echo "  restart   - Restart services"
    echo "  logs      - View logs"
    echo "  reset     - Reset database (delete all data)"
    echo "  status    - Show service status"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # First time setup"
    echo "  $0 start    # Start services"
    echo "  $0 logs     # View logs"
}

# Main script logic
case "${1:-help}" in
    setup)
        create_data_dirs
        start_services
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        view_logs
        ;;
    reset)
        reset_database
        ;;
    status)
        show_status
        ;;
    help|*)
        show_help
        ;;
esac 