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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientInvestmentProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ClientInvestmentProfileDto {
}
exports.ClientInvestmentProfileDto = ClientInvestmentProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the client' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClientInvestmentProfileDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total investment amount of the client', example: 100000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientInvestmentProfileDto.prototype, "totalInvestmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of active investments', example: 3 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientInvestmentProfileDto.prototype, "activeInvestmentsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of matured investments', example: 2 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientInvestmentProfileDto.prototype, "maturedInvestmentsCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of withdrawn investments', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientInvestmentProfileDto.prototype, "withdrawnInvestmentsCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Types of investments',
        example: ['Small Cap', 'Gold', 'Stocks'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ClientInvestmentProfileDto.prototype, "investmentTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Risk profile of the client',
        example: 'Conservative',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ClientInvestmentProfileDto.prototype, "riskProfile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Average returns percentage',
        example: 7.5,
        type: Number,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ClientInvestmentProfileDto.prototype, "averageReturns", void 0);
