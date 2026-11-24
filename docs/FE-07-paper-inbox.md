# FE-07 — Bandeja de trabajos científicos

## 1. Información general

- **ID:** FE-07
- **Nombre:** Bandeja de trabajos científicos
- **Responsable:** Maximiliano Calahorra
- **Estado:** En planificación
- **Rama:** `feature/FE-07-paper-inbox`
- **Versión del prototipo:** `0.7.5`
- **URL del prototipo:** https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

## 2. Objetivo

Incorporar una bandeja personal para que participantes activos con rol
`LISTENER` o `EXPOSITOR` consulten sus trabajos dentro de un congreso, conozcan
su estado académico, pago y última actividad, y accedan a la acción habilitada
según su autoría y estado.

## 3. Alcance

### Incluye

- Ruta `/congresses/:congressCode/my-papers`.
- Acceso `Mis trabajos` desde la tarjeta de un congreso para participantes
  activos `LISTENER` o `EXPOSITOR` con institución completa.
- Consulta real, paginada y filtrable por estado de los trabajos propios.
- Tabla con código, título, versión, dictamen, estado de pago, última actividad
  y acción contextual.
- Borradores `NOT_SUBMITTED` y acciones de edición sólo para el autor
  responsable.
- Acceso a corrección, detalle o flujo existente de comprobantes según la fila.
- Botón `Crear nuevo trabajo`, habilitado únicamente durante el período de
  presentación; fuera de ese período queda deshabilitado con su motivo.
- Estados de carga, error, vacío, paginación y actividad no disponible.
- Actualización del destino `← Volver a Mis trabajos` de FE-05 hacia esta ruta.

### No incluye

- Crear, editar, corregir o reenviar el trabajo dentro de la bandeja.
- Cargar, consultar o revisar comprobantes dentro de la bandeja.
- Solicitudes, aceptación, rechazo o modificaciones de coautoría.
- Gestión administrativa, asignación de evaluadores o cambios al ciclo de
  evaluación y pagos.

## 4. Usuarios y permisos

| Usuario                           | Acceso / acciones                                                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Autor responsable `ACCEPTED`      | Consulta sus trabajos y puede editar borradores, corregir trabajos con observaciones y acceder al comprobante cuando el backend lo habilita. |
| Coautor `ACCEPTED`                | Consulta sus trabajos y puede abrir el detalle, sin acciones de modificación o comprobante.                                                  |
| LISTENER o EXPOSITOR sin trabajos | Puede abrir una bandeja vacía y, si el período lo permite, crear un trabajo.                                                                 |

El backend decide qué trabajos, estado de pago y permisos por fila se exponen.

## 5. Pantallas y flujo de usuario

Ruta: `/congresses/:congressCode/my-papers`.

La pantalla presenta el congreso y una tabla paginada de trabajos propios. El
filtro de estado se sincroniza con la consulta remota. La acción principal por
fila se resuelve así:

- `NOT_SUBMITTED` + autor responsable: `Editar` hacia
  `/congresses/:congressCode/papers/:paperCode/edit`.
- `NEEDS_REVISION` + autor responsable: `Corregir` hacia
  `/congresses/:congressCode/papers/:paperCode/correction`.
- `canUploadPayment = true`: `Subir comprobante` hacia
  `/congresses/:congressCode/payments/:paperCode`.
- Cualquier otro caso: `Ver detalle` hacia
  `/congresses/:congressCode/papers/:paperCode`.

`Crear nuevo trabajo` dirige a la ruta de alta de FE-04 sólo cuando las reglas
del congreso indican que el período de presentación está abierto. Fuera de ese
período queda deshabilitado y se informa el motivo.

El acceso `Mis trabajos` se agrega sin reemplazar los accesos existentes de
pagos. El retorno temporal del detalle FE-05 deja de ir a `/congresses` y pasa
a la bandeja del mismo congreso.

### Referencias visuales

- **Versión aprobada del prototipo:** `0.7.5`.
- **Captura:** `docs/screenshots/participant-my-papers.png`.

La pantalla ocupa el ancho útil de `MainLayout`, sin un `maxWidth` restrictivo.

## 6. Reglas de negocio

- RN-01: Sólo se muestran trabajos donde el usuario autenticado sea autor
  `ACCEPTED`.
- RN-02: Sólo el autor responsable puede editar un borrador, corregir o cargar
  comprobantes.
- RN-03: La bandeja no expone identidad ni datos de evaluadores.
- RN-04: El estado de pago y `canUploadPayment` se consumen del backend; no se
  infieren mediante consultas por fila.
- RN-05: El filtro por estado se aplica en el backend y la paginación conserva
  la página, tamaño y orden remitidos.
- RN-06: `lastActivityType` se traduce a texto de interfaz y
  `lastActivityAt` se formatea en español argentino.
- RN-07: Si la actividad o su fecha llegan como `null` para datos históricos,
  se muestra `Actividad no disponible`, sin inventar una fecha.
- RN-08: El botón de creación se deshabilita fuera del período de presentación,
  siguiendo la disponibilidad actual de FE-04.

