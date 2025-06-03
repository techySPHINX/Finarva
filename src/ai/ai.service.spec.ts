import { AiService } from './ai.service';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'fake-api-key';
    service = new AiService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call Gemini API and return quiz questions', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '1. What is income?\n2. What is savings?\n3. What is risk?',
                },
              ],
            },
          },
        ],
      },
    });

    const result = await service.generateQuizSuggestions({
      id: '1',
      name: 'Test',
      phone: '1234567890',
      agentId: 'agent1',
      language: 'en',
      goals: ['saving'],
    });

    expect(result.length).toBe(3);
    expect(result[0]).toContain('What');
  });

  it('should throw an error on API failure', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: { message: 'Invalid API key' } } },
      message: 'Request failed',
    });

    await expect(
      service.generateQuizSuggestions({
        id: '1',
        name: 'Test',
        phone: '1234567890',
        agentId: 'agent1',
        language: 'en',
        goals: ['saving'],
      }),
    ).rejects.toThrow(HttpException);
  });
});
