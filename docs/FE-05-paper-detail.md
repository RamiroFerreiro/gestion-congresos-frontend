# FE-05 — Detalle e historial de evaluaciones de trabajos científicos

## 1. Información general

- **ID:** FE-05
- **Nombre:** Detalle e historial de evaluaciones de trabajos científicos
- **Responsable:** Maximiliano Calahorra
- **Estado:** Lista para revisión
- **Rama:** `feature/FE-05-paper-detail`
- **Versión del prototipo:** `0.7.5`
- **URL del prototipo:** https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

## 2. Objetivo

Permitir que los autores `ACCEPTED` consulten el detalle de un trabajo
presentado, su estado y el historial de evaluaciones que ya fueron liberadas.

La pantalla debe preservar la modalidad de evaluación del congreso. En simple
ciego el autor conoce qué evaluador emitió cada evaluación histórica; en doble
ciego no recibe ni visualiza esa identidad.

## 3. Alcance

### Incluye

- Ruta temporal de detalle:
  `/congresses/:congressCode/papers/:paperCode`.
- Consulta real del detalle del trabajo y de su historial de evaluaciones.
- Visualización de código, título, versión, estado, fecha de envío, área
  temática, palabras clave, resumen HTML sanitizado y autores `ACCEPTED` con
  institución y rol dentro de la autoría.
- Visualización del evaluador actualmente asignado solamente cuando la
  modalidad simple ciego lo permite.
- Historial descendente de evaluaciones liberadas: versión evaluada, fecha,
  resultado, observación, fecha límite de corrección cuando corresponda e
  identidad histórica del evaluador cuando sea visible.
- Estados de carga, error, acceso denegado y ausencia de evaluaciones
  liberadas.
- Botón visual deshabilitado `Corregir y reenviar` para el autor responsable
  cuando el trabajo esté en `NEEDS_REVISION`; su navegación y operación
  pertenecen a FE-06.
- Integración con Axios y TanStack Query siguiendo los patrones existentes.
- Registro de la feature y sus criterios de aceptación en este documento.

### No incluye

- Corrección, edición o reentrega del trabajo; corresponde a FE-06.
- Bandeja o listado de trabajos propios y su navegación de entrada.
- Solicitud, alta, baja u ordenamiento de coautores.
- Asignación, reasignación o carga de evaluaciones.
- Pago, comprobantes, notificaciones por correo o acciones administrativas.
- Mostrar evaluaciones aún no liberadas ni identidades de evaluadores en doble
  ciego.

## 4. Usuarios y permisos

| Usuario            | Acceso / acciones                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autor `ACCEPTED`   | Puede consultar el detalle y las evaluaciones liberadas de un trabajo del que forma parte. En simple ciego ve la identidad histórica de cada evaluador; en doble ciego no. |
| Autor responsable  | Tiene el mismo acceso de consulta. Si el estado es `NEEDS_REVISION`, visualiza el acceso deshabilitado a la futura corrección de FE-06.                                    |
| Coautor `ACCEPTED` | Tiene el mismo acceso de consulta, sin acceso a la futura corrección.                                                                                                      |

Administradores, superadministradores y evaluadores poseen reglas de acceso
propias en el backend, pero sus vistas no son alcance de FE-05.

El backend conserva la decisión final sobre autenticación, institución,
participación aceptada y visibilidad de información de evaluación.

## 5. Pantallas y flujo de usuario

### 5.1. Detalle del trabajo

Ruta: `/congresses/:congressCode/papers/:paperCode`.

La ruta se utiliza de forma directa mientras la bandeja de trabajos propios no
esté implementada. Consulta el detalle protegido del trabajo y, si el acceso es
válido, su historial de evaluaciones.

El botón `← Volver a Mis trabajos` conserva el texto de la referencia visual.
Hasta que exista la bandeja de trabajos propios, redirige temporalmente a
`/congresses`. La feature que implemente la bandeja deberá actualizar ese
destino sin alterar el texto del botón.

La cabecera muestra el código y estado/dictamen. Cuando el backend informa la
identidad en modalidad simple ciego, se muestra el evaluador actualmente
asignado como tal; no se usa ese dato para atribuir evaluaciones pasadas.

