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
exports.CreateInvestmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateInvestmentDto {
}
exports.CreateInvestmentDto = CreateInvestmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the client associated with the investment',
        example: '60f5a3e9e1d2c9001c9b2b3e',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of investment',
        example: 'Small Cap',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount invested',
        example: 5000,
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvestmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date of the investment',
        type: String,
        format: 'date-time',
        example: '2024-06-01T00:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of the investment',
        example: 'active',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Returns generated from the investment',
        example: 650.75,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvestmentDto.prototype, "returns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Source of the investment entry (e.g., PartnerAPI, Manual)',
        example: 'PartnerAPI',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentDto.prototype, "source", void 0);
