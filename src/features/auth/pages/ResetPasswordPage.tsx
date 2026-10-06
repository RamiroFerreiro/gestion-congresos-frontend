import { Box, Button, Link, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PasswordField from "../components/PasswordField";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../schemas/resetPasswordSchema";

/**
 * Vista para establecer una nueva contraseña de C4T.
 *
 * Esta pantalla forma parte del flujo de recuperación de acceso
 * y se utiliza luego de que el usuario accede mediante el enlace
 * de recuperación recibido por correo electrónico.
 *
 * Responsabilidades:
 * - Permitir ingresar una nueva contraseña.
 * - Solicitar la confirmación de la nueva contraseña.
 * - Permitir regresar al inicio de sesión.
 *
 * La lógica visual y de interacción propia de los campos de contraseña
 * (MOSTRAR / OCULTAR) se encuentra encapsulada en PasswordField.
 *
 * En esta etapa se implementa únicamente el maquetado.
 * La validación de las contraseñas y la integración con el backend
 * se incorporarán posteriormente mediante React Hook Form y Zod.
 */
function ResetPasswordPage() {
  const { control, handleSubmit } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
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
          Crear nueva contraseña
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 3,
            textAlign: "left",
          }}
        >
          Elegí una contraseña nueva para recuperar el acceso a tu cuenta.
        </Typography>

        {/*
          PasswordField encapsula la estructura y comportamiento visual
          común de los campos de contraseña del flujo de autenticación.

          Cada instancia administra su visibilidad de forma independiente.
          Las reglas de validación serán responsabilidad del formulario.
        */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                id="password"
                label="Nueva contraseña"
                placeholder="••••••••"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                id="confirmPassword"
                label="Confirmar nueva contraseña"
                placeholder="••••••••"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            py: 1.25,
          }}
        >
          Guardar nueva contraseña
        </Button>
      </Paper>

      {/*
        Se utiliza React Router para volver al login sin realizar
        una recarga completa de la aplicación.
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

export default ResetPasswordPage;
