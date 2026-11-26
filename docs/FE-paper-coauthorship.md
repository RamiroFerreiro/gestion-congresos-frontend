# FE-14 — Coautoría de trabajos: catálogo y solicitudes

## Contexto y alcance

- Rama frontend: `feature/FE-14-paper-coauthorship`, desde `develop` actualizado. Backend publicado directamente en `develop`, por autorización del equipo.
- Estética: componentes, tema y distribución existentes de C4T; prototipo 0.7.5 como referencia general. Estas vistas no tienen una captura aprobada en el prototipo.
- Implementación real con Axios, TanStack Query, React Hook Form/Zod y Material UI, sin dependencias nuevas.
- No incluye notificaciones internas, historial de rechazados, cancelación del solicitante, transferencia de responsabilidad ni un panel administrativo nuevo.
- Se conservan los cambios locales ajenos y no se arrastra el commit del selector de países.

## Catálogo de incorporación

Ruta: `/congresses/:congressCode/coauthorship`. Accesos «Buscar trabajo para unirme» desde Inicio y Mis trabajos.

El formulario busca coincidencias parciales de código o título al pulsar Buscar o Enter. La búsqueda y la página se guardan en la URL. El listado muestra código, título, área y autores aceptados/máximo; no enlaza al detalle privado. Páginas de 10 trabajos ordenadas por código, con corrección de página cuando desaparece el último resultado.

El modo `forCoauthorship=true` de `GET /api/papers/congresses/{congressCode}` devuelve una página con estos elementos:

```ts
interface CoauthorshipPaper {
  code: string;
  title: string;
  thematicArea: string;
  acceptedAuthorCount: number;
  maxNumberOfAuthors: number | null;
}
```

El modo habitual del endpoint y `/mine` permanecen sin cambios. En modo de coautoría, solo `search`, `thematicArea` y paginación afectan la consulta; los filtros administrativos no pueden modificar la elegibilidad. No se devuelven autores, contactos, evaluadores, pagos ni resúmenes.

## Reglas

- Solicitante con cuenta habilitada, inscripción activa, institución completa y rol LISTENER o EXPOSITOR. Administradores, evaluadores y superadministradores no pueden solicitar.
- Congreso habilitado y período de presentación abierto, con extremos incluidos. El backend usa `DateUtils.now()` de Argentina, igual que el envío de trabajos.
- Trabajo del congreso en NOT_SUBMITTED, con cupo y sin relación previa del solicitante, tanto PENDING como ACCEPTED.
- El cupo cuenta autores ACCEPTED, incluido el responsable; solicitudes pendientes no reservan lugares. Un máximo nulo significa sin límite.
- Fuera del período o con congreso deshabilitado, el catálogo devuelve una página vacía y se explica el cierre en la interfaz.
- Solicitar, aceptar y rechazar revalidan condiciones en backend; cambios concurrentes no dependen de los datos visibles en pantalla.

## Solicitud y respuesta

El solicitante se identifica con el `user.code` de su participación autenticada:

| Acción     | Endpoint                                                           |
| ---------- | ------------------------------------------------------------------ |
| Solicitar  | `POST /api/papers/{paperCode}/authors/requests/{userCode}`         |
| Pendientes | `GET /api/papers/{paperCode}/authors/requests/pending`             |
| Aceptar    | `PATCH /api/papers/{paperCode}/authors/requests/{userCode}/accept` |
| Rechazar   | `PATCH /api/papers/{paperCode}/authors/requests/{userCode}/reject` |

Después de solicitar, se confirma el envío y se actualiza el catálogo: el trabajo deja de aparecer para ese usuario. Se impiden envíos duplicados.

En Mis trabajos, cada fila NOT_SUBMITTED donde `responsibleAuthor=true` incorpora «Solicitudes», sin depender del filtro seleccionado. Abre un modal con nombre, institución, correo y acciones Aceptar/Rechazar. Se consulta únicamente al abrirlo, no por cada fila. No hay un segundo diálogo de confirmación.

El modal consulta también el estado y autoría vigentes y bloquea las decisiones durante consultas y mutaciones. Fuera del período se permite leer los pendientes, con acciones deshabilitadas. Se informa el éxito y se actualizan pendientes, autores, detalle, borrador, bandeja e inicio. Las claves de caché incluyen usuario, congreso y trabajo cuando corresponde.

