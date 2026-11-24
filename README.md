# C4T — Call for Talks | Frontend

Frontend de **C4T (Call for Talks)**, una plataforma web para la gestión de congresos y jornadas científicas universitarias.

Este proyecto forma parte del Trabajo Final Integrador (TFI) de la Licenciatura en Sistemas y permite gestionar distintas etapas de un congreso: configuración, presentación de trabajos científicos, evaluación, seguimiento y administración.

El frontend consume una API REST desarrollada con Spring Boot.

## 1. Tecnologías utilizadas

| Tecnología | Propósito |
|---|---|
| React 19 | Construcción de interfaces |
| TypeScript 6 | Tipado estático |
| Vite 8 | Desarrollo y compilación |
| Material UI 9 | Componentes y sistema de diseño |
| React Router 7 | Navegación |
| Axios | Comunicación HTTP |
| TanStack Query 5 | Gestión de datos asíncronos |
| React Hook Form + Zod | Formularios y validaciones |
| ESLint + Prettier | Calidad y formato de código |
| npm | Gestión de dependencias |
| Docker Compose | Ejecución del entorno en contenedores |

## 2. Requisitos previos

Para ejecutar el proyecto localmente:

- Node.js 24 LTS o una versión compatible con las dependencias.
- npm.
- Git.
- Visual Studio Code u otro editor.

Para ejecutar el entorno con Docker:

- Docker Desktop o Docker Engine.
- Docker Compose.

Para trabajar con Codex, cada integrante deberá tener acceso a la herramienta y configurarla en su entorno.

## 3. Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar al directorio:

```bash
cd gestion-congresos-frontend
```

Instalar las dependencias:

```bash
npm ci
```

El comando `npm ci` requiere que exista un `package-lock.json` válido y sincronizado. Si todavía no está disponible, utilizar `npm install`.

## 4. Configuración del entorno

La URL del backend se configura mediante una variable de entorno de Vite.

Crear un archivo `.env` en la raíz del proyecto, tomando como referencia `.env.example` si existe.

Ejemplo para desarrollo local:

```env
VITE_API_URL=http://localhost:8080
```

La URL debe coincidir con la configuración real del backend.

**Importante:** las variables con prefijo `VITE_` son accesibles desde el código del navegador. No almacenar secretos ni credenciales privadas.

## 5. Ejecución local

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Por defecto, Vite suele utilizar:

http://localhost:5173

El puerto efectivo se muestra en la terminal al iniciar la aplicación.

Para utilizar funcionalidades conectadas a servicios reales, el backend debe encontrarse disponible.

## 6. Ejecución con Docker

La configuración centralizada del entorno se encuentra en el repositorio:

`gestion-congresos-deploy`

Desde ese repositorio:

```bash
docker compose up --build
```

Para detener los contenedores:

```bash
docker compose down
```

Los puertos publicados y las variables utilizadas dependen del archivo Docker Compose.

Consultar la configuración del repositorio de despliegue antes de asumir una URL de acceso.

## 7. Scripts disponibles

Los siguientes scripts están definidos en `package.json`:

| Comando | Función |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la compilación de producción |
| `npm run preview` | Permite previsualizar el build |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Aplica Prettier al proyecto |
| `npm run format:check` | Comprueba el formato sin modificar archivos |

**Precaución:** `npm run format` ejecuta Prettier sobre todo el proyecto. Antes de utilizarlo, revisar el alcance de los archivos que se modificarán.

Actualmente no existe un script específico de pruebas automatizadas ni uno de verificación independiente de TypeScript.

## 8. Comunicación con el backend

El frontend consume una API REST desarrollada con Spring Boot.

En desarrollo local, la URL habitual del backend es:

http://localhost:8080

Antes de integrar una funcionalidad:

1. Consultar la documentación Swagger/OpenAPI del backend.
2. Revisar los contratos de entrada y salida.
3. Reutilizar la configuración compartida de Axios.
4. Respetar los patrones de manejo de datos y errores del proyecto.

No inventar endpoints ni estructuras de respuesta.

