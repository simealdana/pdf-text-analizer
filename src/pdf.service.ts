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
      console.log('error', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to extract text from PDF: ${errorMessage}`,
      );
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
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to extract detailed info from PDF: ${errorMessage}`,
      );
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

      // Extract full text and split it intelligently by pages
      const fullText = data.text || '';
      const textPerPage = this.splitTextByPagesIntelligently(
        fullText,
        totalPages,
      );

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        pages.push({
          page: pageNum,
          text: textPerPage[pageNum - 1] || '',
          metadata: {
            pageInfo: data.info || null,
            pageMetadata: data.metadata || null,
            numrender: data.numrender || null,
            version: data.version || null,
            totalPages: totalPages,
            pageNumber: pageNum,
            characterCount: (textPerPage[pageNum - 1] || '').length,
            wordCount: (textPerPage[pageNum - 1] || '')
              .split(/\s+/)
              .filter((word) => word.length > 0).length,
          },
          nextPage: pageNum < totalPages ? pageNum + 1 : null,
        });
      }

      return pages;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      throw new BadRequestException(
        `Failed to extract pages info from PDF: ${errorMessage}`,
      );
    }
  }

  private splitTextByPagesIntelligently(
    text: string,
    totalPages: number,
  ): string[] {
    // Remove extra whitespace and normalize line breaks
    const normalizedText = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Split by paragraphs (double line breaks)
    const paragraphs = normalizedText.split(/\n\n+/);

    // Calculate approximate paragraphs per page
    const paragraphsPerPage = Math.ceil(paragraphs.length / totalPages);

    const pages: string[] = [];
    let currentPage = '';
    let paragraphCount = 0;

    for (const paragraph of paragraphs) {
      currentPage += paragraph + '\n\n';
      paragraphCount++;

      // Check if we should move to next page
      if (
        paragraphCount >= paragraphsPerPage &&
        pages.length < totalPages - 1
      ) {
        pages.push(currentPage.trim());
        currentPage = '';
        paragraphCount = 0;
      }
    }

    // Add the last page with remaining content
    if (currentPage.trim() || pages.length === 0) {
      pages.push(currentPage.trim());
    }

    // Ensure we have exactly totalPages elements
    while (pages.length < totalPages) {
      pages.push('');
    }

    // If we have more pages than expected, merge the last ones
    if (pages.length > totalPages) {
      const lastPage = pages.slice(totalPages - 1).join('\n\n');
      pages.splice(totalPages - 1, pages.length - totalPages + 1, lastPage);
    }

    return pages;
  }

  private splitTextByPages(text: string, totalPages: number): string[] {
    // Simple approach: split text evenly by pages
    // This is a basic implementation - in a real scenario, you might want
    // to use a more sophisticated PDF parsing library that supports per-page extraction
    const words = text.split(/\s+/);
    const wordsPerPage = Math.ceil(words.length / totalPages);
    const pages: string[] = [];

    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * wordsPerPage;
      const endIndex = Math.min(startIndex + wordsPerPage, words.length);
      const pageWords = words.slice(startIndex, endIndex);
      pages.push(pageWords.join(' '));
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
