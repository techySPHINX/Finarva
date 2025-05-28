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
exports.InsuranceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let InsuranceService = class InsuranceService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
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
    create(data) {
        var _a;
        const insuranceData = Object.assign(Object.assign({}, data), { status: (_a = data.status) !== null && _a !== void 0 ? _a : 'pending' });
        return this.prisma.insurance.create({ data: insuranceData });
    }
    findAll() {
        return this.prisma.insurance.findMany({ include: { client: true } });
    }
    findAllByClient(clientId) {
        return this.prisma.insurance.findMany({ where: { clientId } });
    }
    findOne(id) {
        return this.prisma.insurance.findUnique({ where: { id } });
    }
    update(id, data) {
        return this.prisma.insurance.update({ where: { id }, data });
    }
    remove(id) {
        return this.prisma.insurance.delete({ where: { id } });
    }
    suggestInsurance(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!dto.clientProfile) {
                throw new Error('clientProfile is required');
            }
            const clientProfile = this.mapAnalyzeToClientProfile(dto.clientProfile);
            return this.aiService.suggestInsurance(clientProfile);
        });
    }
};
exports.InsuranceService = InsuranceService;
exports.InsuranceService = InsuranceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], InsuranceService);
