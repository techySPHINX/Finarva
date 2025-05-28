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
exports.InvestmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InvestmentService = class InvestmentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.investment.create({ data });
        });
    }
    bulkCreate(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const investments = (_a = dto.investments) !== null && _a !== void 0 ? _a : [];
            const createPromises = investments.map((investment) => this.prisma.investment.create({ data: investment }));
            return Promise.all(createPromises);
        });
    }
    findAllByClient(clientId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.investment.findMany({
                where: {
                    clientId,
                    status: status || undefined,
                },
            });
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.investment.findUnique({ where: { id } });
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.investment.update({ where: { id }, data });
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.investment.delete({ where: { id } });
        });
    }
    findByClientAndTypes(clientId, types) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.investment.findMany({
                where: {
                    clientId,
                    type: { in: types },
                },
            });
        });
    }
};
exports.InvestmentService = InvestmentService;
exports.InvestmentService = InvestmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvestmentService);