Al aceptar se conserva la promoción LISTENER → EXPOSITOR; al rechazar se elimina la solicitud y el usuario puede volver a pedir incorporación. Los correos del backend se mantienen. El solicitante ve el trabajo en su bandeja cuando actualiza después de la aceptación; no se incorpora un aviso interno automático.

Los fallos de consulta se muestran como errores con reintento, nunca como una lista vacía. Los errores de validación conservan el mensaje del backend. Se manejan sesión vencida, permisos, recurso inexistente, duplicados, conexión y fallas del servidor.

## Concurrencia y compatibilidad

El backend bloquea la fila del trabajo con PESSIMISTIC_WRITE antes de solicitar, aceptar, rechazar o enviar a evaluación. Las altas directas y otras mutaciones de autoría usan el mismo bloqueo para no competir por el cupo ni por la responsabilidad. Se conserva la confirmación existente de descarte de solicitudes al enviar un borrador.

Integrar primero backend y su Swagger; después frontend. No hay migraciones ni cambios de contratos existentes sin `forCoauthorship=true`.

El backend concentra el catálogo en `PaperAuthorService`/`PaperAuthorServiceImpl`, junto con la gestión de autoría. Las pruebas nuevas del backend se conservan locales y están excluidas de su commit mediante `.git/info/exclude`; las pruebas frontend permanecen dentro del alcance de esta feature.

## Validación prevista

- JUnit/Mockito: ventanas temporales, roles, participantes inválidos, modos del endpoint y campos serializados.
- MySQL aislado: filtros antes de paginar, totales, cupos, máximo nulo, aislamiento por congreso, duplicados, rechazo y nueva solicitud, estado desactualizado y aceptaciones concurrentes.
- Frontend: permisos de acciones, fechas, errores, paginación e invalidación aislada de caché con `node:test`.
- Navegador con API aislada y cuentas ficticias: búsqueda, solicitud, rechazo, aceptación, promoción, bandeja del coautor y cierre de período.
- Capturas a 1366×768 y 1920×1080, TypeScript, build, ESLint y Prettier. Registrar fallos globales preexistentes por separado.

```sh
node --experimental-strip-types --test src/features/papers/tests/coauthorship.test.mjs src/features/congresses/tests/congressRules.test.mjs
npx tsc --noEmit
npm run build
npm run lint
npm run format:check
```

## Resultados — 25/11/2026

- Backend: 20 pruebas focalizadas aprobadas, incluidas consultas MySQL aisladas, competencia por el último cupo y regresiones de inicio del participante. JAR generado correctamente.
- Frontend: 14 pruebas aprobadas (6 de coautoría y 8 existentes de congresos), TypeScript, build y ESLint de archivos involucrados correctos.
- El lint global conserva 7 errores preexistentes; el formato global informa problemas en archivos existentes y en la guía local SKILLS.md. Los archivos nuevos de esta feature pasan Prettier. Se conserva la advertencia conocida de bundle mayor a 500 kB.
- Chrome contra API real en 8081 y MySQL temporal en 3308: permisos, privacidad de la respuesta, Swagger, búsqueda parcial, URL/paginación, doble clic, rechazo y nueva solicitud, aceptación, promoción, aparición en `/mine`, estado modificado y cierre de período. Modal fuera del período en modo de lectura; API rechaza aceptar/rechazar con 400. Sin excepciones del navegador.
- Se comprobó que abrir la bandeja no consulta pendientes por cada fila. La prueba usa un puente HTTP de navegador a la API aislada, sin respuestas simuladas.
- No se modificaron datos ni contenedores habituales del proyecto ni se enviaron correos externos; la prueba usó cuentas ficticias y SMTP dirigido a localhost.
- Se preservaron las modificaciones locales de `.gitignore`, `SKILLS.md` y `application.properties`. Publicación del frontend mediante PR hacia `develop`; las pruebas nuevas del backend quedan fuera de su commit por pedido del equipo.

Evidencia visual:

- Catálogo: [1366×768](screenshots/coauthorship-catalog-1366x768.png), [1920×1080](screenshots/coauthorship-catalog-1920x1080.png).
- Solicitudes: [1366×768](screenshots/coauthorship-requests-1366x768.png), [1920×1080](screenshots/coauthorship-requests-1920x1080.png).
