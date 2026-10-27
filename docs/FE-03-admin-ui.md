# FE-03 — Maquetado de vistas del administrador

## 1. Información general

- ID: FE-03

- Nombre: Maquetado de vistas del administrador

- Responsable: Por confirmar

- Estado: En desarrollo (dos incrementos documentados como implementados; FE-03 no está finalizada)

- Rama de referencia: feature/FE-03-admin-ui

- Versión aprobada del prototipo: Pendiente de confirmar para FE-03 (la versión 0.7.5 está disponible, pero no se presume aprobada)

- URL del prototipo: https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5 (referencia provisional)

## 2. Objetivo

Implementar el flujo visual completo del administrador de C4T — Call for Talks, respetando la identidad visual del prototipo y la arquitectura existente del frontend.

FE-03 es una única feature que comprende todas las pantallas administrativas. Se implementa incrementalmente: completar Mis congresos, Crear congreso y Home no implica terminar FE-03. La demostración se realiza mediante mocks tipados, navegación, formularios, validaciones e interacciones simuladas.

## 3. Alcance

**Incluye**

- Maquetado de todas las vistas administrativas indicadas en esta especificación.

- Navegación y conservación del contexto del congreso seleccionado.

- Componentes reutilizables cuando exista una necesidad concreta.

- Formularios con React Hook Form y Zod.

- Mocks tipados y comportamientos simulados.

- Estados vacíos, validaciones y confirmaciones.

- Diseño de escritorio y notebook (1366 × 768 y 1920 × 1080), con accesibilidad básica.

**No incluye**

- Integración real de la administración con servicios backend.

- Persistencia real de congresos, trabajos, evaluaciones o pagos.

- Reimplementación de autenticación, JWT o autorización por roles.

- Cambio de redirección del login hacia el módulo administrativo (se coordina aparte).

- Envío real de notificaciones.

- Adaptación específica a celulares o tablets.

- Extensión opcional de recepción de trabajos en el incremento de creación.

La autenticación existente, conectada al backend, debe preservarse. La persistencia local de mocks no equivale a persistencia real en backend.

## 4. Usuarios y permisos

| Rol | Acceso / acciones |
|---|---|
| Administrador | Accede al flujo de gestión de sus congresos y a las pantallas administrativas de FE-03. |

Los permisos técnicos y la autorización real por rol no se modifican en esta FT.

## 5. Pantallas y flujo de usuario

### 5.1. Flujo general

## 1. El administrador inicia sesión mediante el flujo de autenticación existente.

## 2. Su destino funcional previsto es Mis congresos, aunque la redirección técnica del login se resolverá por separado.

## 3. Sin congresos, visualiza un estado vacío y puede crear el primero.

## 4. Con congresos, visualiza los activos y finalizados que administra.

## 5. Puede seleccionar uno o crear otro, aunque ya tenga congresos.

## 6. La creación requiere superar las validaciones; no existe Borrador de congreso en el MVP.

## 7. Una creación simulada exitosa selecciona el nuevo congreso y navega a su Home.

## 8. Al seleccionar uno existente, se abre su Home.

## 9. Puede regresar a Mis congresos para cambiar de congreso.

## 10. Cada pantalla interna utiliza exclusivamente los datos del congreso identificado en la ruta.

### 5.2. Mis congresos

Ruta propuesta: /admin/congresses.

Sin congresos: mostrar título «Mis congresos», descripción, nombre y avatar con iniciales del administrador, mensaje «Todavía no tenés congresos creados», explicación breve y botón «Crear mi primer congreso» hacia /admin/congresses/new.

Con congresos: mostrar una tarjeta por congreso, incluidos los finalizados, y el botón «Crear nuevo congreso». Ubicar el botón de creación a la izquierda y el nombre/avatar a la derecha. Cada tarjeta incluye:

- Nombre del congreso.

- Institución o sede, según disponibilidad.

- Estado visible (por ejemplo, «Recepción abierta» o «Finalizado»).

- Cantidad de trabajos recibidos.

- Período de realización.

- Fecha límite de presentación.

- Acción para acceder al Home («Continuar gestionando» o «Gestionar congreso»).

Selección: borde bordó para el congreso seleccionado. La selección es independiente del estado del congreso: uno finalizado puede estar seleccionado. Al elegir otro, se actualiza la selección y el identificador de la URL. La estrategia para recordar la selección se documenta en la sección 11.

No mostrar controles de demostración («Probar estado sin congresos», «Volver al ejemplo con congresos») ni códigos de pantalla como ADM-00.

### 5.3. Crear congreso

