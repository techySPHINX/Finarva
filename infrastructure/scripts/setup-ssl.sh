#!/bin/bash
# =============================================================================
# FINARVA - SSL CERTIFICATE SETUP SCRIPT
# =============================================================================
# This script configures SSL/TLS certificates using Let's Encrypt

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
if [ $# -lt 2 ]; then
    log_error "Usage: ./setup-ssl.sh <DOMAIN> <EMAIL> [VM_IP] [SSH_USER]"
    echo ""
    echo "Example:"
    echo "  ./setup-ssl.sh api.finarva.com admin@finarva.com"
    echo "  ./setup-ssl.sh api.finarva.com admin@finarva.com 20.123.45.67 azureuser"
    exit 1
fi

DOMAIN="${1}"
EMAIL="${2}"
VM_IP="${3}"
SSH_USER="${4:-azureuser}"

# If VM_IP is provided, run on remote VM
if [ -n "$VM_IP" ]; then
    log_info "🌐 Setting up SSL for $DOMAIN on remote VM $VM_IP"
    
    # Check DNS resolution
    log_info "🔍 Checking DNS resolution..."
    RESOLVED_IP=$(dig +short "$DOMAIN" @8.8.8.8 | tail -n1)
    
    if [ -z "$RESOLVED_IP" ]; then
        log_error "Domain $DOMAIN does not resolve to any IP"
        log_warn "Please configure your DNS records first:"
        echo "  Type: A Record"
        echo "  Name: $DOMAIN"
        echo "  Value: $VM_IP"
        exit 1
    fi
    
    if [ "$RESOLVED_IP" != "$VM_IP" ]; then
        log_warn "⚠️  DNS mismatch!"
        log_warn "Domain $DOMAIN resolves to: $RESOLVED_IP"
        log_warn "Expected VM IP: $VM_IP"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_info "✅ DNS correctly configured"
    fi
    
    # Run certbot on remote VM
    ssh -o StrictHostKeyChecking=no "$SSH_USER@$VM_IP" << ENDSSH
        set -e
        
        echo "🔒 Installing SSL certificate for $DOMAIN..."
        
        # Stop nginx temporarily
        sudo systemctl stop nginx
        
        # Obtain certificate
        sudo certbot certonly \
            --standalone \
            -d $DOMAIN \
            --non-interactive \
            --agree-tos \
            -m $EMAIL \
            --preferred-challenges http
        
        # Update nginx configuration with correct domain
        sudo sed -i "s/server_name _;/server_name $DOMAIN;/g" /etc/nginx/sites-available/finarva
        
        # Update SSL certificate paths
        sudo sed -i "s|ssl_certificate .*|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|g" /etc/nginx/sites-available/finarva
        sudo sed -i "s|ssl_certificate_key .*|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|g" /etc/nginx/sites-available/finarva
        
        # Test nginx configuration
        sudo nginx -t
        
        # Start nginx
        sudo systemctl start nginx
        
        # Setup auto-renewal
        sudo systemctl enable certbot.timer
        sudo systemctl start certbot.timer
        
        echo "✅ SSL certificate installed successfully!"
        echo "🌐 Your API is now available at: https://$DOMAIN"
ENDSSH
    
else
    # Run on local machine (current VM)
    log_info "🔒 Setting up SSL for $DOMAIN on local machine"
    
    # Stop nginx
    sudo systemctl stop nginx
    
    # Obtain certificate
    sudo certbot certonly \
        --standalone \
        -d "$DOMAIN" \
        --non-interactive \
        --agree-tos \
        -m "$EMAIL" \
        --preferred-challenges http
    
    # Update nginx configuration
    sudo sed -i "s/server_name _;/server_name $DOMAIN;/g" /etc/nginx/sites-available/finarva
    sudo sed -i "s|ssl_certificate .*|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|g" /etc/nginx/sites-available/finarva
    sudo sed -i "s|ssl_certificate_key .*|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|g" /etc/nginx/sites-available/finarva
    
    # Test and reload nginx
    sudo nginx -t
    sudo systemctl start nginx
    
    # Setup auto-renewal
    sudo systemctl enable certbot.timer
    sudo systemctl start certbot.timer
    
    log_info "✅ SSL certificate installed successfully!"
    log_info "🌐 Your API is now available at: https://$DOMAIN"
fi

log_info "📅 Certificate will auto-renew before expiration"
log_info "🔍 To check certificate status: sudo certbot certificates"
