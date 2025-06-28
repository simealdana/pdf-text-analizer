import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfService } from './pdf.service';
import { ApiKeyGuard } from './auth/api-key.guard';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService) => [
        {
          ttl: 60000,
          limit: (configService as ConfigService).get<number>(
            'rateLimit.perMinute',
          ),
        },
        {
          ttl: 3600000,
          limit: (configService as ConfigService).get<number>(
            'rateLimit.perHour',
          ),
        },
      ],
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PdfService, ApiKeyGuard],
})
export class AppModule {}
