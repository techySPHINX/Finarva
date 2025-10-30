# =============================================================================

# INFRASTRUCTURE README

# =============================================================================

This directory contains all infrastructure and deployment automation for the Finarva API.

## 📂 Directory Structure

```
infrastructure/
├── azure/                          # Azure cloud infrastructure
│   ├── main.tf                     # Terraform main configuration
│   ├── variables.tf                # Terraform variable definitions
│   ├── terraform.tfvars.example    # Example variables file
│   ├── cloud-init.yaml             # VM initialization script
│   ├── DEPLOYMENT_GUIDE.md         # Detailed deployment guide
│   └── .gitignore                  # Ignore sensitive files
│
└── scripts/                        # Deployment automation scripts
    ├── deploy-to-azure.sh          # Deploy application to Azure VM
    └── setup-ssl.sh                # SSL certificate automation
```

## 🚀 Quick Start

### Prerequisites

1. **Azure Account** with active subscription
2. **Azure CLI** installed and configured
3. **Terraform** (>= 1.0)
4. **SSH Key Pair** for VM access
5. **Docker** for building images

### Deployment Steps

```bash
# 1. Login to Azure
az login

# 2. Navigate to infrastructure directory
cd infrastructure/azure

# 3. Copy and configure variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 4. Initialize Terraform
terraform init

# 5. Preview infrastructure changes
terraform plan

# 6. Deploy infrastructure
terraform apply

# 7. Note the outputs (VM IP, Redis details, etc.)
terraform output > ../../azure-outputs.txt

# 8. Deploy application
cd ..
./scripts/deploy-to-azure.sh <VM_IP> azureuser

# 9. Setup SSL (if you have a domain)
./scripts/setup-ssl.sh api.yourdomain.com admin@yourdomain.com <VM_IP> azureuser
```

## 📚 Detailed Documentation

For comprehensive deployment instructions, see:

- **[Azure Deployment Guide](./azure/DEPLOYMENT_GUIDE.md)** - Complete Azure setup guide
- **[Main README](../README.md)** - Project overview and local development

## 🏗️ Infrastructure Components

### Azure Resources (Terraform)

| Resource                   | Purpose             | Cost Impact |
| -------------------------- | ------------------- | ----------- |
| **Virtual Machine**        | Hosts application   | ⭐⭐⭐ High |
| **Virtual Network**        | Network isolation   | ⭐ Low      |
| **Network Security Group** | Firewall rules      | ⭐ Low      |
| **Public IP**              | Internet access     | ⭐ Low      |
| **Redis Cache**            | Caching & sessions  | ⭐⭐ Medium |
| **PostgreSQL** (optional)  | Managed database    | ⭐⭐⭐ High |
| **Storage Account**        | Backups & logs      | ⭐ Low      |
| **Application Insights**   | Monitoring & logs   | ⭐ Low      |
| **Log Analytics**          | Centralized logging | ⭐ Low      |

### Estimated Monthly Costs

| Environment     | VM Size | Redis        | Total (USD) |
| --------------- | ------- | ------------ | ----------- |
| **Development** | B1s     | Basic 250MB  | $15-25      |
| **Staging**     | B2s     | Standard 1GB | $50-80      |
| **Production**  | D4s_v3  | Standard 6GB | $250-400    |

> Use [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/) for accurate estimates.

## 🔧 Scripts Overview

### deploy-to-azure.sh

Automates application deployment to Azure VM:

- ✅ SSH connection validation
- ✅ Docker image build and compression
- ✅ File transfer to VM
- ✅ Remote deployment via docker-compose
- ✅ Health check validation

**Usage:**

```bash
./scripts/deploy-to-azure.sh <VM_IP> [SSH_USER] [SSH_KEY]
```

### setup-ssl.sh

Automates SSL/TLS certificate setup:

- ✅ DNS resolution validation
- ✅ Certbot certificate generation
- ✅ Nginx configuration update
- ✅ Auto-renewal setup

**Usage:**

```bash
./scripts/setup-ssl.sh <DOMAIN> <EMAIL> [VM_IP] [SSH_USER]
```

## 🔐 Security Best Practices

### 1. Secrets Management

```bash
# Never commit these files:
terraform.tfvars
.env
.env.production

# Use Azure Key Vault for production secrets
az keyvault create \
  --name kv-finarva-prod \
  --resource-group rg-finarva-production \
  --location eastus
```

