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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningController = void 0;
const common_1 = require("@nestjs/common");
const learning_service_1 = require("./learning.service");
const create_learning_content_dto_1 = require("./dto/create-learning-content.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const record_progress_dto_1 = require("./dto/record-progress.dto");
let LearningController = class LearningController {
    constructor(learningService) {
        this.learningService = learningService;
    }
    create(dto, req) {
        return this.learningService.create(dto, req.user.id);
    }
    findAll(language, tags) {
        const tagArray = tags ? tags.split(',') : [];
        return this.learningService.findAll(language, tagArray);
    }
    findByClientProfile(profile) {
        return this.learningService.findByClientProfile(profile);
    }
    findOne(id) {
        return this.learningService.findOne(id);
    }
    recordProgress(contentId, dto, req) {
        return this.learningService.recordProgress(req.user.id, dto);
    }
};
exports.LearningController = LearningController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Upload learning content (video, audio, PDF)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Learning content created successfully' }),
    (0, swagger_1.ApiBody)({ type: create_learning_content_dto_1.CreateLearningContentDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_learning_content_dto_1.CreateLearningContentDto, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all learning content (filterable)' }),
    (0, swagger_1.ApiQuery)({ name: 'language', required: false, example: 'hi' }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: false, example: 'insurance,investment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of learning content' }),
    __param(0, (0, common_1.Query)('language')),
    __param(1, (0, common_1.Query)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('client-profile'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch personalized content based on client profile' }),
    (0, swagger_1.ApiQuery)({ name: 'language', required: false, example: 'en' }),
    (0, swagger_1.ApiQuery)({ name: 'goals', required: false, example: 'retirement,education' }),
    (0, swagger_1.ApiQuery)({ name: 'income', required: false, example: '20000' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "findByClientProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch a single learning content item by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Single learning item details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/progress'),
    (0, swagger_1.ApiOperation)({ summary: 'Record client progress on a learning item' }),
    (0, swagger_1.ApiBody)({ type: record_progress_dto_1.RecordProgressDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Progress recorded/updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, record_progress_dto_1.RecordProgressDto, Object]),
    __metadata("design:returntype", void 0)
], LearningController.prototype, "recordProgress", null);
exports.LearningController = LearningController = __decorate([
    (0, swagger_1.ApiTags)('Learning Content'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('learning'),
    __metadata("design:paramtypes", [learning_service_1.LearningService])
], LearningController);
