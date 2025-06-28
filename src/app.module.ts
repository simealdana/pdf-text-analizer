import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfService } from './pdf.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
      {
        ttl: 3600000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, PdfService],
})
export class AppModule {}
