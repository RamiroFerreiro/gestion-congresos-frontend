import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import PasswordField from "../components/PasswordField";
import RegisterField from "../components/RegisterField";
import CountrySelect from "../../../components/CountrySelect";
import { AuthService } from "../api/AuthService";
import { useAuth } from "../context/AuthContext";
import {
  firstLoginSchema,
  type FirstLoginFormData,
} from "../schemas/firstLoginSchema";

export default function FirstLoginPage() {
  const { markPasswordChanged, logout } = useAuth();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FirstLoginFormData>({
    resolver: zodResolver(firstLoginSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      dni: "",
      country: "",
    },
  });

  const onSubmit = async (data: FirstLoginFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await AuthService.firstLogin({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        dni: parseInt(data.dni.trim(), 10),
        country: data.country.trim(),
      });

      markPasswordChanged();
      setSuccessMessage(
        response.message ||
          "Tu contraseña y datos de perfil fueron configurados con éxito.",
      );

      // Breve pausa para que el usuario visualice la confirmación antes de redirigir
      setTimeout(() => {
        navigate("/congresses", { replace: true });
      }, 1000);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          logout();
          navigate("/auth/login", { replace: true });
          return;
        }

        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Ocurrió un error al procesar la solicitud. Verificá los datos ingresados.";
        setServerError(backendMessage);
      } else {
        setServerError(
          "Ocurrió un error inesperado. Por favor, intentá nuevamente.",
        );
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        elevation={1}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontFamily: "var(--font-serif)",
            color: "text.primary",
            mb: 1,
            textAlign: "left",
            fontWeight: 600,
          }}
        >
          Primer inicio de sesión
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 2.5,
            textAlign: "left",
          }}
        >
          Por motivos de seguridad, debés cambiar la contraseña temporal y
          completar tus datos obligatorios de perfil para comenzar a utilizar
          C4T.
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mb: 3,
          }}
        >
          <Controller
            name="currentPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                id="currentPassword"
                label="Contraseña temporal actual *"
                placeholder="Ingresá la contraseña recibida por correo"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="newPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                id="newPassword"
                label="Nueva contraseña *"
                placeholder="Mínimo 8 caracteres"
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
                label="Confirmar nueva contraseña *"
                placeholder="Repetí la nueva contraseña"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="dni"
            control={control}
            render={({ field, fieldState }) => (
              <RegisterField
                id="dni"
                label="Documento Nacional de Identidad (DNI) *"
                placeholder="Ej. 12345678"
                type="text"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="country"
            control={control}
            render={({ field, fieldState }) => (
              <CountrySelect
                id="country"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                disabled={isSubmitting || !!successMessage}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>

        <Stack spacing={1.5}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting || !!successMessage}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
            sx={{
              py: 1,
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            {isSubmitting ? "Guardando..." : "Guardar y continuar"}
          </Button>

          <Button
            type="button"
            variant="outlined"
            color="inherit"
            fullWidth
            onClick={handleLogout}
            disabled={isSubmitting}
            sx={{
              py: 0.8,
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                bgcolor: "transparent",
              },
            }}
          >
            Cerrar sesión
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
