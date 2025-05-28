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
exports.AiInsuranceInputDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AiInsuranceInputDto {
}
exports.AiInsuranceInputDto = AiInsuranceInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the client' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AiInsuranceInputDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Age of the client', type: Number }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AiInsuranceInputDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Gender of the client', type: String }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AiInsuranceInputDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Monthly income of the client', type: Number }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AiInsuranceInputDto.prototype, "monthlyIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Existing insurance types', type: [String], example: ['life', 'health'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AiInsuranceInputDto.prototype, "existingInsuranceTypes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Insurance goals', type: [String], example: ['family protection', 'hospitalization'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AiInsuranceInputDto.prototype, "goals", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Dependents of the client', type: [String], example: ['spouse', '2 children'] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AiInsuranceInputDto.prototype, "dependents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Location of the client', example: 'urban' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AiInsuranceInputDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Occupation of the client' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AiInsuranceInputDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Health status of the client', example: 'diabetic' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AiInsuranceInputDto.prototype, "healthStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Preferred language for recommendations' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AiInsuranceInputDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile of the client for suggesting insurance',
        type: Object,
        example: {
            age: 32,
            occupation: 'Farmer',
            income: 40000,
            dependents: 3,
            existingInsurance: false,
            healthStatus: 'Good',
        },
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], AiInsuranceInputDto.prototype, "clientProfile", void 0);
