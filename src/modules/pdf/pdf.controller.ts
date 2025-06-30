import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { UploadedPdfFile } from '../../shared/types/upload.types';
import { ApiKeyGuard } from '../../shared/guards/api-key.guard';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('extract-text')
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

  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('extract-info')
  @UseInterceptors(FileInterceptor('pdf'))
  async extractPdfInfo(@UploadedFile() file: UploadedPdfFile | undefined) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      this.pdfService.validatePdfFile(file);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const detailedInfo: any = await this.pdfService.extractDetailedInfo(
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

  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('extract-pages')
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