Ruta propuesta: /admin/congresses/new. El mismo formulario permite crear el primero o un congreso adicional.

**A. Datos generales**

- Nombre del congreso: obligatorio.

- Sede: obligatoria.

- Mail de contacto: obligatorio y con formato válido.

- Áreas temáticas habilitadas: al menos una; permitir agregar y quitar individualmente.

**B. Fechas importantes**

- Inicio y fin de registro al congreso.

- Inicio y fin de presentación de trabajos.

- Inicio y fin del congreso.

- Las seis fechas son obligatorias.

- Orden estrictamente creciente, sin coincidencia de días ni superposición: inicio de registro < fin de registro < inicio de presentación < fin de presentación < inicio del congreso < fin del congreso.

- La extensión opcional de recepción está excluida de este incremento.

**C. Reglas del trabajo científico**

- Máximo de autores por trabajo: valor inicial 6.

- Mínimo de palabras clave: valor inicial 3.

- Máximo de palabras clave: valor inicial 5.

- Validar repetición de palabras clave: activado inicialmente.

- Límites numéricos positivos; mínimo de palabras clave menor o igual al máximo.

- Reproducir controles de incremento/decremento del prototipo respetando las validaciones.

**D. Evaluación de trabajos**

- Modalidad: Inmediata o Por lote (batch).

- Anonimato: Simple ciego o Doble ciego, visible en ambas modalidades.

- Inmediata: no solicitar fecha adicional.

- Por lote: mostrar fecha de evaluación por lote, obligatoria y estrictamente posterior al cierre de presentación; no puede coincidir con ese día.

**E. Congreso pago**

- Interruptor «Congreso pago».

- Desactivado: ocultar datos de pago y no exigir sus validaciones.

- Activado: solicitar CBU (22 dígitos), alias, titular de la cuenta y monto del arancel (mayor que cero); todos obligatorios.

- No agregar campos de pago ni límites adicionales no especificados.

- La configuración del pago no habilita el pago de un trabajo antes de su aprobación.

**F. Acciones y resultado**

- «Volver a Mis congresos»: regresar sin crear.

- «Crear congreso»: validar todos los campos aplicables y mostrar errores junto a los campos.

- Ante éxito simulado: generar un congreso mock identificable, agregarlo al conjunto disponible, seleccionarlo y navegar a /admin/congresses/:congressId/home con su ID mock.

- No ofrecer «Guardar borrador» ni mostrar «Congreso activo» como rótulo de un congreso todavía inexistente.

- No mostrar breadcrumbs ni códigos de demostración como ADM-01.

### 5.4. Home del administrador

Ruta propuesta: /admin/congresses/:congressId/home.

Mostrar título «Inicio — Panel del administrador», nombre/avatar, nombre e institución/sede del congreso seleccionado, períodos de registro/presentación/realización, acceso visual a configuración mediante engranaje, total de trabajos, resumen de evaluación y pagos, y acción «Ver portal de trabajos».

Debe existir una sola acción «Cambiar congreso» junto al título, que regresa a Mis congresos. Reutilizar AdminHomePage y ActiveCongressCard con los datos del congreso de la ruta.

**Indicadores de evaluación:**

- Sin evaluador asignado.

- Revisión pendiente.

- Pendiente de evaluación.

- Con observaciones.

**Indicadores de pagos:**

- Comprobantes por revisar.

- Sin comprobante: solo trabajos aprobados que requieren pago y aún no tienen comprobante.

Escenario con pendientes: mostrar cantidades mock distintas de cero donde corresponda, estilos de atención del prototipo y todas las categorías, incluso las que tengan cero.

Escenario todo al día: mostrar cero en pendientes con el estilo verde del prototipo y conservar todas las categorías. «Todo al día» no implica cero trabajos recibidos.

Navegación futura: los indicadores llevarán al Portal de trabajos con su filtro; «Ver portal de trabajos» abrirá el listado general; el engranaje llevará a Configuración. Mientras esas pantallas no existan, no mostrar navegación rota ni inventar pantallas anticipadamente: definir un comportamiento temporal claro.

No agregar controles de demostración para alternar escenarios.

### 5.5. Pantallas restantes de FE-03

Estas pantallas sí pertenecen a FE-03, pero deben completar su especificación detallada y referencias visuales antes de implementarse.

**Portal de trabajos**

- Listado de trabajos del congreso seleccionado.

- Filtros por estado del trabajo y del pago.

- Acceso al detalle.

- Recepción de filtros desde los indicadores del Home.

**Detalle de trabajo y seguimiento**

- Datos generales y estado del trabajo.

