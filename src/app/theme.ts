import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#7A1F3A",
      dark: "#4C1224",
    },
    background: {
      // El fondo general de la aplicación se mantiene blanco
      // siguiendo la composición visual definida en el prototipo de C4T.
      default: "#FFFFFF",

      // Las superficies como cards también utilizan blanco.
      // Su separación visual se logra mediante bordes y no por contraste de fondo.
      paper: "#FFFFFF",
    },
    text: {
      primary: "#241B1F",
      secondary: "#6F6468",
    },
    divider: "#D8CECF",
  },

  /**
   * La escala tipográfica se reduce respecto a los valores
   * predeterminados de MUI para mantener la interfaz compacta
   * y alineada con la identidad editorial de C4T.
   */
  typography: {
    /**
     * IBM Plex Sans es la tipografía base de la aplicación.
     * Todo texto que no requiera una jerarquía especial hereda esta fuente.
     */
    fontFamily: "var(--font-sans)",

    body1: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.875rem",
    },

    body2: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
    },

    /**
     * Los encabezados destacados utilizan Source Serif 4
     * para mantener la identidad editorial y académica de C4T.
     */
    h5: {
      fontFamily: "var(--font-serif)",
      fontSize: "1.25rem",
      fontWeight: 100,
    },

    /**
     * Botones y acciones pertenecen a la interfaz funcional,
     * por lo que utilizan IBM Plex Sans.
     */
    button: {
      fontFamily: "var(--font-sans)",
      fontSize: "0.8125rem",
      fontWeight: 700,
      textTransform: "none",
    },
  },

  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // Los campos utilizan el crema de la identidad visual de C4T
          // para diferenciarlos suavemente de las superficies blancas.
          backgroundColor: "#F3EFEE",
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",

          // Se mantiene el mismo fondo durante la interacción
          // para evitar cambios visuales innecesarios.
          "&:hover": {
            backgroundColor: "#F3EFEE",
          },

          "&.Mui-focused": {
            backgroundColor: "#F3EFEE",
          },
        },

        input: {
          paddingTop: "10px",
          paddingBottom: "10px",
        },
      },
    },
  },
});
