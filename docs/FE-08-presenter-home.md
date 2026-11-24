# FE-08 — Inicio del presentador

## 1. Información general

- **ID:** FE-08
- **Nombre:** Inicio del presentador
- **Responsable:** Maximiliano Calahorra
- **Estado:** En desarrollo
- **Rama:** `feature/FE-08-presenter-home`
- **Versión del prototipo:** `0.7.5`
- **URL del prototipo:** https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

## 2. Objetivo

Incorporar la Home personal de un participante dentro de un congreso para que
usuarios `LISTENER` o `EXPOSITOR` conozcan el estado de sus trabajos asociados,
identifiquen acciones académicas y de pago pendientes y accedan a los flujos ya
existentes.

La vista se contextualiza por congreso y no sustituye el listado general de
congresos disponibles ni la futura pantalla exclusiva de «Mis congresos».

## 3. Alcance

### Incluye

- Ruta `/congresses/:congressCode/home`.
- Acceso «Ingresar al congreso» desde una tarjeta de participación activa
  `LISTENER` o `EXPOSITOR` del listado actual de congresos.
- Saludo, datos básicos del congreso y fecha límite de presentación.
- Indicadores personales de trabajos asociados y de pagos de trabajos bajo
  responsabilidad del usuario.
- Accesos desde los indicadores académicos a la bandeja FE-07 con el estado
  correspondiente como filtro.
- Accesos a «Crear nuevo trabajo» y «Ver bandeja de trabajos».
- Reutilización de la disponibilidad de presentación definida para FE-04 y
  FE-07.
- Estados de carga, error, reintento y contadores en cero.

### No incluye

- La pantalla exclusiva de «Mis congresos» ni la persistencia de un congreso
  seleccionado.
- Cambiar el encabezado compartido `MainLayout`; «Cambiar congreso» será una
  acción propia de esta pantalla que vuelve a `/congresses`.
- Crear, editar, corregir o cargar comprobantes dentro de la Home.
- Un listado o filtros de pagos para participantes.
- Home de administradores, evaluadores u otros roles.

## 4. Usuarios y permisos

| Usuario                                     | Acceso / acciones                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `LISTENER` activo con institución completa  | Consulta sus indicadores, accede a la bandeja y puede crear su primer trabajo si el período lo permite.            |
| `EXPOSITOR` activo con institución completa | Consulta sus indicadores, accede a la bandeja, puede crear trabajos y visualiza los pagos bajo su responsabilidad. |

El backend autoriza el acceso y sólo devuelve métricas relativas al usuario
autenticado. La Home no expone autores ajenos ni identidad de evaluadores.

## 5. Pantallas y flujo de usuario

Ruta: `/congresses/:congressCode/home`.

Desde una tarjeta activa en `/congresses`, el usuario selecciona «Ingresar al
congreso». La Home muestra:

- Título «Inicio — Mis trabajos», saludo con el usuario autenticado y acción
  «Cambiar congreso» hacia `/congresses`.
- Nombre, sede y fecha límite de presentación del congreso.
- Total «Trabajos asociados», que incluye los trabajos donde el usuario es autor
  `ACCEPTED`, incluso si es coautor o el trabajo sigue como borrador.
- Bloque académico con Borradores, Con observaciones y Revisión pendiente.
- Bloque de Pagos con Sin comprobante, Comprobantes por revisar y Pagos
  verificados. «Sin comprobante» incluye los comprobantes rechazados, ya que no
  existe un comprobante válido.
- Acciones hacia la creación FE-04 y la bandeja FE-07.
- Bloque informativo estático del ciclo de vida del trabajo.

Los tres indicadores académicos navegan a:

- Borradores: `/congresses/:congressCode/my-papers?status=NOT_SUBMITTED`.
- Con observaciones:
  `/congresses/:congressCode/my-papers?status=NEEDS_REVISION`.
- Revisión pendiente:
  `/congresses/:congressCode/my-papers?status=UNDER_EVALUATION`.

Los indicadores de pago se presentan sólo como resumen informativo en esta
feature. Sus flechas son visuales y no inician navegación hasta que exista un
listado o filtro de pagos participante.

«Crear nuevo trabajo» sólo se habilita si las reglas del congreso permiten la
presentación en el instante actual. Si está deshabilitado, se informa el motivo
definido por el helper compartido de FE-04/FE-07.

### Referencias visuales

- **Versión aprobada del prototipo:** `0.7.5`.
- **Captura:** `docs/screenshots/participant-home.png`.

La pantalla ocupa el ancho útil de `MainLayout`, sin un `maxWidth` restrictivo.

## 6. Reglas de negocio

- RN-01: Sólo puede acceder un participante activo `LISTENER` o `EXPOSITOR`
  con institución completa.
- RN-02: Los indicadores académicos cuentan trabajos donde el usuario sea autor
  `ACCEPTED`, sin importar si es responsable o coautor.
- RN-03: El total de trabajos asociados incluye todos los estados de esos
  trabajos, incluidos borradores, aceptados y rechazados.
- RN-04: Los indicadores de pago cuentan exclusivamente trabajos aceptados en
  los que el usuario sea responsable, porque es quien puede operar el
  comprobante.
