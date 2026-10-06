import { Box, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";
import c4tLoginIcon from "../assets/brand/c4t-login-icon.svg";

/**
 * Layout compartido por las vistas del flujo de autenticación.
 *
 * Responsabilidades:
 * - Define la estructura visual común de las pantallas de autenticación.
 * - Renderiza la identidad de C4T.
 * - Utiliza los colores y tipografías definidos globalmente.
 * - Renderiza mediante <Outlet /> la página correspondiente a la ruta activa.
 *
 * Las páginas específicas son responsables únicamente de su
 * contenido y formulario.
 *
 * Notas de implementación:
 *
 * - minHeight: "100vh"
 *   Hace que el layout ocupe como mínimo toda la altura del navegador.
 *
 * - background.default
 *   Utiliza el fondo crema definido en el theme global.
 *
 * - alignItems: "center"
 *   Mantiene centrado horizontalmente el flujo de autenticación.
 *
 * - <Outlet />
 *   React Router lo reemplaza por la página hija correspondiente.
 */
function AuthLayout() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        boxSizing: "border-box",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        // Se mantiene un espaciado compacto para respetar
        // las proporciones verticales del prototipo.
        py: 4,
        px: 2,

        // En pantallas con poca altura aprovechamos mejor
        // el espacio vertical disponible.
        "@media (max-height: 850px)": {
          py: 2,
        },
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          mb: 2,
          // Reducimos la separación entre la identidad
          // y el contenido cuando el viewport es bajo.
          "@media (max-height: 850px)": {
            mb: 2,
          },
        }}
      >
        <Box
          component="img"
          src={c4tLoginIcon}
          alt=""
          aria-hidden="true"
          sx={{
            width: 60,
            height: "auto",
            display: "block",
            mx: "auto",
            mb: 2,
          }}
        />

        <Typography
          sx={{
            // Source Serif 4 se utiliza en los elementos
            // editoriales y de mayor jerarquía de C4T.
            fontFamily: "var(--font-serif)",
            color: "primary.dark",
            fontSize: "2rem",
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          C4T
        </Typography>

        <Typography
          sx={{
            fontFamily: "var(--font-sans)",
            color: "primary.main",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            mt: 1,
          }}
        >
          CALL FOR TALKS
        </Typography>

        <Typography
          sx={{
            // El tagline utiliza Source Serif 4 en cursiva,
            // reforzando la identidad editorial/académica.
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "text.secondary",
            fontSize: "0.875rem",
            mt: 1.5,
          }}
        >
          Congresos más claros. Ciencia que avanza.
        </Typography>
      </Box>

      <Outlet />
    </Box>
  );
}

export default AuthLayout;
