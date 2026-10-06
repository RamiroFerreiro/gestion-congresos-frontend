import { Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../schemas/forgotPasswordSchema";

/**
 * Vista de recuperación de contraseña de C4T.
 *
 * Responsabilidades:
 * - Solicitar el correo electrónico asociado a la cuenta.
 * - Permitir iniciar el proceso de recuperación de contraseña.
 * - Ofrecer navegación de regreso al inicio de sesión.
 *
 * Los elementos compartidos del flujo de autenticación
 * (logo, identidad C4T, tagline y estructura general)
 * son responsabilidad de AuthLayout.
 *
 * En esta etapa se implementa únicamente el maquetado.
 * El envío del formulario, sus validaciones y la integración
 * con el backend se incorporarán posteriormente.
 */
function ForgotPasswordPage() {
  const { control, handleSubmit } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log(data);
  };
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 450,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "text.primary",
            mb: 0.75,
            textAlign: "left",
          }}
        >
          Recuperar contraseña
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 3,
            textAlign: "left",
          }}
        >
          Ingresá el correo de tu cuenta y te enviaremos un enlace para crear
          una nueva contraseña.
        </Typography>

        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              size="small"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            py: 1.25,
          }}
        >
          Enviar enlace de recuperación
        </Button>
      </Paper>

      {/*
        La navegación utiliza React Router para regresar al login
        sin provocar una recarga completa de la aplicación.
      */}
      <Box
        sx={{
          textAlign: "center",
          mt: 2,
        }}
      >
        <Link
          component={RouterLink}
          to="/auth/login"
          underline="hover"
          sx={{
            color: "primary.dark",
            fontSize: "0.8125rem",
            fontWeight: 600,
          }}
        >
          Volver a iniciar sesión
        </Link>
      </Box>
    </Box>
  );
}

export default ForgotPasswordPage;
