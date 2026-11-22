import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CongressService from "../api/CongressService";
import {
  institutionSchema,
  type InstitutionFormData,
} from "../schemas/institutionSchema";
import { getCongressError } from "../lib/congressErrors";
import type { AvailableCongress } from "../types/congress";

type InstitutionCongress = Pick<AvailableCongress, "code" | "name">;

interface Props {
  congress: InstitutionCongress;
  userId: number;
  editing: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function InstitutionDialog({
  congress,
  userId,
  editing,
  onClose,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: { institution: "" },
  });
  const mutation = useMutation({
    mutationFn: ({ institution }: InstitutionFormData) =>
      editing
        ? CongressService.updateMyInstitution(congress.code, institution)
        : CongressService.registerMe(congress.code, institution),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["congress-participation", userId, congress.code],
      });
      void queryClient.invalidateQueries({
        queryKey: ["my-congresses", userId],
      });
      onSuccess(response.data.message);
    },
  });
  return (
    <Dialog
      open
      onClose={mutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="institution-title"
    >
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <DialogTitle
          id="institution-title"
          sx={{ fontFamily: "var(--font-serif)" }}
        >
          {editing ? "Completá tu institución" : "Inscribirme al congreso"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>{congress.name}</DialogContentText>
          <DialogContentText sx={{ mb: 2 }}>
            Indicá la institución a la que representás en este congreso.
            {!editing && " Te vas a inscribir como participante / oyente."}
          </DialogContentText>
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {getCongressError(mutation.error)}
            </Alert>
          )}
          <TextField
            {...register("institution")}
            autoFocus
            fullWidth
            required
            label="Institución"
            autoComplete="organization"
            disabled={mutation.isPending}
            error={!!errors.institution}
            helperText={errors.institution?.message}
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? "Guardando…"
              : editing
                ? "Guardar institución"
                : "Confirmar inscripción"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
