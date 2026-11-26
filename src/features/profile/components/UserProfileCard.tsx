import { useState } from "react";
import {
  Alert,
  Avatar,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { UserService } from "../api/UserService";
import {
  userProfileSchema,
  type UserProfileFormData,
} from "../schemas/userProfileSchema";
import type { UserProfileResponse } from "../types/userProfile";
import CountrySelect from "../../../components/CountrySelect";

interface UserProfileCardProps {
  user: UserProfileResponse;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      dni: user.dni ? String(user.dni) : "",
      country: user.country ?? "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UserProfileFormData) => {
      return UserService.updateUser(user.code, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        dni: parseInt(data.dni.trim(), 10),
        country: data.country.trim(),
      });
    },
    onSuccess: (updatedUser) => {
      // Sincronizamos la información guardada en la caché de React Query
      queryClient.setQueryData(["user", "me"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });

      // Actualizamos datos básicos en localStorage para mantener coherencia en toda la app
      const rawStored = localStorage.getItem("user");
      if (rawStored) {
        try {
          const stored = JSON.parse(rawStored);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...stored,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
            }),
          );
        } catch {
          // Si el JSON estaba corrupto, evitamos romper el flujo
        }
      }

      setSuccessMessage(
        "Tus datos personales fueron actualizados correctamente.",
      );
      setErrorMessage(null);
      setIsEditing(false);
      reset({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        dni: String(updatedUser.dni),
        country: updatedUser.country,
      });
    },
    onError: (error) => {
      setSuccessMessage(null);
      if (isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage(
          "Ocurrió un error al intentar actualizar los datos. Verificá los campos ingresados.",
        );
      }
    },
  });

  const handleCancel = () => {
    reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      dni: user.dni ? String(user.dni) : "",
      country: user.country ?? "",
    });
    setErrorMessage(null);
    setIsEditing(false);
  };

  const onSubmit = (data: UserProfileFormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    updateMutation.mutate(data);
  };

  const initials =
    `${user.firstName?.slice(0, 1) ?? ""}${user.lastName?.slice(0, 1) ?? ""}`.toUpperCase();

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
          Datos personales
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Editá tu nombre, apellido, documento y país de residencia.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Cabecera del perfil: Avatar + nombre completo + acción */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "primary.main",
              fontFamily: "var(--font-serif)",
              fontSize: "1.3rem",
              fontWeight: 600,
            }}
          >
            {initials || "U"}
          </Avatar>
          <Box>
            <Typography
              component="h3"
              sx={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.2rem",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {user.email}
            </Typography>
          </Box>
        </Box>

        {!isEditing && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setSuccessMessage(null);
              setErrorMessage(null);
              setIsEditing(true);
            }}
          >
            Editar datos
          </Button>
        )}
      </Box>

      {/* Alertas de feedback */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2.5 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 2.5 }}
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Vista de solo lectura */}
      {!isEditing ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            >
              Nombre
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.firstName || "—"}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            >
              Apellido
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.lastName || "—"}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            >
              DNI / Documento
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontWeight: 500, fontFamily: "var(--font-mono)" }}
            >
              {user.dni ? String(user.dni) : "—"}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            >
              País
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.country || "—"}
            </Typography>
          </Box>
        </Box>
      ) : (
        /* Formulario de edición — solo campos editables, sin email */
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
              mb: 3,
            }}
          >
            <TextField
              label="Nombre"
              fullWidth
              size="small"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              {...register("firstName")}
            />

            <TextField
              label="Apellido"
              fullWidth
              size="small"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              {...register("lastName")}
            />

            <TextField
              label="DNI / Documento"
              fullWidth
              size="small"
              error={!!errors.dni}
              helperText={errors.dni?.message}
              {...register("dni")}
            />

            <Controller
              name="country"
              control={control}
              render={({ field, fieldState }) => (
                <CountrySelect
                  id="profile-country"
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  disabled={updateMutation.isPending}
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
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updateMutation.isPending || !isDirty}
              startIcon={
                updateMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              Guardar cambios
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
