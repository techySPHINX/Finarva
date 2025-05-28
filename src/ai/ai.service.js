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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let AiService = class AiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        this.baseUrl = 'https://api.gemini.ai/v1';
        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY not set');
        }
    }
    callGeminiApi(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const response = yield axios_1.default.post(`${this.baseUrl}/chat/completions`, payload, {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                return response.data;
            }
            catch (error) {
                throw new common_1.HttpException(`Gemini API error: ${((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message}`, common_1.HttpStatus.BAD_GATEWAY);
            }
        });
    }
    /**
     * Generate 3 quiz questions relevant to a microentrepreneur client profile.
     */
    generateQuizSuggestions(clientProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const prompt = `You are an AI assistant. Generate 3 relevant quiz questions (without answers/options) for a microentrepreneur client with profile:\n${JSON.stringify(clientProfile)}`;
            const payload = {
                model: 'gemini-1',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 250,
            };
            const result = yield this.callGeminiApi(payload);
            const rawText = ((_c = (_b = (_a = result.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '';
            // Split questions by new lines, filtering empty lines
            const questions = rawText
                .split('\n')
                .map((q) => q.trim())
                .filter((q) => q.length > 0);
            return questions;
        });
    }
    /**
     * Analyze learning content engagement and suggest new content.
     */
    analyzeLearningContent(profile, learningStats) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const prompt = `Analyze the learning content engagement for the client profile:\n${JSON.stringify(profile)}\nGiven the learning content stats:\n${JSON.stringify(learningStats)}\nProvide a summary and suggest new content topics or improvements.`;
            const payload = {
                model: 'gemini-1',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
            };
            const result = yield this.callGeminiApi(payload);
            return ((_c = (_b = (_a = result.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || 'No analysis available.';
        });
    }
    /**
     * Suggest personalized investment strategies.
     */
    suggestInvestments(clientProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const prompt = `Based on the client profile:\n${JSON.stringify(clientProfile)}\nSuggest personalized investment strategies considering goals, income, and risk tolerance.`;
            const payload = {
                model: 'gemini-1',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
            };
            const result = yield this.callGeminiApi(payload);
            return ((_c = (_b = (_a = result.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || 'No investment suggestions available.';
        });
    }
    /**
     * Suggest suitable insurance plans.
     */
    suggestInsurance(clientProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const prompt = `Based on the client profile below, suggest suitable insurance plans with justifications:\n${JSON.stringify(clientProfile)}\nPlease consider age, occupation, income, dependents, existing insurance, and health status.`;
            const payload = {
                model: 'gemini-1',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 300,
            };
            const result = yield this.callGeminiApi(payload);
            return ((_c = (_b = (_a = result.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || 'No insurance suggestions available.';
        });
    }
    analyzeProfile(clientProfile) {
        return __awaiter(this, void 0, void 0, function* () {
            const [quizSuggestions, investmentAdvice, insuranceAdvice] = yield Promise.all([
                this.generateQuizSuggestions(clientProfile),
                this.suggestInvestments(clientProfile),
                this.suggestInsurance(clientProfile),
            ]);
            return {
                quizSuggestions,
                investmentAdvice,
                insuranceAdvice,
            };
        });
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
