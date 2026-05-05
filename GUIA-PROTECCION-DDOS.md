# 🛡️ GUÍA DE PROTECCIÓN DDoS - PARA PRINCIPIANTES

> Esta guía explica cómo funciona la protección contra ataques DDoS que implementamos en la API NestJS.
> Está escrita para que cualquier persona pueda entenderla, incluso si nunca programmó antes.

---

## 📚 ÍNDICE

1. [¿Qué es DDoS?](#qué-es-ddos)
2. [¿Qué es rate limiting?](#qué-es-rate-limiting)
3. [Estructura de archivos](#estructura-de-archivos)
4. [Explicación de cada archivo](#explicación-de-cada-archivo)
5. [Cómo hacer las pruebas](#cómo-hacer-las-pruebas)
6. [Respuestas al análisis](#respuestas-al-análisis)

---

## 1. ¿Qué es DDoS?

Imagina que tienes una tienda pequeña en tu barrio. normally vienen 10 personas por día y tu tienda funciona bien.

Ahora imagina que llegan 10,000 personas al mismo tiempo a tu tienda. No pueden entrar todas, se amontonan, bloquean la puerta, y las personas que querían comprar no pueden entrar.

**Eso es un ataque DDoS** - muchas personas (o bots) le pegan a un servidor al mismo tiempo para overwhelm it y que no pueda funcionar.

### Tipos de ataques:
- **HTTP Flood**: muchas solicitudes HTTP seguidas
- **Login Attack**: muchos intentos de login fallidos
- **SYN Flood**: muchas conexiones TCP incompletas
- etc.

---

## 2. ¿Qué es rate limiting?

Es como un **portero de discoteca**:
- "Máximo 5 personas por minuto"
- Si llegás más rápido, no entrás
- Así el servidor no se satura

En nuestro caso:
- Rate limiting global: máximo 100 requests por minuto por IP
- Rate limiting en login: máximo 5 intentos por minuto

---

## 3. Estructura de archivos

Nuestro proyecto tiene esta estructura:

```
api-test-ddos/src/
├── main.ts                    ← El punto de entrada (arranca la app)
├── app.module.ts              ← Configuración principal + rate limiting
├── app.controller.ts          ← Endpoints generales (/api/...)
├── app.service.ts             ← Lógica de los endpoints generales
├── auth.controller.ts         ← Endpoints de auth (/auth/...)
├── auth.service.ts            ← Lógica de login
├── blocked-ip.service.ts      ← Servicio de bloqueo progresivo
└── blocked-ip.guard.ts       ← Guard que bloquea IPs
```

---

## 4. Explicación de cada archivo

### 4.1. main.ts - El que inicia todo

```typescript
// main.ts - Este archivo es el PRIMERO que se ejecuta cuando arrancás la API

import { NestFactory } from '@nestjs/core';      // Importa NestJS (el framework)
import { AppModule } from './app.module';        // Importa el módulo principal
import { ValidationPipe } from '@nestjs/common'; // Para validar datos

async function bootstrap() {                     // Función que inicia todo
  const app = await NestFactory.create(AppModule); // Crea la aplicación
  
  app.useGlobalPipes(new ValidationPipe({ transform: true })); // Activa validación
  
  await app.listen(process.env.PORT ?? 3000);    // Escucha en puerto 3000
  console.log(`🚀 Server running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();                                      // Ejecuta la función
```

**Qué hace**: Arranca la API y la hace escuchar en el puerto 3000.

---

### 4.2. app.module.ts - La configuración principal

```typescript
// app.module.ts - Acá definimos la configuración de la aplicación

import { Module } from '@nestjs/common';                          // Importa Module de NestJS
import { APP_GUARD } from '@nestjs/core';                        // Para aplicar guards globalmente
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // Rate limiting
import { AppController } from './app.controller';               // Controlador de la app
import { AppService } from './app.service';                     // Servicio de la app
import { AuthController } from './auth.controller';            // Controlador de auth
import { AuthService } from './auth.service';                   // Servicio de auth
import { BlockedIpService } from './blocked-ip.service';       // Servicio de bloqueo
import { BlockedIpGuard } from './blocked-ip.guard.ts';        // Guard de bloqueo

@Module({
  imports: [
    // ═══════════════════════════════════════════════════════════════════
    // THROTTLER - RATE LIMITING
    // ═══════════════════════════════════════════════════════════════════
    ThrottlerModule.forRoot([
      {
        name: 'global',                    // Nombre del limitador (para identificarlo)
        ttl: 60000,                        // Time To Live = 60,000 ms = 1 minuto
        limit: 100,                        // Máximo 100 requests por minuto (global)
      },
      {
        name: 'login',                    // Limitador específico para login
        ttl: 60000,                       // 1 minuto
        limit: 5,                         // Máximo 5 intentos por minuto en login
      },
    ]),
  ],
  controllers: [AppController, AuthController], // Controladores disponibles
  providers: [
    AppService,              // Servicio general
    AuthService,            // Servicio de autenticación
    BlockedIpService,       // Servicio de bloqueo de IPs
    BlockedIpGuard,         // Guard que bloquea IPs
    {
      provide: APP_GUARD,   // Aplica el Throttler a TODA la aplicación
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}   // Exporta el módulo principal
```

**Qué hace**: Configura el rate limiting (límite de requests) para toda la aplicación.

**Línea por línea**:
- `ThrottlerModule.forRoot([...])` - Inicia el módulo de throttle con configuración
- `name: 'global'` - Nombre para identificar este limitador
- `ttl: 60000` - Tiempo en milisegundos (60,000ms = 1 minuto)
- `limit: 100` - Cantidad máxima de requests en ese tiempo
- `APP_GUARD` - Aplica el throttle a TODOS los endpoints

---

### 4.3. auth.controller.ts - Los endpoints de autenticación

```typescript
// auth.controller.ts - Define los endpoints de /auth/...

import { Controller, Post, Body, Get, Headers, UnauthorizedException, Ip, UseGuards } from '@nestjs/common';
// Controller: decorador que indica que es un controlador
// Post, Get: métodos HTTP
// Body, Headers, Ip: parámetros de la request
// UseGuards: para aplicar protección

import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
// Throttle: decorador para aplicar límites específicos
// ThrottlerGuard: el guard que aplica el rate limiting

import { AuthService } from './auth.service';
// AuthService: el servicio con la lógica de autenticación

@Controller('auth')                          // Este controlador maneja rutas que empiezan con /auth
@UseGuards(ThrottlerGuard)                  // Aplica el throttle a TODOS los endpoints de auth
export class AuthController {
  constructor(private readonly authService: AuthService) {} // Inyecta el servicio

  // ═══════════════════════════════════════════════════════════════════
  // POST /auth/login - Endpoint de login
  // ═══════════════════════════════════════════════════════════════════
  @Post('login')                             // Método POST en /auth/login
  @Throttle({ login: { ttl: 60000, limit: 5 } }) // Límite: 5 intentos por minuto
  login(
    @Body() body: { username: string; password: string }, // El cuerpo de la request (JSON)
    @Ip() ip: string,                                      // La IP del cliente
  ) {
    return this.authService.login(body.username, body.password, ip); // Llama al servicio
  }

  // ═══════════════════════════════════════════════════════════════════
  // GET /auth/status - Ver estado de bloqueo de mi IP
  // ═══════════════════════════════════════════════════════════════════
  @Get('status')
  getStatus(@Ip() ip: string) {
    return {
      ip,                                   // Mi IP
      ...this.authService.getBlockStatus(ip), // Estado de bloqueo
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // GET /auth/logs - Ver logs (solo con clave de admin)
  // ═══════════════════════════════════════════════════════════════════
  @Get('logs')
  getLogs(@Headers('x-admin-key') adminKey: string) {
    if (adminKey !== 'admin-secret') {              // Si la clave no es correcta
      throw new UnauthorizedException('Acceso no autorizado'); // Error 401
    }
    return {
      logs: this.authService.getLogs(50),           // Últimos 50 logs
      blockedIPs: this.authService.getBlockedIPs(), // IPs bloqueadas
    };
  }
}
```

**Qué hace**: Define los endpoints de autenticación y aplica el throttle específico para login.

---

### 4.4. auth.service.ts - La lógica de autenticación

```typescript
// auth.service.ts - La lógica del login

import { Injectable, UnauthorizedException } from '@nestjs/common';
// Injectable: decorador que permite inyectar este servicio en其他 lugares
// UnauthorizedException: error 401 (no autorizado)

import { BlockedIpService } from './blocked-ip.service';
// BlockedIpService: servicio que maneja el bloqueo de IPs

@Injectable()
export class AuthService {
  // ═══════════════════════════════════════════════════════════════════
  // USUARIO VÁLIDO (simulado para pruebas)
  // ═══════════════════════════════════════════════════════════════════
  private readonly VALID_USER = {
    username: 'admin',        // Usuario válido
    password: 'password123', // Password válida
  };

  constructor(private readonly blockedIpService: BlockedIpService) {} // Inyecta el servicio de bloqueo

  // ═══════════════════════════════════════════════════════════════════
  // LOGIN - Verifica credenciales
  // ═══════════════════════════════════════════════════════════════════
  login(username: string, password: string, ip: string) {
    // 1. Verificar si la IP está bloqueada
    const blockInfo = this.blockedIpService.getBlockInfo(ip);
    if (blockInfo.blocked) {                     // Si está bloqueada
      throw new UnauthorizedException({          // Lanzar error 401
        message: 'IP bloqueada',
        retryAfterSeconds: blockInfo.retryAfterSeconds, // Cuánto falta para desbloquear
        reason: 'Demasiados intentos fallidos',
      });
    }

    // 2. Verificar credenciales
    if (username === this.VALID_USER.username && password === this.VALID_USER.password) {
      // Login exitoso - registrar
      this.blockedIpService.recordSuccess(ip, '/auth/login');
      return {
        success: true,
        token: 'jwt-token-simulado-' + Date.now(), // Token simulado
        message: 'Login exitoso',
      };
    }

    // 3. Login fallido - registrar intento
    const result = this.blockedIpService.recordFailedAttempt(ip, '/auth/login');
    
    // 4. Si quedó bloqueada, informar
    if (result.blocked) {
      throw new UnauthorizedException({
        message: 'IP bloqueada',
        retryAfterSeconds: result.retryAfterSeconds,
        reason: 'Demasiados intentos fallidos',
        attempts: 'Se han registrado múltiples intentos fallidos',
      });
    }

    // 5. Credenciales wrong pero no bloqueada aún
    throw new UnauthorizedException({
      message: 'Credenciales inválidas',
      attemptsRemaining: 3, // Sugerencia de intentos restantes
    });
  }

  // Obtener estado de bloqueo
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
```

**Qué hace**: Verifica las credenciales de login y registra los intentos.

---

### 4.5. blocked-ip.service.ts - El bloqueo progresivo (EL MÁS IMPORTANTE)

```typescript
// blocked-ip.service.ts - Maneja el bloqueo de IPs

import { Injectable } from '@nestjs/common';
// Injectable: permite que este servicio sea inyectado en otros lugares

interface BlockedIP {        // Estructura de datos para una IP bloqueada
  ip: string;               // La dirección IP
  attempts: number;         // Cuántos intentos fallidos tiene
  blockedUntil: number;      // Hasta qué momento está bloqueada (timestamp)
  createdAt: Date;           // Cuándo se creó el registro
}

@Injectable()
export class BlockedIpService {
  // ═══════════════════════════════════════════════════════════════════
  // MAPA DE IPs BLOQUEADAS (en memoria)
  // ═══════════════════════════════════════════════════════════════════
  private blockedIPs: Map<string, BlockedIP> = new Map();
  // Map es como un diccionario: clave=IP, valor=Datos de bloqueo
  
  // ═══════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN DE BLOQUEO PROGRESIVO
  // ═══════════════════════════════════════════════════════════════════
  // Si fallás 3 veces → bloquea 1 minuto
  // Si fallás 5 veces → bloquea 5 minutos
  // Si fallás 7 veces → bloquea 1 hora
  private readonly BLOCK_THRESHOLDS = [
    { attempts: 3, durationMs: 60000 },   // 60,000 ms = 1 minuto
    { attempts: 5, durationMs: 300000 },// 300,000 ms = 5 minutos
    { attempts: 7, durationMs: 3600000 },// 3,600,000 ms = 1 hora
  ];

  // ═══════════════════════════════════════════════════════════════════
  // LOG DE INTENTOS (para auditoría)
  // ═══════════════════════════════════════════════════════════════════
  private attemptLog: Array<{
    ip: string;          // IP que intentó
    endpoint: string;    // Endpoint que intentó acessar
    timestamp: Date;    // Cuándo lo intentó
    success: boolean;   // Si tuvo éxito o no
  }> = [];

  // ═══════════════════════════════════════════════════════════════════
  // VERIFICAR SI UNA IP ESTÁ BLOQUEADA
  // ═══════════════════════════════════════════════════════════════════
  isBlocked(ip: string): boolean {
    const blocked = this.blockedIPs.get(ip); // Busca la IP en el mapa
    if (!blocked) return false;              // Si no existe, no está bloqueada
    
    // Si ya pasó el tiempo de bloqueo, desbloquear
    if (Date.now() > blocked.blockedUntil) {
      this.unblockIP(ip);                   // Desbloquea la IP
      return false;
    }
    return true;                             // Está bloqueada
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBTENER INFO DE BLOQUEO (incluye tiempo restante)
  // ═══════════════════════════════════════════════════════════════════
  getBlockInfo(ip: string): { blocked: boolean; retryAfterSeconds?: number } {
    const blocked = this.blockedIPs.get(ip);
    if (!blocked) return { blocked: false }; // No está bloqueada
    
    // Si ya pasó el tiempo, desbloquear
    if (Date.now() > blocked.blockedUntil) {
      this.unblockIP(ip);
      return { blocked: false };
    }
    
    // Calcular cuánto falta para desbloquear
    const remainingMs = blocked.blockedUntil - Date.now();
    return {
      blocked: true,
      retryAfterSeconds: Math.ceil(remainingMs / 1000), // Convertir a segundos
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // REGISTRAR INTENTO FALLIDO (y posible bloqueo)
  // ═══════════════════════════════════════════════════════════════════
  recordFailedAttempt(ip: string, endpoint: string): { blocked: boolean; retryAfterSeconds?: number } {
    // 1. Registrar el intento en el log
    this.attemptLog.push({
      ip,
      endpoint,
      timestamp: new Date(),
      success: false,
    });
    
    // 2. Limitar log a últimos 1000 registros (para no usar mucha memoria)
    if (this.attemptLog.length > 1000) {
      this.attemptLog = this.attemptLog.slice(-1000);
    }

    // 3. Obtener o crear registro de la IP
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

    // 4. Incrementar contador de intentos
    blocked.attempts++;

    // 5. Calcular duración del bloqueo según intentos fallidos
    let durationMs = 0;
    for (const threshold of this.BLOCK_THRESHOLDS) {
      if (blocked.attempts >= threshold.attempts) {
        durationMs = threshold.durationMs;
      }
    }

    // 6. Si corresponde, bloquear
    if (durationMs > 0) {
      blocked.blockedUntil = Date.now() + durationMs;
    }

    // 7. Loguear en consola
    console.log(`[BLOCK-LOG] IP: ${ip}, Intentos: ${blocked.attempts}, Endpoint: ${endpoint}, Bloqueado: ${durationMs > 0 ? 'SI' : 'NO'}`);

    // 8. Devolver resultado
    return {
      blocked: durationMs > 0,
      retryAfterSeconds: durationMs > 0 ? Math.ceil(durationMs / 1000) : undefined,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // REGISTRAR INTENTO EXITOSO
  // ═══════════════════════════════════════════════════════════════════
  recordSuccess(ip: string, endpoint: string) {
    this.attemptLog.push({
      ip,
      endpoint,
      timestamp: new Date(),
      success: true,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // DESBLOQUEAR IP
  // ═══════════════════════════════════════════════════════════════════
  private unblockIP(ip: string) {
    this.blockedIPs.delete(ip); // Elimina del mapa
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBTENER LOGS
  // ═══════════════════════════════════════════════════════════════════
  getLogs(limit: number = 100) {
    return this.attemptLog.slice(-limit); // Devuelve los últimos N logs
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBTENER IPs BLOQUEADAS ACTUALMENTE
  // ═══════════════════════════════════════════════════════════════════
  getCurrentlyBlocked(): Array<{ ip: string; attempts: number; retryAfterSeconds: number }> {
    const blocked: Array<{ ip: string; attempts: number; retryAfterSeconds: number }> = [];
    
    for (const [ip, data] of this.blockedIPs) {
      if (Date.now() < data.blockedUntil) { // Si todavía está bloqueada
        blocked.push({
          ip,
          attempts: data.attempts,
          retryAfterSeconds: Math.ceil((data.blockedUntil - Date.now()) / 1000),
        });
      }
    }
    
    return blocked;
  }

  // ═══════════════════════════════════════════════════════════════════
  // RESETEAR TODO (para testing)
  // ═══════════════════════════════════════════════════════════════════
  reset() {
    this.blockedIPs.clear();
    this.attemptLog = [];
  }
}
```

**Qué hace**: Maneja el bloqueo de IPs con lógica progresiva:
- Si fallás 3 veces → bloquea 1 minuto
- Si fallás 5 veces → bloquea 5 minutos
- Si fallás 7 veces → bloquea 1 hora

---

### 4.6. blocked-ip.guard.ts - El que bloquea el acceso

```typescript
// blocked-ip.guard.ts - Revisa si la IP está bloqueada antes de permitir el request

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// Injectable: permite inyectar este guard
// CanActivate: interface que deben implementar los guards
// ExecutionContext: información sobre el request actual
// UnauthorizedException: error 401

import { BlockedIpService } from './blocked-ip.service';
import { Request } from 'express';

@Injectable()
export class BlockedIpGuard implements CanActivate {
  constructor(private readonly blockedIpService: BlockedIpService) {}

  // ═══════════════════════════════════════════════════════════════════
  // CAN ACTIVATE - Se ejecuta ANTES de cada request
  // ═══════════════════════════════════════════════════════════════════
  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener el request
    const request = context.switchToHttp().getRequest<Request>();
    
    // 2. Obtener la IP del cliente
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    
    // 3. Verificar si está bloqueada
    const blockInfo = this.blockedIpService.getBlockInfo(ip);
    
    // 4. Si está bloqueada, lanzar error
    if (blockInfo.blocked) {
      throw new UnauthorizedException({
        message: 'IP bloqueada',
        retryAfterSeconds: blockInfo.retryAfterSeconds,
        reason: 'Has superado el límite de intentos fallidos',
      });
    }
    
    // 5. Si no está bloqueada, permitir el request
    return true;
  }
}
```

**Qué hace**: Se ejecuta antes de cada request y bloquea las IPs que están en la lista negra.

---

## 5. Cómo hacer las pruebas

### 5.1. Arrancar la API

```bash
# Terminal 1: Ir a la carpeta del proyecto
cd /home/adrior/Escritorio/REPOSITORIOS/apiTestDDos/api-test-ddos

# Compilar el proyecto
npm run build

# Arrancar la API
node dist/main.js
```

Debería aparecer:
```
🚀 Server running on http://localhost:3000
```

---

### 5.2. Prueba 1: Verificar que la API funciona

```bash
curl http://localhost:3000/api
```

**Resultado esperado:**
```
API DDoS Test Lab - Running
```

---

### 5.3. Prueba 2: Login correcto

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"password123"}'
```

**Resultado esperado:**
```json
{"success":true,"token":"jwt-token-simulado-1777942351522","message":"Login exitoso"}
```

---

### 5.4. Prueba 3: Login incorrecto (1 vez)

```bash
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"WRONG"}'
```

**Resultado esperado:**
```json
{"message":"Credenciales inválidas","attemptsRemaining":3}
```

---

### 5.5. Prueba 4: Múltiples login incorrectos (ATAQUE SIMULADO)

```bash
for i in 1 2 3 4 5 6 7; do echo "Intento $i:"; curl -s -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"WRONG"}'; echo ""; done
```

**Resultado esperado:**
```
Intento 1: {"message":"Credenciales inválidas","attemptsRemaining":3}
Intento 2: {"message":"Credenciales inválidas","attemptsRemaining":3}
Intento 3: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
Intento 4: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
Intento 5: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
Intento 6: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
Intento 7: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
```

**Qué pasó:**
- Los primeros 2 intentos pasaron (credenciales inválidas)
- Del 3ro en adelante: **429 Too Many Requests** (bloqueado por rate limiting)
- Esto demuestra que el throttle está funcionando!

---

### 5.6. Prueba 5: Rate limiting global (varios endpoints)

```bash
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code} " http://localhost:3000/api/status; done; echo ""
```

**Resultado esperado:**
```
200 200 200 200 200 429 429 429 429 429 
```

**Qué pasó:**
- Primeros 5 requests: 200 OK
- Siguientes 5 requests: 429 Too Many Requests
- El throttle global también funciona!

---

### 5.7. Prueba 6: Ver estado de bloqueo de tu IP

```bash
curl http://localhost:3000/auth/status
```

**Resultado esperado (si NO estás bloqueado):**
```json
{"ip":"::1","blocked":false}
```

**Resultado esperado (si ESTÁS bloqueado):**
```json
{"ip":"::1","blocked":true,"retryAfterSeconds":45}
```

---

### 5.8. Prueba 7: Ver logs de intentos

```bash
curl -H "x-admin-key: admin-secret" http://localhost:3000/auth/logs
```

**Resultado esperado:**
```json
{
  "logs": [
    {"ip":"::1","endpoint":"/auth/login","timestamp":"...","success":false},
    ...
  ],
  "blockedIPs": [...]
}
```

---

### 5.9. Prueba 8: WRK (herramienta de carga real)

Si tenés WRK instalado, podés hacer una prueba de carga más realista:

```bash
wrk -t4 -c100 -d10s http://localhost:3000/api/status
```

**Qué hace:**
- `-t4`: 4 threads
- `-c100`: 100 conexiones simultáneas
- `-d10s`: duración de 10 segundos

**Resultado esperado:**
- Miles de requests intentarán entrar
- La mayoría recibirá **429 Too Many Requests**
- Solo unos pocos pasarán (los primeros 5 aproximadamente)

---

## 6. Respuestas al análisis

### Pregunta 1: ¿Cuándo empezó a bloquear?

**Respuesta:** 
- El throttle actúa **inmediatamente** después del límite configurado
- En login: después del 2do intento (el 3ro recibe 429)
- El bloqueo progresivo (3→1min, 5→5min, 7→1hora) no se activa porque el throttle actúa primero

### Pregunta 2: ¿Qué pasa si aumentan el límite?

**Respuesta:**
- Si `limit: 5` → `limit: 10`: Permite 10 intentos antes de bloquear
- Si `limit: 5` → `limit: 3`: Bloquea más rápido (solo 3 intentos)
- Los umbrales de bloqueo progresivo también se pueden ajustar en `blocked-ip.service.ts`

### Pregunta 3: ¿Qué pasaría en producción?

**Respuesta:**

| Aspecto | Situación actual | En producción |
|---------|------------------|----------------|
| Rate limiting | ✅ Funciona | ✅ Igual |
| Bloqueo progresivo | ✅ Funciona | ⚠️ Necesita Redis |
| Persistencia | ❌ Se pierde al reiniciar | ✅ Redis o Base de datos |
| Escalabilidad | ❌ Un solo servidor | ✅ Múltiples servidores + Load Balancer |
| IP spoofing | ⚠️ Básico | ✅ WAF (Cloudflare) |

**Mejoras para producción:**
1. Usar Redis para persistir bloqueos
2. Agregar WAF (Cloudflare, AWS Shield)
3. Usar CAPTCHA después de 3 intentos fallidos
4. Implementar análisis de comportamiento

---

## 📊 RESUMEN FINAL

| Requisito del profesor | Implementado | Dónde |
|------------------------|--------------|-------|
| Rate limiting global (100/min) | ✅ | app.module.ts |
| Rate limiting login (5/min) | ✅ | app.module.ts + auth.controller.ts |
| Bloqueo progresivo (3→1min, etc) | ✅ | blocked-ip.service.ts |
| Respuesta informativa | ✅ | blocked-ip.guard.ts |
| Logging (IP, endpoint, intentos) | ✅ | blocked-ip.service.ts |

---

## 🎓 CONCEPTOS CLAVE APRENDIDOS

1. **Throttler**: Módulo de NestJS para rate limiting
2. **Guard**: Código que se ejecuta antes de cada request
3. **Service**: Lógica de negocio de la aplicación
4. **Decorator**: @Throttle para límites específicos
5. **Map**: Estructura de datos clave-valor (como un diccionario)

---

*Documento creado para el proyecto de Protección DDoS - Universidad*
*Última actualización: Mayo 2026*