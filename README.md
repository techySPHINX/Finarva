# 🚀 Finarva AI Backend: The Financial OS for Microentrepreneurs

![NestJS](https://img.shields.io/badge/NestJS-Powered-red?style=for-the-badge&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/ORM-Prisma-lightgrey?style=for-the-badge&logo=prisma)
![OpenAI](https://img.shields.io/badge/AI-OpenAI-4B0082?style=for-the-badge&logo=openai)
![Gemini](https://img.shields.io/badge/AI-Gemini-black?style=for-the-badge&logo=google)
![Swagger](https://img.shields.io/badge/API-Docs-yellow?style=for-the-badge&logo=swagger)

> ✨ **Finarva AI Backend** is a robust and scalable platform built with NestJS, PostgreSQL, and Prisma, designed to empower microentrepreneurs with intelligent financial and operational tools.

---

## 🌟 Core Features

- 🤖 **AI Merchant Assistant**: Utilizes LLMs, RAG, and Pinecone DB to offer dynamic, context-aware guidance that streamlines business operations, boosts topline growth, and helps merchants adhere to marketplace best practices.
- 💡 **AI-Powered Financial Advisory**: Delivers personalized investment and insurance advice, driven by OpenAI GPT-4 and Gemini Pro models.
- 📊 **Expense Tracking & Management**: Helps microentrepreneurs manage their business finances effectively.
- 🌊 **Cash Flow Analysis & Forecasting**: Provides insights into cash flow and predicts future financial health.
- 💰 **Micro-loan & Credit Facilitation**: Connects entrepreneurs with potential funding opportunities.
- 📦 **Supply Chain Management**: Helps businesses track their inventory and manage their supply chain.
- 📈 **Business Analytics & Reporting**: Offers a consolidated view of business performance.
- 🧠 **Personalized, Multilingual Quizzes**: Engages users with tailored quizzes in their native language.
- 👤 **Client Management**: Manages detailed client profiles and preferences.
- 📚 **Smart Learning Recommendations**: Recommends relevant content based on user behavior.
- 🌍 **Multi-language Support**: Serves localized content to clients in their native languages.
- 🧩 **Modular & Scalable**: Built using a clean, service-repository pattern.
- 🧪 **Swagger API Docs**: Auto-generated, interactive API documentation.

---

## 🚀 Infrastructure and Performance Enhancements

- **Background Job Processing**: Integrated **BullMQ** to manage long-running tasks asynchronously, ensuring the main application remains fast and responsive.
- **Optimized Database Queries**: Enhanced query performance through indexing strategies and optimized data access patterns, reducing response times.
- **Database Scalability**: Implemented a **read-replica database** strategy to distribute load and improve data availability for read-heavy operations.
- **High Availability**: Leveraged **Node.js Clustering** to run multiple application instances in parallel, improving CPU utilization and overall throughput.

---

## 🏗️ Tech Stack

| Layer         | Technology                                                                          |
| ------------- | ----------------------------------------------------------------------------------- |
| Backend       | [NestJS](https://nestjs.com/)                                                       |
| Database      | [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/)        |
| AI Models     | [OpenAI GPT-4](https://platform.openai.com/) / [Gemini Pro](https://ai.google.dev/) |
| Vector DB     | [Pinecone](https://www.pinecone.io/)                                                |
| Documentation | Swagger + class-validator                                                           |
| Deployment    | Ready for Docker / CI-CD Pipelines                                                  |

---

## 📂 Folder Structure

```
📦 src
├── ai                # AI Integration layer (Gemini/OpenAI)
├── auth              # Authentication and authorization
├── cash-flow         # Cash flow analysis and forecasting
├── clients           # Client module (profile, preferences)
├── expenses          # Expense tracking and management
├── insurance         # Insurance suggestion logic
├── inventory         # Inventory and supply chain management
├── investment        # Investments & recommendations
├── learning          # Content learning logic
├── loans             # Micro-loan and credit facilitation
├── merchant-assistant# AI-powered merchant assistant
├── prisma            # Prisma schema & database setup
├── quiz              # Quiz suggestion, history & records
├── reporting         # Business analytics and reporting
└── vector-store      # Pinecone vector store integration
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js v18+
- PostgreSQL (Local or Docker)
- Prisma CLI
- OpenAI / Gemini API Key
- Pinecone API Key

### 📦 Installation

```bash
git clone https://github.com/your-username/finarva-ai-backend
cd finarva-ai-backend
npm install
```

---

### ⚙️ Setup `.env` File

Create a `.env` file in the root with the following content:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finarva"
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=your-gemini-key
PINECONE_API_KEY=your-pinecone-key
```

---

### 🔁 Prisma Setup

```bash
npx prisma generate
npx prisma db push
```

---

### ▶️ Run Dev Server

```bash
npm run start:dev
```

---

## 📖 API Documentation

> Access the interactive Swagger documentation at:

```
http://localhost:3000/api
```

Explore all endpoints, test requests, and view schemas.

---

## 🧪 Testing & Linting

```bash
npm run lint        # Run linter
npm run test        # Run unit tests
```

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

We welcome contributions! Please follow the standard GitHub flow: fork, branch, commit, and pull request.

---

> 🚀 _Empowering the next generation of microentrepreneurs through intelligence._
