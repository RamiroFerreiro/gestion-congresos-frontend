import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import CongressService from "../api/CongressService";
import CongressDashboardSkeleton from "../components/CongressDashboardSkeleton";
import CongressMetricGroup from "../components/CongressMetricGroup";
import { getCongressStatus } from "../lib/congressAvailability";
import { getCongressError } from "../lib/congressErrors";
import type { CongressDetails } from "../types/congress";
import type { CongressDashboard } from "../types/congressDashboard";

const unexpectedCongressMessage =
  "No pudimos verificar los datos del congreso seleccionado. Volvé al listado e intentá nuevamente.";

function dashboardError(error: unknown) {
  if (isAxiosError(error) && error.response?.status === 404) {
    return "No encontramos el congreso solicitado.";
  }
  if (error instanceof Error && !isAxiosError(error)) return error.message;
  return getCongressError(error);
}

function formatPeriod(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
    return "No disponible";
  const formatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const from = formatter.format(startDate);
  const to = formatter.format(endDate);
  return from === to ? from : `${from} – ${to}`;
}

export default function AdminCongressHomePage() {
  const { congressCode = "" } = useParams();
  const { user } = useAuth();
  const hasCode = congressCode.trim().length > 0;
  const dashboard = useQuery({
    queryKey: ["admin-congress-dashboard", user?.userId, congressCode],
    queryFn: async ({ signal }) => {
      const { data } = await CongressService.getDashboard(congressCode, signal);
      if (
        data.congressCode !== congressCode ||
        !data.academicMetrics ||
        !data.financialMetrics
      ) {
        throw new Error(unexpectedCongressMessage);
      }
      return data;
    },
    enabled: Boolean(user) && hasCode,
    retry: false,
  });
  const congress = useQuery({
    queryKey: ["congress-detail", user?.userId, congressCode],
    queryFn: async ({ signal }) => {
      const { data } = await CongressService.getCongressByCode(
        congressCode,
        signal,
      );
      if (data.code !== congressCode)
        throw new Error(unexpectedCongressMessage);
      return data;
    },
    // El dashboard valida primero el permiso contextual; el SUPER_ADMIN no
    // necesita consultar una participación que puede no tener registrada.
    enabled: Boolean(user) && hasCode && dashboard.isSuccess,
    retry: false,
  });

  if (!user) return null;
  const error = dashboard.error ?? congress.error;
  const expired = isAxiosError(error) && error.response?.status === 401;

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 1280, mx: "auto", px: 4, py: 1 }}>
      <Typography variant="body2" color="text.secondary">
        <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
          Administración
        </Box>
        {" / Inicio del congreso"}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.9rem",
              fontWeight: 700,
            }}
          >
            Inicio — Panel del administrador
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Resumen del congreso seleccionado: trabajos, evaluaciones y pagos.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/my-congresses"
          variant="outlined"
          sx={{ flexShrink: 0 }}
        >
          Cambiar congreso ↔
        </Button>
      </Box>
      {!hasCode ? (
        <Alert severity="error">
          El código del congreso no es válido. Elegí un congreso desde Mis
          congresos.
        </Alert>
      ) : dashboard.isError || congress.isError ? (
        <Alert
          severity="error"
          action={
            expired ? (
              <Button component={RouterLink} to="/auth/login" color="inherit">
                Iniciar sesión
              </Button>
            ) : (
              <Button
                color="inherit"
                onClick={() => {
                  if (dashboard.isError) void dashboard.refetch();
                  else void congress.refetch();
                }}
              >
                Reintentar
              </Button>
            )
          }
        >
          {dashboardError(error)}
        </Alert>
      ) : dashboard.isSuccess && congress.isSuccess ? (
        <DashboardContent
          congress={congress.data}
          dashboard={dashboard.data}
          firstName={user.firstName}
          lastName={user.lastName}
        />
      ) : (
        <CongressDashboardSkeleton />
      )}
    </Stack>
  );
}

