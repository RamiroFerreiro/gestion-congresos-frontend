# FE-03 — Gestión de congresos del SUPER_ADMIN

## 1. Información general

- **ID:** FE-03.

- **Nombre:** Gestión de congresos del SUPER_ADMIN.

- **Estado:** Pendiente de planificación e implementación.

- **Rama sugerida:** `feature/FE-03-super-admin-congresses`.

- **Tipo:** Funcionalidad integrada frontend + backend.

- **Referencias:** `AGENTS.md`, `docs/FRONTEND-WORKFLOW.md`, capturas de `docs/screenshots/`.

- **Versión aprobada del prototipo:** Pendiente de confirmar. Las capturas versionadas constituyen la referencia visual inicial.

## 2. Objetivo

Como **SUPER_ADMIN**, quiero iniciar sesión y acceder a un listado de **todos los congresos registrados en C4T**, para crear un congreso nuevo o seleccionar uno existente e ingresar a su gestión.

Esta funcionalidad se implementará **de punta a punta**, con persistencia y autorización reales en backend. No se realizará una etapa de maquetado aislada ni se utilizarán mocks como fuente final de datos.

## 3. Alcance

**Acuerdo actualizado del 23/11/2026:** Mis congresos se adapta sobre la pantalla
existente `/my-congresses`, que consulta `GET /api/congresses/mine`. Este acuerdo
reemplaza la propuesta anterior de crear un listado administrativo independiente.
Crear congreso se incorpora en el incremento 2 descripto abajo. El Home
administrativo sigue pendiente de implementación.

### Incremento 1: estado vacío del SUPER_ADMIN

- Reutilizar la consulta real a `/mine`, sin cambiar servicios ni contratos.
- Mostrar la variante de `docs/screenshots/super-admin-congresses-empty.png`
  únicamente cuando `user.superAdmin === true` y la consulta exitosa devuelve `[]`.
- Mantener separados carga, error, listado y estado vacío de los demás roles.
- Ofrecer la acción de creación únicamente al SUPER_ADMIN. Hasta implementar el
  formulario, mostrarla deshabilitada con una explicación; el componente recibe
  un callback para conectar la acción en el siguiente incremento.
- Conservar las tarjetas y la navegación comunes. Este incremento no modifica
  login, router, layout compartido ni backend.
- No implementar todavía creación, Home ni métricas administrativas. Las rutas
  administrativas descriptas más adelante pertenecen a la planificación previa;
  se revisarán antes de integrar el formulario y no se agregan en este incremento.

Validación del incremento:

- Build, TypeScript, ESLint y Prettier de los archivos modificados: correctos.
- Ocho pruebas existentes de reglas de congresos: correctas.
- Dieciséis verificaciones de navegador con respuestas controladas de `/mine`:
  SUPER_ADMIN vacío y con registros, usuario común, administrador de congreso,
  carga, error, reintento y ausencia de desbordamiento a 1366 × 768 y 1920 × 1080.
- La aplicación conserva su servicio real de `/mine`; no se agregaron mocks al
  código de producto. No se validó una instancia real del backend en este incremento.
- Lint general: nueve errores preexistentes, confirmados antes y después del cambio.
  Formato general: pendientes previos en otros archivos; no se reformatearon módulos ajenos.

### Incremento 2: creación real de congresos

Acuerdo del 23/11/2026: agregar el formulario en `/admin/congresses/new`, accesible
únicamente para SUPER_ADMIN y conectado a `POST /api/congresses`. Se habilitan
las acciones de creación de `/my-congresses`, tanto en el estado vacío como en el
listado. No se incluye flecha ni botón de volver, por pedido del desarrollador.
Este incremento no modifica login, layout, theme ni backend.

- Referencias: `super-admin-create-congress-default-1.png`,
  `super-admin-create-congress-default-2.png`,
  `super-admin-create-congress-batch-paid-1.png` y
  `super-admin-create-congress-batch-paid-2.png`, en `docs/screenshots/`.
- Usar React Hook Form y Zod. Los límites iniciales de autores/palabras clave son
  6, 3 y 5, como en las capturas; pueden dejarse vacíos para enviar `null`.
- Validar nombre, sede, contacto, al menos un área temática no vacía, áreas no
  repetidas y límites enteros positivos con mínimo de palabras clave ≤ máximo.
- Incluir fecha y hora locales en las seis fechas principales, todas futuras.
  El inicio de cada etapa debe ser anterior a su fin; entre etapas se admite
  igualdad, respetando registro → presentación → realización.
- En modo BATCH exigir una fecha/hora futura de publicación. En IMMEDIATE enviar
  `plannedEvaluationReleaseDate: null`, descartando cualquier valor oculto.
