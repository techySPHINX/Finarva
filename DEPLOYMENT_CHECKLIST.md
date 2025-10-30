# ✅ FINARVA DEPLOYMENT CHECKLIST

Use this checklist to ensure a successful deployment of Finarva to production.

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Prerequisites Installed

- [ ] Node.js 18+ installed
- [ ] Docker installed and running
- [ ] Azure CLI installed (`az --version`)
- [ ] Terraform installed (`terraform --version`)
- [ ] Git installed
- [ ] SSH key pair generated (`ssh-keygen -t rsa -b 4096`)

### 2. Azure Account Setup

- [ ] Azure account created and active
- [ ] Azure subscription available
- [ ] Azure CLI logged in (`az login`)
- [ ] Correct subscription selected (`az account show`)
- [ ] Resource provider registered (`az provider register --namespace Microsoft.Compute`)

### 3. API Keys & Credentials

#### Required (Critical)
- [ ] **OpenAI API Key** obtained from https://platform.openai.com/api-keys
- [ ] **Database URL** (MongoDB Atlas or PostgreSQL connection string)
- [ ] **JWT Secret** generated (`openssl rand -base64 32`)
- [ ] **JWT Refresh Secret** generated (`openssl rand -base64 32`)

#### Optional (Recommended)
- [ ] Google Gemini API Key (https://makersuite.google.com/app/apikey)
- [ ] Pinecone API Key (https://app.pinecone.io/)
- [ ] Stripe API Keys (https://dashboard.stripe.com/)

### 4. Configuration Files

- [ ] `.env` file created from `.env.example`
- [ ] `.env.production` file created from `.env.production.example`
- [ ] `infrastructure/azure/terraform.tfvars` created from example
- [ ] All sensitive values filled in (no placeholder values)
- [ ] Database connection tested locally

### 5. Domain & DNS (If using custom domain)

- [ ] Domain registered
- [ ] DNS access available
- [ ] Email for SSL certificate notifications

---

## 🏗️ INFRASTRUCTURE DEPLOYMENT

### Step 1: Configure Terraform Variables

```powershell
# Navigate to infrastructure
cd infrastructure/azure

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
# Required changes:
# - environment (dev/staging/production)
# - location (Azure region)
# - vm_size
# - admin_username
# - ssh_public_key_path
# - allowed_ssh_ips (your IP address!)
# - db_admin_password (if using Azure PostgreSQL)
```

**Checklist:**
- [ ] `environment` set correctly
- [ ] `location` selected (e.g., "eastus")
- [ ] `vm_size` appropriate for workload
- [ ] `ssh_public_key_path` points to your public key
- [ ] `allowed_ssh_ips` contains your IP (NOT 0.0.0.0/0 for production!)
- [ ] `db_admin_password` is strong (if using PostgreSQL)

### Step 2: Deploy Infrastructure

```powershell
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Apply (creates Azure resources)
terraform apply
```

**Checklist:**
- [ ] Terraform initialized successfully
- [ ] Validation passed without errors
- [ ] Plan reviewed and looks correct
- [ ] Apply completed successfully
- [ ] Outputs saved (`terraform output > ../../azure-outputs.txt`)
- [ ] VM public IP noted
- [ ] Redis connection string saved
- [ ] Application Insights key saved

### Step 3: Verify Infrastructure

```powershell
# Check VM is running
az vm show --resource-group rg-finarva-production --name vm-finarva-production

# Test SSH connection
ssh azureuser@<VM_IP>

# Verify cloud-init completed
sudo cloud-init status

# Check Docker installed
docker --version
docker-compose --version

# Exit SSH
exit
```

**Checklist:**
- [ ] VM is running
- [ ] SSH connection successful
- [ ] cloud-init completed successfully
- [ ] Docker installed and running
- [ ] Nginx installed and running

---

## 🚀 APPLICATION DEPLOYMENT

### Step 4: Configure Environment on VM

```powershell
# SSH into VM
ssh azureuser@<VM_IP>

# Navigate to app directory
cd /opt/finarva

# Create environment file
sudo nano .env

# Paste your production environment variables
# (Use values from .env.production.example)
# IMPORTANT: Update these values:
# - DATABASE_URL
# - OPENAI_API_KEY
# - JWT_SECRET
# - JWT_REFRESH_SECRET
# - REDIS_HOST (from Terraform output)
# - REDIS_PASSWORD (from Terraform output)
# - APPINSIGHTS_INSTRUMENTATIONKEY (from Terraform output)

# Save and exit (Ctrl+X, Y, Enter)

# Verify file created
cat .env
```

**Checklist:**
- [ ] `.env` file created on VM
- [ ] All required variables set
- [ ] No placeholder values remaining
- [ ] Secrets are secure and random
- [ ] Redis connection details from Azure
- [ ] Database URL is correct

### Step 5: Deploy Application

**Option A: Using Deployment Script (Recommended)**

```powershell
# From your local machine
cd Finarva
.\infrastructure\scripts\deploy-helper.ps1

# Select option 2: Deploy Application to Azure VM
# Follow prompts
```

**Option B: Manual Deployment**

```powershell
# On your local machine
docker build -t finarva-api:latest .
docker save finarva-api:latest | gzip > finarva-api.tar.gz

# Upload to VM
scp finarva-api.tar.gz azureuser@<VM_IP>:/tmp/

# On the VM
ssh azureuser@<VM_IP>
cd /opt/finarva
docker load < /tmp/finarva-api.tar.gz
docker-compose up -d
```

**Checklist:**
- [ ] Docker image built successfully
- [ ] Image uploaded to VM
- [ ] Containers started successfully
- [ ] Health check passed (`curl http://localhost:3000/health`)

### Step 6: Setup SSL Certificate (If using custom domain)

```powershell
# Update DNS first!
# Create A record: api.yourdomain.com -> <VM_IP>

# Wait for DNS propagation (check with: nslookup api.yourdomain.com)

# Run SSL setup script
.\infrastructure\scripts\deploy-helper.ps1
# Select option 3: Setup SSL Certificate

# Or manually:
ssh azureuser@<VM_IP>
sudo certbot --nginx -d api.yourdomain.com --non-interactive --agree-tos -m admin@yourdomain.com
sudo systemctl reload nginx
```

**Checklist:**
- [ ] DNS A record created
- [ ] DNS propagated (verified with `nslookup`)
- [ ] SSL certificate obtained
- [ ] Nginx configured for HTTPS
- [ ] HTTPS access working (`https://api.yourdomain.com/health`)
- [ ] HTTP redirects to HTTPS
- [ ] Auto-renewal configured

---

## ✅ POST-DEPLOYMENT VERIFICATION

### Step 7: Verify Application

```powershell
# Test health endpoint
curl https://api.yourdomain.com/health
# or
curl http://<VM_IP>:3000/health

# Expected response:
# {
#   "status": "ok",
#   "info": { ... },
#   "details": { ... }
# }

# Test API documentation
# Open in browser: https://api.yourdomain.com/api/docs

# Test authentication
curl -X POST https://api.yourdomain.com/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

**Checklist:**
- [ ] Health endpoint returns 200 OK
- [ ] Database indicator is healthy
- [ ] Redis indicator is healthy
- [ ] API documentation accessible
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] JWT token returned successfully

### Step 8: Configure Monitoring

```powershell
# In Azure Portal:
# 1. Navigate to Application Insights
# 2. Review live metrics
# 3. Setup alerts for:
#    - High error rate (> 5%)
#    - Slow response time (> 1s)
#    - Server errors (5xx)

# On VM, check logs
ssh azureuser@<VM_IP>
cd /opt/finarva
docker-compose logs -f app

# Verify monitoring script
./monitor.sh
```

**Checklist:**
- [ ] Application Insights receiving data
- [ ] Logs visible in Log Analytics
- [ ] Alerts configured
- [ ] Email notifications setup
- [ ] Dashboard created
- [ ] Monitoring script working

### Step 9: Security Hardening

```powershell
# Review NSG rules
az network nsg rule list `
  --resource-group rg-finarva-production `
  --nsg-name nsg-finarva-app-production `
  --output table

# Verify firewall on VM
ssh azureuser@<VM_IP>
sudo ufw status

# Check for updates
sudo apt update
sudo apt list --upgradable

# Verify automatic updates enabled
sudo systemctl status unattended-upgrades
```

**Checklist:**
- [ ] Only necessary ports open (80, 443, 22)
- [ ] SSH restricted to whitelisted IPs
- [ ] Firewall enabled and configured
- [ ] System updates applied
- [ ] Automatic updates enabled
- [ ] No unnecessary services running

### Step 10: Setup Backups

```powershell
# On VM, verify backup script
ssh azureuser@<VM_IP>
cat /opt/finarva/backup.sh

# Test backup manually
./backup.sh

# Check backup in Azure Storage
az storage blob list `
  --account-name stfinarvaproduction `
  --container-name backups `
  --output table

# Verify cron job
crontab -l
```

**Checklist:**
- [ ] Backup script exists and executable
- [ ] Manual backup successful
- [ ] Backups uploading to Azure Storage
- [ ] Cron job configured (daily at 2 AM)
- [ ] Backup retention policy set
- [ ] Test restore procedure documented

---

## 📊 PERFORMANCE VERIFICATION

### Step 11: Load Testing

```powershell
# Install Apache Bench (if not installed)
# Windows: Use WSL or download from Apache

# Basic load test
ab -n 1000 -c 10 https://api.yourdomain.com/health

# Expected results:
# - Average response time < 200ms
# - No failed requests
# - Requests per second > 50
```

**Checklist:**
- [ ] Average response time acceptable
- [ ] No errors under normal load
- [ ] Throughput meets requirements
- [ ] CPU usage under 70% during load
- [ ] Memory usage stable

---

## 🔐 SECURITY AUDIT

### Step 12: Security Verification

```powershell
# SSL Test
# Visit: https://www.ssllabs.com/ssltest/
# Enter: api.yourdomain.com
# Expected: A or A+ rating

# Security Headers
curl -I https://api.yourdomain.com
# Should include:
# - Strict-Transport-Security
# - X-Content-Type-Options
# - X-Frame-Options
# - X-XSS-Protection

# Test rate limiting
# Send rapid requests and verify 429 response
```

**Checklist:**
- [ ] SSL Labs grade A or higher
- [ ] Security headers present
- [ ] Rate limiting working
- [ ] CORS configured correctly
- [ ] No sensitive data in responses
- [ ] Authentication required for protected routes

---

## 📚 DOCUMENTATION

### Step 13: Update Documentation

**Checklist:**
- [ ] README updated with production URL
- [ ] API documentation reflects actual endpoints
- [ ] Architecture diagrams current
- [ ] Deployment guide tested and accurate
- [ ] Runbook created for common issues
- [ ] Contact information updated

---

## 🎉 FINAL CHECKLIST

### Production Readiness

- [ ] All tests passing
- [ ] Application deployed and accessible
- [ ] SSL certificate installed and valid
- [ ] Monitoring configured and working
- [ ] Backups automated and tested
- [ ] Security hardening complete
- [ ] Performance verified
- [ ] Documentation updated
- [ ] Team trained on deployment process
- [ ] Incident response plan in place

### GitHub Release

- [ ] Code reviewed and approved
- [ ] Version tagged (e.g., v1.0.0)
- [ ] CHANGELOG updated
- [ ] Release notes prepared
- [ ] Repository set to public (if applicable)
- [ ] CI/CD badges updated in README

---

## 🆘 ROLLBACK PLAN

If something goes wrong:

```powershell
# Option 1: Revert deployment
ssh azureuser@<VM_IP>
cd /opt/finarva
docker-compose down
# Restore previous image
docker-compose up -d

# Option 2: Destroy and redeploy
cd infrastructure/azure
terraform destroy
# Fix issues, then redeploy
terraform apply
```

---

## 📞 SUPPORT

If you encounter issues:

1. **Check Logs**
   ```powershell
   ssh azureuser@<VM_IP>
   cd /opt/finarva
   docker-compose logs -f app
   ```

2. **Review Health Check**
   ```powershell
   curl http://localhost:3000/health
   ```

3. **Check Azure Portal**
   - Application Insights for errors
   - Log Analytics for system logs
   - Resource Health for infrastructure

4. **Consult Documentation**
   - [Deployment Guide](infrastructure/azure/DEPLOYMENT_GUIDE.md)
   - [Troubleshooting](infrastructure/README.md#troubleshooting)
   - [Architecture](ARCHITECTURE.md)

---

**🎊 Congratulations! Your Finarva deployment is complete!**

Remember to:
- Monitor your application regularly
- Keep systems updated
- Review security alerts
- Maintain backups
- Scale as needed

For questions or issues, open a GitHub issue or contact support.
