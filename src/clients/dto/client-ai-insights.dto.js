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
exports.ClientAiInsightsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class ClientAiInsightsDto {
}
exports.ClientAiInsightsDto = ClientAiInsightsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Create a quiz about saving habits', 'Send content on digital payments'] }),
    __metadata("design:type", Array)
], ClientAiInsightsDto.prototype, "quizSuggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Add learning content on financial literacy'] }),
    __metadata("design:type", Array)
], ClientAiInsightsDto.prototype, "contentSuggestions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: ['Mutual funds for beginners', 'Micro insurance plans'] }),
    __metadata("design:type", Array)
], ClientAiInsightsDto.prototype, "investmentSuggestions", void 0);
