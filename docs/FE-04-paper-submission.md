# FE-04 — Envío y edición de borradores de trabajos científicos

## 1. Información general

- **ID:** FE-04
- **Nombre:** Envío y edición de borradores de trabajos científicos
- **Responsable:** Maximiliano Calahorra
- **Estado:** Validada — lista para commit y PR
- **Rama:** `feature/FE-04-paper-submission`
- **Versión del prototipo:** `0.7.5`
- **URL del prototipo:** https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

## 2. Objetivo

Permitir que un participante elegible cree un trabajo científico, lo guarde sin
enviarlo a evaluación y, mientras permanezca como borrador, lo consulte y
edite. La pantalla utiliza reglas reales del congreso e integración real con el
backend.

Un borrador es un trabajo completo en estado `NOT_SUBMITTED`: no es un
formulario parcialmente guardado ni está disponible para evaluación.

## 3. Alcance

### Incluye

- Vista reutilizable para crear y editar borradores de trabajos científicos.
- Rutas propuestas:
  - `/congresses/:congressCode/papers/new`.
  - `/congresses/:congressCode/papers/:paperCode/edit`.
- Consulta de reglas, áreas temáticas y período de presentación del congreso.
- Consulta de la participación autenticada para identificar al responsable y
  su institución.
- Formulario de título, área temática, palabras clave y resumen enriquecido.
- Autor responsable inicial y autores `ACCEPTED` al editar un borrador.
- Eliminación de coautores aceptados por parte del responsable, cuando el
  backend lo autorice. El responsable no puede eliminarse.
- Guardado de un nuevo borrador, actualización de su contenido y envío a
  evaluación.
- Estados de carga, error, éxito y confirmación ante solicitudes pendientes de
  coautoría al enviar.
- Validaciones con React Hook Form y Zod, además de las del backend.

### No incluye

- Inicio del presentador, bandeja/listado de trabajos propios y sus accesos.
- Vista pública de trabajos abiertos, solicitud de coautoría y aceptación o
  rechazo de esas solicitudes.
- Edición de trabajos `NEEDS_REVISION`, evaluación, pagos y comprobantes.
- Retiro o reenvío de un trabajo enviado a evaluación.
- Guardado de borradores incompletos.
- Fórmulas científicas en LaTeX, MathML u otro formato especializado.
- Cambios a autenticación, autorización o contratos del backend.

## 4. Usuarios y permisos

| Rol       | Acceso / acciones                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| LISTENER  | Puede crear un trabajo si tiene participación activa, institución informada y cuenta global habilitada. El backend lo promueve a EXPOSITOR al crear. |
| EXPOSITOR | Puede crear y, si es responsable, editar, enviar o eliminar coautores aceptados de sus borradores.                                                   |

El backend conserva la decisión final sobre permisos, participación activa,
institución y estado. Administradores, evaluadores y superadministradores no
forman parte de esta vista de participante.

## 5. Pantallas y flujo de usuario

### 5.1. Crear trabajo

Ruta: `/congresses/:congressCode/papers/new`.

La pantalla consulta el congreso y la participación del usuario autenticado.
Muestra las reglas aplicables, el responsable con su institución y el formulario
vacío. El responsable es el único autor inicial; no existe selector ni acción
para agregar autores desde esta vista.

**Guardar borrador** crea un trabajo `NOT_SUBMITTED` si el formulario es válido.
**Enviar trabajo** crea el trabajo y luego solicita su envío a evaluación. Si el
segundo paso falla, el borrador creado se conserva en `NOT_SUBMITTED` y se
informa el error.

Al guardar por primera vez, la ruta se actualiza a la edición del borrador y se
muestra una confirmación no bloqueante mediante MUI `Snackbar`.

### 5.2. Editar borrador

Ruta: `/congresses/:congressCode/papers/:paperCode/edit`.

La pantalla consulta el detalle del trabajo. Sólo ofrece edición para un trabajo
`NOT_SUBMITTED` cuyo responsable sea el usuario autenticado. La lista proviene
de los autores `ACCEPTED` incluidos en el detalle del paper; puede contener al
responsable y coautores aceptados mediante el flujo externo de solicitudes.

Los coautores aceptados pueden mostrar la acción de eliminación; el responsable
no. La vista no crea ni acepta solicitudes de coautoría.

**Guardar borrador** actualiza los metadatos y las palabras clave aplicables.
**Enviar trabajo** persiste cambios pendientes y solicita el envío.

El destino funcional posterior al guardado o envío es la futura bandeja de
trabajos del congreso. Hasta que esa ruta exista, no se navega a una pantalla
ficticia: el guardado conserva o actualiza la ruta de edición y muestra un
`Snackbar`; luego de un envío exitoso la vista queda inactiva, sin acciones de
edición, e informa el resultado con el mismo mecanismo.

