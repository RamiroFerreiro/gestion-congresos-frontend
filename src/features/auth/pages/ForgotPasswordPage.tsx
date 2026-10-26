import { useState } from "react";
import { Box, Button, Link, Paper, TextField, Typography, Alert } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas/forgotPasswordSchema";
import { AuthService } from "../api/AuthService";

function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setErrorMsg(null);
    try {
      await AuthService.forgotPassword(data);
      // Sin importar si el mail existe o no, el backend responde 200 OK.
      setIsSuccess(true);
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);
      setErrorMsg("Ocurrió un error al procesar tu solicitud. Intentá nuevamente.");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 450 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.75, textAlign: "left" }}>
          Recuperar contraseña
        </Typography>

        {isSuccess ? (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Si el correo ingresado está registrado, te enviamos las instrucciones para crear una nueva contraseña.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, textAlign: "left" }}>
              Ingresá el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
            </Typography>

            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

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
              disabled={isSubmitting}
              sx={{ mt: 2, py: 1.25 }}
            >
              {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </Box>
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

export default ForgotPasswordPage;