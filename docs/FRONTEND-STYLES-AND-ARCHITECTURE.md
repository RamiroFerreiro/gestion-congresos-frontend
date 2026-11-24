# C4T Frontend — Contexto de Arquitectura, Estructura y Estilos

Este documento consolida la arquitectura del frontend, las pautas de estilo visual, la estructura de directorios y los patrones de implementación del sistema **C4T (Call for Talks)**. Su objetivo es asegurar consistencia visual y técnica en el desarrollo de pantallas y componentes nuevos.

---

## 1. Identidad Visual y Sistema de Estilos

El diseño responde a una identidad **editorial y académica**, orientada a entornos de escritorio (*desktop-first*, resoluciones de referencia `1366×768` y `1920×1080`).

### 1.1. Paleta de Colores

| Color / Token | Valor Hex | Uso Principal |
| :--- | :--- | :--- |
| **Primary Main** | `#7A1F3A` | Color principal de marca (burgundy). Botones primarios, avatares, bordes activos. |
| **Primary Dark** | `#4C1224` | Burgundy oscuro. Barra superior / Header global en `MainLayout`, estados hover intensos. |
| **Soft Pink / Accent** | `#F3E1E6` | Rosa suave. Fondos de chips, tags o badges sutiles, acentos secundarios. |
| **Background Default** | `#FFFFFF` | Fondo general de páginas. |
| **Background Paper** | `#FFFFFF` | Superficies de cards y contenedores (`Paper`). La separación visual se hace por borde, no por contraste de fondo. |
| **Input Background** | `#F3EFEE` | Fondo crema para campos de entrada (`MuiOutlinedInput`), chips neutrales o zonas de carga. |
| **Text Primary** | `#241B1F` | Color base para textos, títulos y datos numéricos. |
| **Text Secondary** | `#6F6468` | Subtítulos, descripciones secundarias y etiquetas auxiliares. |
| **Divider / Border** | `#D8CECF` | Bordes de cards (`variant="outlined"`), divisores de secciones y separadores de tablas. |

> **Regla de oro**: Se prioriza el uso de tokens del tema de MUI (`primary.main`, `text.secondary`, `divider`, `background.paper`, etc.) o variables CSS antes que colores fijos escritos en duro.

---

### 1.2. Tipografía y Jerarquía

Se definen tres familias tipográficas clave cargadas en `src/styles/index.css`:

1. **`var(--font-sans)` (`IBM Plex Sans`)**:
   - **Uso**: Tipografía base para todo el cuerpo de texto, botones, campos de formularios, labels y tablas.
   - **Variantes MUI**: `body1` (0.875rem), `body2` (0.8125rem), `button` (0.8125rem, `fontWeight: 700`, `textTransform: 'none'`).

2. **`var(--font-serif)` (`Source Serif 4`)**:
   - **Uso**: Títulos principales, isotipo de marca ("C4T") y encabezados de páginas para aportar carácter editorial/académico.
   - **Variantes MUI**: `h5` (1.25rem), o en `Typography` con `component="h1"` / `h2` y `fontFamily: "var(--font-serif)"`.

3. **`var(--font-mono)` (`IBM Plex Mono`)**:
   - **Uso**: Códigos de seguimiento, identificadores técnicos (ej. `CONG-2026`, hashes), tags de estado, fechas técnicas y subheader de navegación.

---

### 1.3. Estilo de Componentes UI Recurrentes

* **Cards / Contenedores**:
  ```tsx
  <Paper
    variant="outlined"
    sx={{
      p: 3,
      borderColor: "divider",
      bgcolor: "background.paper",
      borderRadius: 1, // Radio sutil estándar
    }}
  >
    {/* Contenido */}
  </Paper>
  ```
* **Inputs y Formularios**:
  - Configurados globalmente en `theme.ts` con fondo `#F3EFEE` y padding vertical compacto (`10px`).
  - Formularios gestionados mediante **React Hook Form** + validación con esquemas **Zod**.
* **Botones**:
  - `variant="contained"`: Fondo burgundy (`primary.main`), texto blanco, sin mayúsculas sostenidas (`textTransform: 'none'`).
  - `variant="outlined"`: Borde sutil, texto con `fontWeight: 700`.
* **Headers de Página**:
  - Título con `fontFamily: "var(--font-serif)"` (ej. `fontSize: "1.6rem"`).
  - Subtítulo en `color="text.secondary"`.

---

## 2. Arquitectura y Estructura de Carpetas

El proyecto sigue una arquitectura **modular basada en funcionalidades (feature-based)** dentro de `src/`:

```text
gestion-congresos-frontend/
├── docs/                               # Especificaciones funcionales, screenshots y guías
│   ├── screenshots/                    # Capturas de referencia de versiones aprobadas
│   ├── FE-03-admin-ui.md
│   ├── FE-04-paper-submission.md
│   └── FRONTEND-WORKFLOW.md
├── src/
│   ├── app/                            # Configuración global de la app
│   │   ├── App.tsx                     # Componente raíz
│   │   ├── providers.tsx               # QueryClientProvider, ThemeProvider, AuthProvider, etc.
│   │   ├── router.tsx                  # Enrutador centralizado (React Router)
│   │   └── theme.ts                    # Tema extendido de Material UI (colores y tipografías)
│   │
│   ├── assets/                         # Recursos estáticos locales
│   │   └── brand/                      # Logotipos e isotipos oficiales (c4t-login-icon.svg)
│   │
│   ├── components/                     # Componentes puramente compartidos y agnósticos
│   │   ├── HomeButton.tsx
│   │   └── UserSelector.tsx
│   │
│   ├── layouts/                        # Estructuras de página reutilizables
│   │   ├── AuthLayout.tsx              # Layout para Login, Registro, Recupero
│   │   └── MainLayout.tsx              # Banner superior burgundy con logo C4T + sub-barra
│   │
│   ├── lib/                            # Infraestructura técnica compartida
│   │   ├── api.ts                      # Instancia configurada de Axios (baseURL, interceptors)
│   │   └── queryClient.ts              # Configuración de TanStack Query
│   │
│   ├── styles/                         # Hojas de estilo globales
│   │   └── index.css                   # Importación de fuentes de Google Fonts y variables CSS
│   │
│   └── features/                       # Módulos de dominio del negocio
│       ├── auth/                       # Autenticación, sesión y roles
│       │   ├── context/AuthContext.tsx # Estado de usuario logueado y token
│       │   └── pages/                  # LoginPage, RegisterPage, etc.
│       │
│       ├── congresses/                 # Gestión y selección de congresos
│       │   ├── api/                    # CongressService.ts
│       │   ├── components/             # AvailableCongressCard, InstitutionDialog, etc.
│       │   ├── lib/                    # Helpers de disponibilidad y cálculo de estados
│       │   ├── pages/                  # CongressesPage.tsx
│       │   ├── schemas/                # Schemas de validación Zod
│       │   └── types/                  # Modelos e interfaces TypeScript (AvailableCongress, etc.)
│       │
│       ├── papers/                     # Envío y evaluación de trabajos / ponencias
│       │   ├── api/                    # PaperService.ts
│       │   ├── components/             # Subcomponentes del formulario de envío, listas
│       │   ├── pages/                  # PaperSubmissionPage.tsx, AdminPapersPage.tsx
│       │   ├── schemas/                # Schemas Zod de envío de trabajos
│       │   └── types/                  # Tipos del dominio de trabajos
│       │
│       └── payments/                   # Comprobantes y estados de pago
│           ├── api/                    # PaymentService.ts
│           ├── components/             # Formularios y visualizadores de pago
│           ├── pages/                  # PaymentsPage.tsx
│           ├── schemas/                # Schemas Zod para comprobantes
│           └── types/                  # Tipos de transacciones y estados de pago
```

---

## 3. Reglas de Organización Interna por Feature

Cada carpeta dentro de `src/features/<nombre-feature>/` debe auto-contener su lógica para evitar acoplamientos innecesarios:

1. **`api/`**: Clases o funciones de servicio que consumen los endpoints de Spring Boot utilizando la instancia de `api.ts`.
2. **`components/`**: Componentes visuales específicos de este módulo (no se exportan a otras features a menos que se promuevan a `src/components/`).
3. **`pages/`**: Componentes de vista que se conectan en `src/app/router.tsx`.
4. **`schemas/`**: Esquemas de validación construidos con `zod` (`.ts`).
5. **`types/`**: Interfaces y tipos de TypeScript que reflejan contratos con el backend o estados internos.
6. **`lib/`**: Funciones puras de utilidad, formateadores o cálculo de reglas de negocio específicas del módulo.

---

## 4. Guía para Construir Nuevas Pantallas

Al crear o modificar una pantalla:

1. **Enrutamiento**: Registrar la ruta en `src/app/router.tsx` dentro del layout que corresponda (`AuthLayout` o `MainLayout`).
2. **Obtención de Datos**:
   - Usar `useQuery` o `useMutation` de `@tanstack/react-query`.
   - Manejar explícitamente estados de carga (`CircularProgress`, skeleton) y error (`Alert`).
3. **Formularios**:
   - Integrar `useForm` con `zodResolver(miSchema)`.
   - Utilizar componentes controlados de MUI (`TextField`, `Select`) conectados con `register` o `Controller`.
4. **Validaciones de Calidad**:
   Antes de dar por cerrado un incremento, ejecutar:
   - `npm run lint`
   - `npm run format:check`
   - `npm run build`