function DashboardContent({
  congress,
  dashboard,
  firstName,
  lastName,
}: {
  congress: CongressDetails;
  dashboard: CongressDashboard;
  firstName: string;
  lastName: string;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const status = getCongressStatus(congress, now);
  const code = encodeURIComponent(congress.code);
  const papersPath = `/congresses/${code}/papers`;
  const paymentsPath = `/congresses/${code}/payments`;
  const academic = dashboard.academicMetrics;
  const financial = dashboard.financialMetrics;

  return (
    <>
      <Paper
        component="section"
        aria-label="Resumen del congreso"
        variant="outlined"
        sx={{ p: 2.75, borderRadius: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: "0.75rem",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          >
            {firstName.slice(0, 1)}
            {lastName.slice(0, 1)}
          </Avatar>
          <Typography sx={{ fontWeight: 700 }}>Hola, {firstName}</Typography>
        </Box>
        <Box sx={{ borderTop: 1, borderColor: "divider", mt: 2, pt: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
            >
              CONGRESO SELECCIONADO · {congress.code}
            </Typography>
            <Chip
              label={status.label}
              size="small"
              variant="outlined"
              color={status.disabled || status.finished ? "default" : "success"}
            />
          </Box>
          <Typography sx={{ mt: 1 }}>
            {congress.name} · {congress.place}
          </Typography>
          <Box
            component="dl"
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 2,
              m: 0,
              mt: 2,
            }}
          >
            {[
              {
                label: "Registro",
                start: congress.registrationStartDate,
                end: congress.registrationEndDate,
              },
              {
                label: "Presentación de trabajos",
                start: congress.presentationStartDate,
                end: congress.presentationEndDate,
              },
              {
                label: "Congreso",
                start: congress.startDate,
                end: congress.endDate,
              },
            ].map(({ label, start, end }) => (
              <Box
                key={label}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Typography
                  component="dt"
                  variant="body2"
                  color="text.secondary"
                >
                  {label}
                </Typography>
                <Typography
                  component="dd"
                  variant="body2"
                  sx={{ m: 0, mt: 0.5, fontWeight: 600 }}
                >
                  {formatPeriod(start, end)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
      <Paper
        component="section"
        aria-label="Trabajos recibidos"
        variant="outlined"
        sx={{ p: 2.5, borderRadius: 2 }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            {academic.totalSubmissions.toLocaleString("es-AR")}
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>Trabajos recibidos</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Incluye los trabajos no presentados.
        </Typography>
      </Paper>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2.5,
          alignItems: "start",
        }}
      >
        <CongressMetricGroup
          id="academic-metrics-title"
          title="Evaluación"
          description="Estado y asignación de trabajos. Un trabajo puede aparecer en más de un indicador."
          rows={[
            {
              label: "Sin evaluador asignado",
              description: "Consultar trabajos sin evaluador.",
              count: academic.unassignedSubmissions.count,
              to: `${papersPath}?unassigned=true`,
              tone: "warning",
            },
            {
              label: "En evaluación",
              description: "Trabajos en proceso de evaluación.",
              count: academic.underEvaluationSubmissions.count,
              to: `${papersPath}?status=UNDER_EVALUATION`,
              tone: "warning",
            },
            {
              label: "Con observaciones",
              description: "Trabajos que requieren correcciones.",
              count: academic.needsRevisionSubmissions.count,
              to: `${papersPath}?status=NEEDS_REVISION`,
              tone: "warning",
            },
            {
              label: "Aceptados",
              description: "Trabajos aceptados en el congreso.",
              count: academic.acceptedSubmissions.count,
              to: `${papersPath}?status=ACCEPTED`,
              tone: "success",
            },
            {
              label: "Rechazados",
              description: "Trabajos rechazados en el congreso.",
              count: academic.rejectedSubmissions.count,
              to: `${papersPath}?status=REJECTED`,
              tone: "error",
            },
            {
              label: "No presentados",
              description: "Trabajos que todavía no se enviaron.",
              count: academic.notSubmittedSubmissions.count,
              to: `${papersPath}?status=NOT_SUBMITTED`,
              tone: "primary",
            },
          ]}
        />
        <CongressMetricGroup
          id="financial-metrics-title"
          title="Pagos"
          description={`${congress.free ? "Congreso gratuito. " : ""}Comprobantes registrados: ${financial.totalPayments.toLocaleString("es-AR")}.`}
          rows={[
            {
              label: "Comprobantes por revisar",
              description: "Pendientes de verificación del administrador.",
              count: financial.pendingApprovalPayments.count,
              tone: "secondary",
            },
            {
              label: "Comprobantes aprobados",
              description: "Pagos verificados por la administración.",
              count: financial.approvedPayments.count,
              tone: "success",
            },
            {
              label: "Comprobantes rechazados",
              description: "Comprobantes que requieren atención.",
              count: financial.rejectedPayments.count,
              tone: "error",
            },
          ]}
          action={{ label: "Gestionar pagos y Libro", to: paymentsPath }}
        />
      </Box>
      <Button
        component={RouterLink}
        to={papersPath}
        variant="contained"
        sx={{ alignSelf: "flex-start", px: 3, py: 1.25 }}
      >
        Ver portal de trabajos
      </Button>
    </>
  );
}
