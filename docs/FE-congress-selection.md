# Selección e inscripción en congresos

## Acuerdos vigentes

Confirmados el 12/11/2026. Esta especificación corresponde al flujo común
posterior al login. FE-03 es un antecedente y no define este flujo.

- Referencia visual: prototipo 0.7.5 y capturas compartidas de los listados.
- Integración real; sin mocks. Backend consultado en `develop`, commit `b618e64`.
- Todos los usuarios ven los congresos habilitados (`enabled=true`), incluso
  los finalizados. Las fechas determinan sus estados visuales.
- Inscribirse exige período de inscripción vigente y congreso no finalizado.
- La inscripción propia asigna LISTENER y requiere institución (1–255 caracteres).
- Una participación activa permite acceder aun con inscripción cerrada o congreso
  finalizado. Antes de operar se debe completar cualquier institución pendiente.
- Una participación dada de baja requiere reactivación administrativa. Se conserva
  el mensaje del backend al intentar inscribirse.
- El JWT autentica las llamadas. El rol se obtiene por congreso, no del almacenamiento
  del navegador. El código de usuario viene en la participación o `/api/users/me`.
- El último congreso se recordará por usuario y se intentará abrir automáticamente
  después del login, validando habilitación y participación. Tras inscribirse se
  ingresará directamente. Estos accesos se conectarán cuando existan los inicios.
- El mantenimiento del prototipo está a cargo de otro integrante.

## Incremento 1

Ruta protegida: `/congresses`. Para revisarlo, iniciar sesión con el flujo existente
y abrir esa ruta manualmente. El login conserva su destino actual (`/dashboard`).

Implementado: listado, tarjetas, consulta de participación, inscripción, completar
institución y estados de carga, error, éxito y vacío. El acceso a los inicios está
deshabilitado temporalmente; no se agregan rutas ficticias ni métricas inventadas.
La selección destacada se incorporará junto a la persistencia del último congreso.

### Contratos

| Acción                  | Endpoint                                                   |
| ----------------------- | ---------------------------------------------------------- |
| Listar habilitados      | `GET /api/congresses?enabled=true`                         |
| Consultar participación | `GET /api/congresses/{code}/participants/me`               |
| Inscribirse             | `POST /api/congresses/{code}/participants/me`              |
| Completar institución   | `PATCH /api/congresses/{code}/participants/me/institution` |

Las escrituras envían `{ institution }` y reciben `{ message }`. Luego se invalida
la consulta de participación. La caché se separa por usuario y se limpia al salir.

Un 404 de participación significa ausencia de participación activa, pero no permite
distinguir una baja previa. Otras fallas no habilitan la inscripción. No existe un
endpoint agregado de participaciones propias: se consulta por congreso.

`AuthService` contempla `superAdmin?: boolean` y documenta junto al login el contrato
pendiente. Ausencia del campo no habilita permisos; no se simula un superadministrador.
El backend sigue siendo responsable de autorizar cada operación.

Las fechas del backend son LocalDateTime sin offset: se interpretan en la zona local
del navegador y se actualizan visualmente cada 30 segundos. El servidor valida de
nuevo al inscribirse. Queda pendiente acordar un contrato de zona horaria explícito
si se requiere soportar usuarios en distintas zonas.

## Validación y revisión manual

- Abrir sin sesión: redirige al login.
- Listado vacío, fallas de red y reintento; fallo de participación por tarjeta.
- Congreso abierto sin participación: permite institución e inscripción.
- Institución vacía, espacios o más de 255 caracteres: no enviar.
- Tras una escritura exitosa, actualizar participación; conservar mensajes del backend.
- Congreso futuro, inscripción cerrada y congreso finalizado: tarjetas visibles sin inscripción.
- Participación activa con institución pendiente: completar mediante PATCH, no POST.
- Otra cuenta: no reutilizar las participaciones de la anterior.
- Comparar visualmente a 1366×768 y 1920×1080 con el prototipo.

Pruebas de reglas (Node 22.16 o compatible):

```sh
node --experimental-strip-types --test src/features/congresses/tests/congressRules.test.mjs
```

También ejecutar build, lint, format:check y `tsc --noEmit`. Registrar por separado
errores preexistentes y validaciones que no puedan ejecutarse.

### Resultado local del incremento 1

- Build y TypeScript: correctos. Build advierte un bundle de aproximadamente 681 kB.
- Ocho pruebas de reglas: correctas.
- ESLint y Prettier de los archivos del incremento: correctos.
- Lint general: cuatro errores preexistentes en AuthContext y componentes legacy
  de congresos/trabajos. Formato general: 39 archivos previos pendientes.
- Corregida la entrada de index.html, que apuntaba al inexistente main.jsx.
- Sin validación contra API real ni comparación en navegador de las dos resoluciones:
  Docker Desktop no estaba disponible durante esta revisión.
