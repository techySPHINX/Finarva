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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
const create_client_dto_1 = require("./dto/create-client.dto");
const update_client_dto_1 = require("./dto/update-client.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const ai_service_1 = require("../ai/ai.service");
const swagger_1 = require("@nestjs/swagger");
let ClientsController = class ClientsController {
    constructor(clientsService, aiService) {
        this.clientsService = clientsService;
        this.aiService = aiService;
    }
    create(dto, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const agentId = req.user.id;
            return this.clientsService.create(dto, agentId);
        });
    }
    findAll(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientsService.findAllByAgent(req.user.id);
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientsService.findOne(id);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientsService.update(id, dto);
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.clientsService.remove(id);
        });
    }
    getClientAiInsights(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const client = yield this.clientsService.findOne(id);
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
            return this.aiService.analyzeProfile(profile);
        });
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new client' }),
    (0, swagger_1.ApiBody)({ type: create_client_dto_1.CreateClientDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Client created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.CreateClientDto, Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all clients for authenticated agent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of clients for the agent' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a client by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Client ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a client by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Client ID' }),
    (0, swagger_1.ApiBody)({ type: update_client_dto_1.UpdateClientDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_client_dto_1.UpdateClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a client by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Client ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Client deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-generated insights for a client' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Client ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'AI insights generated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "getClientAiInsights", null);
exports.ClientsController = ClientsController = __decorate([
    (0, swagger_1.ApiTags)('Clients'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('clients'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [clients_service_1.ClientsService,
        ai_service_1.AiService])
], ClientsController);