El contenido evaluado muestra la versión actual, título, palabras clave y
resumen. Los datos complementarios presentan el área temática y los autores
`ACCEPTED`, identificando autor principal o coautor junto con su institución.

### 5.2. Historial de evaluaciones

El historial presenta las evaluaciones liberadas en orden descendente. Cada
ítem contiene la versión evaluada, fecha, resultado, observación y, para
`NEEDS_REVISION`, la fecha límite de corrección. En simple ciego se muestra el
evaluador que creó ese ítem histórico; en doble ciego no se reserva espacio ni
se muestra un sustituto de identidad.

Si no hay evaluaciones liberadas, se informa el estado vacío sin asumir que el
trabajo no tenga un evaluador asignado ni que haya sido rechazado.

Cuando el estado actual es `NEEDS_REVISION`, sólo el autor responsable ve el
botón `Corregir y reenviar` en estado deshabilitado. No navega ni ejecuta una
operación en FE-05. Para los estados `UNDER_EVALUATION`, `ACCEPTED` y
`REJECTED` no se muestra ese botón.

### Referencias visuales

- **Versión aprobada del prototipo:** `0.7.5`.
- **Captura:** `docs/screenshots/participant-detail-paper.png`.

La captura fue ajustada para mostrar institución en cada autor. El botón de
corrección se conserva como referencia visual del estado `NEEDS_REVISION`, pero
en FE-05 debe permanecer deshabilitado hasta que FE-06 implemente su flujo.
La vista ocupa todo el ancho útil provisto por `MainLayout`, sin un `maxWidth`
restrictivo; el espaciado lateral lo aporta el layout compartido.

## 6. Reglas de negocio

- RN-01: Sólo un autor con participación `ACCEPTED` puede consultar el detalle
  y el historial de un trabajo del que forma parte.
- RN-02: Los autores reciben únicamente evaluaciones liberadas. Esta regla la
  aplica el backend; el frontend no debe intentar inferir evaluaciones ocultas.
- RN-03: En simple ciego, el backend puede informar `evaluatorCode` y
  `evaluatorFullName` para cada evaluación histórica visible a un autor.
- RN-04: En doble ciego, ambos campos de identidad histórica deben recibirse
  como `null` y la interfaz no debe mostrar identidad, marcador ni texto
  alternativo del evaluador.
- RN-05: La identidad de una evaluación histórica proviene de quien la creó,
  no del evaluador actualmente asignado al trabajo; una reasignación posterior
  no altera el historial.
- RN-06: El evaluador nunca recibe identidades de autores. Esta protección es
  responsabilidad del backend y no debe debilitarse desde la interfaz.
- RN-07: Autores, instituciones y roles se muestran sólo para autores
  `ACCEPTED` devueltos en el detalle.
- RN-08: El botón de corrección se limita al autor responsable, sólo aparece
  con estado `NEEDS_REVISION` y permanece deshabilitado en esta feature.
- RN-09: El resumen se muestra con el HTML restringido y sanitizado por el
  backend. No se agregan fórmulas, imágenes, enlaces ni estilos arbitrarios.

## 7. Datos e integración

**Modalidad:** Backend real.

### Datos necesarios

- Trabajo: código, congreso, título, versión, estado, fecha de envío, área,
  palabras clave, resumen HTML, autores `ACCEPTED` y evaluador actual cuando
  corresponda.
- Autor: nombre completo, institución y rol de autoría.
- Evaluación: versión evaluada, fecha, resultado, observación, fecha límite y
  evaluador histórico condicionado por permisos y modalidad.

### Servicios involucrados

| Operación                           | Endpoint / servicio                      | Estado     |
| ----------------------------------- | ---------------------------------------- | ---------- |
| Consultar detalle protegido         | `GET /api/papers/{paperCode}`            | Disponible |
| Consultar historial de evaluaciones | `GET /api/evaluations/paper/{paperCode}` | Disponible |

`GET /api/evaluations/paper/{paperCode}` devuelve los campos
`feedback`, `evaluationDate`, `evaluatedVersion`, `newDeadline`, `newStatus`,
`evaluatorCode` y `evaluatorFullName`. Los dos últimos se reciben como `null`
cuando la identidad no puede exponerse al consumidor autenticado.

## 8. Validaciones y manejo de errores

