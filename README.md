# Sistema de Gestión Bibliotecaria — SGB

Sistema de Gestión Bibliotecaria para la Universidad de Madeira, desarrollado con una **arquitectura por capas (N-Tier)** como proyecto académico de la asignatura Desarrollo de Software II.

## Información académica

- **Estudiante:** Manuel Morales Martínez
- **Código:** 406384
- **Institución:** Fundación Universitaria Católica Lumen Gentium — UNICATÓLICA
- **Asignatura:** Desarrollo de Software II
- **Evaluación:** Segundo Momento Evaluativo
- **Docente:** Fabian Stiven Valencia Córdoba

## Descripción del proyecto

El frontend es la capa de presentación del Sistema de Gestión Bibliotecaria. Está desarrollado con React, TypeScript, Vite y Tailwind CSS. Ofrece un portal de demostración, una experiencia de estudiante y un espacio de gestión bibliotecaria.

La interfaz consume la API REST del backend mediante solicitudes HTTP y utiliza respuestas JSON para mostrar y actualizar la información. El HTML de la aplicación lo sirve el frontend; la API devuelve datos y no páginas HTML.

El sistema de demostración incluye catálogo de recursos, usuarios de ejemplo, préstamos, reservas, renovaciones, devoluciones, multas y actividades con inscripción.

## Arquitectura por capas (N-Tier)

La separación por capas delimita responsabilidades, reduce el acoplamiento y facilita el mantenimiento, las pruebas y la evolución del sistema. Se basa en el patrón descrito en *Fundamentals of Software Architecture*, de Mark Richards y Neal Ford: cada capa mantiene una responsabilidad definida y se comunica con las capas adyacentes.

1. **Presentación — frontend y API:** la interfaz React presenta la información. En el backend, Express y los controladores reciben solicitudes HTTP y generan respuestas.
2. **Lógica de aplicación — servicios:** coordina los casos de uso y las reglas del dominio.
3. **Persistencia — repositorios:** encapsula las consultas SQL y el acceso a los datos.
4. **Base de datos — SQLite:** almacena recursos, usuarios, préstamos, reservas, multas y actividades.

Esta división permite cambiar la interfaz sin trasladar las consultas SQL, y modificar la persistencia sin llevar esa lógica a los controladores.

## Flujo end-to-end: consulta de recursos

1. El frontend solicita `GET /api/recursos` vía HTTP.
2. Express dirige la solicitud al controlador de recursos.
3. El controlador delega la operación a `recursoService`.
4. El servicio solicita los registros a `recursoRepository`.
5. El repositorio consulta SQLite.
6. Los registros regresan del repositorio al servicio y al controlador.
7. El controlador responde con **`200 OK`** y un JSON estandarizado. La API devuelve datos, no HTML.

Ejemplo de respuesta:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Ejemplo de recurso",
      "autor": "Autor de ejemplo",
      "coleccion": "General",
      "ejemplares": 2,
      "estado": "Disponible"
    }
  ]
}
```

## Diagrama de arquitectura

[Ver diagrama de arquitectura en Mermaid](https://mermaid.ai/d/16789ce8-6554-427d-917e-ce4389f31fb5)

## Funcionalidades de la demo

- Consultar y registrar recursos bibliográficos.
- Consultar estudiantes y usuarios; registrar usuarios.
- Solicitar préstamos; cuando no hay ejemplares, entrar en cola de reserva.
- Renovar o devolver préstamos; al devolver, asignar el ejemplar a una reserva pendiente cuando corresponde.
- Consultar y cancelar reservas.
- Registrar multas y marcarlas como pagadas.
- Publicar actividades e inscribir usuarios respetando los cupos.
- Consultar la información desde el portal de estudiante y desde el espacio bibliotecario.

## API disponible

La dirección local del backend es `http://localhost:3000`.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/recursos` | Consultar el catálogo |
| `POST` | `/api/recursos` | Registrar un recurso |
| `GET` | `/api/usuarios` | Consultar usuarios |
| `GET` | `/api/usuarios/estudiantes` | Consultar perfiles de estudiante de demostración |
| `POST` | `/api/usuarios` | Registrar un usuario |
| `GET` | `/api/prestamos` | Consultar préstamos activos |
| `GET` | `/api/prestamos/todos` | Consultar todos los préstamos |
| `POST` | `/api/prestamos` | Solicitar un préstamo o crear una reserva si no hay ejemplares |
| `PATCH` | `/api/prestamos/:id/renovar` | Renovar un préstamo |
| `PATCH` | `/api/prestamos/:id/devolver` | Devolver un préstamo |
| `GET` | `/api/reservas` | Consultar la cola de reservas |
| `DELETE` | `/api/reservas/:id` | Cancelar una reserva |
| `GET` | `/api/multas` | Consultar multas |
| `POST` | `/api/multas` | Registrar una multa |
| `PATCH` | `/api/multas/:id/pagar` | Marcar una multa como pagada |
| `GET` | `/api/actividades` | Consultar actividades |
| `POST` | `/api/actividades` | Crear una actividad |
| `POST` | `/api/actividades/:id/inscripciones` | Inscribir un usuario en una actividad |

