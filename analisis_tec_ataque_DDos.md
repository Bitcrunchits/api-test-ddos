# Análisis Técnico - Protección contra Ataques DDoS

> **Descripción**: Este documento analiza el sistema de protección DDoS implementado en la API NestJS del proyecto. Contiene respuestas a preguntas técnicas sobre el comportamiento del sistema y propuestas de mejora para entornos de producción.

---

## 📚 Índice

### Análisis técnico
- [Pregunta 1: ¿Cuándo empezó a bloquear?](#pregunta-1-cuándo-empezó-a-bloquear)
- [Pregunta 2: ¿Qué pasa si aumentan el límite?](#pregunta-2-qué-pasa-si-aumentan-el-límite)
- [Pregunta 3: ¿Qué pasaría en producción?](#pregunta-3-qué-harían-en-producción)

### Propuestas de mejora
- [1. CAPTCHA después de N intentos fallidos](#1-captcha-después-de-n-intentos-fallidos)
- [2. WAF (Web Application Firewall)](#2-waf-web-application-firewall)
- [3. CDN con caché](#3-cdn-con-caché)
- [4. Circuit Breaker Pattern](#4-circuit-breaker-pattern)
- [5. Colas (Message Queues)](#5-colas-message-queues)
- [6. IP Geoblocking + Threat Intelligence](#6-ip-geoblocking--threat-intelligence)

### Recomendaciones
- [Recomendación final](#recomendación-final)

---

## Preguntas respondidas:

**1. ¿Cuándo empieza a bloquear?**
- Tras el 3er intento fallido (1 min), 5to (5 min), 7mo (1 hora)

**2. ¿Qué pasa si aumentan el límite?**
- Explica el efecto de cambiar `limit` en throttling

**3. ¿Qué pasaría en producción?**
- Lista problemas: memoria volátil, un solo servidor, IP spoofing

**Propuestas de mejora** (solo propuestas, no implementadas):
- CAPTCHA después de intentos fallidos
- WAF (Cloudflare, AWS Shield)
- CDN con caché
- Circuit Breaker Pattern
- Colas (RabbitMQ, Kafka)
- IP Geoblocking + Threat Intelligence

---

# Parte 4 - Análisis

## Pregunta 1: ¿Cuándo empezó a bloquear?

### Respuesta:

El bloqueo comienza **inmediatamente después del 3er intento fallido** de login.

**Detalle del comportamiento actual:**

| Intento | Respuesta del servidor | Acción |
|---------|------------------------|--------|
| 1 | `401 - Credenciales inválidas` | Registra intento |
| 2 | `401 - Credenciales inválidas` | Registra intento |
| 3 | `401 - IP bloqueada` | Bloquea por **1 minuto** |
| 4 | `401 - IP bloqueada` | Ya bloqueada |
| 5 | `401 - IP bloqueada` | Ya bloqueada (5 min) |
| 7 | `401 - IP bloqueada` | Ya bloqueada (1 hora) |

El sistema detecta el patrón de intentos fallidos y activa el bloqueo progresivo:

```
[BLOQUEO] IP: ::1, Intentos: 3, Endpoint: /auth/login, Bloqueado: SI, Duración: 60000ms
```

### Evidencia del código:

En `blocked-ip.service.ts`, línea 89-99:
```typescript
// Calcular duración del bloqueo según intentos
let durationMs = 0;
for (const threshold of this.BLOCK_THRESHOLDS) {
  if (blocked.attempts >= threshold.attempts) {
    durationMs = threshold.durationMs;
  }
}
```

---

## Pregunta 2: ¿Qué pasa si aumentan el límite?

### Respuesta:

| Cambio | Efecto |
|--------|--------|
| `limit: 100` → `limit: 200` (global) | Permite más requests antes de activar throttling |
| `limit: 5` → `limit: 10` (login) | Mayor tolerancia a intentos fallidos antes de bloqueo |
| `attempts: 3` → `attempts: 5` (bloqueo) | Más intentos permitidos antes de bloquear |

### Simulación mental:

- **Con limit=5 en login**: Después de 5 requests en 1 minuto, el 6to retorna 429 Too Many Requests
- **Con limit=10 en login**: Permite 10 requests por minuto, útil para usuarios que olvidan contraseña y prueban varias veces

### En el código:

`app.module.ts` líneas 13-24:
```typescript
ThrottlerModule.forRoot([
  {
    name: 'global',
    ttl: 60000,
    limit: 100,  // ← Cambiar aquí para modificar
  },
  {
    name: 'login',
    ttl: 60000,
    limit: 5,    // ← Cambiar aquí para modificar
  },
])
```

---

## Pregunta 3: ¿Qué pasaría en producción?

### Respuesta:

### ✅ Lo que funciona bien:
- Rate limiting por IP previene ataques básicos
- Bloqueo progresivo disuade atacantes persistentes
- Logging permite auditoría

### ⚠️ Problemas en producción:

| Problema | Impacto | Solución propuesta |
|----------|---------|-------------------|
| **Memoria volátil** | Al reiniciar el servidor se pierden todos los bloques | Usar Redis o base de datos |
| **Un solo servidor** | DDoS real satura el servidor completo | Escalar horizontalmente + Load Balancer |
| **IP spoofing** | Atacante cambia IP para evadir bloqueos | Usar header X-Forwarded-For con confianza en proxy |
| **Sin persistencia** | Bloqueos no survivean reinicios | Persistir en BD o Redis |
| **Rate limit por IP únicamente** | No detecta patrones distribuídos | Combinar con análisis de comportamiento |

### Configuración recomendada para producción:

```typescript
ThrottlerModule.forRoot([
  {
    name: 'global',
    ttl: 60000,
    limit: 50,  // Más restrictivo en prod
  },
  {
    name: 'login',
    ttl: 60000,
    limit: 3,   // Más restrictivo
  },
])
```

Y en `blocked-ip.service.ts`:
```typescript
private readonly BLOCK_THRESHOLDS = [
  { attempts: 3, durationMs: 300000 },  // 3 → 5 min
  { attempts: 5, durationMs: 3600000 }, // 5 → 1 hora
  { attempts: 10, durationMs: 86400000 }, // 10 → 1 día
];
```

---

# Parte 5 - Propuestas de Mejora

> ⚠️ **Nota**: Solo se proponen, no se implementan por ser muy complejos para este proyecto académico.

---

## 1. CAPTCHA después de N intentos fallidos

**Descripción**: Después de 3 intentos fallidos de login, mostrar CAPTCHA (reCAPTCHA, hCaptcha) antes de permitir más intentos.

**Pros**:
- Detiene ataques automatizados
_relativamente buena
- Ampliamente adoptado

**Contras**:
- Requiere integración con servicio externo (Google, etc.)
- Costo potencial
- UX friction

---

## 2. WAF (Web Application Firewall)

**Descripción**: Usar Cloudflare, AWS Shield, o similar como capa de protección.

**Opciones**:
- **Cloudflare**: DDoS protection, WAF rules, rate limiting a nivel de red
- **AWS Shield**: Protección DDoS de AWS
- **Azure Application Gateway**: WAF integrado

**Pros**:
- Protección DDoS real de nivel carrier
- Mitigación de ataques Layer 3-7
- Analytics y logging avanzado

**Contras**:
- Costo mensual
- Configuración compleja
- Vendor lock-in

---

## 3. CDN con caché

**Descripción**: Usar CloudFront, Fastly, o similar para cachear respuestas estáticas.

**Pros**:
- Reduces carga en el servidor de origen
- Mitiga ataques Layer 7
- Geodistribución

**Contras**:
- Solo funciona para contenido cacheable
- No protege endpoints dinámicos como /auth/login

---

## 4. Circuit Breaker Pattern

**Descripción**: Implementar circuit breaker que "abre" cuando detecta anomalías.

```
Normal → Abiertos → Medio abierto → Cerrado
```

**Librerías推荐adas**:
- Node.js: `opossum`
- NestJS: `@nestjs/circuit-breaker` (community)

**Pros**:
- Previene cascadas de errores
- Auto-recuperación

**Contras**:
- Complex de implementar correctamente
- Requiere tuning de thresholds

---

## 5. Colas (Message Queues)

**Descripción**: Usar cola (RabbitMQ, Kafka, SQS) para procesar requests asincrónicamente.

**Arquitectura**:
```
Cliente → API → Queue → Worker → Respuesta
```

**Pros**:
- Buffer de tráfico peak
- Processing decoupling
- Retry automático

**Contras**:
- Latencia agregada (no instantáneo)
- Complexidad operacional
- No previene DDoS, solo suaviza picos

---

## 6. IP Geoblocking + Threat Intelligence

**Descripción**: Bloquear IPs de países no esperados o listas negras conocidas.

**Servicios**:
- MaxMind GeoIP
- AbuseIPDB
- Spamhaus

**Pros**:
- Reduce superficie de ataque
- Bloquea bots conocidos

**Contras**:
- Falsos positivos (VPN, proxies)
- Actualización constante necesaria

---

## Recomendación final

Para este proyecto académico, la mejor combinación sería:

1. ✅ **Mantener**: Rate limiting + Bloqueo progresivo (ya implementado)
2. ✅ **Agregar**: CAPTCHA después de 3 intentos (fácil, efectivo)
3. 🚀 **Producción**: WAF como Cloudflare (protección real)

---

*Documento creado para el proyecto de Laboratorio de DDoS -*
*Última actualización: Mayo 2026*
*Guía diseñada para uso académico y de investigación*
*Autor: Burdiles Ricardo Adrián. Estudiante de ITS Cipolletti.
*Materia: Prácticas III 3° año
*Profesor: Aqueveque Roberto