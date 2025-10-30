# =============================================================================

# FINARVA - AZURE DEPLOYMENT GUIDE

# =============================================================================

## Prerequisites

Before deploying to Azure, ensure you have:

1. **Azure Account** with active subscription
2. **Azure CLI** installed ([Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
3. **Terraform** installed (version >= 1.0)
4. **SSH Key Pair** for VM access
5. **Docker** installed on your local machine

## Step-by-Step Deployment

### 1. Prepare Azure Environment

```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "<Your-Subscription-ID>"

# Verify current subscription
az account show
```

### 2. Create Terraform Backend (Optional but Recommended)

```bash
# Create resource group for Terraform state
az group create --name rg-terraform-state --location eastus

# Create storage account for state files
az storage account create \
  --name stfinarvatfstate \
  --resource-group rg-terraform-state \
  --location eastus \
  --sku Standard_LRS

# Create container for state files
az storage container create \
  --name tfstate \
  --account-name stfinarvatfstate

# Get storage account key
az storage account keys list \
  --resource-group rg-terraform-state \
  --account-name stfinarvatfstate
```

Update `infrastructure/azure/main.tf` backend configuration with your values.

### 3. Configure Terraform Variables

Create `infrastructure/azure/terraform.tfvars`:

```hcl
environment = "production"
location    = "eastus"
vm_size     = "Standard_B2s"

# SSH configuration
admin_username      = "azureuser"
ssh_public_key_path = "~/.ssh/id_rsa.pub"

# Whitelist your IP for SSH access
allowed_ssh_ips = ["YOUR.IP.ADDRESS/32"]

# Database (set to true if using Azure PostgreSQL)
enable_postgresql = false
db_admin_username = "finarvaadmin"
db_admin_password = "YourStrongPassword123!"

# Redis configuration
redis_capacity = 1
redis_family   = "C"
redis_sku      = "Standard"
```

**Important**: Never commit `terraform.tfvars` to git! It contains sensitive data.

### 4. Deploy Infrastructure with Terraform

```bash
# Navigate to infrastructure directory
cd infrastructure/azure

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Apply infrastructure
terraform apply

# Save outputs
terraform output > ../../azure-outputs.txt
```

**Note the VM public IP from the output!**

### 5. Verify VM Setup

```bash
# Get VM IP from Terraform output
VM_IP=$(terraform output -raw vm_public_ip)

# Test SSH connection
ssh azureuser@$VM_IP

# Check if cloud-init completed
sudo cloud-init status

# Verify Docker installation
docker --version
docker-compose --version

# Verify directory structure
ls -la /opt/finarva/
```

### 6. Configure Application Environment

```bash
# On the VM, copy environment template
cd /opt/finarva
cp .env.template .env

# Edit with your values
nano .env
```

**Required Configuration**:

```env
# MongoDB (use MongoDB Atlas for production)
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/finarva

# Redis (from Terraform output)
REDIS_HOST=<from terraform output redis_hostname>
REDIS_PASSWORD=<from terraform output redis_primary_key>

# JWT Secrets (generate strong random strings)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# AI Services
OPENAI_API_KEY=sk-your-key
GOOGLE_AI_API_KEY=your-key
PINECONE_API_KEY=your-key

# Stripe
STRIPE_SECRET_KEY=sk_live_your-key

# Application Insights (from Terraform output)
APPINSIGHTS_INSTRUMENTATIONKEY=<from terraform output>
```

### 7. Deploy Application

**Option A: From Local Machine**

```bash
# Make scripts executable
chmod +x infrastructure/scripts/*.sh

# Deploy to Azure VM
./infrastructure/scripts/deploy-to-azure.sh <VM_IP> azureuser
```

**Option B: Directly on VM**

```bash
# SSH into VM
ssh azureuser@<VM_IP>

# Pull and start application
cd /opt/finarva
./deploy.sh
```

### 8. Configure DNS (Optional but Recommended)

Add DNS A record pointing to your VM IP:

```
Type: A
Name: api (or your subdomain)
Value: <VM_PUBLIC_IP>
TTL: 3600
```

Verify DNS propagation:

```bash
dig api.yourdomain.com
nslookup api.yourdomain.com
```

### 9. Setup SSL Certificate

```bash
# From local machine
./infrastructure/scripts/setup-ssl.sh api.yourdomain.com admin@yourdomain.com <VM_IP> azureuser

# Or on the VM directly
ssh azureuser@<VM_IP>
sudo ./infrastructure/scripts/setup-ssl.sh api.yourdomain.com admin@yourdomain.com
```

### 10. Verify Deployment

```bash
# Check application health
curl http://<VM_IP>:3000/health
curl https://api.yourdomain.com/health

# View API documentation
https://api.yourdomain.com/api/docs

# Check logs
ssh azureuser@<VM_IP>
cd /opt/finarva
docker-compose logs -f app

# Monitor system
./monitor.sh
```

## Post-Deployment

### Configure Firewall Rules

```bash
# Allow only necessary ports
az network nsg rule create \
  --resource-group rg-finarva-production \
  --nsg-name nsg-finarva-app-production \
  --name AllowHTTPSOnly \
  --priority 100 \
  --source-address-prefixes Internet \
  --destination-port-ranges 443 \
  --access Allow \
  --protocol Tcp
```

### Setup Monitoring

1. **Application Insights**: Already configured via Terraform
2. **Log Analytics**: Monitor VM and application logs
3. **Azure Monitor**: Set up alerts for:
   - CPU usage > 80%
   - Memory usage > 80%
   - Disk usage > 80%
   - Application health check failures

### Setup Backups

```bash
# Create backup schedule (on VM)
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/finarva/backup.sh >> /opt/finarva/logs/backup.log 2>&1

# Configure Azure Backup for VM
az backup protection enable-for-vm \
  --resource-group rg-finarva-production \
  --vault-name rsv-finarva-backups \
  --vm vm-finarva-production \
  --policy-name DefaultPolicy
```

### Setup Auto-Updates

```bash
# Enable automatic security updates (already in cloud-init)
ssh azureuser@<VM_IP>
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure Docker container auto-updates
# Install watchtower
cd /opt/finarva
cat >> docker-compose.yml << EOF

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 3600 --cleanup
EOF

docker-compose up -d watchtower
```

## Scaling Recommendations

### Vertical Scaling (Increase VM Size)

```bash
# Stop VM
az vm deallocate --resource-group rg-finarva-production --name vm-finarva-production

# Resize VM
az vm resize \
  --resource-group rg-finarva-production \
  --name vm-finarva-production \
  --size Standard_D4s_v3

# Start VM
az vm start --resource-group rg-finarva-production --name vm-finarva-production
```

### Horizontal Scaling

For high-traffic applications, consider:

1. **Azure App Service** with auto-scaling
2. **Azure Kubernetes Service (AKS)** for container orchestration
3. **Azure Load Balancer** for multiple VMs
4. **Azure Application Gateway** with WAF

## Maintenance

### Update Application

```bash
# Local deployment
./infrastructure/scripts/deploy-to-azure.sh <VM_IP>

# Or on VM
ssh azureuser@<VM_IP>
cd /opt/finarva && ./deploy.sh
```

### View Logs

```bash
# Application logs
ssh azureuser@<VM_IP>
cd /opt/finarva
docker-compose logs -f app

# Nginx logs
tail -f /opt/finarva/logs/nginx-access.log
tail -f /opt/finarva/logs/nginx-error.log

# System logs
sudo journalctl -u docker -f
```

### Database Maintenance

```bash
# If using Azure PostgreSQL
az postgres flexible-server restart \
  --resource-group rg-finarva-production \
  --name psql-finarva-production

# Backup database
az postgres flexible-server backup list \
  --resource-group rg-finarva-production \
  --name psql-finarva-production
```

## Troubleshooting

### Application Won't Start

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs --tail=100 app

# Check environment variables
docker-compose config

# Restart application
docker-compose restart app
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# Test renewal
sudo certbot renew --dry-run
```

### Performance Issues

```bash
# Monitor resources
./monitor.sh

# Check Docker stats
docker stats

# View top processes
htop

# Check disk space
df -h
```

### Network Issues

```bash
# Test connectivity
curl -v http://localhost:3000/health

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check firewall
sudo ufw status
```

## Security Best Practices

1. **Keep System Updated**

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Rotate Secrets Regularly**
   - JWT secrets
   - Database passwords
   - API keys

3. **Monitor Access Logs**

   ```bash
   tail -f /opt/finarva/logs/nginx-access.log | grep -i "POST\|DELETE"
   ```

4. **Enable Azure Security Center**

   ```bash
   az security pricing create --name VirtualMachines --tier standard
   ```

5. **Setup Azure Key Vault** for secrets management

6. **Enable Disk Encryption**
   ```bash
   az vm encryption enable \
     --resource-group rg-finarva-production \
     --name vm-finarva-production \
     --disk-encryption-keyvault <vault-name>
   ```

## Cost Optimization

1. **Use Reserved Instances** for production (save up to 72%)
2. **Stop VMs** during non-business hours (dev/staging)
3. **Use Azure Cost Management** to track spending
4. **Right-size resources** based on actual usage

## Disaster Recovery

### Backup Strategy

1. **VM Snapshots**: Daily via Azure Backup
2. **Database Backups**: Automated by Azure
3. **Application Data**: Daily via backup script
4. **Configuration**: Store in Git

### Recovery Procedure

```bash
# Restore from backup
az backup restore restore-disks \
  --resource-group rg-finarva-production \
  --vault-name rsv-finarva-backups \
  --container-name <container> \
  --item-name <item> \
  --rp-name <recovery-point>
```

## Support

For deployment issues:

- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [Azure Documentation](https://docs.microsoft.com/azure)
- Contact: devops@finarva.com