### 5.3. Envío y solicitudes pendientes

El envío cambia el estado de `NOT_SUBMITTED` a `UNDER_EVALUATION` y bloquea la
edición posterior. Si el backend responde `409` por solicitudes pendientes, se
informa la situación y se pide confirmación antes de reintentar con
`confirmDiscardPendingRequests=true`.

### Referencias visuales

- **Versión aprobada del prototipo:** `0.7.5`.
- **Capturas:**
  - `docs/screenshots/participant-create-paper-1.png`.
  - `docs/screenshots/participant-create-paper-2.png`.

La segunda captura representa la creación inicial con un responsable. La misma
sección se reutiliza para mostrar varios autores aceptados al editar un borrador.

La ayuda visual del resumen debe indicar solamente formatos soportados:
negrita, cursiva, subrayado, subíndices, superíndices y citas. La mención a
«fórmulas» de la captura debe corregirse antes de la validación visual final.

## 6. Reglas de negocio

- RN-01: Sólo un participante activo, con cuenta habilitada, institución
  informada y rol `LISTENER` o `EXPOSITOR` puede crear un trabajo.
- RN-02: El creador es el responsable y se envía como el primer y único valor de
  `authorUserCodes` al crear.
- RN-03: Un trabajo nuevo se crea en `NOT_SUBMITTED` y todavía no puede asignarse
  a evaluación.
- RN-04: Un borrador requiere título, área temática, resumen y al menos una
  palabra clave; no se persisten borradores incompletos.
- RN-05: El área temática debe pertenecer al congreso.
- RN-06: Las palabras clave se ingresan separadas por comas. El backend controla
  duplicados, máximo y repetición en el título; el mínimo se verifica al enviar.
- RN-07: El bloque inicial contiene sólo al responsable. Los coautores se
  incorporan mediante solicitudes fuera de esta feature.
- RN-08: Al editar se muestran sólo autores `ACCEPTED`. El responsable puede
  eliminar coautores, pero nunca a sí mismo.
- RN-09: El resumen se guarda como HTML sanitizado. Se admiten `p`, `strong`,
  `b`, `em`, `i`, `u`, `sub`, `sup`, `blockquote` y `br`, sin atributos.
- RN-10: No se admiten fórmulas especializadas, imágenes, enlaces, estilos
  arbitrarios ni HTML fuera de la lista permitida.
- RN-11: Sólo el responsable puede enviar. El envío cambia el estado a
  `UNDER_EVALUATION` y bloquea la edición en FE-04.
- RN-12: Con solicitudes `PENDING`, el responsable debe confirmar su descarte
  para enviar. El backend descarta y envía en la misma operación.

## 7. Datos e integración

**Modalidad:** Backend real.

### Datos necesarios

- Congreso: código, áreas temáticas, máximo de autores, reglas de palabras
  clave y fechas de presentación.
- Participación autenticada: identidad, rol e institución del responsable.
- Trabajo: código, estado, título, área, resumen HTML, palabras clave y autores
  aceptados.

### Servicios involucrados

| Operación                         | Endpoint / servicio                                         | Estado     |
| --------------------------------- | ----------------------------------------------------------- | ---------- |
| Consultar reglas del congreso     | `GET /api/congresses/{congressCode}`                        | Disponible |
| Consultar participación propia    | `GET /api/congresses/{congressCode}/participants/me`        | Disponible |
| Crear borrador                    | `POST /api/papers`                                          | Disponible |
| Consultar borrador                | `GET /api/papers/{paperCode}`                               | Disponible |
| Actualizar título, área y resumen | `PUT /api/papers/{paperCode}`                               | Disponible |
| Agregar palabra clave             | `POST /api/papers/{paperCode}/keywords?keyword={keyword}`   | Disponible |
| Quitar palabra clave              | `DELETE /api/papers/{paperCode}/keywords?keyword={keyword}` | Disponible |
| Eliminar coautor aceptado         | `DELETE /api/papers/{paperCode}/authors/{userCode}`         | Disponible |
| Enviar a evaluación               | `PATCH /api/papers/{paperCode}/submit`                      | Disponible |

El alta inicial envía `title`, `thematicArea`, `summary`, `keywords`,
`congressCode` y un único `authorUserCodes` con el código autenticado. El
backend asigna internamente `ABSTRACT` y la fecha de envío al ejecutar `submit`.

El `PUT` no modifica palabras clave ni autores. Para un borrador existente, la
interfaz coordina metadatos y cambios de palabras clave como una única acción
visible de guardado.

## 8. Validaciones y manejo de errores

- Título, área, resumen y al menos una palabra clave son obligatorios para
  crear un borrador.
