import { Alert, Box } from "@mui/material";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import CongressService from "../api/CongressService";
import CongressForm from "../components/CongressForm";
import { toCreateCongressRequest } from "../lib/congressCreation";
import { getCongressError } from "../lib/congressErrors";
import type { CreateCongressFormData } from "../schemas/createCongressSchema";
import type { CreateCongressRequest } from "../types/createCongress";

export default function CreateCongressPage() {
  const { user } = useAuth();
  if (user?.superAdmin !== true) {
    return (
      <Alert severity="error">No tenés permisos para crear congresos.</Alert>
    );
  }
  return <CongressCreation userId={user.userId} />;
}

function CongressCreation({ userId }: { userId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submitting = useRef(false);
  const mutation = useMutation({
    mutationFn: (payload: CreateCongressRequest) =>
      CongressService.createCongress(payload),
    retry: false,
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-congresses", userId] }),
        queryClient.invalidateQueries({
          queryKey: ["available-congresses", userId],
        }),
      ]);
      navigate("/my-congresses", {
        replace: true,
        state: {
          createdCongressName: response.data.name,
          createdCongressCode: response.data.code,
        },
      });
    },
  });

  const submit = async (data: CreateCongressFormData) => {
    // También cubre dos envíos mientras termina la validación asíncrona de RHF.
    if (submitting.current) return;
    submitting.current = true;
    try {
      await mutation.mutateAsync(toCreateCongressRequest(data));
    } catch {
      // La mutación conserva el error para mostrarlo sin perder los valores del formulario.
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: 4, pt: 2, pb: 4 }}>
      <CongressForm
        onSubmit={submit}
        isSubmitting={mutation.isPending}
        serverError={mutation.isError ? getCongressError(mutation.error) : null}
      />
    </Box>
  );
}
