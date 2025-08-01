import { Injectable } from '@nestjs/common';
import { CreateMerchantAssistantDto } from './dto/create-merchant-assistant.dto';
import { UpdateMerchantAssistantDto } from './dto/update-merchant-assistant.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { VectorStoreService } from '../vector-store/vector-store.service';

@Injectable()
export class MerchantAssistantService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private vectorStoreService: VectorStoreService,
  ) {}

  async create(createMerchantAssistantDto: CreateMerchantAssistantDto) {
    const { merchantId, query } = createMerchantAssistantDto;

    const queryEmbedding = await this.aiService.generateEmbedding(query);

    const similarInteractions = await this.vectorStoreService.getSimilarEmbeddings(
      queryEmbedding,
      merchantId,
      3, 
    );

    let conversationHistory = '';
    if (similarInteractions.length > 0) {
      conversationHistory = similarInteractions
        .map(
          (interaction) =>
            `Previous Query: ${interaction.merchantAssistant.query}\nPrevious Response: ${interaction.merchantAssistant.response}`,
        )
        .join('\n\n');
    }

    const merchantContext = `Merchant ID: ${merchantId}`;
    const fullPrompt = `As an AI Merchant Assistant for microentrepreneurs, provide actionable insights based on the following query. Consider aspects like enhancing operational efficiency, marketing impact, and sales performance. Incorporate the following conversation history if relevant:\n\n${conversationHistory}\n\nNew Query: ${query}. Context: ${merchantContext}`;

    const aiResponse = await this.aiService.callGeminiApi(fullPrompt, 500);

    const newInteraction = await this.prisma.merchantAssistant.create({
      data: {
        merchantId,
        query,
        response: aiResponse,
      },
    });

    await this.vectorStoreService.storeEmbedding(
      newInteraction.id,
      merchantId,
      queryEmbedding,
      'query',
    );
    const responseEmbedding = await this.aiService.generateEmbedding(aiResponse);
    await this.vectorStoreService.storeEmbedding(
      newInteraction.id,
      merchantId,
      responseEmbedding,
      'response',
    );

    return newInteraction;
  }

  findAll() {
    return this.prisma.merchantAssistant.findMany();
  }

  findOne(id: number) {
    return this.prisma.merchantAssistant.findUnique({ where: { id: String(id) } });
  }

  update(id: number, updateMerchantAssistantDto: UpdateMerchantAssistantDto) {
    return this.prisma.merchantAssistant.update({
      where: { id: String(id) },
      data: updateMerchantAssistantDto,
    });
  }

  remove(id: number) {
    return this.prisma.merchantAssistant.delete({ where: { id: String(id) } });
  }
}
