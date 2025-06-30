import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { UploadedPdfFile } from '../../shared/types/upload.types';
import { ApiKeyGuard } from '../../shared/guards/api-key.guard';
import {
  ExtractInfoMetadataDto,
  ExtractPagesMetadataDto,
} from './dto/metadata-flags.dto';
import {
  PdfTextResponseDto,
  PdfInfoResponseDto,
  PdfPagesResponseDto,
} from './dto/pdf-response.dto';

interface QueryParams {
  includeMetadata?: string;
  textLimit?: string;
}

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('extract-text')
  @UseInterceptors(FileInterceptor('pdf'))
  async extractPdfText(
    @UploadedFile() file: UploadedPdfFile | undefined,
  ): Promise<PdfTextResponseDto> {
    return this.pdfService.extractTextFromPdf(file);
  }

  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('extract-info')
  @UseInterceptors(FileInterceptor('pdf'))
  async extractPdfInfo(
    @UploadedFile() file: UploadedPdfFile | undefined,
    @Query() query: QueryParams,
  ): Promise<PdfInfoResponseDto> {
    const metadataFlags: ExtractInfoMetadataDto = {
      includeMetadata: query.includeMetadata === 'true',
      textLimit: query.textLimit ? parseInt(query.textLimit, 10) : undefined,
    };

    return this.pdfService.extractDetailedInfo(file, metadataFlags);
  }

  @UseGuards(ApiKeyGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('extract-pages')
  @UseInterceptors(FileInterceptor('pdf'))
  async extractPdfPages(
    @UploadedFile() file: UploadedPdfFile | undefined,
    @Query() query: QueryParams,
  ): Promise<PdfPagesResponseDto> {
    const metadataFlags: ExtractPagesMetadataDto = {
      includeMetadata: query.includeMetadata === 'true',
      textLimit: query.textLimit ? parseInt(query.textLimit, 10) : undefined,
    };

    return this.pdfService.extractPagesInfo(file, metadataFlags);
  }
}
