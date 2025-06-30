import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { getMetadataPrompt } from './prompts/metadata.prompt';
import { PdfMetadata } from './types/metadata.types';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateMetadata(text: string): Promise<PdfMetadata | null> {
    const apiKey = this.configService.get<string>('openai.apiKey');

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured');
      return null;
    }

    try {
      const prompt = getMetadataPrompt(text);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert document analysis assistant. Respond only with valid JSON following the specified format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 400,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const parsedResponse = JSON.parse(response) as unknown;

      let metadata: PdfMetadata;
      if (typeof parsedResponse === 'object' && parsedResponse !== null) {
        const responseObj = parsedResponse as Record<string, unknown>;
        if (responseObj.metadata && typeof responseObj.metadata === 'object') {
          metadata = responseObj.metadata as PdfMetadata;
        } else {
          metadata = parsedResponse as PdfMetadata;
        }
      } else {
        throw new Error('Invalid response format');
      }

      if (!metadata.description || !Array.isArray(metadata.keywords)) {
        throw new Error('Invalid metadata structure');
      }

      return {
        description: metadata.description,
        keywords: metadata.keywords,
      };
    } catch (error) {
      this.logger.error('Error generating metadata with OpenAI:', error);
      return null;
    }
  }
}
