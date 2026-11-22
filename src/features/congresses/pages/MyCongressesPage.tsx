import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import CongressService from "../api/CongressService";
import InstitutionDialog from "../components/InstitutionDialog";
import MyCongressCard from "../components/MyCongressCard";
import { getCongressError } from "../lib/congressErrors";
import type { MyCongressSummary } from "../types/congress";

export default function MyCongressesPage() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [institutionCongress, setInstitutionCongress] =
    useState<MyCongressSummary | null>(null);
  const congresses = useQuery({
    queryKey: ["my-congresses", user?.userId],
    queryFn: ({ signal }) => CongressService.listMyCongresses(signal),
    enabled: Boolean(user),
    retry: false,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!user) return null;

  const isSuperAdmin = user.superAdmin === true;
  const canManageCongresses =
    isSuperAdmin ||
    congresses.data?.data.some((congress) => congress.role === "ADMINISTRATOR");
  const title = "Mis congresos";
  const description = isSuperAdmin
    ? "Elegí el congreso que querés gestionar. Los trabajos, evaluaciones, pagos y configuraciones permanecen separados."
    : "Elegí el congreso que querés consultar o gestionar según tu rol.";

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.8rem",
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 680 }}>
            {description}
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
            <Button component={RouterLink} to="/congresses" variant="outlined">
              Explorar congresos
            </Button>
            {canManageCongresses && (
              <Tooltip
                title="La creación de congresos todavía no está integrada."
                arrow
              >
                <span>
                  <Button variant="contained" disabled>
                    + Crear nuevo congreso
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: "0.75rem",
            }}
          >
            {user.firstName.slice(0, 1)}
            {user.lastName.slice(0, 1)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {user.firstName} {user.lastName}
          </Typography>
        </Box>
      </Box>

      {congresses.isPending ? (
        <Box
          role="status"
          sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
        >
          <CircularProgress size={24} />
          <Typography>Cargando tus congresos…</Typography>
        </Box>
      ) : congresses.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void congresses.refetch()}>
              Reintentar
            </Button>
          }
        >
          {getCongressError(congresses.error)}
        </Alert>
      ) : congresses.data.data.length === 0 ? (
        <Alert
          severity="info"
          action={
            <Button component={RouterLink} to="/congresses" color="inherit">
              Explorar congresos
            </Button>
          }
        >
          Todavía no tenés congresos asociados. Explorá los congresos
          disponibles para inscribirte.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 2,
          }}
        >
          {congresses.data.data.map((congress) => (
            <MyCongressCard
              key={congress.code}
              congress={congress}
              now={now}
              onCompleteInstitution={setInstitutionCongress}
            />
          ))}
        </Box>
      )}

      {!congresses.isPending && !congresses.isError && (
        <Typography variant="body2" color="text.secondary">
          La información y las acciones disponibles dependen de tu rol dentro de
          cada congreso.
        </Typography>
      )}

      {institutionCongress && (
        <InstitutionDialog
          congress={institutionCongress}
          userId={user.userId}
          editing
          onClose={() => setInstitutionCongress(null)}
          onSuccess={() => setInstitutionCongress(null)}
        />
      )}
    </Stack>
  );
}
