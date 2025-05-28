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
exports.UpdateInsuranceDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const swagger_1 = require("@nestjs/swagger");
const create_insurance_dto_1 = require("./create-insurance.dto");
class UpdateInsuranceDto extends (0, mapped_types_1.PartialType)(create_insurance_dto_1.CreateInsuranceDto) {
}
exports.UpdateInsuranceDto = UpdateInsuranceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'The name of the insurance' }),
    __metadata("design:type", String)
], UpdateInsuranceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'The type of the insurance' }),
    __metadata("design:type", String)
], UpdateInsuranceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'The premium amount' }),
    __metadata("design:type", Number)
], UpdateInsuranceDto.prototype, "premium", void 0);
