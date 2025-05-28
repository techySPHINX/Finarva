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
exports.InvestmentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class InvestmentResponseDto {
}
exports.InvestmentResponseDto = InvestmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the investment' }),
    __metadata("design:type", String)
], InvestmentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the client who made the investment' }),
    __metadata("design:type", String)
], InvestmentResponseDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of investment (e.g., mutual fund, stock, etc.)' }),
    __metadata("design:type", String)
], InvestmentResponseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount invested' }),
    __metadata("design:type", Number)
], InvestmentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date of the investment', type: String, format: 'date-time' }),
    __metadata("design:type", Date)
], InvestmentResponseDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Current status of the investment (e.g., active, closed)' }),
    __metadata("design:type", String)
], InvestmentResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Returns generated from the investment' }),
    __metadata("design:type", Number)
], InvestmentResponseDto.prototype, "returns", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Source or platform of the investment' }),
    __metadata("design:type", String)
], InvestmentResponseDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when the investment was created', type: String, format: 'date-time' }),
    __metadata("design:type", Date)
], InvestmentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp when the investment was last updated', type: String, format: 'date-time' }),
    __metadata("design:type", Date)
], InvestmentResponseDto.prototype, "updatedAt", void 0);
