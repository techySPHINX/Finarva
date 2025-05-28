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
exports.SuggestSummaryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SuggestSummaryDto {
}
exports.SuggestSummaryDto = SuggestSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the client receiving the suggestion' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestSummaryDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Type of suggestion (e.g., quiz, learning, investment)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestSummaryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Text content of the suggestion' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SuggestSummaryDto.prototype, "suggestion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional metadata associated with the suggestion',
        type: 'object',
        additionalProperties: true,
        example: { source: 'AI Engine', topic: 'Mutual Funds' }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SuggestSummaryDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional confidence score (0 to 1) indicating suggestion reliability',
        example: 0.85
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SuggestSummaryDto.prototype, "confidence", void 0);
