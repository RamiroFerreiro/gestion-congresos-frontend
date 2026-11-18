import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import CongressService from "../../congresses/api/CongressService";
import type {
  CongressParticipation,
  ParticipantRole,
} from "../../congresses/types/congress";

const ROLE_LABELS: Record<ParticipantRole, string> = {
  UNKNOWN: "Sin rol asignado",
  ADMINISTRATOR: "Administrador",
  EVALUATOR: "Evaluador",
  EXPOSITOR: "Presentador",
  LISTENER: "Oyente",
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

interface CongressParticipationCardProps {
  congressCode: string;
  congressName?: string;
  participation: CongressParticipation;
}

export default function CongressParticipationCard({
  congressCode,
  congressName,
  participation,
}: CongressParticipationCardProps) {
  const [isEditingInstitution, setIsEditingInstitution] = useState(false);
  const [institutionValue, setInstitutionValue] = useState(
    participation.institution ?? "",
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateInstitutionMutation = useMutation({
    mutationFn: async (institution: string) => {
      const response = await CongressService.updateMyInstitution(
        congressCode,
        institution,
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(
        data?.message || "Institución actualizada correctamente.",
      );
      setErrorMessage(null);
      setIsEditingInstitution(false);
      // Invalida la query de participación para reflejar el dato actualizado
      void queryClient.invalidateQueries({
        queryKey: ["congress-participation", congressCode],
      });
    },
    onError: (error) => {
      setSuccessMessage(null);
      if (isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("No se pudo actualizar la institución.");
      }
    },
  });

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionValue.trim()) {
      setErrorMessage("La institución no puede estar vacía.");
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    updateInstitutionMutation.mutate(institutionValue.trim());
  };

  const handleCancelInstitution = () => {
    setInstitutionValue(participation.institution ?? "");
    setErrorMessage(null);
    setIsEditingInstitution(false);
  };

  const roleText = ROLE_LABELS[participation.role] ?? participation.role;

  return (
    <Paper
      component="article"
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderColor: "divider",
        bgcolor: "background.paper",
        borderRadius: 1,
        mb: 3,
      }}
    >
      {/* Cabecera de la participación en el congreso */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "var(--font-mono)",
              color: "text.secondary",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display: "block",
              mb: 0.5,
            }}
          >
            Congreso: {congressCode}
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.35rem",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {congressName || `Congreso ${congressCode}`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Chip
            label={roleText}
            sx={{
              bgcolor: "primary.main",
              color: "common.white",
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          />
          <Chip
            label={participation.active ? "Inscripto" : "Inactivo"}
            variant="outlined"
            color={participation.active ? "success" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
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

      <Divider sx={{ mb: 3 }} />

      {/* Grid de información del participante */}
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
            Rol asignado
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {roleText}
          </Typography>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
          >
            Fecha de inscripción
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, fontFamily: "var(--font-mono)" }}
          >
            {formatDate(participation.registrationDate)}
          </Typography>
        </Box>

        {/* Sección de Institución con modo lectura y edición */}
        <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
          >
            Institución a la que representás
          </Typography>

          {!isEditingInstitution ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
                p: 2,
                borderRadius: 1,
                bgcolor: "action.hover",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: participation.institution
                    ? "text.primary"
                    : "text.secondary",
                  fontStyle: participation.institution ? "normal" : "italic",
                }}
              >
                {participation.institution || "Sin institución asignada"}
              </Typography>

              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => {
                  setInstitutionValue(participation.institution ?? "");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setIsEditingInstitution(true);
                }}
              >
                {participation.institution
                  ? "Cambiar institución"
                  : "Asignar institución"}
              </Button>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleSaveInstitution}
              sx={{ mt: 1 }}
            >
              <TextField
                fullWidth
                size="small"
                label="Institución"
                value={institutionValue}
                onChange={(e) => setInstitutionValue(e.target.value)}
                disabled={updateInstitutionMutation.isPending}
                autoFocus
                placeholder="Ej. Universidad de Buenos Aires"
                sx={{ mb: 2 }}
              />
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ justifyContent: "flex-end" }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancelInstitution}
                  disabled={updateInstitutionMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  size="small"
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    updateInstitutionMutation.isPending ||
                    institutionValue.trim() ===
                      (participation.institution ?? "").trim()
                  }
                  startIcon={
                    updateInstitutionMutation.isPending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : null
                  }
                >
                  Guardar institución
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
