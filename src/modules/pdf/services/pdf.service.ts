import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadedPdfFile } from '../../../shared/types/upload.types';
import pdfParse from 'pdf-parse';
import {
  cleanText,
  splitTextByPages,
} from '../../../shared/utils/text-cleaner.util';
import { MetadataService } from './metadata.service';
import { PdfMetadata } from '../types/metadata.types';
import {
  ExtractInfoMetadataDto,
  ExtractPagesMetadataDto,
} from '../dto/metadata-flags.dto';
import {
  PdfTextResponseDto,
  PdfInfoResponseDto,
  PdfPagesResponseDto,
  PdfPageDto,
  PdfDetailedInfoDto,
} from '../dto/pdf-response.dto';

@Injectable()
export class PdfService {
  constructor(
    private readonly metadataService: MetadataService,
    private readonly configService: ConfigService,
  ) {}

  async extractTextFromPdf(
    file: UploadedPdfFile | undefined,
  ): Promise<PdfTextResponseDto> {
    this.validatePdfFile(file);

    const extractedText = await this.extractTextFromBuffer(file.buffer);

    return {
      success: true,
      message: 'Text extracted successfully',
      data: {
        filename: file.originalname,
        size: file.size,
        extractedText,
        characterCount: extractedText.length,
        wordCount: extractedText.split(/\s+/).filter((word) => word.length > 0)
          .length,
      },
    };
  }

  async extractDetailedInfo(
    file: UploadedPdfFile | undefined,
    metadataFlags: ExtractInfoMetadataDto,
  ): Promise<PdfInfoResponseDto> {
    this.validatePdfFile(file);

    const includeMetadata = Boolean(metadataFlags.includeMetadata);
    const textLimit = metadataFlags.textLimit ?? 4000;

    const detailedInfo: PdfDetailedInfoDto =
      await this.extractDetailedInfoFromBuffer(
        file.buffer,
        includeMetadata,
        textLimit,
      );

    return {
      success: true,
      message: 'PDF information extracted successfully',
      data: {
        filename: file.originalname,
        size: file.size,
        ...detailedInfo,
      },
    };
  }

  async extractPagesInfo(
    file: UploadedPdfFile | undefined,
    metadataFlags: ExtractPagesMetadataDto,
  ): Promise<PdfPagesResponseDto> {
    this.validatePdfFile(file);

    const includeMetadata = Boolean(metadataFlags.includeMetadata);
    const textLimit = metadataFlags.textLimit ?? 2000;

    const pagesInfo = await this.extractPagesInfoFromBuffer(
      file.buffer,
      includeMetadata,
      textLimit,
    );

    return {
      success: true,
      message: 'PDF pages information extracted successfully',
      data: {
        filename: file.originalname,
        size: file.size,
        totalPages: pagesInfo.length,
        pages: pagesInfo,
      },
    };
  }

  private async extractTextFromBuffer(fileBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(fileBuffer);
      return cleanText(data.text || '');
    } catch (error) {
      console.warn(
        'PDF extraction warning:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return '';
    }
  }

  private async extractDetailedInfoFromBuffer(
    fileBuffer: Buffer,
    includeMetadata = false,
    textLimit = 4000,
  ): Promise<PdfDetailedInfoDto> {
    try {
      const data = await pdfParse(fileBuffer);
      const cleanTextData = cleanText(data.text || '');

      let generatedMetadata: PdfMetadata | null = null;

      if (includeMetadata) {
        const truncatedText = this.truncateText(cleanTextData, textLimit);
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const meta =
            await this.metadataService.generateMetadata(truncatedText);
          if (
            meta &&
            typeof meta === 'object' &&
            'description' in meta &&
            'keywords' in meta
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            generatedMetadata = meta;
          } else {
            generatedMetadata = null;
          }
        } catch {
          generatedMetadata = null;
        }
      }

      return {
        numpages: data.numpages || 0,
        numrender: data.numrender || 0,
        info: data.info || null,
        metadata: data.metadata || null,
        text: cleanTextData,
        version: data.version || null,
        generatedMetadata,
      };
    } catch (error) {
      console.warn(
        'PDF extraction warning:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return {
        numpages: 0,
        numrender: 0,
        info: null,
        metadata: null,
        text: '',
        version: null,
        generatedMetadata: null,
        warning:
          'PDF may contain only images or be corrupted. No text could be extracted.',
      };
    }
  }

  private async extractPagesInfoFromBuffer(
    fileBuffer: Buffer,
    includeMetadata = false,
    textLimit = 2000,
  ): Promise<PdfPageDto[]> {
    try {
      const data = await pdfParse(fileBuffer);
      const totalPages = data.numpages || 0;

      if (totalPages === 0) {
        return [];
      }

      const fullText = cleanText(data.text || '');
      const textPerPage = splitTextByPages(fullText, totalPages);

      const pages: PdfPageDto[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pageText = cleanText(textPerPage[pageNum - 1] || '');

        let pageMetadata: PdfMetadata | null = null;

        if (includeMetadata) {
          const truncatedPageText = this.truncateText(pageText, textLimit);
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const meta =
              await this.metadataService.generateMetadata(truncatedPageText);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            pageMetadata = meta as PdfMetadata | null;
          } catch {
            pageMetadata = null;
          }
        }

        pages.push({
          page: pageNum,
          text: pageText,
          metadata: {
            pageInfo: data.info || null,
            pageMetadata: data.metadata || null,
            numrender: data.numrender || null,
            version: data.version || null,
            totalPages: totalPages,
            pageNumber: pageNum,
            characterCount: pageText.length,
            wordCount: pageText.split(/\s+/).filter((word) => word.length > 0)
              .length,
            generatedMetadata: pageMetadata,
          },
          nextPage: pageNum < totalPages ? pageNum + 1 : null,
        });
      }

      return pages;
    } catch (error) {
      console.warn(
        'PDF extraction warning:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return [];
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  private validatePdfFile(file: UploadedPdfFile | undefined): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File must be a PDF');
    }

    if (file.size === 0) {
      throw new BadRequestException('File is empty');
    }

    const maxSizeMB = this.configService.get<number>('pdf.maxFileSize', 50);
    const maxSize = maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size too large. Maximum size is ${maxSizeMB}MB`,
      );
    }
  }
}
