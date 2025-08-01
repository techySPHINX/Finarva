import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Pinecone, Index } from '@pinecone-database/pinecone';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VectorStoreService implements OnModuleInit {
  private readonly logger = new Logger(VectorStoreService.name);
  private pinecone!: Pinecone;
  private pineconeIndex!: Index;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const pineconeApiKey = process.env.PINECONE_API_KEY;
      const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT;

      if (!pineconeApiKey) {
        throw new Error('PINECONE_API_KEY environment variable not set.');
      }
      if (!pineconeEnvironment) {
        throw new Error('PINECONE_ENVIRONMENT environment variable not set.');
      }

      this.pinecone = new Pinecone({
        apiKey: pineconeApiKey,
      });

      const indexName = process.env.PINECONE_INDEX_NAME;
      if (!indexName) {
        throw new Error('PINECONE_INDEX_NAME environment variable not set.');
      }

      // Check if the index exists, and create it if it doesn't
      const describeIndex = await this.pinecone.describeIndex(indexName);
      if (!describeIndex) {
        this.logger.log(`Pinecone index '${indexName}' not found. Creating...`);
        await this.pinecone.createIndex({
          name: indexName,
          dimension: 768, 
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });
        this.logger.log(`Pinecone index '${indexName}' created.`);
      }

      this.pineconeIndex = this.pinecone.index(indexName);
      this.logger.log(`Pinecone initialized and connected to index: ${indexName}`);
    } catch (error) {
      this.logger.error(
        `Failed to initialize Pinecone: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async storeEmbedding(
    id: string,
    merchantId: string,
    embedding: number[],
    type: 'query' | 'response',
  ) {
    try {
      await this.pineconeIndex.upsert([
        {
          id: id,
          values: embedding,
          metadata: { merchantId, type },
        },
      ]);
      this.logger.log(`Stored embedding for ID: ${id}, Type: ${type}`);
    } catch (error) {
      this.logger.error(
        `Failed to store embedding for ID ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getSimilarEmbeddings(
    queryEmbedding: number[],
    merchantId: string,
    limit = 3,
  ): Promise<any[]> {
    try {
      const queryResult = await this.pineconeIndex.query({
        vector: queryEmbedding,
        topK: limit,
        filter: {
          merchantId: { '$eq': merchantId },
        },
        includeMetadata: true,
      });

      const matchedIds = queryResult.matches.map((match) => match.id);

      if (matchedIds.length === 0) {
        return [];
      }

      const interactions = await this.prisma.merchantAssistant.findMany({
        where: {
          id: {
            in: matchedIds,
          },
        },
      });

      const sortedInteractions = queryResult.matches.map((match) => {
        const interaction = interactions.find((int) => int.id === match.id);
        return {
          ...interaction,
          pineconeScore: match.score,
          pineconeMetadata: match.metadata,
        };
      });

      return sortedInteractions;
    } catch (error) {
      this.logger.error(
        `Failed to get similar embeddings for merchantId ${merchantId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
