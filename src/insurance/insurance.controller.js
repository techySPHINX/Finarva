"use strict";
// src/insurance/insurance.controller.ts
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
exports.InsuranceController = void 0;
const common_1 = require("@nestjs/common");
const insurance_service_1 = require("./insurance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_insurance_dto_1 = require("./dto/create-insurance.dto");
const update_insurance_dto_1 = require("./dto/update-insurance.dto");
const ai_insurance_input_dto_1 = require("./dto/ai-insurance-input.dto");
const swagger_1 = require("@nestjs/swagger");
let InsuranceController = class InsuranceController {
    constructor(insuranceService) {
        this.insuranceService = insuranceService;
    }
    create(dto) {
        return this.insuranceService.create(dto);
    }
    findAll() {
        return this.insuranceService.findAll();
    }
    findByClient(clientId) {
        return this.insuranceService.findAllByClient(clientId);
    }
    findOne(id) {
        return this.insuranceService.findOne(id);
    }
    update(id, dto) {
        return this.insuranceService.update(id, dto);
    }
    suggestInsurance(dto) {
        return this.insuranceService.suggestInsurance(dto);
    }
};
exports.InsuranceController = InsuranceController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new insurance entry' }),
    (0, swagger_1.ApiBody)({ type: create_insurance_dto_1.CreateInsuranceDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_insurance_dto_1.CreateInsuranceDto]),
    __metadata("design:returntype", void 0)
], InsuranceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all insurance entries' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InsuranceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('client/:clientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all insurance entries for a client' }),
    (0, swagger_1.ApiParam)({ name: 'clientId', example: 'clxyz123' }),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InsuranceController.prototype, "findByClient", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific insurance entry by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InsuranceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update insurance entry by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_insurance_dto_1.UpdateInsuranceDto]),
    __metadata("design:returntype", void 0)
], InsuranceController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('suggest'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-powered insurance suggestions' }),
    (0, swagger_1.ApiBody)({ type: ai_insurance_input_dto_1.AiInsuranceInputDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_insurance_input_dto_1.AiInsuranceInputDto]),
    __metadata("design:returntype", void 0)
], InsuranceController.prototype, "suggestInsurance", null);
exports.InsuranceController = InsuranceController = __decorate([
    (0, swagger_1.ApiTags)('Insurance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('insurance'),
    __metadata("design:paramtypes", [insurance_service_1.InsuranceService])
], InsuranceController);