Las funcionalidades que todavía no estén integradas pueden utilizar mocks tipados, siempre que su especificación lo indique.

## 9. Organización del código

El frontend utiliza una organización por funcionalidades.

```text
src/
├── app/          # Router, providers y theme
├── assets/       # Recursos estáticos
├── components/   # Componentes compartidos
├── features/     # Funcionalidades de negocio
├── layouts/      # Layouts de la aplicación
├── lib/          # Configuraciones y utilidades compartidas
└── styles/       # Estilos globales
```

Antes de crear nuevas estructuras, revisar el código existente y reutilizar los patrones disponibles.

## 10. Prototipo y referencias visuales

El diseño de C4T se encuentra documentado en un prototipo versionado.

**Versión de referencia inicial:** `0.7.5`

**Prototipo:**

https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

El prototipo conserva versiones anteriores y permite consultar el diseño correspondiente a cada versión.

Cada funcionalidad debe registrar en su especificación la versión del prototipo utilizada como referencia.

Cuando se publique una versión nueva, las funcionalidades en desarrollo no cambiarán automáticamente de referencia. Primero se evaluará el impacto de los cambios y se actualizarán las especificaciones correspondientes.

Las capturas de pantalla aprobadas deben almacenarse en `docs/screenshots/`.

La versión del prototipo es independiente de la versión del código frontend.

## 11. Metodología de desarrollo

El equipo utiliza un enfoque de desarrollo guiado por especificaciones (SDD), con apoyo de Codex.

El proceso general es:

1. Seleccionar una funcionalidad del backlog.
2. Revisar o preparar su especificación funcional.
3. Identificar la versión del prototipo correspondiente.
4. Crear una rama de trabajo.
5. Solicitar a Codex un análisis y un plan de implementación.
6. Revisar y aprobar el plan.
7. Implementar incrementalmente.
8. Validar los resultados.
9. Abrir un Pull Request para revisión.

Codex es una herramienta de asistencia. Cada desarrollador es responsable de comprender y validar el código que incorpora.

## 12. Documentación del equipo

| Documento | Propósito |
|---|---|
| `README.md` | Contexto, instalación y ejecución |
| `AGENTS.md` | Reglas de desarrollo para Codex |
| `docs/FRONTEND-WORKFLOW.md` | Procedimiento de trabajo del equipo |
| `docs/templates/feature-spec.md` | Plantilla de especificación funcional |
| `docs/templates/codex-prompt.md` | Prompts estándar para Codex |
| `docs/FE-XX-*.md` | Especificaciones de cada funcionalidad |
| `docs/screenshots/` | Capturas del prototipo |

Los documentos pendientes de creación se incorporarán progresivamente.

## 13. Convenciones de colaboración

- Trabajar en ramas propias, siguiendo la estrategia Git del equipo.
- No desarrollar directamente en `main` ni en `develop`.
- Mantener cada cambio dentro del alcance de su tarea.
- Coordinar modificaciones sobre el router, theme, providers y componentes compartidos.
- Actualizar las especificaciones cuando cambien los requisitos.
- Revisar los cambios antes de realizar commits.
- Abrir Pull Requests hacia `develop`.
- Solicitar revisión a otro integrante antes de integrar los cambios.

## 14. Validaciones antes de un Pull Request

Ejecutar:

```bash
npm run build
npm run lint
npm run format:check
```

Además:

- Revisar los criterios de aceptación de la funcionalidad.
- Probar la navegación y los formularios involucrados.
- Comparar la interfaz con la versión del prototipo acordada.
- Revisar `git diff`.
- Verificar que no existan cambios accidentales.
- Documentar por separado los errores preexistentes.

Los controles adicionales de TypeScript y las pruebas automatizadas podrán incorporarse a medida que evolucione el proyecto.

## 15. Estado del proyecto

C4T se encuentra en desarrollo como parte del Trabajo Final Integrador.

Las funcionalidades se incorporan progresivamente mediante tareas y Pull Requests revisados por el equipo.s