import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import PasswordField from "../../auth/components/PasswordField";
import { UserService } from "../api/UserService";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../schemas/changePasswordSchema";

export default function ChangePasswordCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      UserService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    onSuccess: (response) => {
      setSuccessMessage(
        response.message || "Tu contraseña se ha modificado exitosamente.",
      );
      setErrorMessage(null);
      reset();
      setIsEditing(false);
    },
    onError: (error) => {
      setSuccessMessage(null);

      if (isAxiosError(error)) {
        const status = error.response?.status;
        const backendMessage = error.response?.data?.message;

        if (status === 401) {
          setError("currentPassword", {
            message:
              backendMessage || "La contraseña actual ingresada es incorrecta.",
          });
          return;
        }

        if (status === 400 && backendMessage) {
          setErrorMessage(backendMessage);
          return;
        }
      }

      setErrorMessage(
        "Ocurrió un error inesperado al intentar cambiar la contraseña. Intentá nuevamente.",
      );
    },
  });

  const handleCancel = () => {
    reset();
    setErrorMessage(null);
    setIsEditing(false);
  };

  const onSubmit = (data: ChangePasswordFormData) => {
    setErrorMessage(null);
    changePasswordMutation.mutate(data);
  };

  const isPending = changePasswordMutation.isPending;

  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderColor: "divider",
        bgcolor: "background.paper",
        borderRadius: 1,
      }}
    >
      {/* Cabecera de sección */}
      <Box sx={{ mb: 2.5 }}>
        <Typography
          component="h2"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "text.primary",
            mb: 0.25,
          }}
        >
          Seguridad
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Administrá la contraseña de acceso a tu cuenta.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Alerta de éxito */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Alerta de error general */}
      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Vista de solo lectura */}
      {!isEditing ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            >
              Contraseña
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                letterSpacing: "0.15em",
                color: "text.primary",
              }}
            >
              ••••••••••••
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setSuccessMessage(null);
              setErrorMessage(null);
              setIsEditing(true);
            }}
          >
            Cambiar contraseña
          </Button>
        </Box>
      ) : (
        /* Formulario inline de cambio de contraseña */
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              mb: 3,
            }}
          >
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <PasswordField
                  id="currentPassword"
                  label="Contraseña actual"
                  placeholder="••••••••"
                  {...field}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message}
                  disabled={isPending}
                />
              )}
            />

            <Controller
              name="newPassword"
              control={control}
              render={({ field }) => (
                <PasswordField
                  id="newPassword"
                  label="Nueva contraseña"
                  placeholder="••••••••"
                  {...field}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  disabled={isPending}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <PasswordField
                  id="confirmPassword"
                  label="Confirmar nueva contraseña"
                  placeholder="••••••••"
                  {...field}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={isPending}
                />
              )}
            />
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              Guardar contraseña
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
