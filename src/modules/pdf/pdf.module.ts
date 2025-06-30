import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { MetadataService } from './metadata.service';

@Module({
  controllers: [PdfController],
  providers: [PdfService, MetadataService],
  exports: [PdfService, MetadataService],
})
export class PdfModule {}
