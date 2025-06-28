import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { PdfService } from './pdf.service';
import { UploadedPdfFile } from './types/upload.types';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('extract-pdf-text')
  @UseInterceptors(FileInterceptor('pdf'))
  async extractPdfText(@UploadedFile() file: UploadedPdfFile | undefined) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      this.pdfService.validatePdfFile(file);

      const extractedText = await this.pdfService.extractTextFromPdf(
        file.buffer,
      );

      return {
        success: true,
        message: 'Text extracted successfully',
        data: {
          filename: file.originalname,
          size: file.size,
          extractedText,
          characterCount: extractedText.length,
          wordCount: extractedText
            .split(/\s+/)
            .filter((word) => word.length > 0).length,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }

  @Post('extract-pdf-info')
  @UseInterceptors(FileInterceptor('pdf'))
  async extractPdfInfo(@UploadedFile() file: UploadedPdfFile | undefined) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      this.pdfService.validatePdfFile(file);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const detailedInfo = await this.pdfService.extractDetailedInfo(
        file.buffer,
      );

      return {
        success: true,
        message: 'PDF information extracted successfully',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: {
          filename: file.originalname,
          size: file.size,
          ...detailedInfo,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }

  @Post('extract-pdf-pages')
  @UseInterceptors(FileInterceptor('pdf'))
  async extractPdfPages(@UploadedFile() file: UploadedPdfFile | undefined) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      this.pdfService.validatePdfFile(file);

      const pagesInfo = await this.pdfService.extractPagesInfo(file.buffer);

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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }
}
