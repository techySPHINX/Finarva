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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentController = void 0;
const common_1 = require("@nestjs/common");
const investment_service_1 = require("./investment.service");
const create_investment_dto_1 = require("./dto/create-investment.dto");
const update_investment_dto_1 = require("./dto/update-investment.dto");
const swagger_1 = require("@nestjs/swagger");
let InvestmentController = class InvestmentController {
    constructor(investmentService) {
        this.investmentService = investmentService;
    }
    create(dto) {
        return this.investmentService.create(dto);
    }
    findAllByClient(clientId) {
        return this.investmentService.findAllByClient(clientId);
    }
    findOne(id) {
        return this.investmentService.findOne(id);
    }
    update(id, dto) {
        return this.investmentService.update(id, dto);
    }
    remove(id) {
        return this.investmentService.remove(id);
    }
};
exports.InvestmentController = InvestmentController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new investment' }),
    (0, swagger_1.ApiBody)({ type: create_investment_dto_1.CreateInvestmentDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Investment successfully created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_investment_dto_1.CreateInvestmentDto]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('client/:clientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all investments for a specific client' }),
    (0, swagger_1.ApiParam)({ name: 'clientId', description: 'ID of the client' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of client investments' }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "findAllByClient", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific investment by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Investment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an investment by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Investment ID' }),
    (0, swagger_1.ApiBody)({ type: update_investment_dto_1.UpdateInvestmentDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_investment_dto_1.UpdateInvestmentDto]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an investment by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Investment ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Investment removed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InvestmentController.prototype, "remove", null);
exports.InvestmentController = InvestmentController = __decorate([
    (0, swagger_1.ApiTags)('Investments'),
    (0, common_1.Controller)('investments'),
    __metadata("design:paramtypes", [investment_service_1.InvestmentService])
], InvestmentController);
