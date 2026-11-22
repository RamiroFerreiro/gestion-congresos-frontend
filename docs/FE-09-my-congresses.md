# FE-09 — Mis congresos y catálogo de congresos

## 1. Información general

- **ID:** FE-09
- **Nombre:** Mis congresos y catálogo de congresos
- **Responsable:** Maximiliano Calahorra
- **Estado:** En desarrollo
- **Rama:** `feature/FE-09-my-congresses`
- **Versión del prototipo:** `0.7.5`
- **URL del prototipo:** https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

## 2. Objetivo

Separar la selección de congresos en una pantalla personal de congresos
gestionables y un catálogo general para explorar e inscribirse. La funcionalidad
es común a todos los roles.

## 3. Alcance

### Incluye

- Ruta `/my-congresses` como destino posterior al inicio de sesión.
- Ruta `/congresses` como catálogo de congresos habilitados.
- Listado de participaciones activas propias con datos del congreso, rol,
  institución y estado visual.
- Para súper administradores, listado de todos los congresos gestionables.
- Acciones según rol, institución y estado del congreso.
- Reutilización de la consulta personal en ambas vistas para evitar una consulta
  individual de participación por tarjeta.
- Actualización de caché después de inscribirse o modificar la institución.

### No incluye

- Home, alta o configuración administrativos.
- Home o bandeja de evaluadores.
- Métricas de trabajos por tarjeta.
- Persistencia de un congreso seleccionado.
- Rutas placeholder.

## 4. Usuarios y reglas de negocio

- Un usuario estándar ve únicamente participaciones activas, incluso si el
  congreso está finalizado o deshabilitado.
- Un súper administrador ve todos los congresos con rol virtual `SUPER_ADMIN`,
  aunque no tenga una participación registrada.
- Una institución incompleta bloquea el acceso operativo y permite completarla.
- Un congreso deshabilitado se muestra, pero no ofrece acciones operativas.
- `LISTENER` y `EXPOSITOR` con institución completa continúan al Inicio del
  participante.
- `ADMINISTRATOR` y `SUPER_ADMIN` muestran las acciones administrativas de la
  referencia visual deshabilitadas hasta contar con sus vistas reales.
- `EVALUATOR` muestra una acción deshabilitada hasta contar con su espacio.
- El catálogo sólo muestra congresos habilitados y conserva las reglas vigentes
  de inscripción.

## 5. Pantallas y navegación

### Mis congresos

Ruta: `/my-congresses`.

Cada tarjeta muestra nombre, sede, rol, estado visual, período del congreso y
fecha límite de presentación. Para todos los roles, el rol reemplaza la métrica
de trabajos propia de la captura, porque esa métrica no es equivalente en la
vista genérica.

La pantalla tiene estados de carga, error con reintento y vacío con acceso a
`/congresses` mediante «Explorar congresos».

### Explorar congresos

Ruta: `/congresses`.

Es el catálogo general de congresos habilitados. Un usuario sin participación
puede iniciar su inscripción; una participación existente muestra su acción
correspondiente o un acceso a Mis congresos.

El login y el enlace global «Mis congresos» llevan a `/my-congresses`.

### Referencias visuales

- Captura principal: `docs/screenshots/my-congresses.png`.
- La variante administrativa compartida durante la definición se usa como
  referencia funcional para textos y acciones, sin incorporarse como captura
  versionada.

## 6. Datos e integración

**Modalidad:** Backend real.

| Operación               | Endpoint                                                   | Estado     |
| ----------------------- | ---------------------------------------------------------- | ---------- |
| Consultar Mis congresos | `GET /api/congresses/mine`                                 | Disponible |
| Consultar catálogo      | `GET /api/congresses?enabled=true`                         | Disponible |
| Inscribirse             | `POST /api/congresses/{code}/participants/me`              | Disponible |
| Actualizar institución  | `PATCH /api/congresses/{code}/participants/me/institution` | Disponible |

`GET /api/congresses/mine` devuelve `code`, `name`, `place`, `enabled`, fechas
de realización y presentación, `role` e `institution`. No devuelve métricas de
trabajos ni información de otros participantes.

## 7. Criterios de aceptación

- [ ] Tras iniciar sesión, el usuario llega a `/my-congresses`.
- [ ] Mis congresos muestra participaciones activas de todos los roles.
- [ ] Un súper administrador visualiza todos los congresos gestionables.
- [ ] Las tarjetas muestran rol, fechas y estado correctos.
- [ ] Un congreso deshabilitado se muestra bloqueado.
- [ ] Una institución pendiente puede completarse.
- [ ] LISTENER y EXPOSITOR elegibles acceden al Inicio del participante.
- [ ] No hay navegación rota para administración ni evaluación.
- [ ] El catálogo permite explorar congresos habilitados e iniciar inscripción.
- [ ] Inscripción y actualización de institución refrescan ambas vistas.
- [ ] La interfaz respeta la captura aprobada a 1366 × 768 y 1920 × 1080.

## 8. Dependencias y notas de implementación

- Reutilizar Axios, TanStack Query, el diálogo de institución y las utilidades
  de disponibilidad existentes.
- Mantener la ruta de cada congreso en la URL; no agregar estado global.
- Coordinar cambios en `src/app/router.tsx`, `src/layouts/MainLayout.tsx` y el
  flujo de login, porque son archivos compartidos.
- Actualizar el documento de selección e inscripción de congresos si sus
  acuerdos previos contradicen esta feature.
