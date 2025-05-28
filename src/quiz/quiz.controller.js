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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizController = void 0;
const common_1 = require("@nestjs/common");
const quiz_service_1 = require("./quiz.service");
const create_quiz_dto_1 = require("./dto/create-quiz.dto");
const add_question_dto_1 = require("./dto/add-question.dto");
const submit_quiz_dto_1 = require("./dto/submit-quiz.dto");
const update_quiz_dto_1 = require("./dto/update-quiz.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let QuizController = class QuizController {
    constructor(quizService) {
        this.quizService = quizService;
    }
    create(dto, req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.quizService.createQuiz(dto, req.user.id);
        });
    }
    addQuestion(dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.quizService.addQuestion(dto);
        });
    }
    findAll(lang_1, tags_1) {
        return __awaiter(this, arguments, void 0, function* (lang, tags, page = '1', limit = '10') {
            const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
            return yield this.quizService.getAllQuizzes(lang, tagArray, Number(page), Number(limit));
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.quizService.getQuizById(id);
        });
    }
    update(id, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.quizService.updateQuiz(id, dto);
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.quizService.deleteQuiz(id);
        });
    }
    submit(req, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.quizService.submitQuiz(req.user.id, dto);
        });
    }
    attempts(req_1) {
        return __awaiter(this, arguments, void 0, function* (req, page = '1', limit = '10') {
            return yield this.quizService.getAttemptsByClient(req.user.id, Number(page), Number(limit));
        });
    }
    getSuggestionsFromAI(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.quizService.getQuizSuggestionsFromAI(req.user.id);
        });
    }
};
exports.QuizController = QuizController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '📝 Create a new quiz' }),
    (0, swagger_1.ApiBody)({ type: create_quiz_dto_1.CreateQuizDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_quiz_dto_1.CreateQuizDto, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('question'),
    (0, swagger_1.ApiOperation)({ summary: '➕ Add a question to a quiz' }),
    (0, swagger_1.ApiBody)({ type: add_question_dto_1.AddQuestionDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [add_question_dto_1.AddQuestionDto]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "addQuestion", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '📚 Get all quizzes (with optional filters and pagination)' }),
    (0, swagger_1.ApiQuery)({ name: 'language', required: false, description: 'Language filter (e.g., en, hi)' }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: false, description: 'Comma-separated tags (e.g., insurance,investment)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number for pagination', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', example: 10 }),
    __param(0, (0, common_1.Query)('language')),
    __param(1, (0, common_1.Query)('tags')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '🔍 Get quiz by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quiz ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '✏️ Update quiz by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quiz ID' }),
    (0, swagger_1.ApiBody)({ type: update_quiz_dto_1.UpdateQuizDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_quiz_dto_1.UpdateQuizDto]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '🗑️ Delete quiz by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Quiz ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('submit'),
    (0, swagger_1.ApiOperation)({ summary: '📤 Submit quiz answers and score' }),
    (0, swagger_1.ApiBody)({ type: submit_quiz_dto_1.SubmitQuizDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, submit_quiz_dto_1.SubmitQuizDto]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)('attempts/client'),
    (0, swagger_1.ApiOperation)({ summary: '📈 Get all quiz attempts by current client (with pagination)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Page number for pagination', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Items per page', example: 10 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "attempts", null);
__decorate([
    (0, common_1.Get)('suggestions/ai'),
    (0, swagger_1.ApiOperation)({ summary: '🤖 Get AI-generated quiz suggestions for current client' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QuizController.prototype, "getSuggestionsFromAI", null);
exports.QuizController = QuizController = __decorate([
    (0, swagger_1.ApiTags)('Quiz'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('quiz'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [quiz_service_1.QuizService])
], QuizController);
