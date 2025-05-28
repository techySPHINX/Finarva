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
exports.LearningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LearningService = class LearningService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto, creatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.learningContent.create({
                data: Object.assign(Object.assign({}, dto), { createdById: creatorId }),
            });
        });
    }
    // Update existing content
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.learningContent.update({
                where: { id },
                data: dto,
            });
        });
    }
    // Get all content optionally filtered by language and tags
    findAll(language_1) {
        return __awaiter(this, arguments, void 0, function* (language, tags = []) {
            return this.prisma.learningContent.findMany({
                where: {
                    language: language || undefined,
                    tags: tags.length ? { hasSome: tags } : undefined,
                },
            });
        });
    }
    // Get one content by ID
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.prisma.learningContent.findUnique({ where: { id } });
            if (!content)
                throw new common_1.NotFoundException('Learning content not found');
            return content;
        });
    }
    // Personalized content for a client based on profile
    findByClientProfile(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            const { preferredLanguage, goals, occupation, investmentExperience } = profile;
            return this.prisma.learningContent.findMany({
                where: {
                    language: preferredLanguage || undefined,
                    OR: [
                        (goals === null || goals === void 0 ? void 0 : goals.length) ? { tags: { hasSome: goals } } : undefined,
                        occupation ? { tags: { has: occupation } } : undefined,
                        investmentExperience ? { tags: { has: investmentExperience } } : undefined,
                    ].filter(Boolean),
                },
            });
        });
    }
    // Track client's progress on learning content
    recordProgress(clientId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.learningProgress.upsert({
                where: {
                    clientId_contentId: {
                        clientId,
                        contentId: dto.contentId,
                    },
                },
                update: {
                    progress: dto.progress,
                    lastAccessedAt: new Date(),
                },
                create: {
                    clientId,
                    contentId: dto.contentId,
                    progress: dto.progress,
                    lastAccessedAt: new Date(),
                },
            });
        });
    }
    // Get all progress records for a client
    getClientProgress(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.learningProgress.findMany({
                where: { clientId },
                include: {
                    content: true,
                },
            });
        });
    }
};
exports.LearningService = LearningService;
exports.LearningService = LearningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LearningService);
