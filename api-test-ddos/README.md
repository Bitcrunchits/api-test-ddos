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

*Documento creado para el proyecto de Laboratorio de DDoS -*
*Última actualización: Mayo 2026*
*Guía diseñada para uso académico y de investigación*
*Autor: Burdiles Ricardo Adrián. Estudiante de ITS Cipolletti.
*Materia: Prácticas III 3° año
*Profesor: Aqueveque Roberto