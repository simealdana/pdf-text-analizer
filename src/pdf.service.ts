import { Injectable, BadRequestException } from '@nestjs/common';
import { UploadedPdfFile } from './types/upload.types';
import pdfParse from 'pdf-parse';

@Injectable()
export class PdfService {
  constructor() {}

  async extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(fileBuffer);
      return data.text || '';
    } catch (error) {
      console.warn(
        'PDF extraction warning:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return '';
    }
  }

  async extractDetailedInfo(fileBuffer: Buffer): Promise<any> {
    try {
      const data = await pdfParse(fileBuffer);

      return {
        numpages: data.numpages || 0,
        numrender: data.numrender || 0,
        info: data.info || null,
        metadata: data.metadata || null,
        text: data.text || '',
        version: data.version || null,
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
        warning:
          'PDF may contain only images or be corrupted. No text could be extracted.',
      };
    }
  }

  async extractPagesInfo(fileBuffer: Buffer): Promise<
    Array<{
      page: number;
      text: string;
      metadata: any;
      nextPage: number | null;
    }>
  > {
    try {
      const data = await pdfParse(fileBuffer);
      const totalPages = data.numpages || 0;

      if (totalPages === 0) {
        return [];
      }

      const pages: Array<{
        page: number;
        text: string;
        metadata: any;
        nextPage: number | null;
      }> = [];

      const fullText = data.text || '';
      const textPerPage = this.splitTextByPagesIntelligently(
        fullText,
        totalPages,
      );

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const pageText = textPerPage[pageNum - 1] || '';

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

  private splitTextByPagesIntelligently(
    text: string,
    totalPages: number,
  ): string[] {
    const normalizedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const paragraphs = normalizedText.split(/\n\n+/);
    const paragraphsPerPage = Math.ceil(paragraphs.length / totalPages);

    const pages: string[] = [];
    let currentPage = '';
    let paragraphCount = 0;

    for (const paragraph of paragraphs) {
      currentPage += paragraph + '\n\n';
      paragraphCount++;

      if (
        paragraphCount >= paragraphsPerPage &&
        pages.length < totalPages - 1
      ) {
        pages.push(currentPage.trim());
        currentPage = '';
        paragraphCount = 0;
      }
    }

    if (currentPage.trim() || pages.length === 0) {
      pages.push(currentPage.trim());
    }

    while (pages.length < totalPages) {
      pages.push('');
    }

    if (pages.length > totalPages) {
      const lastPage = pages.slice(totalPages - 1).join('\n\n');
      pages.splice(totalPages - 1, pages.length - totalPages + 1, lastPage);
    }

    return pages;
  }

  validatePdfFile(file: UploadedPdfFile): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File must be a PDF');
    }

    if (file.size === 0) {
      throw new BadRequestException('File is empty');
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        'File size too large. Maximum size is 50MB',
      );
    }
  }
}