- Para congresos pagos incluir banco, titular, CBU/CVU, CUIT/CUIL, alias, arancel
  y moneda. Banco y CUIT/CUIL, moneda y horarios complementan las capturas para
  cumplir el contrato real. Respetar las longitudes de los DTO y la precisión
  `DECIMAL(10,2)` del arancel; la moneda se normaliza a tres letras mayúsculas.
- Enviar los datos bancarios en `bankDetailRequestDTO`, dentro del mismo POST.
  Para congresos gratuitos enviar importe cero y cuenta/moneda nulas.
- Los nombres JSON de los booleanos son `free` y `singleBlind`; se verificaron
  serializando y deserializando el DTO compilado con Jackson. No enviar las
  denominaciones Java `isFree` e `isSingleBlind` como claves del request.
- Evitar doble envío. Los errores de comunicación o validación conservan los
  datos ingresados y se muestran en el formulario, sin generar registros locales.
- Tras `201`, invalidar Mis congresos y catálogo para el usuario, regresar a
  `/my-congresses` y mostrar una confirmación con el nombre devuelto por la API.
  La respuesta conserva `congressId` y `code`; no se incorpora todavía un Home.
- La protección de interfaz usa `superAdmin === true`; la autorización efectiva
  permanece en el backend. Los demás roles conservan sus pantallas existentes.

Dependencias de integración real: el código local de backend todavía llama a
`configureCongressBankDetails` incondicionalmente, incluso para congresos
gratuitos. También queda verificar la persistencia de gratuidad/anonimato en
`CongressMapper`. Estas dependencias se reportan, sin corregir el repositorio
backend desde este workspace. No se debe dar por validada la persistencia real
del formulario mediante respuestas controladas de navegador.

Validación local del incremento 2:

- Build y TypeScript (`tsc --noEmit`): correctos. Build mantiene la advertencia
  por tamaño del bundle.
- ESLint y Prettier de los archivos del incremento: correctos.
- Veintiuna pruebas de reglas/contrato: trece nuevas de creación y ocho existentes
  de congresos. Comando: `node --experimental-strip-types --test src/features/congresses/tests/createCongress.test.mjs src/features/congresses/tests/congressRules.test.mjs`.
- Veintinueve verificaciones de navegador con respuestas HTTP controladas:
  acceso por rol, campos condicionales, validaciones, un solo POST ante dos envíos,
  contrato gratuito/pago, conservación de datos ante errores, actualización de
  `/mine`, confirmación y recarga del listado. Se revisaron capturas a 1366 × 768
  y 1920 × 1080, sin desbordamiento horizontal.
- Lint general: mantiene nueve errores ajenos al incremento. Formato general:
  mantiene pendientes previos en otros archivos.
- No se ejecutó una creación contra el backend real ni se modificó ese repositorio.
  El formulario usa Axios y el endpoint real; las respuestas controladas se usaron
  únicamente para verificar el navegador.

### Incremento 3: formato de fechas del formulario

Acuerdo del 23/11/2026: mostrar `DD/MM/YY HH:mm` en las seis fechas principales
y en la publicación programada del modo BATCH. Usar MUI X Date Pickers con
Day.js, calendario en español y horario de 24 horas con precisión de minutos.
La configuración de idioma se limita al formulario.

El año abreviado corresponde a la presentación. El formulario conserva el año
completo y el servicio sigue enviando fechas locales `YYYY-MM-DDTHH:mm:ss`, sin
conversión a UTC. Se mantienen las validaciones de fechas y cronología existentes.

Validación local del incremento 3:

- Build, TypeScript y las 21 pruebas existentes de reglas/contrato: correctos.
- ESLint y Prettier de los archivos de este incremento: correctos.
- Se revisaron los campos vacíos a 1366 × 768 y 1920 × 1080, con el formato
  solicitado y sin desbordamiento horizontal. La comprobación automatizada de
  edición de fechas quedó pendiente; no se autorizó la ejecución adicional de Chrome.
- Lint general conserva nueve errores previos; el chequeo de formato general
  informa 102 archivos ajenos a este incremento. Build mantiene la advertencia
  por tamaño del bundle.

### Incremento 4: estado general del congreso

Mis congresos muestra «Activo» para un congreso habilitado y aún no finalizado,
fuera de las etapas «Recepción abierta» y «En curso». Se conservan las etiquetas
«Deshabilitado» y «Finalizado» con su prioridad actual.

El resumen de `/mine` no contiene fechas de inscripción. Su estado general no
indica disponibilidad para inscribirse. Explorar congresos conserva su cálculo
de inscripción: próximamente, abierta o cerrada, además de las etapas existentes.
Este ajuste no incorpora el destino de gestión administrativa.