Las respuestas correctas de lectura siguen el formato `{ "success": true, "data": ... }`. En las operaciones de creación el servidor puede responder `201 Created`; las validaciones incorrectas responden con un estado de error y un mensaje JSON.

## Requisitos

- Docker y Docker Compose para ejecutar el sistema completo.
- Node.js 22 o superior y npm si se ejecutan los servicios directamente en el equipo.

## Ejecución con Docker Compose

El Compose unificado está en la carpeta contenedora `SGB-Universidad-Madeira`, que debe contener las carpetas `sgb-backend` y `sgb-frontend`. Una vez disponibles ambos directorios, desde la carpeta contenedora ejecuta:

```bash
docker compose up --build
```

Este único comando construye y levanta ambos servicios:

- **Backend:** `http://localhost:3000`
- **Frontend:** `http://localhost:5173`

Para detener los contenedores:

```bash
docker compose down
```

La base de datos SQLite del Compose unificado se guarda en un volumen de Docker para conservar los datos entre reinicios.

### Archivos Docker del frontend

- `Dockerfile`: imagen de producción del frontend, compilada y servida mediante Nginx.
- `Dockerfile.dev`: imagen de desarrollo con Vite.
- `vite.config.ts`: servidor de desarrollo y proxy de solicitudes `/api` al backend.
- `nginx.conf`: configuración del servidor de producción y proxy de la API.
- `docker-compose.yml` en la carpeta contenedora: configuración unificada de frontend y backend.

El backend también incluye `docker-compose.yml` y `docker-compose.dev.yml` para levantarlo de forma independiente. El Compose unificado pertenece a la carpeta contenedora, no a cada servicio.

## Ejecución local del frontend

Desde la carpeta `sgb-frontend`:

```bash
npm install
npm run dev
```

Vite inicia la aplicación en `http://localhost:5173` y reenvía las solicitudes `/api` al backend en `http://localhost:3000` por defecto. Para compilar y verificar el frontend:

```bash
npm run lint
npm run build
```

La compilación de producción queda en `dist/`.

## Estructura del frontend

```text
sgb-frontend/
├── src/
│   ├── components/      # Componentes reutilizables y navegación
│   ├── pages/           # Portal, estudiante y módulos bibliotecarios
│   ├── services/        # Clientes HTTP para consumir la API
│   ├── types/           # Tipos compartidos de TypeScript
│   ├── App.tsx          # Rutas de la aplicación
│   └── main.tsx         # Punto de entrada de React
├── Dockerfile
├── Dockerfile.dev
├── nginx.conf
├── vite.config.ts
└── README.md
```

## Verificación rápida

Con ambos servicios iniciados, abre `http://localhost:5173` y comprueba que el catálogo cargue. También puedes verificar directamente la API:

```bash
curl http://localhost:3000/api/recursos
```

La primera inicialización de una base vacía agrega datos ficticios de ejemplo y prepara las tablas necesarias. Las migraciones actuales preservan los datos existentes.

## Advertencia de seguridad

Esta aplicación se preparó para una demostración académica. Algunas operaciones son públicas y no requieren autenticación; los datos son compartidos entre quienes usan la demo. Utiliza únicamente datos ficticios. No expongas el sistema en una red pública ni lo uses para guardar información personal real sin implementar autenticación, autorización y las medidas de seguridad necesarias.
