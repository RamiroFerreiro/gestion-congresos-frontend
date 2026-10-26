import { useState } from "react";
import { Box, Button, Link, Paper, Typography, Alert } from "@mui/material";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import PasswordField from "../components/PasswordField";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schemas/resetPasswordSchema";
import { AuthService } from "../api/AuthService";

function ResetPasswordPage() {
  const navigate = useNavigate();
  // Extraemos el parámetro ?token=... de la URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "", // Actualizado al nuevo nombre
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setErrorMsg(null);

    if (!token) {
      setErrorMsg("El enlace de recuperación no es válido o está incompleto.");
      return;
    }

    try {
      await AuthService.resetPassword(token, data);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setErrorMsg("Las contraseñas no coinciden, la clave es igual a la actual o el enlace expiró.");
          return;
        }
        if (error.response?.status === 404) {
          setErrorMsg("El enlace de recuperación no es válido o ya fue utilizado.");
          return;
        }
      }
      setErrorMsg("Ocurrió un error inesperado al intentar guardar la contraseña.");
    }
  };

  // Si no hay token en la URL, avisamos de inmediato
  if (!token) {
    return (
      <Box sx={{ width: "100%", maxWidth: 450 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Enlace de recuperación inválido. Por favor, solicitá uno nuevo desde la pantalla de inicio de sesión.
        </Alert>
        <Box sx={{ textAlign: "center" }}>
          <Link component={RouterLink} to="/auth/forgot-password" sx={{ fontWeight: 600 }}>Solicitar nuevo enlace</Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 450 }}>
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} elevation={1} sx={{ p: 3, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.75, textAlign: "left" }}>
          Crear nueva contraseña
        </Typography>

        {isSuccess ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...
          </Alert>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, textAlign: "left" }}>
              Elegí una contraseña nueva para recuperar el acceso a tu cuenta.
            </Typography>

            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="newPassword" // Actualizado al nuevo nombre
                control={control}
                render={({ field, fieldState }) => (
                  <PasswordField
                    id="newPassword"
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

            <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 2, py: 1.25 }}>
              {isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}
            </Button>
          </>
        )}
      </Paper>

      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Link component={RouterLink} to="/auth/login" underline="hover" sx={{ color: "primary.dark", fontSize: "0.8125rem", fontWeight: 600 }}>
          Volver a iniciar sesión
        </Link>
      </Box>
    </Box>
  );
}

export default ResetPasswordPage;