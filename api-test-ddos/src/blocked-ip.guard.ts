import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { BlockedIpService } from './blocked-ip.service';
import { Request } from 'express';

@Injectable()
export class BlockedIpGuard implements CanActivate {
  constructor(private readonly blockedIpService: BlockedIpService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    
    const blockInfo = this.blockedIpService.getBlockInfo(ip);
    
    if (blockInfo.blocked) {
      throw new UnauthorizedException({
        message: 'IP bloqueada',
        retryAfterSeconds: blockInfo.retryAfterSeconds,
        reason: 'Has superado el límite de intentos fallidos',
      });
    }
    
    return true;
  }
}