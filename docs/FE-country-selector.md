# FE-13 — Selector compartido de países

## Información general

- Rama: `feature/FE-13-country-selector`.
- Base: `develop`, commit `7d17473`, con FE-10 y FE-11 ya integradas.
- Referencia visual: tema, componentes y selector del registro existente; prototipo C4T 0.7.5 como referencia general.
- Modalidad: catálogo local compartido, sin dependencias nuevas ni cambios de backend.

## Objetivo y alcance

Unificar el campo país en registro, primer ingreso y edición del perfil global.
El primer ingreso conserva la implementación del equipo en `/first-login`.

- Incorporar `CountrySelect` en los tres formularios con React Hook Form y MUI.
- Compartir 250 países y territorios en español, ordenados alfabéticamente.
- Mantener los nombres enviados en `country` al backend; usar los códigos del catálogo como identificadores internos de las opciones.
- Mostrar errores de campo y deshabilitar la selección durante el envío, respetando los estados existentes de cada formulario.
- Conservar un valor previamente guardado fuera del catálogo como opción adicional del formulario, sin modificar la lista compartida ni normalizar datos automáticamente.

No incluye cambios en rutas, login, contexto de autenticación, interceptores 428,
servicios HTTP, contraseñas, permisos o comportamiento posterior al primer ingreso.
Se preserva íntegramente el cambio de contraseña del perfil integrado en FE-11.

## Catálogo y mantenimiento

El snapshot `src/lib/data/countries.es.json` procede del
[catálogo español de i18n-iso-countries](https://github.com/michaelwittig/node-i18n-iso-countries/blob/master/langs/es.json),
descargado el 24/11/2026. Se conserva su [licencia MIT](licenses/i18n-iso-countries.txt).
El catálogo incluye países y territorios y la entrada XK del proveedor.

Los nombres alternativos del proveedor usan su primera variante. La lista se
incluye en el frontend: los formularios no consultan servicios externos.
Para actualizarla, reemplazar el snapshot desde la fuente, conservar la licencia,
revisar cambios de nombres y códigos y ejecutar sus pruebas.

## Criterios de aceptación

- Registro y primer ingreso muestran «Seleccioná un país» sin preselección.
- Los tres formularios usan las mismas opciones y muestran validaciones existentes.
- La selección transmite el nombre del país, sin cambiar contratos del backend.
- Un país previamente guardado fuera del catálogo permanece visible y seleccionable.
- Cancelar la edición del perfil restaura el valor original; guardar utiliza la selección nueva.
- El selector se deshabilita durante el envío; en registro y primer ingreso también respeta el estado de éxito existente.
- El diff respecto de `develop` contiene únicamente el selector, catálogo, licencia, documentación, pruebas y adaptación de los tres campos.

## Validación

```sh
node --experimental-strip-types --test src/lib/tests/countries.test.mjs src/features/congresses/tests/congressRules.test.mjs
npx tsc --noEmit
npm run build
npm run lint
npm run format:check
```

Las comprobaciones globales de lint y formato pueden contener fallos preexistentes.
Se deben distinguir de los errores propios y evitar reformatear módulos ajenos.

Las pruebas de catálogo comprueban integridad, nombres en español, ordenamiento,
ausencia de preselección y compatibilidad con valores antiguos. La prueba funcional
de formularios con respuestas API simuladas no sustituye una prueba integral con
cuentas reales y backend.

## Resultados sobre la nueva base

- 12 pruebas aprobadas: 4 del catálogo y 8 existentes de congresos.
- TypeScript, build y ESLint de los archivos involucrados: aprobados.
- Formato del componente, catálogo, pruebas y esta especificación: aprobado. Se conservó el formato existente de las pantallas para mantener el diff limitado al campo país.
- El lint global mantiene 7 errores preexistentes; el formato global informa 107 archivos fuera de formato. No se modificaron módulos ajenos para corregirlos.
- Chrome con API simulada: registro permite elegir México; FE-10 conserva `/first-login` y permite elegir España; perfil conserva un valor previo fuera de catálogo, restaura al cancelar y envía Brasil al guardar. Sin excepciones del navegador.
- Se verificó que router, login, contexto de autenticación, interceptores, servicios y cambios de contraseña coinciden con `origin/develop`.
- Integración mediante PR de `feature/FE-13-country-selector` hacia `develop`, con revisión del equipo.