- Evaluador asignado, incluso sin observaciones.

- Historial cronológico de evaluaciones, observaciones y correcciones.

- Pago y comprobantes cuando corresponda.

**Asignación de evaluadores**

- Un único evaluador asignado a cada trabajo a la vez.

- Selección y confirmación.

- Visualización y posibilidad de cambio del evaluador actual.

**Gestión de pagos**

- Visualización de comprobantes existentes.

- Aprobación y rechazo simulados, con motivo obligatorio de rechazo.

- Estado de verificación.

- Pago habilitado únicamente para trabajos aprobados.

**Configuración del congreso**

- Visualización de parámetros del congreso seleccionado.

- Modificación simulada de parámetros permitidos.

- Validaciones y confirmaciones.

### 5.6. Rutas propuestas

| Pantalla | Ruta |
|---|---|
| Mis congresos | `/admin/congresses` |
| Crear congreso | `/admin/congresses/new` |
| Home | `/admin/congresses/:congressId/home` |
| Portal de trabajos | `/admin/congresses/:congressId/papers` |
| Detalle de trabajo | `/admin/congresses/:congressId/papers/:paperId` |
| Configuración | `/admin/congresses/:congressId/settings` |

Otras rutas se definirán al especificar su navegación. Mantener el router centralizado en src/app/router.tsx.

### 5.7. Referencias visuales

- **Versión aprobada:** pendiente de confirmación.

- **URL provisional:** https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

- **Carpeta:** `docs/screenshots/`.

**Capturas de referencia:**

- `admin-congresses-empty.png` — Mis congresos sin registros.

- `admin-congresses-list.png` — Mis congresos con registros.

- `admin-create-congress-default-1.png` — Crear congreso, formulario inicial (parte 1).

- `admin-create-congress-default-2.png` — Crear congreso, formulario inicial (parte 2).

- `admin-create-congress-batch-paid-1.png` — Crear congreso, evaluación por lote y pago (parte 1).

- `admin-create-congress-batch-paid-2.png` — Crear congreso, evaluación por lote y pago (parte 2).

- `admin-home-pending.png` — Home con pendientes.

- `admin-home-up-to-date.png` — Home con todo al día.

Las capturas definen la composición visual y esta especificación las reglas funcionales. Ante contradicciones o detalles no definidos, solicitar confirmación.

## 6. Reglas de negocio

- RN-01. Cada pantalla administrativa utiliza el contexto de un único congreso; no se mezclan datos entre congresos.

- RN-02. La selección de un congreso es independiente de su estado de recepción o finalización.

- RN-03. Los congresos finalizados siguen accesibles; sus operaciones permitidas se detallarán al especificar cada pantalla.

- RN-04. No existe el guardado de congresos en borrador.

- RN-05. Un trabajo admite un único evaluador a la vez, reemplazable.

- RN-06. Los pagos solo se habilitan para trabajos aprobados.

- RN-07. El historial de revisiones y correcciones respeta el orden cronológico.

- RN-08. El rechazo de un comprobante exige motivo.

- RN-09. No mostrar breadcrumbs ni códigos internos de pantalla.

- RN-10. Preservar autenticación existente sin reimplementarla.

- RN-11. La creación de congresos exige las validaciones de campos, fechas y modalidades detalladas en 5.3.

## 7. Datos e integración

Modalidad: mocks tipados para el módulo administrativo; la autenticación existente continúa conectada al backend.

| Operación | Fuente / servicio | Estado |
|---|---|---|
| Listar y seleccionar congresos | Mocks administrativos | Simulado |
| Crear congreso | Formulario y estado mock compartido | Simulado |
| Mostrar indicadores y trabajos | Mocks por congreso | Simulado / pendiente según pantalla |
| Asignar evaluadores | Interacción mock | Pendiente de implementar |
| Gestionar comprobantes | Interacción mock | Pendiente de implementar |
| Modificar configuración | Interacción mock | Pendiente de implementar |
| Autenticación | Integración existente | Preservar, fuera de alcance |

No se especifican endpoints reales para FE-03. La integración administrativa con backend se realizará en otra tarea.

**Persistencia simulada ya documentada**

- Los escenarios tipados iniciales se encuentran en src/features/admin/mocks/adminCongresses.ts (withCongresses o empty).

- AdminCongressesProvider comparte el conjunto de congresos entre rutas administrativas.

- La selección se recuerda en sessionStorage por usuario y pestaña; la URL interna válida tiene prioridad. Un ID inexistente muestra aviso y permite regresar al listado.

