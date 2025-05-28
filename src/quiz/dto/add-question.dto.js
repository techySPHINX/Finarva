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
exports.AddQuestionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AddQuestionDto {
}
exports.AddQuestionDto = AddQuestionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the quiz to which this question belongs',
        example: 'quiz123',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddQuestionDto.prototype, "quizId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The actual question text',
        example: 'What is the capital of France?',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddQuestionDto.prototype, "question", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of possible options',
        example: ['Paris', 'London', 'Berlin', 'Madrid'],
        type: [String],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], AddQuestionDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The correct answer from the options',
        example: 'Paris',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddQuestionDto.prototype, "answer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Language of the question',
        example: 'en',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddQuestionDto.prototype, "language", void 0);
