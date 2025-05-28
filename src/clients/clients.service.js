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
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsService = class ClientsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data, agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.client.create({
                data: Object.assign(Object.assign({}, data), { agentId }),
            });
        });
    }
    findAllByAgent(agentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.client.findMany({
                where: { agentId },
                orderBy: { createdAt: 'desc' },
            });
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.prisma.client.findUnique({ where: { id } });
            if (!client) {
                throw new common_1.NotFoundException(`Client with id ${id} not found`);
            }
            return client;
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.prisma.client.findUnique({ where: { id } });
            if (!existing) {
                throw new common_1.NotFoundException(`Client with id ${id} not found`);
            }
            return this.prisma.client.update({
                where: { id },
                data,
            });
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield this.prisma.client.findUnique({ where: { id } });
            if (!existing) {
                throw new common_1.NotFoundException(`Client with id ${id} not found`);
            }
            return this.prisma.client.delete({ where: { id } });
        });
    }
    getClientProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const client = yield this.findOne(id);
            return {
                id: client.id,
                name: client.name,
                phone: client.phone,
                language: client.language,
                age: (_a = client.age) !== null && _a !== void 0 ? _a : undefined,
                gender: (_b = client.gender) !== null && _b !== void 0 ? _b : undefined,
                income: (_c = client.income) !== null && _c !== void 0 ? _c : undefined,
                goals: client.goals,
                agentId: client.agentId,
            };
        });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsService);
