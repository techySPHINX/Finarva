import { IsString, IsOptional, IsArray } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class GetLearningContentQueryDto {
  @ApiPropertyOptional({
    description: "Language of the learning content",
    example: "en",
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: "Tags to filter the learning content",
    type: [String],
    example: ["typescript", "nestjs"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
