import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BlockedIpService } from './blocked-ip.service';

@Injectable()
export class AuthService {
  // Usuario válido simulado
  private readonly VALID_USER = {
    username: 'admin',
    password: 'password123',
  };

  constructor(private readonly blockedIpService: BlockedIpService) {}

  login(username: string, password: string, ip: string) {
    // Verificar si la IP está bloqueada
    const blockInfo = this.blockedIpService.getBlockInfo(ip);
    if (blockInfo.blocked) {
      throw new UnauthorizedException({
        message: 'IP bloqueada',
        retryAfterSeconds: blockInfo.retryAfterSeconds,
        reason: 'Demasiados intentos fallidos',
      });
    }

    // Verificar credenciales
    if (username === this.VALID_USER.username && password === this.VALID_USER.password) {
      // Login exitoso - registrar
      this.blockedIpService.recordSuccess(ip, '/auth/login');
      return {
        success: true,
        token: 'jwt-token-simulado-' + Date.now(),
        message: 'Login exitoso',
      };
    }

    // Login fallido - registrar y possibly bloquear
    const result = this.blockedIpService.recordFailedAttempt(ip, '/auth/login');
    
    if (result.blocked) {
      throw new UnauthorizedException({
        message: 'IP bloqueada',
        retryAfterSeconds: result.retryAfterSeconds,
        reason: 'Demasiados intentos fallidos',
        attempts: 'Se han registrado múltiples intentos fallidos',
      });
    }

    throw new UnauthorizedException({
      message: 'Credenciales inválidas',
      attemptsRemaining: 3, // Sugerencia
    });
  }

  // Endpoint para ver estado de bloqueo (para debugging)
  getBlockStatus(ip: string) {
    return this.blockedIpService.getBlockInfo(ip);
  }

  // Obtener logs
  getLogs(limit?: number) {
    return this.blockedIpService.getLogs(limit);
  }

  // Obtener IPs bloqueadas
  getBlockedIPs() {
    return this.blockedIpService.getCurrentlyBlocked();
  }
}