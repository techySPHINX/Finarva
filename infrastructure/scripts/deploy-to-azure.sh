#!/bin/bash
# =============================================================================
# FINARVA - AZURE DEPLOYMENT SCRIPT
# =============================================================================
# This script deploys the Finarva API to an Azure VM

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check arguments
if [ $# -lt 1 ]; then
    log_error "Usage: ./deploy-to-azure.sh <VM_IP> [SSH_USER]"
    echo ""
    echo "Example:"
    echo "  ./deploy-to-azure.sh 20.123.45.67"
    echo "  ./deploy-to-azure.sh 20.123.45.67 azureuser"
    exit 1
fi

VM_IP="${1}"
SSH_USER="${2:-azureuser}"
SSH_KEY="${3:-~/.ssh/id_rsa}"

log_info "🚀 Starting Finarva deployment to Azure VM"
log_info "VM IP: $VM_IP"
log_info "SSH User: $SSH_USER"

# Test SSH connection
log_info "🔐 Testing SSH connection..."
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$VM_IP" "echo 'SSH connection successful'" > /dev/null 2>&1; then
    log_error "Cannot connect to VM via SSH. Please check:"
    echo "  - VM IP address is correct"
    echo "  - SSH key is correct"
    echo "  - Network Security Group allows SSH (port 22)"
    exit 1
fi
log_info "✅ SSH connection successful"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    log_warn "⚠️  .env.production not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env.production
        log_warn "Please edit .env.production with your production values before deploying"
        read -p "Press Enter to continue or Ctrl+C to abort..."
    else
        log_error ".env.example not found. Cannot create production environment file."
        exit 1
    fi
fi

# Build Docker image
log_info "🏗️  Building Docker image..."
docker build -t finarva-api:latest -f Dockerfile . || {
    log_error "Docker build failed"
    exit 1
}
log_info "✅ Docker image built successfully"

# Save Docker image
log_info "💾 Saving Docker image..."
docker save finarva-api:latest | gzip > finarva-api.tar.gz || {
    log_error "Failed to save Docker image"
    exit 1
}
IMAGE_SIZE=$(du -h finarva-api.tar.gz | cut -f1)
log_info "✅ Image saved (Size: $IMAGE_SIZE)"

# Upload files to VM
log_info "📤 Uploading files to VM..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no finarva-api.tar.gz "$SSH_USER@$VM_IP:/opt/finarva/" || {
    log_error "Failed to upload Docker image"
    rm -f finarva-api.tar.gz
    exit 1
}

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no .env.production "$SSH_USER@$VM_IP:/opt/finarva/.env" || {
    log_error "Failed to upload environment file"
    rm -f finarva-api.tar.gz
    exit 1
}

# Clean up local image archive
rm -f finarva-api.tar.gz
log_info "✅ Files uploaded successfully"

# Deploy on VM
log_info "🚀 Deploying application on VM..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$VM_IP" << 'ENDSSH'
    set -e
    cd /opt/finarva
    
    echo "📦 Loading Docker image..."
    docker load < finarva-api.tar.gz
    
    echo "⏹️  Stopping existing containers..."
    docker-compose down || true
    
    echo "▶️  Starting new containers..."
    docker-compose up -d
    
    echo "🧹 Cleaning up..."
    rm -f finarva-api.tar.gz
    
    echo "⏳ Waiting for application to start..."
    sleep 15
    
    echo "🏥 Checking application health..."
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
    else
        echo "⚠️  Health check failed. Showing logs:"
        docker-compose logs --tail=50 app
        exit 1
    fi
ENDSSH

if [ $? -eq 0 ]; then
    log_info "✅ Deployment completed successfully!"
    echo ""
    log_info "🌐 Your API is now running at:"
    echo "   http://$VM_IP:3000"
    echo "   https://$VM_IP:3000 (if SSL is configured)"
    echo ""
    log_info "📊 Useful commands:"
    echo "   View logs:    ssh $SSH_USER@$VM_IP 'cd /opt/finarva && docker-compose logs -f'"
    echo "   Restart app:  ssh $SSH_USER@$VM_IP 'cd /opt/finarva && docker-compose restart'"
    echo "   Monitor:      ssh $SSH_USER@$VM_IP '/opt/finarva/monitor.sh'"
    echo ""
else
    log_error "Deployment failed! Check the logs above for details."
    exit 1
fi
