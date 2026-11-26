import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import PasswordField from "../../auth/components/PasswordField";
import { UserService } from "../api/UserService";
import {
  changeEmailSchema,
  type ChangeEmailFormData,
} from "../schemas/changeEmailSchema";
import type { UserProfileResponse } from "../types/userProfile";

interface ChangeEmailCardProps {
  user: UserProfileResponse;
}

export default function ChangeEmailCard({ user }: ChangeEmailCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: (data: ChangeEmailFormData) =>
      UserService.changeEmail({
        newEmail: data.newEmail,
        currentPassword: data.currentPassword,
      }),
    onSuccess: (response) => {
      setSuccessMessage(
        response.message ||
          "Se ha enviado un enlace de confirmación a tu correo actual. Revisá tu bandeja de entrada para continuar con el proceso.",
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
            message: "La contraseña actual es incorrecta.",
          });
          return;
        }
        if (status === 409) {
          setError("newEmail", {
            message:
              "El correo electrónico ingresado ya está registrado por otro usuario.",
          });
          return;
        }
        if (status === 400 && backendMessage) {
          setErrorMessage(backendMessage);
          return;
        }
      }

      setErrorMessage(
        "Ocurrió un error inesperado al intentar el cambio de correo. Intentá nuevamente.",
      );
    },
  });

  const handleCancel = () => {
    reset();
    setErrorMessage(null);
    setIsEditing(false);
  };

  const onSubmit = (data: ChangeEmailFormData) => {
    // Validación previa: el nuevo email no debe coincidir con el actual
    if (data.newEmail.trim().toLowerCase() === user.email.toLowerCase()) {
      setError("newEmail", {
        message:
          "El nuevo correo electrónico debe ser distinto al correo actual.",
      });
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    changeEmailMutation.mutate(data);
  };

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
          Correo electrónico
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Para cambiar tu correo se enviará un enlace de confirmación a tu
          dirección actual.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Alerta de éxito global (fuera del modo edición) */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
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
              Correo electrónico actual
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.email}
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
            Cambiar correo
          </Button>
        </Box>
      ) : (
        /* Formulario inline de cambio de email */
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {errorMessage && (
            <Alert
              severity="error"
              sx={{ mb: 2.5 }}
              onClose={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              mb: 3,
            }}
          >
            <TextField
              label="Nuevo correo electrónico"
              type="email"
              fullWidth
              size="small"
              autoComplete="email"
              error={!!errors.newEmail}
              helperText={errors.newEmail?.message}
              {...register("newEmail")}
            />

            <Controller
              name="currentPassword"
              control={control}
              render={({ field, fieldState }) => (
                <PasswordField
                  id="currentPassword-email"
                  label="Contraseña actual"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
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
              disabled={changeEmailMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={changeEmailMutation.isPending}
              startIcon={
                changeEmailMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              Confirmar cambio
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
