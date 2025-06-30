import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MetadataService } from '../services/metadata.service';

describe('MetadataService', () => {
  let service: MetadataService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MetadataService>(MetadataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMetadata', () => {
    it('should return null when OpenAI API key is not configured', async () => {
      mockConfigService.get.mockReturnValue(null);

      const result = (await service.generateMetadata(
        'Sample text content',
      )) as unknown;

      expect(result).toBeNull();
      expect(mockConfigService.get).toHaveBeenCalledWith('openai.apiKey');
    });

    it('should return null when OpenAI API key is empty string', async () => {
      mockConfigService.get.mockReturnValue('');

      const result = (await service.generateMetadata(
        'Sample text content',
      )) as unknown;

      expect(result).toBeNull();
    });

    it('should generate metadata successfully with valid API key', async () => {
      const mockApiKey = 'sk-test-api-key';
      const mockText =
        'This is a sample document about artificial intelligence and machine learning.';

      mockConfigService.get.mockReturnValue(mockApiKey);

      // Mock the OpenAI response
      const mockOpenAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                metadata: {
                  description:
                    'A document discussing artificial intelligence and machine learning concepts.',
                  keywords: [
                    'artificial intelligence',
                    'machine learning',
                    'AI',
                    'ML',
                  ],
                },
              }),
            },
          },
        ],
      };

      // Mock the OpenAI client
      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockOpenAIResponse),
          },
        },
      };

      // Mock the getOpenAI method
      jest.spyOn(service as any, 'getOpenAI').mockReturnValue(mockOpenAI);

      const result = (await service.generateMetadata(mockText)) as unknown;

      expect(result).toEqual({
        description:
          'A document discussing artificial intelligence and machine learning concepts.',
        keywords: ['artificial intelligence', 'machine learning', 'AI', 'ML'],
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert document analysis assistant. Respond only with valid JSON following the specified format.',
          },
          {
            role: 'user',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
            content: expect.stringContaining(mockText),
          },
        ],
        temperature: 0.3,
        max_tokens: 400,
      });
    });

    it('should handle OpenAI API errors gracefully', async () => {
      const mockApiKey = 'sk-test-api-key';
      mockConfigService.get.mockReturnValue(mockApiKey);

      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockRejectedValue(new Error('OpenAI API error')),
          },
        },
      };

      jest.spyOn(service as any, 'getOpenAI').mockReturnValue(mockOpenAI);

      const result = (await service.generateMetadata('Sample text')) as unknown;

      expect(result).toBeNull();
    });

    it('should handle invalid JSON response from OpenAI', async () => {
      const mockApiKey = 'sk-test-api-key';
      mockConfigService.get.mockReturnValue(mockApiKey);

      const mockOpenAIResponse = {
        choices: [
          {
            message: {
              content: 'Invalid JSON response',
            },
          },
        ],
      };

      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockOpenAIResponse),
          },
        },
      };

      jest.spyOn(service as any, 'getOpenAI').mockReturnValue(mockOpenAI);

      const result = (await service.generateMetadata('Sample text')) as unknown;

      expect(result).toBeNull();
    });

    it('should handle empty response from OpenAI', async () => {
      const mockApiKey = 'sk-test-api-key';
      mockConfigService.get.mockReturnValue(mockApiKey);

      const mockOpenAIResponse = {
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      };

      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockOpenAIResponse),
          },
        },
      };

      jest.spyOn(service as any, 'getOpenAI').mockReturnValue(mockOpenAI);

      const result = (await service.generateMetadata('Sample text')) as unknown;

      expect(result).toBeNull();
    });

    it('should handle response without metadata structure', async () => {
      const mockApiKey = 'sk-test-api-key';
      mockConfigService.get.mockReturnValue(mockApiKey);

      const mockOpenAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                description: 'Sample description',
                keywords: ['sample', 'keywords'],
              }),
            },
          },
        ],
      };

      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockOpenAIResponse),
          },
        },
      };

      jest.spyOn(service as any, 'getOpenAI').mockReturnValue(mockOpenAI);

      const result = (await service.generateMetadata('Sample text')) as unknown;

      expect(result).toEqual({
        description: 'Sample description',
        keywords: ['sample', 'keywords'],
      });
    });

    it('should handle response with missing required fields', async () => {
      const mockApiKey = 'sk-test-api-key';
      mockConfigService.get.mockReturnValue(mockApiKey);

      const mockOpenAIResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                metadata: {
                  description: 'Sample description',
                  // Missing keywords field
                },
              }),
            },
          },
        ],
      };

      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockOpenAIResponse),
          },
        },
      };

      jest.spyOn(service as any, 'getOpenAI').mockReturnValue(mockOpenAI);

      const result = (await service.generateMetadata('Sample text')) as unknown;

      expect(result).toBeNull();
    });
  });
});