## 7. Datos e integración

**Modalidad:** Backend real.

| Operación                        | Endpoint / servicio                                         | Estado     |
| -------------------------------- | ----------------------------------------------------------- | ---------- |
| Consultar bandeja propia         | `GET /api/papers/congresses/{congressCode}/mine`            | Disponible |
| Consultar reglas de presentación | `GET /api/congresses/{congressCode}/paper-submission-rules` | Disponible |
| Consultar participación actual   | `GET /api/congresses/{congressCode}/participants/me`        | Disponible |

El listado devuelve una página con `code`, `title`, `version`, `status`,
`submittedAt`, `responsibleAuthor`, `paymentStatus`, `canUploadPayment`,
`lastActivityType` y `lastActivityAt`.

Valores de pago:

- `NOT_ENABLED`: no habilitado.
- `PENDING_RECEIPT`: sin comprobante.
- `PENDING_APPROVAL`: comprobante en revisión.
- `VERIFIED`: pago verificado.
- `REJECTED`: comprobante rechazado.

Valores de actividad:

- `DRAFT_SAVED`, `PAPER_SUBMITTED`, `EVALUATION_RELEASED`,
  `CORRECTION_SUBMITTED`, `PAYMENT_UPLOADED`, `PAYMENT_VERIFIED` y
  `PAYMENT_REJECTED`.

## 8. Validaciones y manejo de errores

- Carga inicial y cambio de filtro muestran un indicador sin presentar datos
  incompletos como definitivos.
- `401` informa sesión no válida; `403` informa falta de permisos o institución
  incompleta; `404` informa congreso o participación inexistente.
- Una respuesta vacía presenta un estado informativo y conserva la acción de
  creación cuando corresponda.
- El botón de creación explica la apertura futura, cierre o invalidez de las
  fechas de presentación cuando no puede habilitarse.
- Las acciones se construyen exclusivamente a partir del estado y permisos
  devueltos por el backend.

## 9. Criterios de aceptación

- [ ] CA-01: Un participante activo con rol `LISTENER` o `EXPOSITOR` e
      institución completa accede a `Mis trabajos` desde Mis congresos.
- [ ] CA-02: La bandeja muestra únicamente trabajos donde el usuario es autor
      `ACCEPTED`.
- [ ] CA-03: La tabla presenta código, título, versión, dictamen, pago, última
      actividad y acción según la captura aprobada.
- [ ] CA-04: El filtro de estado consulta y pagina resultados reales.
- [ ] CA-05: Un borrador muestra `Editar` sólo para el autor responsable.
- [ ] CA-06: Un trabajo `NEEDS_REVISION` muestra `Corregir` sólo para el autor
      responsable.
- [ ] CA-07: Un coautor sólo accede al detalle y no recibe acciones de edición,
      corrección ni comprobante.
- [ ] CA-08: `Subir comprobante` aparece sólo cuando `canUploadPayment` es
      verdadero y navega al flujo de pagos existente.
- [ ] CA-09: `Crear nuevo trabajo` se deshabilita fuera del período de
      presentación y comunica el motivo.
- [ ] CA-10: Una actividad nula muestra `Actividad no disponible`.
- [ ] CA-11: La pantalla contempla carga, error, vacío y paginación.
- [ ] CA-12: El retorno desde FE-05 apunta a la bandeja del congreso.
- [ ] CA-13: La interfaz respeta la captura aprobada en 1366 × 768 y
      1920 × 1080, sin desbordamiento horizontal.

## 10. Dependencias y decisiones pendientes

### Dependencias

- FE-04 para el alta y edición de borradores.
- FE-05 para detalle e historial de evaluaciones.
- FE-06 para corrección y reenvío.
- Endpoint participante integrado en backend desde `develop`.
- Flujo de pagos existente para comprobantes.

### Decisiones pendientes

- El backend debe definir en una futura migración si realizará un backfill de
  actividad para trabajos existentes. Hasta entonces, el frontend contempla
  actividad nula.

## 11. Notas de implementación

- No reutilizar `AdminPapersPage`: responde a permisos, filtros y acciones de
  administración diferentes.
- Reutilizar el cliente Axios, TanStack Query, tipos de estado y disponibilidad
  de presentación ya existentes.
- Mantener los datos remotos en consultas de TanStack Query; no incorporar
  estado global ni dependencias nuevas.
- Registrar la ruta participante antes de rutas dinámicas que puedan
  interceptarla y coordinar el cambio en `src/app/router.tsx`.

## 12. Verificación final

- [ ] Se cumplen los criterios de aceptación.
- [ ] Se respetó la captura y el alcance aprobados.
- [ ] Se ejecutaron type-check, lint, formato y build.
- [ ] Se validaron responsable, coautor, bandeja vacía, cada estado de pago,
      actividad nula, período cerrado y paginación.
- [ ] Se documentaron errores preexistentes o pendientes.
- [ ] El Pull Request fue creado hacia `develop` y recibió revisión.
