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
exports.BulkCreateInvestmentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class CreateInvestmentItemDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Client ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentItemDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Investment type, e.g., "Small Cap", "Gold", etc.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Investment amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvestmentItemDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Investment start date', type: String, format: 'date-time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInvestmentItemDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Investment status, e.g., "active", "matured", "withdrawn"' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Returns on investment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInvestmentItemDto.prototype, "returns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source of investment, e.g., "PartnerAPI", "Manual"' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvestmentItemDto.prototype, "source", void 0);
class BulkCreateInvestmentDto {
}
exports.BulkCreateInvestmentDto = BulkCreateInvestmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [CreateInvestmentItemDto],
        description: 'Array of investments to create'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateInvestmentItemDto),
    __metadata("design:type", Object)
], BulkCreateInvestmentDto.prototype, "investments", void 0);