Validación del incremento 4: build, TypeScript y las 24 pruebas de reglas/contrato
correctos, incluidas tres nuevas pruebas del estado general y del catálogo.
ESLint y Prettier de los archivos modificados: correctos. Lint general conserva
nueve errores previos y formato general informa 100 archivos ajenos al incremento;
build mantiene la advertencia por tamaño del bundle.

### Incremento 5: presentación del listado del SUPER_ADMIN

Usar la nueva captura de Mis congresos adjuntada por el desarrollador como
referencia visual para el listado con registros. Centrar el contenido y destacar
título, acción de creación, estado y rol. Por pedido posterior del desarrollador,
recuperar dos tarjetas por fila, incluso con un único registro. En la última
revisión se conserva el rótulo «Rol» con 8 px de margen inferior antes del chip.
Alinear los rótulos «Rol» y «Presentación de trabajos — Hasta el…», y mostrar
«Congreso» debajo.
Para un congreso de un solo día mostrar la fecha una vez; si ocupa varios días,
conservar ambas fechas. El estado activo se presenta en verde y el rol en rosado.

Si el listado del SUPER_ADMIN está vacío, mostrar únicamente la acción «Crear
congreso» del estado vacío y ocultar el bloque de acciones del encabezado. Cuando
hay registros, ofrecer «Crear nuevo congreso» en el encabezado.

La variante de tarjeta corresponde al rol `SUPER_ADMIN` recibido en `/mine`.
Los demás roles conservan sus etiquetas, distribución y acciones. Se reutilizan
el encabezado de `MainLayout`, el estado vacío y los servicios existentes.
«Gestionar congreso» permanece deshabilitado, con una explicación accesible por
foco o puntero; su destino administrativo sigue pendiente de implementación.

Validación del incremento 5:

- Build, TypeScript y las 24 pruebas existentes de reglas/contrato: correctos.
- ESLint y Prettier de los archivos modificados: correctos.
- Veintisiete verificaciones de navegador en la revisión del incremento, con
  respuestas HTTP controladas: composición a 1366 × 768 y 1920 × 1080, dos
  tarjetas por fila, ancho de media fila con un registro, margen entre rol y chip,
  nombres largos, estados, fechas de uno o varios días, explicación por teclado,
  estado vacío, carga, error, creación y conservación de acciones de otros roles.
  Se compararon las capturas con la referencia adjuntada. El producto mantiene
  la consulta real a `/mine`; no se agregaron mocks a la aplicación.
- Lint general conserva nueve errores previos y formato general informa 98
  archivos ajenos al incremento. Build mantiene la advertencia por tamaño del bundle.

### Incremento 6: skeleton de Mis congresos

Usar la captura de carga adjuntada por el desarrollador como referencia. Durante
la consulta inicial a `/mine`, mostrar dos tarjetas skeleton de Material UI en
dos columnas, con bloques para título, sede, rol, fechas y acción. Adaptar sus
medidas a las variantes existentes de SUPER_ADMIN y de los demás roles.

El SUPER_ADMIN ve «Crear nuevo congreso» deshabilitado durante la carga para
reservar el espacio que ocupará la acción al recibir los datos. Mantener un
mensaje accesible de carga, ocultar los bloques decorativos a lectores de pantalla
y respetar la preferencia de movimiento reducido.

El skeleton depende de `isPending`: una actualización en segundo plano conserva
las tarjetas ya disponibles. No introducir demoras artificiales. Al terminar la
consulta, mostrar el listado, el estado vacío o el error real correspondiente.

Validación del incremento 6:

- Build y TypeScript: correctos. Build conserva la advertencia por tamaño del bundle.
- ESLint y Prettier de los archivos modificados: correctos. Los chequeos generales
  mantienen nueve errores de lint y problemas de formato en 98 archivos ajenos.
- Dieciocho verificaciones de navegador con respuestas HTTP controladas: carga
  inicial de ambos tipos de usuario, dos tarjetas sin controles interactivos,
  mensaje accesible, movimiento reducido, botón de creación deshabilitado,
  reemplazo por datos, vacío o error, reintento y conservación de datos en caché
  durante una actualización. Se compararon capturas a 1366 × 768 y 1920 × 1080
  con la referencia, sin desbordamiento horizontal. Se conserva el servicio real.

### Incremento 7: wizard de creación para desktop

Transformar el formulario existente en cuatro pasos: Datos generales, Fechas
importantes, Reglas y evaluación, y Pago. Tomar como referencia la captura del
wizard adjuntada por el desarrollador. Mantener un stepper horizontal bordó/gris,
el indicador «Paso X de 4», las superficies outlined y las grillas de escritorio.
No incorporar adaptaciones móviles en este incremento.

