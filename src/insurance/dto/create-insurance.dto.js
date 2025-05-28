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
exports.CreateInsuranceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateInsuranceDto {
}
exports.CreateInsuranceDto = CreateInsuranceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the client' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInsuranceDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of insurance' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInsuranceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Insurance amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInsuranceDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Premium amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInsuranceDto.prototype, "premium", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Term in months' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateInsuranceDto.prototype, "termMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Insurance provider' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInsuranceDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source of insurance' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInsuranceDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date of insurance', type: String, format: 'date-time' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInsuranceDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date of insurance', type: String, format: 'date-time' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInsuranceDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status of insurance' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInsuranceDto.prototype, "status", void 0);
