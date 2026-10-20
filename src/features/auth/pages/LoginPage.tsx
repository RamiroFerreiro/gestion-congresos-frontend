import { useState } from "react";
import { Box, Button, Link, Paper, Typography, Alert } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PasswordField from "../components/PasswordField";
import RegisterField from "../components/RegisterField";
import { loginSchema, type LoginFormData } from "../schemas/loginSchema";
import { useAuth } from "../context/AuthContext";

/**
 * Vista de inicio de sesión de C4T.
 *
 * Responsabilidades:
 * - Renderizar el formulario visual de inicio de sesión.
 * - Permitir navegar hacia recuperación de contraseña y registro.
 * - Conectarse con el AuthContext para enviar credenciales al backend.
 */
function LoginPage() {
  // Extraemos la función login de nuestro contexto
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Estado local para manejar si mostramos un error de credenciales
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting }, // Nos sirve para deshabilitar el botón mientras carga
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null); // Limpiamos errores previos al reintentar
    try {
      await login(data);
      
      // Si el backend responde OK y el Contexto guardó todo, redirigimos.
      // Modificá "/dashboard" por la ruta principal de tu app.
      navigate("/dashboard"); 
    } catch (error) {
      // Atrapamos el error y mostramos el mensaje al usuario
      setAuthError("Las credenciales ingresadas no son correctas. Por favor, intentá nuevamente.");
      console.error("Fallo al iniciar sesión:", error);
    }
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
          p: 3.5,
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
            mb: 2,
            textAlign: "left",
          }}
        >
          Iniciar sesión
        </Typography>

        {/* ALERTA DE ERROR: Solo se muestra si authError tiene texto */}
        {authError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {authError}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.25,
          }}
        >
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <RegisterField
                id="email"
                label="Correo electrónico"
                placeholder="nombre@institucion.edu.ar"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                id="password"
                label="Contraseña"
                placeholder="••••••••"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: -0.5,
            }}
          >
            <Link
              component={RouterLink}
              to="/auth/forgot-password"
              underline="hover"
              sx={{
                color: "primary.dark",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting} // Se deshabilita para evitar doble click
            sx={{
              py: 1.25,
              mt: 0.25,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </Box>
      </Paper>

      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          mt: 3,
        }}
      >
        ¿No tenés una cuenta?{" "}
        <Link
          component={RouterLink}
          to="/auth/register"
          underline="hover"
          sx={{
            color: "primary.dark",
            fontWeight: 600,
          }}
        >
          Registrate
        </Link>
      </Typography>

      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          mt: 1,
          mx: "auto",
          maxWidth: 360,
        }}
      >
        Ingresá para gestionar tus trabajos, evaluaciones o inscripciones.
      </Typography>
    </Box>
  );
}

export default LoginPage;