### 2. Network Security

```bash
# Whitelist only necessary IPs in terraform.tfvars
allowed_ssh_ips = ["YOUR.IP.ADDRESS/32"]

# Disable password authentication (SSH keys only)
# This is configured in cloud-init.yaml
```

### 3. SSL/TLS

```bash
# Always use HTTPS in production
# Automatic via setup-ssl.sh and Let's Encrypt

# Test SSL configuration
curl -I https://api.yourdomain.com
```

### 4. Regular Updates

```bash
# System updates (automatic via cloud-init)
sudo apt update && sudo apt upgrade -y

# Container updates (automatic via Watchtower)
# Configured in docker-compose.yml
```

## 📊 Monitoring & Logging

### Application Insights

```bash
# View metrics in Azure Portal
az monitor app-insights component show \
  --app appi-finarva-production \
  --resource-group rg-finarva-production
```

### Log Analytics

```bash
# Query logs
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "ContainerLog | where TimeGenerated > ago(1h)"
```

### VM Monitoring

```bash
# SSH into VM and run monitoring script
ssh azureuser@<VM_IP>
./monitor.sh
```

## 🔄 CI/CD Integration

This infrastructure is designed to work with the GitHub Actions workflows:

- **`.github/workflows/ci.yaml`** - Continuous Integration (tests, linting, security)
- **`.github/workflows/deploy.yaml`** - Continuous Deployment (not modified)

The infrastructure deployment is **separate** from application CI/CD:

- **Infrastructure**: Deploy manually via Terraform (infrequent changes)
- **Application**: Deploy automatically via GitHub Actions or `deploy-to-azure.sh`

## 🆘 Troubleshooting

### Terraform Errors

```bash
# State lock issue
terraform force-unlock <LOCK_ID>

# Destroy and recreate
terraform destroy
terraform apply

# View detailed logs
TF_LOG=DEBUG terraform apply
```

### VM Access Issues

```bash
# Test SSH connection
ssh -v azureuser@<VM_IP>

# Check NSG rules
az network nsg rule list \
  --resource-group rg-finarva-production \
  --nsg-name nsg-finarva-app-production

# Reset VM
az vm restart \
  --resource-group rg-finarva-production \
  --name vm-finarva-production
```

### Application Issues

```bash
# View container logs
ssh azureuser@<VM_IP>
cd /opt/finarva
docker-compose logs -f app

# Restart application
docker-compose restart app

# Check health endpoint
curl http://localhost:3000/health
```

## 🔄 Scaling Options

### Vertical Scaling (Bigger VM)

```bash
# Stop VM
az vm deallocate --resource-group rg-finarva-production --name vm-finarva-production

# Resize
az vm resize \
  --resource-group rg-finarva-production \
  --name vm-finarva-production \
  --size Standard_D8s_v3

# Start VM
az vm start --resource-group rg-finarva-production --name vm-finarva-production
```

### Horizontal Scaling

For high-traffic scenarios:

1. **Azure App Service** with auto-scaling
2. **Azure Kubernetes Service (AKS)**
3. **Azure Container Instances (ACI)**
4. **Azure Load Balancer** with multiple VMs

## 📝 Maintenance

### Regular Tasks

| Task                    | Frequency      | Command                                  |
| ----------------------- | -------------- | ---------------------------------------- |
| **System Updates**      | Weekly         | `sudo apt update && sudo apt upgrade -y` |
| **Certificate Renewal** | Auto (60 days) | `sudo certbot renew`                     |
| **Database Backup**     | Daily          | `./backup.sh`                            |
| **Log Rotation**        | Auto           | Configured in cloud-init                 |
| **Security Scan**       | Weekly         | `docker scan finarva-api`                |

### Update Infrastructure

```bash
# Update Terraform configuration
cd infrastructure/azure

# Preview changes
terraform plan

# Apply updates
terraform apply
```

## 🛟 Support

For infrastructure issues:

1. Check [Deployment Guide](./azure/DEPLOYMENT_GUIDE.md)
2. Review [Azure Documentation](https://docs.microsoft.com/azure)
3. Open GitHub issue with `infrastructure` label
4. Contact: devops@finarva.com

## 📄 License

This infrastructure code is part of the Finarva project and is licensed under the MIT License.