- Los congresos creados se conservan en sessionStorage con la clave c4t:fe03:created-congresses:v1:`<userId>` o sufijo mock para previsualización sin sesión.

- Los fixtures iniciales permanecen separados de los registros creados.

- Si sessionStorage no está disponible, la simulación funciona en memoria mientras no se recargue la página.

- Cerrar la sesión de la pestaña termina la persistencia simulada; no hay llamadas administrativas al backend.

## 8. Validaciones y manejo de errores

- Formularios con React Hook Form y Zod; errores junto a los campos aplicables.

- Nombre, sede, correo válido, seis fechas y al menos un área temática no vacía son obligatorios.

- Fechas estrictamente crecientes, sin coincidencias.

- Límites numéricos enteros positivos; mínimo de palabras clave no mayor al máximo.

- Evaluación por lote requiere fecha posterior al cierre de presentación; evaluación inmediata no exige ni conserva ese campo oculto.

- Pago activado exige CBU de 22 dígitos, alias, titular y arancel positivo; pago desactivado no exige ni guarda esos datos.

- ID de congreso inexistente: mostrar aviso y acceso de regreso a Mis congresos.

- No mostrar enlaces rotos a pantallas futuras.

- Estados vacíos, de pendientes y «Todo al día» conforme a 5.2 y 5.4.

## 9. Criterios de aceptación

### 9.1. Pantallas iniciales

- [ ] CA-01. Mis congresos muestra el estado vacío y permite crear el primero.

- [ ] CA-02. Muestra congresos activos y finalizados, y permite crear otros nuevos.

- [ ] CA-03. Las tarjetas muestran la información principal definida.

- [ ] CA-04. El seleccionado se destaca con borde bordó, independientemente de su estado.

- [ ] CA-05. Seleccionar un congreso navega a su Home y conserva el contexto.

- [ ] CA-06. Crear congreso presenta las secciones y campos acordados.

- [ ] CA-07. Permite agregar y quitar áreas temáticas, manteniendo al menos una.

- [ ] CA-08. Funcionan las validaciones de fechas, límites y campos obligatorios.

- [ ] CA-09. Por lote exige una fecha posterior al cierre de presentación.

- [ ] CA-10. Congreso pago activa y exige datos bancarios y arancel; desactivarlo elimina esas exigencias.

- [ ] CA-11. La creación simulada agrega, selecciona y redirige al Home del nuevo congreso.

- [ ] CA-12. El Home muestra únicamente datos del congreso seleccionado.

- [ ] CA-13. El Home representa «Con pendientes» y «Todo al día».

- [ ] CA-14. Existe una sola acción «Cambiar congreso» hacia Mis congresos.

- [ ] CA-15. Los accesos a pantallas pendientes no generan navegación rota.

- [ ] CA-16. El diseño funciona en 1366 × 768 y 1920 × 1080 sin superposiciones ni desbordamiento horizontal.

- [ ] CA-17. Se ejecutan las validaciones técnicas aplicables; errores preexistentes se reportan por separado.

### 9.2. Resto de FE-03

- [ ] CA-18. Portal de trabajos lista y filtra trabajos del congreso seleccionado.

- [ ] CA-19. Indicadores del Home abren el Portal con filtro correspondiente.

- [ ] CA-20. El detalle muestra información, evaluador y seguimiento cronológico.

- [ ] CA-21. Se puede asignar o cambiar un único evaluador por trabajo.

- [ ] CA-22. Comprobantes pueden aprobarse o rechazarse con motivo.

- [ ] CA-23. Configuración permite consultar y modificar parámetros simulados.

- [ ] CA-24. Pantallas restantes respetan identidad visual y reglas de negocio.

FE-03 solo está completa cuando se cumplen los criterios aplicables al flujo administrativo completo. Las casillas quedan sin marcar porque este documento no constituye una verificación actual de la aplicación.

## 10. Dependencias y decisiones pendientes

**Dependencias**

- Flujo de autenticación ya existente: preservar su funcionamiento.

- Integración futura de la redirección de login a Mis congresos: fuera de esta FT.

- Portal, detalle, evaluadores, pagos y configuración: completar requisitos y capturas antes de implementar.

- Coordinación sobre router, theme y otros archivos compartidos.

**Decisiones pendientes**

- Confirmar la versión exacta del prototipo aprobada para FE-03.

- Verificar qué capturas están efectivamente agregadas en docs/screenshots/.

- Definir comportamiento temporal de los accesos a pantallas todavía no implementadas.

- Definir permisos y operaciones de congresos finalizados cuando se especifiquen esas pantallas.

- Verificar si persiste la referencia /src/main.jsx en index.html frente a src/main.tsx antes de proponer una corrección.