- El editor no genera HTML fuera de los formatos acordados; el backend vuelve a
  sanitizar y validar el resumen.
- Las palabras clave se limpian de espacios y entradas vacías antes de formar el
  arreglo. Se muestran las reglas del congreso.
- Los errores se muestran junto a los campos y se conserva el mensaje del
  backend cuando corresponda.
- Durante consultas, guardado, eliminación o envío se deshabilitan acciones
  duplicadas y se informa carga.
- Fallas de autenticación, participación, institución, permisos, congreso,
  área, estado o período no se convierten en éxitos locales.
- Ante `409` se solicita confirmación antes de reintentar el envío.
- Tras una operación exitosa se actualizan las consultas afectadas y se muestra
  una confirmación no bloqueante.

## 9. Criterios de aceptación

- [x] CA-01: Un LISTENER o EXPOSITOR elegible puede abrir la creación para un
      congreso válido.
- [x] CA-02: La pantalla muestra reglas y áreas temáticas reales del congreso.
- [x] CA-03: La creación muestra sólo al responsable con su institución, sin
      selector ni acción para agregar autores.
- [x] CA-04: Un borrador muestra al responsable y coautores `ACCEPTED`; sólo
      estos últimos pueden eliminarse.
- [x] CA-05: El formulario valida campos obligatorios y reglas aplicables de
      palabras clave.
- [x] CA-06: Guardar crea o actualiza un trabajo `NOT_SUBMITTED` completo sin
      enviarlo a evaluación.
- [x] CA-07: Enviar un trabajo válido lo transiciona a `UNDER_EVALUATION` y
      bloquea la edición posterior.
- [x] CA-08: Solicitudes pendientes exigen confirmación antes de descartarse.
- [x] CA-09: El resumen preserva sólo el HTML permitido y no ofrece fórmulas
      especializadas.
- [x] CA-10: La interfaz muestra carga, error y éxito sin ocultar fallas del
      backend.
- [x] CA-11: La pantalla respeta las referencias ajustadas en 1366 × 768 y
      1920 × 1080, sin desbordamiento horizontal.

## 10. Dependencias y decisiones pendientes

### Dependencias

- Inicio del presentador y bandeja de trabajos, que deberán enlazar a las rutas
  de creación y edición.
- Coordinación para modificar `src/app/router.tsx`, un archivo compartido.
- Ajuste de la ayuda de formato en
  `docs/screenshots/participant-create-paper-2.png`.

### Decisiones pendientes

No hay decisiones funcionales pendientes que bloqueen el análisis técnico de
FE-04. La bandeja de trabajos continúa como dependencia de navegación futura.

## 11. Notas de implementación

- Mantener un único componente de formulario en modo creación o edición según
  la ruta; no duplicar la interfaz por cantidad de autores.
- Al crear, obtener responsable desde autenticación y participación. Al editar,
  usar autores del detalle del trabajo; no consultar participantes
  administrativos del congreso.
- Usar Tiptap como editor HTML restringido, con `@tiptap/react`,
  `@tiptap/pm`, `@tiptap/starter-kit`,
  `@tiptap/extension-subscript`,
  `@tiptap/extension-superscript` y
  `@tiptap/extension-underline`. La barra se construirá con controles MUI.
  Se deshabilitarán las extensiones que produzcan etiquetas fuera de la política
  del backend, como enlaces, listas, encabezados, tachado, código y reglas
  horizontales. El HTML del editor no reemplaza la sanitización del backend.
- No reutilizar el componente legacy con `@ts-nocheck`, token falso y
  almacenamiento local como base de FE-04 sin un análisis posterior.
- No se crearán mocks ni se modificarán contratos del backend para FE-04.

## 12. Verificación final

- [x] Se cumplen los criterios de aceptación aplicables.
- [x] Se respetó el alcance y la versión `0.7.5` del prototipo.
- [x] Se corrigió la referencia visual de formatos antes de compararla.
- [x] Se revisaron los cambios realizados y los archivos compartidos.
- [x] Se ejecutaron `npm run build`, `npm run lint`, `npm run format:check` y
      la verificación de TypeScript disponible.
- [x] Se probaron creación, edición, envío, errores y confirmación de
      solicitudes pendientes.
- [x] Se documentaron limitaciones y errores preexistentes.
- [ ] El Pull Request fue creado hacia `develop` y recibió revisión.

El lint global conserva cuatro errores preexistentes fuera de FE-04, en
`AuthContext`, `CongressComponent` y el componente legacy `PaperComponent`.
El formato global también informa 61 archivos preexistentes fuera de formato.
Los archivos incorporados o modificados para esta entrega cumplen las
verificaciones de TypeScript, ESLint y Prettier aplicables; el build de Vite
finaliza correctamente.
