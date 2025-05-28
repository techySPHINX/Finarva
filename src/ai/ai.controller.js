"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const quiz_suggestion_dto_1 = require("./dto/quiz-suggestion.dto");
const insurance_suggestion_dto_1 = require("./dto/insurance-suggestion.dto");
const content_insight_dto_1 = require("./dto/content-insight.dto");
const investment_suggestion_dto_1 = require("./dto/investment-suggestion.dto");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    mapAnalyzeToClientProfile(analyze) {
        return {
            id: 'unknown-id',
            name: 'unknown-name',
            phone: 'unknown-phone',
            agentId: 'unknown-agent',
            language: analyze.language || 'unknown-language',
            goals: analyze.goals || [],
        };
    }
    generateQuizQuestions(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
            return this.aiService.generateQuizSuggestions(clientProfile);
        });
    }
    analyzeLearningContent(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
            return this.aiService.analyzeLearningContent(clientProfile, dto.learningData);
        });
    }
    suggestInvestments(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
            return this.aiService.suggestInvestments(clientProfile);
        });
    }
    suggestInsurance(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
            return this.aiService.suggestInsurance(clientProfile);
        });
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('quiz-suggestions'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate quiz questions based on client profile' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [quiz_suggestion_dto_1.QuizSuggestionDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "generateQuizQuestions", null);
__decorate([
    (0, common_1.Post)('content-insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Analyze learning content engagement for a client' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [content_insight_dto_1.ContentInsightDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "analyzeLearningContent", null);
__decorate([
    (0, common_1.Post)('investment-suggestions'),
    (0, swagger_1.ApiOperation)({
        summary: 'Suggest investment strategies based on client profile',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [investment_suggestion_dto_1.InvestmentSuggestionDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "suggestInvestments", null);
__decorate([
    (0, common_1.Post)('insurance-suggestions'),
    (0, swagger_1.ApiOperation)({ summary: 'Suggest insurance plans based on client profile' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [insurance_suggestion_dto_1.InsuranceSuggestionDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "suggestInsurance", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)('AI Assistant'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
