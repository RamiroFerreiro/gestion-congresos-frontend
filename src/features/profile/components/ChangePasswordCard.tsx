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
import PasswordField from "../../auth/components/PasswordField";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../schemas/changePasswordSchema";

export default function ChangePasswordCard() {
  const [isEditing, setIsEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const onSubmit = async (_data: ChangePasswordFormData) => {
    // TODO: Conectar con PATCH /api/users/me/password
    // El endpoint recibirá: { currentPassword, newPassword, confirmPassword }
    // Por ahora esta acción no tiene efecto en el backend.
    console.info("Cambio de contraseña pendiente de integración con backend.");
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
          Seguridad
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Administrá la contraseña de acceso a tu cuenta.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Aviso de funcionalidad en desarrollo */}
      <Alert severity="info" sx={{ mb: 3 }}>
        La funcionalidad de cambio de contraseña estará disponible próximamente.
      </Alert>

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
            onClick={() => setIsEditing(true)}
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
              render={({ field, fieldState }) => (
                <PasswordField
                  id="currentPassword"
                  label="Contraseña actual"
                  placeholder="••••••••"
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

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
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
