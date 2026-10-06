import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  type TextFieldProps,
} from "@mui/material";
import { useState } from "react";

interface PasswordFieldProps
  extends Omit<TextFieldProps, "type" | "label"> {
  label: string;
}

/**
 * Campo reutilizable para el ingreso de contraseñas
 * dentro del flujo de autenticación de C4T.
 *
 * Responsabilidades:
 * - Mantener una estructura visual consistente para las contraseñas.
 * - Controlar internamente la visibilidad del valor ingresado.
 * - Proveer la acción MOSTRAR / OCULTAR.
 * - Mantener la semántica y accesibilidad del campo.
 *
 * La validación del valor no pertenece a este componente.
 * Será responsabilidad del formulario mediante React Hook Form y Zod.
 */
function PasswordField({
  id,
  label,
  ...textFieldProps
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        variant="body2"
        sx={{
          display: "block",
          color: "text.secondary",
          fontWeight: 600,
          mb: 0.75,
          textAlign: "left",
        }}
      >
        {label}
      </Typography>

      <TextField
        id={id}
        type={showPassword ? "text" : "password"}
        size="small"
        fullWidth
        {...textFieldProps}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  sx={{
                    minWidth: "auto",
                    p: 0,
                    color: showPassword
                      ? "primary.main"
                      : "text.secondary",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.05em",

                    "&:hover": {
                      bgcolor: "transparent",
                      color: "primary.main",
                    },

                    "&:active": {
                      bgcolor: "transparent",
                      color: "primary.dark",
                    },
                  }}
                >
                  {showPassword ? "OCULTAR" : "MOSTRAR"}
                </Button>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}

export default PasswordField;