Conservar una única instancia de React Hook Form con `shouldUnregister: false`,
el schema Zod, los valores iniciales, las áreas dinámicas, los servicios y el
callback de envío actuales. Mantener `presentationStartDate`,
`presentationEndDate`, `startDate` y `endDate` como nombres de campo: son los
nombres reales de las fechas de presentación y realización en el contrato actual.

- Continuar valida los campos del paso con `trigger()`. Atrás no valida ni borra
  datos. Los errores visibles corresponden al paso actual. El envío final solo
  está disponible en Pago; si la validación completa detecta errores de otro
  paso, mostrar ese paso. Evitar avances duplicados durante la validación.
- Mantener ocultos los datos de pago cuando `paid` es false y limpiar sus errores.
  En IMMEDIATE ocultar y limpiar la fecha programada y sus errores. El schema
  conserva sus reglas condicionales existentes.
- Paso 1: Cancelar / Continuar. Pasos 2 y 3: Atrás / Continuar. Paso 4:
  Atrás / Crear congreso. Conservar «← Mis congresos» en la parte superior.
- Cancelar o volver al listado navega directamente si el formulario no está
  modificado. Si tiene cambios, mostrar el Dialog «¿Salir del formulario?»,
  «Los datos ingresados no se guardarán.», con «Seguir editando» y
  «Salir sin guardar».
- Durante el envío deshabilitar los campos y la navegación; mostrar un indicador
  pequeño y «Creando congreso…» sin alterar el ancho del botón. Conservar los datos
  y el paso ante un error de API.
- Identificar el paso activo con `aria-current`, anunciar el número de paso y
  enfocar su contenido al cambiar. Conservar las etiquetas de los controles.

Validación del incremento 7 y del ajuste de la acción del estado vacío:

- Build, TypeScript y las 24 pruebas existentes de reglas/contrato: correctos.
- Cuarenta y cinco verificaciones de navegador con respuestas HTTP controladas:
  errores por paso, campos obligatorios, áreas repetidas, fechas inválidas y su
  cronología, foco, avance sin saltos, conservación de valores, condiciones de
  pago/BATCH, confirmación de salida, errores de API y reintento. Se verificó un
  único POST durante el envío y el contrato gratuito/pago con fechas locales.
- La validación final vuelve al paso correspondiente si una fecha ya venció.
  Los datos se conservan al regresar, incluyendo áreas dinámicas y datos bancarios.
- Se compararon las capturas a 1366 × 768 y 1920 × 1080 con la referencia y se
  verificó la ausencia de desbordamiento horizontal. El estado vacío ofrece una
  sola acción de creación. Se conserva la protección de acceso del SUPER_ADMIN.
- ESLint y Prettier de los archivos del incremento: correctos. El lint general
  informa nueve errores en otros módulos y el chequeo de formato informa 106
  archivos ajenos al incremento. Build conserva la advertencia de tamaño del bundle.
- No se ejecutó una creación contra el backend real en estas verificaciones;
  la aplicación conserva el servicio y el contrato existentes, sin mocks de producto.

### Incremento 8: fecha y hora en controles separados

Reemplazar el popup combinado por un calendario compacto de Material UI para
la fecha `DD/MM/YY` y un campo editable `HH:mm` de 24 horas. Aplicar el mismo
control a las seis fechas principales y a la publicación programada BATCH.
Conservar la identidad visual, el idioma español y las etiquetas accesibles.
En BATCH, usar «Fecha de publicación por lote» como etiqueta flotante del campo
de fecha para alinear los controles de fecha/hora con el selector de modalidad.
Las seis fechas principales conservan el título sobre sus controles.

Ambos controles representan el mismo campo de React Hook Form. Conservar por
separado la parte ya ingresada cuando la otra está vacía o es inválida, incluso
al volver de paso. El schema existente impide avanzar con valores incompletos.
Elegir un día conserva la hora y editar la hora conserva la fecha.

Mantener los nombres de campos y el formato local del request con año completo,
sin conversión a UTC. No agregar dependencias ni modificar servicios o schemas.

Validación del incremento 8:

- Build, TypeScript y las 24 pruebas de reglas/contrato existentes: correctos.
- Cincuenta y tres verificaciones de navegador con respuestas HTTP controladas,
  incluyendo calendario compacto sin columnas horarias, preservación de la otra
  parte al editar, fecha sola/hora sola al regresar de paso, valores incompletos
  u horas inválidas, etiquetas accesibles y mensajes asociados. Se verificaron
  las transiciones del wizard, BATCH y los contratos gratuito/pago con años
  completos y horas locales. Se revisaron capturas a 1366 × 768 y 1920 × 1080,
  sin desbordamiento horizontal.
- ESLint y Prettier de los archivos del incremento: correctos. Los chequeos
  generales mantienen nueve errores de lint y problemas de formato en 106
  archivos ajenos. Build conserva la advertencia por tamaño del bundle.
