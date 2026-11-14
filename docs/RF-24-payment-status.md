# RF-24 — Consulta y revisión del estado de pago

## Referencia y alcance

Referencia visual autorizada: `prototipo-congresos-codigo-fuente.zip`, archivo
`prototipo-congresos/public/prototipo.html`, suministrado por el usuario en esta
sesión. Se utiliza esa copia como referencia, sin asumir una versión numérica.
Se revisaron el código y los estilos; no se verificaron interacciones en navegador.

Implementación en React, TypeScript, MUI, Axios, TanStack Query y React Hook Form
con Zod. No incorpora dependencias ni cambios en el backend.

## Acceso y pantallas

- Desde Mis congresos, los participantes administradores y expositores con
  institución completa disponen del acceso a pagos.
- `/congresses/:congressCode/payments`: listado paginado administrativo o
  consulta por código para expositores.
- `/congresses/:congressCode/payments/:paperCode`: detalle del estado, observaciones,
  comprobante y acciones permitidas.
- Evaluadores y oyentes no tienen acceso a estas vistas. El backend conserva
  la autoridad sobre los permisos por congreso y por trabajo.
- Los congresos gratuitos muestran que no requieren pagos y no ofrecen carga
  ni revisión de comprobantes.

## Estados y validaciones

| API                | Interfaz        |
| ------------------ | --------------- |
| `null`             | Sin comprobante |
| `PENDING_APPROVAL` | Por revisar     |
| `APPROVED`         | Verificado      |
| `REJECTED`         | Rechazado       |

La carga se ofrece únicamente al autor principal aceptado con rol expositor,
en trabajos `ACCEPTED`, sin comprobante o con comprobante rechazado. Requiere
un archivo no vacío PDF, PNG o JPG. El servidor determina el tamaño permitido;
se informa específicamente una respuesta HTTP 413.

La revisión administrativa se ofrece para comprobantes pendientes de trabajos
aceptados. Aprobar requiere confirmación; rechazar requiere un motivo sin
espacios vacíos y de hasta 255 caracteres. Un pago verificado no ofrece acciones
de modificación. Los errores de permisos o de concurrencia se muestran y se
vuelve a consultar el estado.

La vista previa y descarga del archivo usan Axios con el JWT de la sesión,
sin incluir credenciales en URLs. Las URLs temporales se liberan al cerrar.
Tras cargar o revisar se actualizan las consultas del pago, el comprobante y
el listado. La caché se separa por usuario y congreso.

## Contratos disponibles y diferencias con la documentación del backend

La implementación consulta los controladores y DTO del backend actual, que no
coinciden completamente con `gestion-congresos-backend/docs/RF-24.md`:

- No existe `GET /api/papers/payments?congressCode=...`. El listado administrativo
  usa `GET /api/papers/{congressCode}/papers?status=ACCEPTED&page=...&size=10&sort=code,asc`
  y consulta el detalle y el pago de cada trabajo visible. Los contadores
  representan exclusivamente la página actual y excluyen consultas fallidas.
  Este enfoque genera más solicitudes que un listado específico de pagos.
- No hay un endpoint de trabajos propios. El expositor consulta por código;
  nunca se descarga el listado general para filtrar autores en el navegador.
- `GET /api/papers/payments/{paperCode}` devuelve 404 sin comprobante. Antes se
  obtiene el detalle autorizado del trabajo y se comprueba su congreso. Solo
  entonces ese 404 se representa como ausencia de comprobante. Los errores de
  consulta del trabajo y los 403 no se convierten en estados financieros.
- La consulta acepta también el contrato futuro con HTTP 200 y `status: null`.
- El acceso global respeta el campo opcional `superAdmin` ya definido en el
  contexto de autenticación. Su suministro en la respuesta de inicio de sesión
  sigue pendiente en el proyecto; no se deducen privilegios de la ausencia de
  participación. Los administradores de congreso usan su participación activa.

Otras rutas consumidas:

- `GET /api/congresses/{congressCode}`.
- `GET /api/congresses/{congressCode}/participants/me`.
- `GET /api/papers/{paperCode}`.
- `GET /api/papers/payments/file/{paperCode}`.
- `POST /api/papers/{paperCode}/payment`, multipart con parte `file`.
- `PATCH /api/papers/payments/{paperCode}/status`, con `status` y `observations`.

La exportación del Libro de Resúmenes pertenece a otro requerimiento y no se
incorpora a esta pantalla.

## Revisión funcional a cargo del equipo

1. Ingresar como expositor y consultar un trabajo propio sin comprobante.
2. Cargar un PDF, PNG o JPG y comprobar el estado Por revisar.
3. Ingresar como administrador del congreso, localizarlo en el listado y abrir
   el comprobante. Revisar búsqueda, paginación y recuperación de errores.
4. Rechazar con motivo y verificar su visualización para el expositor.
5. Reenviar un comprobante y aprobarlo; comprobar que desaparezcan las acciones
   de carga y revisión cuando quede Verificado.
6. Verificar que un coautor pueda consultar y no cargar; que otro expositor,
   evaluadores y oyentes no puedan consultar pagos ajenos.
7. Revisar un congreso gratuito, un trabajo no aceptado, una sesión vencida y
   los errores de conexión, archivo vacío, formato incorrecto y HTTP 413.
8. Comparar en escritorio con la referencia del ZIP, incluyendo los diálogos.

No se ejecutan pruebas funcionales ni automatizadas por indicación del contexto
maestro. Los resultados de compilación y análisis estático se informan por
separado al entregar el cambio.
