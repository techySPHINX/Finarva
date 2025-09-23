import { Test, TestingModule } from '@nestjs/testing';
import { MerchantAssistantService } from './merchant-assistant.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { VectorStoreService } from '../vector-store/vector-store.service';
import { CreateMerchantAssistantDto } from './dto/create-merchant-assistant.dto';
import { UpdateMerchantAssistantDto } from './dto/update-merchant-assistant.dto';

const mockPrismaService = {
  primary: {
    merchantAssistant: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
  readReplica: {
    merchantAssistant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
};

const mockAiService = {
  generateEmbedding: jest.fn(),
  callGeminiApi: jest.fn(),
};

const mockVectorStoreService = {
  getSimilarEmbeddings: jest.fn(),
  storeEmbedding: jest.fn(),
};

describe('MerchantAssistantService', () => {
  let service: MerchantAssistantService;
  let prisma: typeof mockPrismaService;
  let aiService: typeof mockAiService;
  let vectorStoreService: typeof mockVectorStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantAssistantService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: VectorStoreService,
          useValue: mockVectorStoreService,
        },
      ],
    }).compile();

    service = module.get<MerchantAssistantService>(MerchantAssistantService);
    prisma = module.get(PrismaService);
    aiService = module.get(AiService);
    vectorStoreService = module.get(VectorStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a merchant assistant interaction and store embeddings', async () => {
      const createDto: CreateMerchantAssistantDto = {
        merchantId: 'merchant123',
        query: 'How to increase sales?',
      };
      const queryEmbedding = [0.1, 0.2, 0.3];
      const aiResponse = 'Use social media.';
      const newInteraction = {
        id: 'interaction1',
        merchantId: createDto.merchantId,
        query: createDto.query,
        response: aiResponse,
      };

      aiService.generateEmbedding.mockResolvedValue(queryEmbedding);
      vectorStoreService.getSimilarEmbeddings.mockResolvedValue([]);
      aiService.callGeminiApi.mockResolvedValue(aiResponse);
      prisma.primary.merchantAssistant.create.mockResolvedValue(newInteraction);
      vectorStoreService.storeEmbedding.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(aiService.generateEmbedding).toHaveBeenCalledWith(createDto.query);
      expect(vectorStoreService.getSimilarEmbeddings).toHaveBeenCalledWith(
        queryEmbedding,
        createDto.merchantId,
        3,
      );
      expect(aiService.callGeminiApi).toHaveBeenCalled(); // Detailed check for prompt is complex, rely on integration tests for that
      expect(prisma.primary.merchantAssistant.create).toHaveBeenCalledWith({
        data: {
          merchantId: createDto.merchantId,
          query: createDto.query,
          response: aiResponse,
        },
      });
      expect(vectorStoreService.storeEmbedding).toHaveBeenCalledTimes(2);
      expect(vectorStoreService.storeEmbedding).toHaveBeenCalledWith(
        newInteraction.id,
        createDto.merchantId,
        queryEmbedding,
        'query',
      );
      expect(result).toEqual(newInteraction);
    });

    it('should include conversation history if similar interactions exist', async () => {
      const createDto: CreateMerchantAssistantDto = {
        merchantId: 'merchant123',
        query: 'How to increase sales?',
      };
      const queryEmbedding = [0.1, 0.2, 0.3];
      const similarInteractions = [
        {
          merchantAssistant: { query: 'Old query', response: 'Old response' },
        },
      ];
      const aiResponse = 'Use social media.';
      const newInteraction = {
        id: 'interaction1',
        merchantId: createDto.merchantId,
        query: createDto.query,
        response: aiResponse,
      };

      aiService.generateEmbedding.mockResolvedValue(queryEmbedding);
      vectorStoreService.getSimilarEmbeddings.mockResolvedValue(similarInteractions);
      aiService.callGeminiApi.mockResolvedValue(aiResponse);
      prisma.primary.merchantAssistant.create.mockResolvedValue(newInteraction);
      vectorStoreService.storeEmbedding.mockResolvedValue(undefined);

      await service.create(createDto);

      const expectedPromptPart = 'Previous Query: Old query\nPrevious Response: Old response';
      expect(aiService.callGeminiApi).toHaveBeenCalledWith(expect.stringContaining(expectedPromptPart), 500);
    });
  });

  describe('findAll', () => {
    it('should return all merchant assistant interactions', async () => {
      const interactions = [{ id: '1', merchantId: '1', query: 'q', response: 'r' }];
      prisma.readReplica.merchantAssistant.findMany.mockResolvedValue(interactions);

      const result = await service.findAll();

      expect(prisma.readReplica.merchantAssistant.findMany).toHaveBeenCalled();
      expect(result).toEqual(interactions);
    });
  });

  describe('findOne', () => {
    it('should return a single merchant assistant interaction', async () => {
      const id = 1;
      const interaction = { id: '1', merchantId: '1', query: 'q', response: 'r' };
      prisma.readReplica.merchantAssistant.findUnique.mockResolvedValue(interaction);

      const result = await service.findOne(id);

      expect(prisma.readReplica.merchantAssistant.findUnique).toHaveBeenCalledWith({ where: { id: String(id) } });
      expect(result).toEqual(interaction);
    });
  });

  describe('update', () => {
    it('should update a merchant assistant interaction', async () => {
      const id = 1;
      const updateDto: UpdateMerchantAssistantDto = { query: 'updated query' };
      const updatedInteraction = { id: '1', merchantId: '1', query: 'updated query', response: 'r' };
      prisma.primary.merchantAssistant.update.mockResolvedValue(updatedInteraction);

      const result = await service.update(id, updateDto);

      expect(prisma.primary.merchantAssistant.update).toHaveBeenCalledWith({
        where: { id: String(id) },
        data: updateDto,
      });
      expect(result).toEqual(updatedInteraction);
    });
  });

  describe('remove', () => {
    it('should delete a merchant assistant interaction', async () => {
      const id = 1;
      const deletedInteraction = { id: '1', merchantId: '1', query: 'q', response: 'r' };
      prisma.primary.merchantAssistant.delete.mockResolvedValue(deletedInteraction);

      const result = await service.remove(id);

      expect(prisma.primary.merchantAssistant.delete).toHaveBeenCalledWith({ where: { id: String(id) } });
      expect(result).toEqual(deletedInteraction);
    });
  });
});
