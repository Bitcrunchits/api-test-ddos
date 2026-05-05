import { Injectable } from '@nestjs/common';

interface BlockedIP {
  ip: string;
  attempts: number;
  blockedUntil: number;
  createdAt: Date;
}

@Injectable()
export class BlockedIpService {
  private blockedIPs: Map<string, BlockedIP> = new Map();
  
  // Configuración de bloqueo progresivo
  private readonly BLOCK_THRESHOLDS = [
    { attempts: 3, durationMs: 60000 },  // 3 intentos → 1 minuto
    { attempts: 5, durationMs: 300000 }, // 5 intentos → 5 minutos
    { attempts: 7, durationMs: 3600000 }, // 7 intentos → 1 hora
  ];

  // Logging de intentos
  private attemptLog: Array<{
    ip: string;
    endpoint: string;
    timestamp: Date;
    success: boolean;
  }> = [];

  getBlockedIPs(): BlockedIP[] {
    return Array.from(this.blockedIPs.values());
  }

  isBlocked(ip: string): boolean {
    const blocked = this.blockedIPs.get(ip);
    if (!blocked) return false;
    
    if (Date.now() > blocked.blockedUntil) {
      // Desbloquear cuando expire el tiempo
      this.unblockIP(ip);
      return false;
    }
    return true;
  }

  getBlockInfo(ip: string): { blocked: boolean; retryAfterSeconds?: number } {
    const blocked = this.blockedIPs.get(ip);
    if (!blocked) return { blocked: false };
    
    if (Date.now() > blocked.blockedUntil) {
      this.unblockIP(ip);
      return { blocked: false };
    }
    
    const remainingMs = blocked.blockedUntil - Date.now();
    return {
      blocked: true,
      retryAfterSeconds: Math.ceil(remainingMs / 1000),
    };
  }

  recordFailedAttempt(ip: string, endpoint: string): { blocked: boolean; retryAfterSeconds?: number } {
    // Registrar el intento en el log
    this.attemptLog.push({
      ip,
      endpoint,
      timestamp: new Date(),
      success: false,
    });
    
    // Limitar log a últimos 1000 registros
    if (this.attemptLog.length > 1000) {
      this.attemptLog = this.attemptLog.slice(-1000);
    }

    let blocked = this.blockedIPs.get(ip);
    
    if (!blocked) {
      blocked = {
        ip,
        attempts: 0,
        blockedUntil: 0,
        createdAt: new Date(),
      };
      this.blockedIPs.set(ip, blocked);
    }

    blocked.attempts++;

    // Calcular duración del bloqueo según intentos
    let durationMs = 0;
    for (const threshold of this.BLOCK_THRESHOLDS) {
      if (blocked.attempts >= threshold.attempts) {
        durationMs = threshold.durationMs;
      }
    }

    if (durationMs > 0) {
      blocked.blockedUntil = Date.now() + durationMs;
    }

    console.log(`[BLOCK-LOG] IP: ${ip}, Intentos: ${blocked.attempts}, Endpoint: ${endpoint}, Bloqueado: ${durationMs > 0 ? 'SI' : 'NO'}`);

    return {
      blocked: durationMs > 0,
      retryAfterSeconds: durationMs > 0 ? Math.ceil(durationMs / 1000) : undefined,
    };
  }

  recordSuccess(ip: string, endpoint: string) {
    this.attemptLog.push({
      ip,
      endpoint,
      timestamp: new Date(),
      success: true,
    });
  }

  private unblockIP(ip: string) {
    this.blockedIPs.delete(ip);
  }

  // Obtener logs
  getLogs(limit: number = 100): Array<{
    ip: string;
    endpoint: string;
    timestamp: Date;
    success: boolean;
  }> {
    return this.attemptLog.slice(-limit);
  }

  // Obtener IPs bloqueadas actualmente
  getCurrentlyBlocked(): Array<{ ip: string; attempts: number; retryAfterSeconds: number }> {
    const blocked: Array<{ ip: string; attempts: number; retryAfterSeconds: number }> = [];
    
    for (const [ip, data] of this.blockedIPs) {
      if (Date.now() < data.blockedUntil) {
        blocked.push({
          ip,
          attempts: data.attempts,
          retryAfterSeconds: Math.ceil((data.blockedUntil - Date.now()) / 1000),
        });
      }
    }
    
    return blocked;
  }

  // Resetear todo (para testing)
  reset() {
    this.blockedIPs.clear();
    this.attemptLog = [];
  }
}