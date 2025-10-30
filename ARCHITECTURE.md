# 🏛️ FINARVA ARCHITECTURE DOCUMENTATION

Complete architectural overview of the Finarva AI-powered financial platform.

---

## 📊 Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Architecture](#component-architecture)
3. [Data Flow](#data-flow)
4. [Deployment Architecture](#deployment-architecture)
5. [Security Architecture](#security-architecture)
6. [Scalability & Performance](#scalability--performance)

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │ Web Client  │  │ Mobile App  │  │  3rd Party  │                  │
│  │   (React)   │  │   (React    │  │     API     │                  │
│  │             │  │   Native)   │  │  Consumers  │                  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │
└─────────┼─────────────────┼─────────────────┼───────────────────────┘
          │                 │                 │
          │            HTTPS/TLS              │
          │                 │                 │
          └─────────────────┼─────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────────┐
│                   API GATEWAY / LOAD BALANCER                          │
│                    (Nginx / Azure Load Balancer)                       │
└──────────────────────────┬────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────────┐
│                     APPLICATION LAYER                                  │
│  ┌────────────────────────────────────────────────────────────┐       │
│  │              FINARVA API (NestJS)                          │       │
│  │  ┌─────────────────────────────────────────────────────┐  │       │
│  │  │  Controllers (REST Endpoints)                       │  │       │
│  │  │  • Auth   • Clients  • Expenses  • Investments      │  │       │
│  │  │  • AI     • Loans    • Insurance • Analytics        │  │       │
│  │  └────────────────┬────────────────────────────────────┘  │       │
│  │                   │                                        │       │
│  │  ┌────────────────┴────────────────────────────────────┐  │       │
│  │  │  Business Logic Layer (Services)                    │  │       │
│  │  │  • Authentication & Authorization (JWT)             │  │       │
│  │  │  • AI Service (OpenAI, Gemini)                      │  │       │
│  │  │  • Financial Analytics                              │  │       │
│  │  │  • Business Logic & Validation                      │  │       │
│  │  └────────────────┬────────────────────────────────────┘  │       │
│  │                   │                                        │       │
│  │  ┌────────────────┴────────────────────────────────────┐  │       │
│  │  │  Data Access Layer (Prisma ORM)                     │  │       │
│  │  │  • Repository Pattern                               │  │       │
│  │  │  • Query Optimization                               │  │       │
│  │  │  • Transaction Management                           │  │       │
│  │  └────────────────────────────────────────────────────┘  │       │
│  └────────────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────────┐
│                      DATA & CACHE LAYER                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│  │ PostgreSQL  │  │    Redis    │  │  Pinecone   │                   │
│  │  Database   │  │    Cache    │  │  Vector DB  │                   │
│  │             │  │  & Session  │  │  (AI RAG)   │                   │
│  └─────────────┘  └─────────────┘  └─────────────┘                   │
└───────────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│  │   OpenAI    │  │   Google    │  │   Stripe    │                   │
│  │   GPT-4     │  │  Gemini Pro │  │  Payments   │                   │
│  └─────────────┘  └─────────────┘  └─────────────┘                   │
└───────────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────────┐
│                  BACKGROUND JOBS & QUEUE                               │
│  ┌────────────────────────────────────────────────────────┐           │
│  │  BullMQ Job Queue (Redis-backed)                       │           │
│  │  • Email Notifications  • Report Generation            │           │
│  │  • Data Aggregation     • Scheduled Tasks              │           │
│  └────────────────────────────────────────────────────────┘           │
└───────────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┼────────────────────────────────────────────┐
│                  MONITORING & LOGGING                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                   │
│  │ Application │  │     Log     │  │   Health    │                   │
│  │  Insights   │  │  Analytics  │  │   Checks    │                   │
│  │   (Azure)   │  │  Workspace  │  │             │                   │
│  └─────────────┘  └─────────────┘  └─────────────┘                   │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### NestJS Module Structure

```
AppModule (Root)
│
├── AuthModule
│   ├── AuthController
│   ├── AuthService
│   ├── JwtStrategy
│   ├── RefreshTokenStrategy
│   └── Guards (JwtAuthGuard, RolesGuard)
│
├── AIModule
│   ├── AIController
│   ├── AIService (OpenAI, Gemini integration)
│   ├── AIProcessor (BullMQ consumer)
│   └── VectorStoreModule (Pinecone)
│
├── ClientsModule
│   ├── ClientsController
│   ├── ClientsService
│   └── DTOs (Create, Update, Query)
│
├── ExpensesModule
│   ├── ExpensesController
│   ├── ExpensesService
│   └── DTOs
│
├── InvestmentModule
│   ├── InvestmentController
│   ├── InvestmentService
│   └── DTOs
│
├── LoansModule
│   ├── LoansController
│   ├── LoansService
│   └── DTOs
│
├── InsuranceModule
│   ├── InsuranceController
│   ├── InsuranceService
│   └── DTOs
│
├── CashFlowModule
│   ├── CashFlowController
│   ├── CashFlowService
│   └── Analytics
│
├── InventoryModule
│   ├── InventoryController
│   ├── InventoryService
│   └── DTOs
│
├── LearningModule
│   ├── LearningController
│   ├── LearningService
│   └── DTOs
│
├── QuizModule
│   ├── QuizController
│   ├── QuizService
│   └── DTOs
│
├── MerchantAssistantModule
│   ├── MerchantAssistantController
│   ├── MerchantAssistantService
│   └── RAG Pipeline
│
├── ReportingModule
│   ├── ReportingController
│   ├── ReportingService
│   └── Analytics
│
├── HealthModule
│   ├── HealthController
│   └── Health Indicators (Database, Redis, Disk, Memory)
│
├── PrismaModule (Global)
│   └── PrismaService
│
└── CommonModule
    ├── Filters (Exception, Validation)
    ├── Interceptors (Logging, Transform, Timeout)
    ├── Pipes (Validation)
    └── DTOs (Pagination, Response)
```

---

## 🔄 Data Flow

### Authentication Flow

```
1. User Login Request
   │
   ├─> POST /api/v1/auth/login
   │   { email, password }
   │
   ├─> AuthController.login()
   │
   ├─> AuthService.validateUser()
   │   ├─> PrismaService.findUser()
   │   └─> bcrypt.compare(password, hashedPassword)
   │
   ├─> AuthService.generateTokens()
   │   ├─> JWT Access Token (15min)
   │   └─> JWT Refresh Token (7 days)
   │
   ├─> Store refresh token in Redis
   │   └─> RedisService.set(userId, refreshToken)
   │
   └─> Response
       {
         accessToken: "...",
         refreshToken: "...",
         user: { ... }
       }

2. Authenticated Request
   │
   ├─> GET /api/v1/clients
   │   Header: Authorization: Bearer <accessToken>
   │
   ├─> JwtAuthGuard.canActivate()
   │   ├─> JWT Verification
   │   ├─> Extract user from token
   │   └─> Attach to request.user
   │
   ├─> ClientsController.findAll()
   │
   ├─> ClientsService.findAll(userId)
   │
   ├─> PrismaService.findMany({ where: { userId } })
   │
   └─> Response: [ { client1 }, { client2 }, ... ]

3. Token Refresh
   │
   ├─> POST /api/v1/auth/refresh
   │   { refreshToken }
   │
   ├─> Verify refresh token
   │
   ├─> Check Redis for valid session
   │
   ├─> Generate new access token
   │
   └─> Response: { accessToken }
```

### AI Request Flow (Merchant Assistant)

```
1. AI Query Request
   │
   ├─> POST /api/v1/merchant-assistant/ask
   │   { query: "How do I improve cash flow?" }
   │
   ├─> MerchantAssistantController.ask()
   │
   ├─> Check Redis cache
   │   └─> Cache key: md5(query)
   │   └─> If cached: return cached response
   │
   ├─> RAG Pipeline (if not cached)
   │   │
   │   ├─> Query Embedding
   │   │   └─> OpenAI Embeddings API
   │   │       └─> Vector: [0.123, -0.456, ...]
   │   │
   │   ├─> Vector Search
   │   │   └─> Pinecone.query(vector)
   │   │       └─> Top 5 relevant documents
   │   │
   │   ├─> Context Augmentation
   │   │   └─> Combine: user query + relevant docs
   │   │
   │   ├─> LLM Generation
   │   │   ├─> Try OpenAI GPT-4
   │   │   │   └─> If fails: fallback to Gemini
   │   │   └─> Generate response
   │   │
   │   └─> Response Post-processing
   │       └─> Format, sanitize, validate
   │
   ├─> Cache response in Redis
   │   └─> TTL: 1 hour
   │
   └─> Response
       {
         answer: "To improve cash flow...",
         sources: [...],
         confidence: 0.95
       }
```

### Background Job Flow

```
1. Enqueue Job
   │
   ├─> Service calls: queue.add('generate-report', data)
   │
   ├─> BullMQ adds job to Redis queue
   │
   └─> Returns job ID

2. Job Processing
   │
   ├─> Worker polls Redis queue
   │
   ├─> Pick up job
   │
   ├─> AIProcessor.handleGenerateReport(data)
   │   ├─> Fetch user data
   │   ├─> Generate report with AI
   │   ├─> Store in database
   │   └─> Send email notification
   │
   ├─> Update job status
   │
   └─> Remove from queue (if successful)
       OR retry (if failed, max 3 attempts)
```

---

## 🌐 Deployment Architecture (Azure)

### Azure Infrastructure

```
┌─────────────────────────────────────────────────────────────────┐
│                      AZURE SUBSCRIPTION                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Resource Group: rg-finarva-production         │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Virtual Network: vnet-finarva-production            │ │ │
│  │  │  Address Space: 10.0.0.0/16                          │ │ │
│  │  │                                                      │ │ │
│  │  │  ┌────────────────────────────────────────────────┐ │ │ │
│  │  │  │  Subnet: snet-app (10.0.1.0/24)               │ │ │ │
│  │  │  │                                                │ │ │ │
│  │  │  │  ┌──────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │  Virtual Machine                         │ │ │ │ │
│  │  │  │  │  • Ubuntu 22.04 LTS                      │ │ │ │ │
│  │  │  │  │  • Standard_D4s_v3                       │ │ │ │ │
│  │  │  │  │  • Docker + Docker Compose               │ │ │ │ │
│  │  │  │  │  • Nginx (reverse proxy + SSL)           │ │ │ │ │
│  │  │  │  │  • Finarva API Container                 │ │ │ │ │
│  │  │  │  └──────────────────────────────────────────┘ │ │ │ │
│  │  │  │                                                │ │ │ │
│  │  │  │  ┌──────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │  Network Security Group                  │ │ │ │ │
│  │  │  │  │  • Allow 443 (HTTPS)                     │ │ │ │ │
│  │  │  │  │  • Allow 80 (HTTP -> redirect)           │ │ │ │ │
│  │  │  │  │  • Allow 22 (SSH - whitelisted IPs)      │ │ │ │ │
│  │  │  │  └──────────────────────────────────────────┘ │ │ │ │
│  │  │  └────────────────────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Public IP: pip-finarva-production                   │ │ │
│  │  │  • Static allocation                                 │ │ │
│  │  │  • DNS: api.finarva.com                              │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Azure Redis Cache: redis-finarva-production         │ │ │
│  │  │  • Standard tier, 6GB                                │ │ │
│  │  │  • TLS encryption                                    │ │ │
│  │  │  • Private endpoint                                  │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Azure PostgreSQL Flexible Server (Optional)         │ │ │
│  │  │  • General Purpose, 4 vCores                         │ │ │
│  │  │  • 128GB storage                                     │ │ │
│  │  │  • Auto-backups (7 days retention)                   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Storage Account: stfinarvaproduction                │ │ │
│  │  │  • Blob containers for backups                       │ │ │
│  │  │  • File shares for logs                              │ │ │
│  │  │  • Geo-redundant storage                             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Application Insights: appi-finarva-production       │ │ │
│  │  │  • Performance monitoring                            │ │ │
│  │  │  • Error tracking                                    │ │ │
│  │  │  • Custom metrics                                    │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │  Log Analytics Workspace                             │ │ │
│  │  │  • Centralized logging                               │ │ │
│  │  │  • Query and analysis                                │ │ │
│  │  │  • Alerts and dashboards                             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│              LAYER 1: NETWORK SECURITY                   │
│  • Azure NSG (Network Security Group)                   │
│  • IP Whitelisting for SSH                              │
│  • DDoS protection                                       │
│  • Private endpoints for Azure services                 │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────────┐
│              LAYER 2: TRANSPORT SECURITY                 │
│  • TLS 1.3 encryption (Let's Encrypt)                   │
│  • HSTS (HTTP Strict Transport Security)                │
│  • Certificate auto-renewal                             │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────────┐
│         LAYER 3: APPLICATION SECURITY                    │
│  • Helmet.js security headers                           │
│  • CORS configuration                                   │
│  • Rate limiting (100 req/min)                          │
│  • Request size limits                                  │
│  • XSS protection                                       │
│  • CSRF protection                                      │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────────┐
│         LAYER 4: AUTHENTICATION & AUTHORIZATION          │
│  • JWT with RS256 algorithm                             │
│  • Access tokens (15min expiry)                         │
│  • Refresh tokens (7 days, Redis-backed)                │
│  • Role-based access control (RBAC)                     │
│  • Password hashing (bcrypt, 10 rounds)                 │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────────┐
│              LAYER 5: DATA SECURITY                      │
│  • Encrypted database connections (SSL/TLS)             │
│  • Redis TLS encryption                                 │
│  • Environment variable encryption                      │
│  • Secrets in Azure Key Vault                           │
│  • Database backups encryption                          │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────────┐
│            LAYER 6: MONITORING & AUDIT                   │
│  • Application Insights logging                         │
│  • Security event tracking                              │
│  • Audit trails for sensitive operations                │
│  • Anomaly detection                                    │
│  • Alert notifications                                  │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Scalability & Performance

### Horizontal Scaling Strategy

```
Load Balancer (Azure LB / App Gateway)
    │
    ├─── VM Instance 1 (Auto-scaled)
    │    └─── Docker: Finarva API
    │
    ├─── VM Instance 2 (Auto-scaled)
    │    └─── Docker: Finarva API
    │
    └─── VM Instance N (Auto-scaled)
         └─── Docker: Finarva API

         All sharing:
         • Redis Cache (session affinity)
         • PostgreSQL (connection pooling)
         • Azure Storage
```

### Performance Optimizations

1. **Caching Strategy**
   - Redis caching for frequently accessed data
   - Cache TTL based on data volatility
   - Cache invalidation on updates

2. **Database Optimization**
   - Prisma query optimization
   - Database indexing on frequently queried fields
   - Connection pooling (max 100 connections)
   - Read replicas for read-heavy operations

3. **API Optimization**
   - Response compression (gzip)
   - Pagination for large datasets
   - Field selection to minimize payload
   - Rate limiting to prevent abuse

4. **Background Processing**
   - BullMQ for async operations
   - Job prioritization
   - Retry logic with exponential backoff

---

## 📈 Monitoring Dashboard

### Key Metrics Tracked

```
Application Performance
├── Request Rate (req/sec)
├── Response Time (p50, p95, p99)
├── Error Rate (%)
└── Throughput (MB/sec)

Infrastructure Health
├── CPU Usage (%)
├── Memory Usage (%)
├── Disk I/O
└── Network I/O

Business Metrics
├── Active Users
├── API Calls by Endpoint
├── AI Query Volume
└── Payment Transactions

Security Metrics
├── Failed Authentication Attempts
├── Rate Limit Violations
├── Suspicious Activity
└── Security Scan Results
```

---

**This architecture is designed for:**

- ✅ High availability (99.9% uptime)
- ✅ Horizontal scalability
- ✅ Security best practices
- ✅ Performance optimization
- ✅ Easy maintenance
- ✅ Cost efficiency

For deployment details, see [Azure Deployment Guide](infrastructure/azure/DEPLOYMENT_GUIDE.md).
