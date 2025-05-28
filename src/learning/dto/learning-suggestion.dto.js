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
exports.LearningSuggestionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class LearningHistoryItem {
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Content ID", example: "abc123" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LearningHistoryItem.prototype, "contentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Completion percentage", example: 100 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LearningHistoryItem.prototype, "completion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Viewed at timestamp", example: "2024-06-01T12:00:00Z" }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], LearningHistoryItem.prototype, "viewedAt", void 0);
class LearningSuggestionDto {
}
exports.LearningSuggestionDto = LearningSuggestionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: "Preferred language", example: "en" }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LearningSuggestionDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "User interests",
        type: [String],
        example: ["finance", "technology"]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], LearningSuggestionDto.prototype, "interests", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "User profile information",
        type: "object",
        additionalProperties: true,
        example: {
            name: "John Doe",
            age: 30,
            occupation: "Engineer",
            investmentExperience: "Intermediate"
        }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], LearningSuggestionDto.prototype, "profile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Learning history",
        type: [LearningHistoryItem],
        example: [
            {
                contentId: "abc123",
                completion: 100,
                viewedAt: "2024-06-01T12:00:00Z"
            }
        ]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => LearningHistoryItem),
    __metadata("design:type", Array)
], LearningSuggestionDto.prototype, "learningHistory", void 0);