## 11. Notas de implementación

### 11.1. Estrategia incremental

Orden previsto:

## 1. Mis congresos.

## 2. Crear congreso.

## 3. Home del administrador.

## 4. Portal de trabajos.

## 5. Detalle de trabajo y seguimiento.

## 6. Asignación y cambio de evaluador.

## 7. Gestión de pagos y comprobantes.

## 8. Configuración del congreso.

El orden puede ajustarse por dependencias. Cada incremento requiere análisis, aprobación, implementación y validación. No implementar toda FE-03 en una sola operación.

**Archivos existentes a revisar y reutilizar:**

- src/layouts/AppLayout.tsx

- src/features/admin/pages/AdminHomePage.tsx

- src/features/admin/components/ActiveCongressCard.tsx

- src/app/theme.ts

- src/app/router.tsx

Respetar los cambios locales, evitar tocar módulos ajenos sin aprobación y justificar nuevas dependencias o abstracciones.

### 11.2. Incremento documentado como implementado — Mis congresos

- Acceso directo: /admin/congresses; redirección de login sin cambios.

- Escenarios tipados en src/features/admin/mocks/adminCongresses.ts y proveedor administrativo compartido.

- Identidad del usuario autenticado cuando existe, o mock para previsualización.

- Selección recordada en sessionStorage por usuario; URL interna válida prevalece y actualiza selección.

- ID inexistente muestra aviso y acceso al listado; sin selección previa, no se resalta tarjeta.

- Congresos finalizados siguen seleccionables.

- Ambos botones de creación llevan a /admin/congresses/new.

- Home existente adaptado para recibir congreso de la ruta, mostrar información y cantidad de trabajos, y permitir «Cambiar congreso».

- Ruta anterior /admin/home conservada como redirección al contexto recordado o primer mock disponible.

- Configuración deshabilitada hasta implementarse; escenarios completos de pendientes del Home fuera de este incremento.

- Validación manual indicada: seleccionar distintos congresos, regresar, recargar, abrir rutas directas, probar ID inválido y conjunto vacío; comprobar resoluciones, teclado y creación.

### 11.3. Incremento documentado como implementado — Crear congreso

- Formulario con React Hook Form y esquema Zod único; secciones en src/features/admin/components/create-congress/.

- Campos y fechas obligatorias con secuencia estricta; sin extensión de recepción.

- Al menos un área temática no vacía; agregar y quitar individualmente.

- Límites enteros positivos; valores iniciales 6/3/5; mínimo de palabras clave puede igualar al máximo.

- Evaluación Inmediata y Simple ciego iniciales; Por lote requiere fecha posterior al cierre; Inmediata no valida ni conserva fecha oculta.

- Pago desactivado inicialmente; activarlo exige CBU de 22 dígitos, alias, titular y monto positivo; al desactivar, los datos no bloquean ni se guardan.

- CBU tratado como texto para preservar ceros iniciales.

- AdminCongressesProvider comparte registros y conserva los creados en sessionStorage por usuario o sufijo mock.

- Fixtures iniciales separados de creados. Para limpiar pruebas, eliminar solo la clave de creados del usuario de prueba; sin controles de demostración.

- Cada creación genera ID diferente, congreso activo con cero trabajos y navegación a Home. «Activo» no implica «Recepción abierta».

- Volver sin enviar no crea registro ni conserva borrador.

- Sin sessionStorage, simulación en memoria hasta recarga; sin llamadas administrativas al backend.

- Prueba de reglas de negocio documentada (Node 24):

node --experimental-strip-types --test src/features/admin/schemas/createCongressSchema.test.mjs

Las secciones 11.2 y 11.3 registran el estado descrito en la especificación original, no una auditoría del repositorio actual.

## 12. Verificación final

- [ ] Cumple los criterios de aceptación aplicables a toda FE-03.

- [ ] Se confirmó y respetó la versión aprobada del prototipo.

- [ ] Se revisaron las capturas disponibles.

- [ ] Se respetó el alcance y la autenticación existente.

- [ ] Se revisó el diff y los archivos compartidos.

- [ ] Se ejecutaron npm run build, npm run lint y npm run format:check, informando resultados reales.

- [ ] Se ejecutaron las pruebas relevantes disponibles y verificaciones manuales.

- [ ] Se documentaron limitaciones, pendientes y errores preexistentes.

- [ ] El PR correspondiente apunta a develop y recibió revisión.

Para instrucciones generales sobre Codex y Git, consultar AGENTS.md y docs/FRONTEND-WORKFLOW.md.