- En la revisión de alineación BATCH pasaron 54 verificaciones de navegador,
  incluida la comprobación de que modalidad, fecha y hora comienzan a la misma
  altura. Build, TypeScript y los chequeos de los archivos modificados: correctos.

### Incremento 9: Home administrativo con métricas reales

Acuerdo aprobado: ampliar el destino inicial para mostrar el panel administrativo
de la captura adjuntada, conectado al contrato existente. Este incremento
reemplaza la limitación previa de construir únicamente una pantalla mínima.
No implementar nuevas operaciones de asignación, evaluación o configuración.

- Habilitar «Gestionar congreso» para SUPER_ADMIN y ADMINISTRATOR, conservando
  las restricciones actuales de congreso deshabilitado e institución pendiente.
  Permitir la consulta de congresos finalizados habilitados.
- Navegar a `/admin/congresses/:congressCode/home` usando el código real de `/mine`.
  «Cambiar congreso» vuelve a `/my-congresses`. Reutilizar `MainLayout`.
- Consumir `GET /api/congresses/{congressCode}/dashboard` mediante Axios y TanStack
  Query. El backend valida usuario habilitado, SUPER_ADMIN o administrador activo
  del congreso e institución cuando corresponde. El SUPER_ADMIN no requiere
  participación. Consultar luego `GET /api/congresses/{congressCode}` para sede,
  estado y períodos de registro, presentación y realización.
- Separar la caché por usuario y código. Cancelar consultas al cambiar de congreso
  y rechazar respuestas que correspondan a otro código. Mostrar skeleton, error
  con reintento, permisos insuficientes, sesión vencida o congreso no encontrado.
- «Trabajos recibidos» usa `academicMetrics.totalSubmissions` sin excluir
  `NOT_SUBMITTED`, conforme al criterio acordado. Mostrar las métricas reales de
  asignación y estado: sin evaluador, en evaluación, con observaciones, aceptados,
  rechazados y no presentados. Los indicadores pueden superponerse.
- Pagos muestra comprobantes pendientes, aprobados y rechazados, junto al total
  de comprobantes registrados. No inferir trabajos sin comprobante a partir de
  estos datos. El contrato no distingue «Revisión pendiente» ni «Sin comprobante».
- Los indicadores académicos enlazan al portal existente con `unassigned=true`
  o el `status` correspondiente. «Ver portal de trabajos» abre el listado general
  y «Gestionar pagos y Libro» abre la pantalla existente de pagos; esta última
  no implementa filtros por estado desde el dashboard.
- Mantener los demás roles y sus destinos actuales. No agregar botones de
  demostración, configuración sin destino ni métricas ficticias. No modificar el
  backend. El portal de trabajos conserva su navegación temporal al detalle.

Verificación del incremento:

- TypeScript (`tsc --noEmit`), build, ESLint y Prettier de los archivos del
  incremento: correctos. Los 24 tests existentes de creación y reglas de
  congresos también pasan.
- 37 verificaciones de navegador con respuestas controladas: navegación desde
  `/mine`, métricas y filtros, permisos, institución pendiente, cambio de
  congreso con respuesta anterior demorada, ceros, carga, errores y reintentos.
  No se realizaron escrituras en la API ni una validación contra un backend en
  ejecución con credenciales reales.
- Comparación visual con la referencia adjuntada en 1366 × 768 y 1920 × 1080,
  sin desbordamiento horizontal. Se conserva el encabezado compartido actual.
- El lint global continúa con 9 errores en módulos ajenos al incremento y el
  chequeo global de formato informa 102 archivos ajenos. El build mantiene la
  advertencia existente de tamaño del bundle.

### Incluye

- Identificar al SUPER_ADMIN mediante el campo `superAdmin` de la respuesta de autenticación existente.

- Redirigir al SUPER_ADMIN autenticado a `/admin/congresses`.

- Consultar desde el backend **todos los congresos de la plataforma**, con independencia de quién los creó.

- Mostrar el estado vacío o el listado de congresos según la respuesta real.

- Permitir acceder al formulario de creación desde ambos estados.

- Crear congresos mediante backend, con validaciones de frontend y backend.

- Seleccionar un congreso y navegar a su Home mediante el identificador real.

- Controlar autorización en backend para consultas y operaciones privilegiadas.

- Gestionar carga, errores, ausencia de datos y sesiones no autorizadas.

### No incluye

- Invitación, alta o asignación de administradores a congresos.

- Gestión de participantes, evaluadores, trabajos, dictámenes o pagos.

- Nuevas operaciones administrativas de asignación, evaluación y configuración. El panel inicial de métricas y navegación del incremento 9 queda incluido; reutiliza las vistas operativas existentes.

