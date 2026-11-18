import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthContext";
import CongressService from "../../congresses/api/CongressService";
import { PaymentService } from "../api/PaymentService";
import { getPaymentError } from "../lib/paymentErrors";
import {
  paperLookupSchema,
  type PaperLookupValues,
} from "../schemas/paymentSchemas";
import AdminPayments from "../components/AdminPayments";
import PaymentDetail from "../components/PaymentDetail";

export default function PaymentsPage() {
  const { congressCode = "", paperCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const form = useForm<PaperLookupValues>({
    resolver: zodResolver(paperLookupSchema),
    defaultValues: { paperCode: "" },
  });
  const congress = useQuery({
    queryKey: ["payment-congress", user?.userId, congressCode],
    queryFn: ({ signal }) => PaymentService.getCongress(congressCode, signal),
    retry: false,
  });
  const participation = useQuery({
    queryKey: ["congress-participation", user?.userId, congressCode],
    queryFn: async ({ signal }) => {
      try {
        return (await CongressService.getMyParticipation(congressCode, signal))
          .data;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    retry: false,
  });
  const basePath = `/congresses/${encodeURIComponent(congressCode)}/payments`;
  if (!user) return null;
  if (congress.isPending || participation.isPending)
    return (
      <Box role="status" sx={{ display: "flex", gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Cargando información del congreso…</Typography>
      </Box>
    );
  if (congress.isError || participation.isError)
    return (
      <Stack spacing={2}>
        <Button
          component={RouterLink}
          to="/congresses"
          sx={{ alignSelf: "flex-start" }}
        >
          Volver a mis congresos
        </Button>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                void congress.refetch();
                void participation.refetch();
              }}
            >
              Reintentar
            </Button>
          }
        >
          {getPaymentError(congress.error ?? participation.error)}
        </Alert>
      </Stack>
    );
  const participant = participation.data?.active ? participation.data : null;
  const isAdmin =
    user.superAdmin === true || participant?.role === "ADMINISTRATOR";
  const isExpositor = participant?.role === "EXPOSITOR";

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={RouterLink}
          to={paperCode ? basePath : "/congresses"}
          sx={{ mb: 2 }}
        >
          {paperCode ? "Volver a pagos" : "Volver a mis congresos"}
        </Button>
        <Typography
          variant="body2"
          sx={{
            fontFamily: "var(--font-mono)",
            color: "text.secondary",
            mb: 1,
          }}
        >
          {congress.data.name}
        </Typography>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            fontSize: "1.7rem",
          }}
        >
          {isAdmin ? "Control de pagos y Libro de Resúmenes" : "Estado de pago"}
        </Typography>
      </Box>
      {!isAdmin && !isExpositor ? (
        <Alert severity="warning">
          La consulta de pagos está disponible para administradores y
          expositores del congreso.
        </Alert>
      ) : participant &&
        !participant.institution?.trim() &&
        !user.superAdmin ? (
        <Alert severity="warning">
          Completá tu institución desde Mis congresos para consultar o gestionar
          pagos.
        </Alert>
      ) : isAdmin && !paperCode ? (
        <AdminPayments
          key={congressCode}
          congressCode={congressCode}
          userId={user.userId}
          free={congress.data.free}
        />
      ) : congress.data.free ? (
        <Alert severity="info">
          Este congreso es gratuito. Los trabajos aceptados no requieren
          comprobante ni validación de pago.
        </Alert>
      ) : paperCode ? (
        <PaymentDetail
          key={`${congressCode}/${paperCode}`}
          congressCode={congressCode}
          paperCode={paperCode}
          isAdmin={isAdmin}
          isExpositor={isExpositor}
          userCode={participant?.user.code}
        />
      ) : (
        <>
          <Typography color="text.secondary">
            Ingresá el código de un trabajo del que seas autor para consultar su
            pago y las observaciones del comprobante.
          </Typography>
          <Box
            component="form"
            onSubmit={form.handleSubmit(({ paperCode: code }) =>
              navigate(`${basePath}/${encodeURIComponent(code)}`),
            )}
            noValidate
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
              maxWidth: 640,
            }}
          >
            <TextField
              {...form.register("paperCode")}
              label="Código del trabajo"
              required
              fullWidth
              error={!!form.formState.errors.paperCode}
              helperText={form.formState.errors.paperCode?.message}
            />
            <Button type="submit" variant="contained" sx={{ flexShrink: 0 }}>
              Consultar pago
            </Button>
          </Box>
        </>
      )}
    </Stack>
  );
}
