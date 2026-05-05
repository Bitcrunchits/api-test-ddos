import { Controller, Post, Body, Get, Headers, UnauthorizedException, Ip, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ login: { ttl: 60000, limit: 5 } })
  login(
    @Body() body: { username: string; password: string },
    @Ip() ip: string,
  ) {
    return this.authService.login(body.username, body.password, ip);
  }

  // Endpoint para ver estado de bloqueo de la IP actual
  @Get('status')
  getStatus(@Ip() ip: string) {
    return {
      ip,
      ...this.authService.getBlockStatus(ip),
    };
  }

  // Endpoint para ver logs (solo para debugging)
  @Get('logs')
  getLogs(@Headers('x-admin-key') adminKey: string) {
    if (adminKey !== 'admin-secret') {
      throw new UnauthorizedException('Acceso no autorizado');
    }
    return {
      logs: this.authService.getLogs(50),
      blockedIPs: this.authService.getBlockedIPs(),
    };
  }
}