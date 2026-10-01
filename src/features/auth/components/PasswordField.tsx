import { useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder?: string;
  helperText?: string;
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
  placeholder,
  helperText,
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
        placeholder={placeholder}
        size="small"
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {/*
                  La visibilidad se controla dentro del componente
                  para evitar repetir esta lógica en cada formulario
                  que solicite una contraseña.
                */}
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
                    color: "text.secondary",
                    fontSize: "0.6875rem",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    cursor: "pointer",

                    "&:hover": {
                      bgcolor: "transparent",
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

      {helperText && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mt: 0.75,
            textAlign: "left",
            fontSize: "0.75rem",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default PasswordField;