- Migración de JWT y `localStorage` a cookies `HttpOnly`.

- Rediseño del login, registro o recuperación de contraseña.
- Implementación, modificación o análisis del flujo de cambio obligatorio de contraseña (`mustChangePassword`), que queda expresamente fuera de FE-03. No alterar su comportamiento existente.

- Controles de demostración o persistencia simulada como solución final.

## 4. Usuarios y permisos

| Rol | Acceso y acciones |

| --- | --- |

| SUPER_ADMIN (`superAdmin === true`) | Consultar todos los congresos, crear uno nuevo y acceder al Home del congreso seleccionado. |

| Usuario no SUPER_ADMIN | Mantener su flujo existente; no obtiene privilegios globales ni acceso a operaciones exclusivas del SUPER_ADMIN. |

El campo de la base de datos `is_super_admin` y la propiedad del contrato de autenticación `superAdmin` representan el mismo concepto, pero **no tienen el mismo nombre**. El frontend utiliza `superAdmin`.

La redirección del frontend es una decisión de interfaz; **la autorización efectiva se valida en el backend** usando la identidad autenticada, nunca un valor de `localStorage` enviado por el cliente como prueba de permisos.

## 5. Pantallas y flujo de usuario

### 5.1. Inicio de sesión y redirección

1. El usuario inicia sesión mediante el endpoint existente `POST /api/auth`.

2. El frontend recibe el token y los datos de autenticación, incluido `superAdmin`.

3. Si `superAdmin === true`, se navega a `/admin/congresses`.

4. En caso contrario, se conserva la navegación habitual del usuario.

5. Al recargar o abrir una ruta directamente, la aplicación debe mantener una navegación coherente con la sesión disponible; las solicitudes protegidas siguen sujetas a validación del backend.

**Decisión vigente:** conservar temporalmente el mecanismo actual de JWT y `localStorage`. No interpretar la información local como autorización suficiente.

### 5.2. Mis congresos — Estado vacío

**Ruta:** `/admin/congresses`.

**Condición:** el backend responde exitosamente con una colección vacía.

- Mostrar «Mis congresos» y la identidad del usuario autenticado.

- Mostrar «Todavía no tenés congresos creados» y una explicación breve.

- Mostrar «Crear mi primer congreso», con navegación a `/admin/congresses/new`.

- No confundir errores de consulta con ausencia de congresos.

- No incluir controles de ejemplo ni códigos de pantalla del prototipo.

**Referencia visual:** `docs/screenshots/super-admin-congresses-empty.png`.

### 5.3. Mis congresos — Con registros

**Ruta:** `/admin/congresses`.

**Condición:** el backend devuelve uno o más congresos.

- Crear desde cero una tarjeta reutilizable por congreso, siguiendo las referencias visuales.

- Presentar nombre, institución o sede, estado, cantidad de trabajos recibidos, período de realización y fecha límite de presentación, según contrato real.

- Diferenciar visualmente congresos activos y finalizados según los estados efectivos del backend.

- Mostrar «Crear nuevo congreso» hacia `/admin/congresses/new`.

- Permitir seleccionar un congreso y navegar a `/admin/congresses/:congressCode/home` con el código real entregado por `/mine`.

- Si existe selección recordada, destacarla visualmente con borde bordó; la URL válida tiene prioridad sobre cualquier selección local.

- La selección es independiente del estado: un congreso finalizado puede seleccionarse si el backend permite consultarlo.

**Referencia visual:** `docs/screenshots/admin-congresses-list.png`.

### 5.4. Crear congreso

**Ruta:** `/admin/congresses/new`.

- Construir desde cero la pantalla y el formulario de creación, siguiendo las referencias visuales y las reglas funcionales que apruebe el equipo.

- Definir los campos y validaciones contra el contrato real del backend antes de implementar; no asumir que ya existe un formulario disponible.

- Validar campos obligatorios, fechas, áreas temáticas, parámetros de trabajos, modalidad de evaluación y datos de pago cuando corresponda.

- Enviar los datos al backend y persistir un congreso real.

- Mostrar errores de validación o de comunicación sin generar registros ficticios.

- Tras el éxito, usar el ID devuelto por el backend, actualizar/invalidate la consulta del listado y navegar al Home del congreso creado.

- No ofrecer guardado de borrador si esa capacidad no está definida en el contrato aprobado.

### 5.5. Selección e ingreso a gestión

**Ruta de destino:** `/admin/congresses/:congressCode/home`.

- El identificador del congreso proviene del backend.

- La ruta interna determina el congreso activo; no mezclar datos entre congresos.

- Si el código no existe o el backend deniega acceso, mostrar un estado adecuado con opción de volver al listado.

