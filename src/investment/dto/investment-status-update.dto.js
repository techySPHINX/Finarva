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
exports.InvestmentStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class InvestmentStatusDto {
}
exports.InvestmentStatusDto = InvestmentStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the investment' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvestmentStatusDto.prototype, "investmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New status of the investment (e.g., active, matured, withdrawn)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvestmentStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional remarks or comments about the status change' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvestmentStatusDto.prototype, "remarks", void 0);
