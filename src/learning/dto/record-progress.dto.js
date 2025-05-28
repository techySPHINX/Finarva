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
exports.RecordProgressDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class RecordProgressDto {
}
exports.RecordProgressDto = RecordProgressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the client', example: 'client123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordProgressDto.prototype, "clientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the content', example: 'content456' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordProgressDto.prototype, "contentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Completion percentage', minimum: 0, maximum: 100, example: 75 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], RecordProgressDto.prototype, "completion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional progress data', example: { step: 2, status: 'in-progress' }, required: false }),
    __metadata("design:type", Object)
], RecordProgressDto.prototype, "progress", void 0);
