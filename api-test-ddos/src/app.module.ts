import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BlockedIpService } from './blocked-ip.service';
import { BlockedIpGuard } from './blocked-ip.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto global
      },
      {
        name: 'login',
        ttl: 60000, // 1 minuto
        limit: 5, // 5 intentos por minuto en login
      },
    ]),
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    AuthService,
    BlockedIpService,
    BlockedIpGuard,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