- RN-05: Un trabajo aceptado sin comprobante o con comprobante rechazado se
  cuenta en «Sin comprobante».
- RN-06: Los indicadores académicos son enlaces a FE-07; los indicadores de
  pago no son navegables en este alcance.
- RN-07: La disponibilidad de creación debe coincidir con FE-04 y FE-07.
- RN-08: La autorización definitiva y los cálculos de métricas pertenecen al
  backend; el frontend no agrega ni infiere trabajos.

## 7. Datos e integración

**Modalidad:** Backend real.

### Datos necesarios

- Sesión autenticada: nombre y apellido para el saludo.
- Resumen personal del congreso: código, nombre, sede, fecha límite y métricas.
- Participación actual: rol, estado e institución.
- Reglas de presentación: estado habilitado y período de presentación.

### Servicios involucrados

| Operación                        | Endpoint / servicio                                         | Estado                            |
| -------------------------------- | ----------------------------------------------------------- | --------------------------------- |
| Consultar Home personal          | `GET /api/congresses/{congressCode}/participant-home`       | Disponible                        |
| Consultar participación actual   | `GET /api/congresses/{congressCode}/participants/me`        | Disponible                        |
| Consultar reglas de presentación | `GET /api/congresses/{congressCode}/paper-submission-rules` | Disponible                        |
| Consultar bandeja propia         | `GET /api/papers/congresses/{congressCode}/mine`            | Disponible, destino de navegación |

El endpoint integrado devuelve:

```json
{
  "congressCode": "string",
  "congressName": "string",
  "place": "string",
  "presentationEndDate": "LocalDateTime",
  "totalAssociatedPapers": 0,
  "drafts": 0,
  "needsRevision": 0,
  "underEvaluation": 0,
  "paymentsWithoutValidReceipt": 0,
  "paymentsPendingApproval": 0,
  "paymentsVerified": 0
}
```

Debe responder `401` sin sesión, `403` ante participación, institución o rol no
elegible y `404` si el congreso no existe.

## 8. Validaciones y manejo de errores

- La carga inicial muestra un indicador hasta disponer del resumen personal.
- Errores `401`, `403` y `404` muestran un mensaje contextual y opción de
  reintento cuando corresponda.
- Con cero trabajos se muestran los seis indicadores en cero; no se inventan
  acciones pendientes.
- Si no se pueden validar reglas o participación, la Home conserva el resumen
  cargado y deshabilita la creación, informando la imposibilidad de verificarla.
- Fechas inválidas se muestran como no disponibles y bloquean la creación según
  el helper compartido.

## 9. Criterios de aceptación

- [ ] CA-01: Un `LISTENER` o `EXPOSITOR` elegible puede entrar a la Home desde
      «Ingresar al congreso» en el listado actual.
- [ ] CA-02: La Home muestra saludo, datos del congreso, fecha límite y total de
      trabajos asociados provenientes del backend.
- [ ] CA-03: Los tres indicadores académicos representan los valores reales y
      llevan al filtro FE-07 correspondiente.
- [ ] CA-04: Los tres indicadores de pago reflejan trabajos bajo
      responsabilidad del usuario; los rechazados se incluyen en Sin
      comprobante.
- [ ] CA-05: Los indicadores de pago no generan una navegación inexistente.
- [ ] CA-06: Crear nuevo trabajo usa la misma disponibilidad de FE-04/FE-07 y
      comunica el motivo de bloqueo.
- [ ] CA-07: Con cero trabajos, la interfaz conserva la estructura y muestra
      contadores en cero.
- [ ] CA-08: Se contemplan carga, error y reintento sin exponer métricas
      administrativas ni datos de evaluadores.
- [ ] CA-09: La interfaz respeta la captura aprobada en 1366 × 768 y
      1920 × 1080, sin desbordamiento horizontal.

## 10. Dependencias y decisiones pendientes

### Dependencias

- FE-04 para la creación de trabajos y su helper de disponibilidad.
- FE-07 para la bandeja, sus filtros y el acceso desde el listado de congresos.
- Nuevo endpoint participante `participant-home` integrado en `develop` del
  backend.

### Decisiones pendientes

- Ninguna funcional pendiente dentro de este alcance. La pantalla de «Mis
  congresos» y la selección persistente del congreso se planificarán por
  separado.

## 11. Notas de implementación

- Crear una feature `presenter-home`; no reutilizar el dashboard administrativo
  porque sus métricas son globales y requieren permisos de administración.
- Reutilizar Axios, TanStack Query, `PaperSubmissionService` y
  `getSubmissionAvailability` existentes.
- Mantener el estado remoto en consultas locales de TanStack Query, sin agregar
  estado global ni dependencias.
- Coordinar cambios sobre `src/app/router.tsx` y
  `AvailableCongressCard.tsx`, que son archivos compartidos.

## 12. Verificación final

- [ ] Se cumplen los criterios de aceptación.
- [ ] Se respetó la captura y el alcance aprobados.
- [ ] Se ejecutaron type-check, lint, formato y build.
- [ ] Se validaron contadores, navegación académica, pagos rechazados, período
      cerrado y estado vacío.
- [ ] Se documentaron errores preexistentes o pendientes.
- [ ] El Pull Request fue creado hacia `develop` y recibió revisión.
