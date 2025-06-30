import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PdfModule } from './modules/pdf/pdf.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
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
    AuthModule,
    HealthModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
