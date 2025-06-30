import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './services/pdf.service';
import { MetadataService } from './services/metadata.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService, MetadataService],
  exports: [PdfService, MetadataService],
})
export class PdfModule {}