- Crear desde cero el panel inicial del incremento 9, identificando el congreso seleccionado con su código real, mostrando las métricas disponibles y permitiendo volver al listado. Las operaciones administrativas nuevas requieren una especificación posterior.

### 5.6. Rutas

| Pantalla | Ruta |

| --- | --- |

| Mis congresos | `/admin/congresses` |

| Crear congreso | `/admin/congresses/new` |

| Home del congreso | `/admin/congresses/:congressCode/home` |

Mantener el router centralizado según la arquitectura existente.

### 5.7. Referencias visuales

- `docs/screenshots/super-admin-congresses-empty.png` — Estado sin congresos del SUPER_ADMIN.

- `docs/screenshots/admin-congresses-list.png` — Listado con congresos.

- Para Crear congreso, utilizar las capturas existentes en `docs/screenshots/` que el equipo confirme como aprobadas. No tomar especificaciones anteriores como implementación previa ni como fuente automática de requisitos.

- **Versión aprobada del prototipo:** pendiente de confirmar.

Las capturas definen la composición visual; esta especificación y los contratos aprobados definen el comportamiento. No trasladar breadcrumbs, códigos internos ni botones de demostración.

## 6. Reglas de negocio

- **RN-01.** Solo un SUPER_ADMIN autenticado y autorizado puede ejecutar las operaciones globales de FE-03.

- **RN-02.** El listado del SUPER_ADMIN abarca todos los congresos de la plataforma, independientemente de su creador.

- **RN-03.** Una respuesta vacía válida se representa como estado vacío; una falla se representa como error.

- **RN-04.** La creación persiste datos reales y utiliza el ID devuelto por el backend.

- **RN-05.** El congreso seleccionado se identifica por la ruta; no se mezclan datos de congresos diferentes.

- **RN-06.** La condición de congreso activo/finalizado es distinta de la selección actual.

- **RN-07.** Se preserva el flujo existente para usuarios que no son SUPER_ADMIN.

- **RN-08.** No se otorgan permisos por confiar en `localStorage`, estados de React ni parámetros manipulables por el cliente.

- **RN-09.** No se crean borradores ni controles de demostración no definidos en el alcance.

## 7. Datos e integración

### Autenticación existente

- **Endpoint observado en el frontend:** `POST /api/auth`.

- **Campos conocidos de la respuesta:** `userId`, `firstName`, `lastName`, `email`, `token`, `superAdmin` (el resto del contrato se mantiene sin cambios).

- **Estado actual:** JWT y datos del usuario almacenados en `localStorage`; se conservan temporalmente.

- **Pendiente de verificación:** confirmar que `superAdmin` siempre se devuelve como booleano y cómo se manejan sesiones expiradas y cambios de permisos.

### Congresos

| Operación | Contrato | Estado |

| --- | --- | --- |

| Listar todos los congresos | Endpoint y DTO a verificar en backend | Pendiente |

| Crear congreso | Endpoint, request, validaciones y response a verificar | Pendiente |

| Obtener congreso por código | `GET /api/congresses/{congressCode}`: código, nombre, sede, estado y fechas | Verificado e integrado en el incremento 9 |

| Consultar métricas administrativas | `GET /api/congresses/{congressCode}/dashboard`: `academicMetrics` y `financialMetrics` | Verificado e integrado en el incremento 9 |

| Consultar cantidades de trabajos | Verificar si las devuelve el listado o requiere otra consulta | Pendiente |

**No inventar endpoints ni asumir campos del DTO.** Si el backend carece de alguna operación, proponer su implementación y autorización antes de integrar el frontend.

No se presupone que existan mocks, proveedores administrativos ni pantallas administrativas en el código. Implementar el flujo con datos reales desde el inicio; no introducir mocks ni `sessionStorage` como fuente de verdad del listado o de la creación.

## 8. Validaciones y manejo de errores

- Login inválido: conservar el manejo existente.

- Usuario sin privilegios: no permitir acceso global; el backend debe responder con el estado HTTP correspondiente.

- Consulta en curso: mostrar indicador de carga.

- Consulta exitosa vacía: mostrar estado vacío.

- Error de red o servidor: mostrar mensaje y permitir reintentar, sin presentar datos mock como si fueran reales.

- Formulario nuevo: usar React Hook Form y Zod conforme a las convenciones del proyecto, y procesar errores devueltos por el backend.

- Creación exitosa: evitar doble envío y navegar usando el ID real.

- ID inválido o no autorizado: informar el problema y permitir regresar.

- Sesión expirada: conservar el comportamiento de autenticación existente y proponer ajustes solo si son necesarios.

## 9. Criterios de aceptación

- [ ] **CA-01.** Un SUPER_ADMIN autenticado llega a `/admin/congresses` después del login.

- [ ] **CA-02.** Un usuario no SUPER_ADMIN conserva su navegación habitual.

