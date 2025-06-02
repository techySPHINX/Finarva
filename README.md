# 🧠 Finarva AI Backend – Empowering Microentrepreneurs with Intelligence

![NestJS](https://img.shields.io/badge/NestJS-Powered-red?style=for-the-badge&logo=nestjs)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![Prisma](https://img.shields.io/badge/ORM-Prisma-blue?style=for-the-badge&logo=prisma)
![OpenAI](https://img.shields.io/badge/AI-OpenAI-4B0082?style=for-the-badge&logo=openai)
![Gemini](https://img.shields.io/badge/AI-Gemini-black?style=for-the-badge&logo=google)
![Swagger](https://img.shields.io/badge/API-Docs-yellow?style=for-the-badge&logo=swagger)

> ✨ A powerful NestJS backend for the **Gromo Platform**, enabling AI-driven quiz generation, investment advice, insurance suggestions, and personalized learning for India's microentrepreneurs.

---

## 🌟 Features

- 👤 **Client Management** – Manage detailed client profiles and preferences
- 🧠 **AI-Generated Quiz Suggestions** – Personalized quiz generation using Gemini/OpenAI
- 📚 **Smart Learning Recommendations** – Recommend relevant content based on behavior
- 📈 **Investment Engine** – Assist with small-cap, gold, equity investments & more
- 🛡️ **Insurance Advisory** – Intelligent suggestions based on client background
- 🌍 **Multi-language Support** – Serve localized content to clients in their native languages
- 🧩 **Modular & Scalable** – Built using a clean, service-repository pattern
- 🧪 **Swagger API Docs** – Auto-generated, interactive API documentation

---

## 🏗️ Tech Stack

| Layer         | Technology                                                                          |
| ------------- | ----------------------------------------------------------------------------------- |
| Backend       | [NestJS](https://nestjs.com/)                                                       |
| Database      | [MongoDB](https://www.mongodb.com/) + [Prisma](https://www.prisma.io/)              |
| AI Models     | [OpenAI GPT-4](https://platform.openai.com/) / [Gemini Pro](https://ai.google.dev/) |
| Documentation | Swagger + class-validator                                                           |
| Deployment    | Ready for Docker / CI-CD Pipelines                                                  |

---

## 📂 Folder Structure

```
📦 src
├── ai                # AI Integration layer (Gemini/OpenAI)
├── client            # Client module (profile, preferences)
├── quiz              # Quiz suggestion, history & records
├── investment        # Investments & recommendations
├── insurance         # Insurance suggestion logic
├── learning          # Content learning logic
├── common            # DTOs, interceptors, validators
└── prisma            # Prisma schema & database setup
```

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js v18+
- MongoDB (Local or Atlas)
- Prisma CLI
- OpenAI / Gemini API Key

### 📦 Installation

```bash
git clone https://github.com/techySPHINX/Finarva
cd Finarva
npm install
```

---

### ⚙️ Setup `.env` File

Create a `.env` file in the root with the following content:

```env
DATABASE_URL=mongodb://localhost:27017/gromo
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=your-gemini-key
```

---

### 🔁 Prisma Setup

```bash
npx prisma generate
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

## 🤖 AI Integration Highlights

- Uses **client profile**, **quiz history**, and **language** to generate:
  - 📊 **Quiz Suggestions**
  - 📚 **Content Recommendations**
  - 🛡️ **Investment & Insurance Advice**

> Easily switch between **OpenAI** and **Gemini** via `AiService`.

---

## 📤 Sample Payloads

### 🎯 Quiz Suggestion Request

```json
POST /ai/quiz-suggestions

{
  "profile": {
    "name": "Ravi",
    "age": 32,
    "occupation": "Street Vendor",
    "interests": ["insurance", "savings"],
    "investmentExperience": "beginner"
  },
  "quizHistory": [],
  "language": "hi"
}
```

---

### 📚 Learning Content Suggestion

```json
POST /ai/learning-suggestions

{
  "profile": {
    "age": 28,
    "occupation": "Tailor",
    "investmentExperience": "beginner"
  },
  "interests": ["mutual funds", "budgeting"]
}
```

---

## 🧪 Testing & Linting

```bash
npm run lint        # Run linter
npm run test        # Run unit tests
```

---

## 💡 Developer Tips

- Use `@nestjs/swagger` decorators to auto-generate docs
- DTOs are validated with `class-validator`
- Prisma handles MongoDB integration with schema enforcement
- Modular folders make future extension a breeze

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

We welcome contributions!

```bash
# Clone and create a new branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git commit -m "feat: added investment insight AI"

# Push and open a PR 🚀
git push origin feature/your-feature-name
```

---

## 👨‍💻 Maintainer

Made with ❤️ by [Jagan Kumar Hotta](https://github.com/techySPHINX)

---

> 🚀 _Powering the next generation of microentrepreneurs through intelligence._
