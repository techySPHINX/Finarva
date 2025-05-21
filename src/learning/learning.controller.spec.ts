import { Test, TestingModule } from '@nestjs/testing';
import { LearningController } from './learning.controller';

describe('LearningController', () => {
  let controller: LearningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningController],
    }).compile();

    controller = module.get<LearningController>(LearningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
