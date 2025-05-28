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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let QuizService = class QuizService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
    }
    createQuiz(dto, createdBy) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return this.prisma.quiz.create({
                data: Object.assign(Object.assign({}, dto), { description: (_a = dto.description) !== null && _a !== void 0 ? _a : '', createdBy }),
            });
        });
    }
    addQuestion(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ensure the quiz exists before adding question
            const quiz = yield this.prisma.quiz.findUnique({
                where: { id: dto.quizId },
            });
            if (!quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            return this.prisma.question.create({
                data: {
                    quizId: dto.quizId,
                    question: dto.question,
                    options: dto.options,
                    answer: dto.answer,
                    language: dto.language,
                },
            });
        });
    }
    getAllQuizzes(language_1, tags_1) {
        return __awaiter(this, arguments, void 0, function* (language, tags, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            return this.prisma.quiz.findMany({
                where: {
                    language,
                    tags: tags && tags.length > 0 ? { hasSome: tags } : undefined,
                },
                include: {
                    questions: true,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            });
        });
    }
    getQuizById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield this.prisma.quiz.findUnique({
                where: { id },
                include: { questions: true },
            });
            if (!quiz) {
                throw new common_1.NotFoundException('Quiz not found');
            }
            return quiz;
        });
    }
    updateQuiz(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.prisma.quiz.findUnique({ where: { id } });
            if (!existing)
                throw new common_1.NotFoundException('Quiz not found');
            return this.prisma.quiz.update({
                where: { id },
                data: dto,
            });
        });
    }
    deleteQuiz(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.prisma.quiz.findUnique({ where: { id } });
            if (!existing)
                throw new common_1.NotFoundException('Quiz not found');
            // Optionally: Delete related questions too (cascading not automatic in MongoDB)
            yield this.prisma.question.deleteMany({ where: { quizId: id } });
            return this.prisma.quiz.delete({ where: { id } });
        });
    }
    // Helper: Auto-score answers
    validateQuizAnswers(quizId, answers) {
        return __awaiter(this, void 0, void 0, function* () {
            const quiz = yield this.getQuizById(quizId);
            let score = 0;
            quiz.questions.forEach((q, idx) => {
                if (answers[idx] &&
                    answers[idx].toString().toLowerCase() === q.answer.toLowerCase()) {
                    score++;
                }
            });
            return { score, total: quiz.questions.length };
        });
    }
    submitQuiz(clientId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Check client exists
            const client = yield this.prisma.client.findUnique({
                where: { id: clientId },
            });
            if (!client)
                throw new common_1.NotFoundException('Client not found');
            // Auto-score if score is not provided or <= 0
            let score = (_a = dto.score) !== null && _a !== void 0 ? _a : 0;
            if (score <= 0) {
                const result = yield this.validateQuizAnswers(dto.quizId, dto.answers);
                score = result.score;
            }
            return this.prisma.clientQuizAttempt.create({
                data: {
                    clientId,
                    quizId: dto.quizId,
                    score,
                    answers: dto.answers,
                },
            });
        });
    }
    getAttemptsByClient(clientId_1) {
        return __awaiter(this, arguments, void 0, function* (clientId, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            return this.prisma.clientQuizAttempt.findMany({
                where: { clientId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    quiz: true,
                },
            });
        });
    }
    getQuizSuggestionsFromAI(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const client = yield this.prisma.client.findUnique({
                where: { id: clientId },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    agentId: true,
                    preferredLanguage: true,
                    interests: true,
                    goals: true,
                    quizAttempts: {
                        select: {
                            quizId: true,
                            score: true,
                            createdAt: true,
                        },
                    },
                },
            });
            if (!client) {
                throw new common_1.NotFoundException('Client not found');
            }
            const profile = {
                id: client.id,
                name: client.name,
                phone: client.phone,
                agentId: client.agentId,
                language: (_a = client.preferredLanguage) !== null && _a !== void 0 ? _a : 'en',
                goals: (_b = client.goals) !== null && _b !== void 0 ? _b : [],
            };
            const quizHistory = client.quizAttempts.map((attempt) => ({
                quizId: attempt.quizId,
                score: attempt.score,
                completedAt: attempt.createdAt.toISOString(),
            }));
            return this.aiService.generateQuizSuggestions(profile);
        });
    }
};
exports.QuizService = QuizService;
exports.QuizService = QuizService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], QuizService);