- La ruta requiere una sesión autenticada; errores `401` redirigen o informan
  que la sesión venció según el comportamiento global vigente.
- Ante `403`, se informa que el usuario no tiene permiso para consultar el
  trabajo o no completó su institución, sin mostrar datos parciales.
- Ante `404`, se informa que el trabajo no existe o ya no está disponible.
- Durante la carga se muestran indicadores y no se presenta información
  incompleta como definitiva.
- Un historial vacío muestra un mensaje informativo y no un error.
- Las fechas se formatean para interfaz en español argentino.
- La interfaz respeta los `null` de identidad enviados por el backend y no
  consulta usuarios ni construye nombres de evaluadores por cuenta propia.
- El botón de corrección deshabilitado no debe disparar navegación, mutaciones
  ni mensajes de éxito.

## 9. Criterios de aceptación

- [ ] CA-01: Un autor `ACCEPTED` puede abrir el detalle de un trabajo propio
      mediante la ruta definida.
- [ ] CA-02: Un usuario sin participación aceptada recibe un estado de acceso
      denegado sin visualizar información del trabajo.
- [ ] CA-03: La pantalla muestra código, título, versión, estado, fecha de
      envío, área temática, palabras clave, resumen y autores `ACCEPTED` con
      institución y rol de autoría.
- [ ] CA-04: El resumen se renderiza con el HTML sanitizado entregado por el
      backend.
- [ ] CA-05: El historial muestra sólo evaluaciones liberadas, en orden de la
      más reciente a la más antigua.
- [ ] CA-06: Cada evaluación muestra versión, fecha, resultado, observación y
      fecha límite cuando el resultado es `NEEDS_REVISION`.
- [ ] CA-07: En simple ciego se muestra el evaluador histórico asociado a cada
      evaluación cuando el backend lo informa.
- [ ] CA-08: En doble ciego no se muestra identidad, marcador ni dato derivado
      de ningún evaluador histórico o actual.
- [ ] CA-09: La pantalla contempla carga, error, acceso denegado y ausencia de
      evaluaciones liberadas.
- [ ] CA-10: Sólo el autor responsable visualiza el botón de corrección
      deshabilitado cuando el estado es `NEEDS_REVISION`; no se muestra para otros
      estados ni coautores.
- [ ] CA-11: La pantalla respeta la referencia visual ajustada en 1366 × 768 y
      1920 × 1080, sin desbordamiento horizontal.

## 10. Dependencias y decisiones pendientes

### Dependencias

- `GET /api/evaluations/paper/{paperCode}` con trazabilidad histórica de
  evaluadores ya integrada en backend.
- Coordinación para modificar `src/app/router.tsx`, archivo compartido.
- Futura bandeja de trabajos propios para enlazar la ruta de detalle.
- FE-06 para habilitar la navegación y operación de corrección/reentrega.

### Decisiones pendientes

No hay decisiones funcionales pendientes que bloqueen FE-05. La implementación
de FE-06 reemplazará el botón deshabilitado por una acción navegable para el
autor responsable.

## 11. Notas de implementación

- Reutilizar el tipo y servicio de detalle introducidos en FE-04, ampliándolos
  con el tipo y consulta de historial de evaluaciones; no duplicar contratos.
- Mantener los datos remotos en consultas independientes de TanStack Query y
  no crear estado global para esta pantalla.
- No reutilizar `AdminPapersPage`: esa pantalla responde a necesidades y
  permisos administrativos distintos.
- El renderer del resumen debe usar exclusivamente el HTML ya sanitizado por
  backend; no incorporar un editor enriquecido en una vista de consulta.

## 12. Verificación final

- [ ] Se cumplen los criterios de aceptación aplicables.
- [ ] Se respetó el alcance de consulta de FE-05.
- [ ] Se utilizó la versión `0.7.5` y la captura visual aprobada.
- [ ] Se revisaron los cambios realizados y los archivos compartidos.
- [ ] Se ejecutaron las validaciones técnicas correspondientes.
- [ ] Se validaron manualmente simple ciego, doble ciego, historial vacío y
      acceso denegado.
- [ ] Se documentaron limitaciones o pendientes.
- [ ] El Pull Request fue creado hacia `develop` y recibió revisión.
