# ⚡ FINARVA QUICK START GUIDE

Get Finarva up and running in minutes!

---

## 🎯 Choose Your Path

### 1️⃣ Local Development (Fastest Start)

Perfect for testing and development.

```powershell
# Clone the repository
git clone https://github.com/techySPHINX/Finarva.git
cd Finarva

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your API keys

# Run with Docker Compose
docker-compose up -d

# Or run locally
npm run start:dev
```

**Access the application:**

- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

---

### 2️⃣ Azure Cloud Deployment (Production)

Deploy to Azure with complete infrastructure automation.

#### Windows PowerShell

```powershell
# Run the deployment helper
cd Finarva
.\infrastructure\scripts\deploy-helper.ps1

# Follow the interactive menu:
# 1. Deploy Azure Infrastructure (Terraform)
# 2. Deploy Application to Azure VM
# 3. Setup SSL Certificate
```

#### Linux/macOS

```bash
# Navigate to infrastructure
cd infrastructure/azure

# Configure deployment
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Deploy infrastructure
terraform init
terraform apply

# Deploy application
cd ..
./scripts/deploy-to-azure.sh <VM_IP> azureuser

# Setup SSL
./scripts/setup-ssl.sh api.yourdomain.com admin@yourdomain.com <VM_IP>
```

---

## 📝 Required Configuration

### Minimum Required Environment Variables

```env
# Database (MongoDB Atlas recommended for production)
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/finarva

# OpenAI (required for AI features)
OPENAI_API_KEY=sk-...

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-random-secret
JWT_REFRESH_SECRET=your-random-refresh-secret
```

### Optional Services (for full features)

```env
# Google Gemini AI
GOOGLE_AI_API_KEY=...

# Pinecone Vector Database
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX=finarva-vectors

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...

# Redis (included in docker-compose)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🔑 Getting API Keys

### OpenAI (Required)

1. Visit https://platform.openai.com/api-keys
2. Create account and add payment method
3. Generate new API key
4. Copy to `OPENAI_API_KEY`

### MongoDB Atlas (Recommended)

1. Visit https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP address (0.0.0.0/0 for testing)
5. Get connection string
6. Copy to `DATABASE_URL`

### Google Gemini (Optional)

1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Copy to `GOOGLE_AI_API_KEY`

### Pinecone (Optional)

1. Visit https://app.pinecone.io/
2. Create free account
3. Create index named `finarva-vectors`
4. Copy API key to `PINECONE_API_KEY`

### Stripe (Optional)

1. Visit https://dashboard.stripe.com/register
2. Get test API key from dashboard
3. Copy to `STRIPE_SECRET_KEY`

---

## ✅ Verification Checklist

After deployment, verify everything is working:

### Local Development

```powershell
# Check health
curl http://localhost:3000/health

# View API documentation
# Open: http://localhost:3000/api/docs

# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

### Production (Azure)

```powershell
# Check health
curl https://api.yourdomain.com/health

# Verify SSL
curl -I https://api.yourdomain.com

# Check logs
ssh azureuser@<VM_IP>
cd /opt/finarva
docker-compose logs -f app
```

---

## 🐛 Common Issues

### "Cannot connect to database"

**Solution:**

- Check `DATABASE_URL` is correct
- Verify database is running (for local PostgreSQL)
- For MongoDB Atlas: whitelist IP address

### "OpenAI API error"

**Solution:**

- Verify `OPENAI_API_KEY` is valid
- Check OpenAI account has credits
- Ensure API key has correct permissions

### "Module not found" errors

**Solution:**

```powershell
# Clean install
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Docker containers won't start

**Solution:**

```powershell
# Clean Docker state
docker-compose down -v
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### SSH connection refused (Azure)

**Solution:**

- Verify VM is running in Azure Portal
- Check Network Security Group allows SSH (port 22)
- Verify you're using correct IP address
- Ensure SSH key is correct

---

## 📚 Next Steps

1. **Read Documentation**
   - [Complete README](../README.md)
   - [Contributing Guide](../CONTRIBUTING.md)
   - [Azure Deployment Guide](../infrastructure/azure/DEPLOYMENT_GUIDE.md)

2. **Explore API**
   - Visit Swagger documentation
   - Test endpoints
   - Review data models

3. **Setup Monitoring**
   - Configure Application Insights (Azure)
   - Setup error tracking (Sentry)
   - Review health checks

4. **Secure Your Application**
   - Change default secrets
   - Configure CORS for your domain
   - Enable rate limiting
   - Setup SSL certificate

5. **Join the Community**
   - Star the repository ⭐
   - Report issues
   - Submit pull requests
   - Share feedback

---

## 🆘 Get Help

- **Documentation Issues**: Check [README.md](../README.md)
- **Technical Problems**: Open a [GitHub Issue](https://github.com/techySPHINX/Finarva/issues)
- **Security Concerns**: Email security@finarva.com
- **General Questions**: Check [Discussions](https://github.com/techySPHINX/Finarva/discussions)

---

## 📦 What's Included

- ✅ RESTful API with NestJS
- ✅ AI-powered features (OpenAI, Gemini)
- ✅ User authentication & authorization
- ✅ PostgreSQL/MongoDB database support
- ✅ Redis caching & sessions
- ✅ BullMQ job queue
- ✅ Swagger API documentation
- ✅ Docker containerization
- ✅ Azure deployment automation
- ✅ CI/CD pipelines
- ✅ Comprehensive testing
- ✅ Production-ready security

---

**🚀 You're ready to build amazing things with Finarva!**

Need more help? See the [complete documentation](../README.md) or [deployment guide](../infrastructure/azure/DEPLOYMENT_GUIDE.md).
