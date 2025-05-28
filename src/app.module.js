"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
// Core Modules
const prisma_module_1 = require("./prisma/prisma.module");
// Feature Modules
const auth_module_1 = require("./auth/auth.module");
const clients_module_1 = require("./clients/clients.module");
const insurance_module_1 = require("./insurance/insurance.module");
const investment_module_1 = require("./investment/investment.module");
const learning_module_1 = require("./learning/learning.module");
const quiz_module_1 = require("./quiz/quiz.module");
// AI Modules
const ai_module_1 = require("./ai/ai.module");
// import { ChatbotModule } from './ai/chatbot/chatbot.module';
// import { FinancialHealthModule } from './ai/financial-health/financial-health.module';
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Infrastructure
            prisma_module_1.PrismaModule,
            // Domain Modules
            auth_module_1.AuthModule,
            clients_module_1.ClientsModule,
            insurance_module_1.InsuranceModule,
            investment_module_1.InvestmentModule,
            learning_module_1.LearningModule,
            quiz_module_1.QuizModule,
            // AI Modules
            ai_module_1.AiModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