- [ ] **CA-03.** El listado se obtiene de una consulta real al backend y abarca todos los congresos.

- [ ] **CA-04.** Si el backend devuelve cero congresos, se muestra el estado vacío.

- [ ] **CA-05.** El estado vacío permite navegar a Crear congreso.

- [ ] **CA-06.** Si existen congresos, se muestra una tarjeta por cada registro.

- [ ] **CA-07.** Las tarjetas presentan los datos disponibles y diferencian estados reales.

- [ ] **CA-08.** El listado ofrece la acción «Crear nuevo congreso».

- [ ] **CA-09.** El formulario crea un congreso persistido mediante el backend y muestra validaciones pertinentes.

- [ ] **CA-10.** Después de crear, el listado se actualiza y se utiliza el ID real del nuevo congreso.

- [ ] **CA-11.** Seleccionar un congreso navega a su Home con su ID real.

- [ ] **CA-12.** Se distinguen carga, error y respuesta vacía.

- [ ] **CA-13.** El backend rechaza operaciones privilegiadas sin autorización, incluso si se manipula el frontend.

- [ ] **CA-14.** El diseño respeta las capturas sin controles de demostración.

- [ ] **CA-15.** No se rompe la autenticación ni las rutas existentes de otros usuarios.

- [ ] **CA-16.** Se verifican los flujos con datos reales y se registran los resultados de las validaciones técnicas.

## 10. Dependencias y decisiones pendientes

### Dependencias

- Repositorio frontend y acceso al backend Spring Boot.

- Contratos reales de consulta y creación de congresos.

- Reglas de autorización del SUPER_ADMIN en backend.

- Referencias visuales aprobadas y definición funcional de los campos del formulario de creación.

- Router, `AuthProvider`, `AuthService` e infraestructura Axios existentes.

### Decisiones pendientes

- Verificar el identificador FE-03 en el backlog.

- Confirmar la versión aprobada del prototipo.

- Verificar endpoints y DTO reales, incluidos estado y métricas de cada congreso.

- Evaluar futuras métricas y operaciones del Home que el contrato actual no ofrece, fuera del panel inicial aprobado en el incremento 9.

- Determinar cómo se actualizan permisos/sesiones si cambia `is_super_admin` en backend.

## 11. Notas de implementación

### 11.1. Estrategia de trabajo

Implementar **una única feature funcional integrada**, sin fase de maquetado separada, mediante pasos técnicos verificables:

1. Inspeccionar frontend y backend; confirmar contratos y seguridad.

2. Integrar redirección y protección de rutas para SUPER_ADMIN.

3. Conectar listado real y estados vacío, carga y error.

4. Conectar creación real y navegación con ID persistido.

5. Verificar de punta a punta, incluidas autorizaciones y regresiones.

Cada paso requiere revisión y aprobación según `docs/FRONTEND-WORKFLOW.md`. La feature no se considera terminada hasta cumplir el flujo completo.

### 11.2. Implementación desde cero y reutilización transversal

**Implementación desde cero:** crear las pantallas de Mis congresos, Crear congreso y el destino mínimo del Home, junto con sus componentes, servicios y estados necesarios.

Revisar y reutilizar únicamente infraestructura transversal que realmente exista:

- `AuthProvider` y `AuthService` existentes.

- Router centralizado (verificar ubicación real).

- `src/lib/api` y servicios HTTP existentes.

- Theme, layouts y componentes compartidos que efectivamente estén implementados.

No asumir rutas de archivos adicionales sin inspeccionar el repositorio. Evitar cambios no relacionados y nuevas dependencias innecesarias.

## 12. Verificación final

- [ ] Se verificaron los contratos reales del backend y sus autorizaciones.

- [ ] Se probaron login SUPER_ADMIN y usuario común, sin modificar otros flujos de autenticación.

- [ ] Se verificaron listado vacío, listado con registros, carga y errores.

- [ ] Se creó un congreso real y se confirmó su persistencia tras recargar.

- [ ] Se creó desde cero el destino mínimo del Home y se comprobó navegación con el ID real.

- [ ] Se verificó que no se mezclen datos de distintos congresos.

- [ ] Se probó que usuarios sin privilegios no pueden consultar ni crear congresos globalmente.

- [ ] Se crearon desde cero las pantallas administrativas necesarias y se revisaron las capturas y el diseño de escritorio.

- [ ] Se ejecutaron los comandos de build, lint, formato y pruebas aplicables; se documentaron sus resultados reales.

- [ ] Se revisó el diff, se documentaron limitaciones y se preparó PR hacia `develop`.

**Referencias del proceso:** `AGENTS.md`, `docs/FRONTEND-WORKFLOW.md` y `docs/templates/codex-prompt.md`.
